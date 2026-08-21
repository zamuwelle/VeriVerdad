<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

class GroqService
{
	public function chat($messages, $tools = null, $model = null)
	{
		$keys = array_values(array_filter(Config::get('groq.keys', [])));
		if (empty($keys)) throw new \RuntimeException('No Groq API keys configured.');

		$model = $model ?? Config::get('groq.model', 'openai/gpt-oss-120b');
		$count = count($keys);
		$startIndex = Cache::increment('groq_key_offset') % $count;

		for ($i = 0; $i < $count; $i++) {
			$index = ($startIndex + $i) % $count;
			$key = $keys[$index];

			if (Cache::has("groq_cd_{$index}_{$model}")) continue;

			try {
				$payload = [
					'model' => $model,
					'messages' => $messages,
					'max_completion_tokens' => 1024,
					'temperature' => 0.4,
				];

				if (str_starts_with($model, 'openai/') || str_starts_with($model, 'qwen')) {
					$payload['include_reasoning'] = true;
					$payload['reasoning_effort'] = 'medium';
				}

				if ($tools) $payload['tools'] = $tools;

				$response = Http::withToken($key)->timeout(60)->post('https://api.groq.com/openai/v1/chat/completions', $payload);

				if ($response->successful()) {
					$data = $response->json();
					$choice = $data['choices'][0] ?? [];
					$message = $choice['message'] ?? [];
					$usage = $data['usage'] ?? [];
					$reply = preg_replace('/\x{3010}[^\x{3011}]*\x{3011}/u', '', $message['content'] ?? '');

					return [
						'reply' => $reply,
						'reasoning' => $message['reasoning'] ?? null,
						'model' => $data['model'] ?? $model,
						'usage' => [
							'prompt_tokens' => $usage['prompt_tokens'] ?? 0,
							'completion_tokens' => $usage['completion_tokens'] ?? 0,
							'total_tokens' => $usage['total_tokens'] ?? 0,
							'total_time' => $usage['total_time'] ?? null,
						],
					];
				}

				if ($response->status() === 429) {
					$retryAfter = (int) ($response->header('Retry-After') ?? 60);
					Cache::put("groq_cd_{$index}_{$model}", true, now()->addSeconds(max(5, $retryAfter)));
					continue;
				}

				if ($response->status() === 401) {
					Cache::put("groq_cd_{$index}_{$model}", true, now()->addYear());
					continue;
				}
			} catch (ConnectionException $e) {
				continue;
			}
		}

		throw new \RuntimeException('All Groq keys rate-limited. Try again shortly.');
	}
}
