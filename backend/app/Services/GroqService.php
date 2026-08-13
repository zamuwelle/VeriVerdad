<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

class GroqService
{
	protected static $cooldowns = [];

	public function chat($messages, $tools = null, $model = null)
	{
		$keys = Config::get('groq.keys');
		$model = $model ?? Config::get('groq.model');

		foreach ($keys as $index => $key) {
			if (isset(self::$cooldowns[$index]) && self::$cooldowns[$index] > now()) {
				continue;
			}

			try {
				$payload = [
					'model' => $model,
					'messages' => $messages,
					'max_completion_tokens' => 1024,
					'temperature' => 0.7,
					'include_reasoning' => true,
					'reasoning_effort' => 'medium',
				];

				if ($tools) $payload['tools'] = $tools;

				$response = Http::withToken($key)
					->timeout(60)
					->post('https://api.groq.com/openai/v1/chat/completions', $payload);

				if ($response->successful()) {
					$data = $response->json();
					$choice = $data['choices'][0] ?? [];
					$message = $choice['message'] ?? [];
					$usage = $data['usage'] ?? [];

					return [
						'reply' => $message['content'] ?? '',
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
					$retryAfter = $response->header('Retry-After');
					$cooldownSeconds = is_numeric($retryAfter) ? (int) $retryAfter : 60;
					self::$cooldowns[$index] = now()->addSeconds($cooldownSeconds);
					continue;
				}

				if ($response->status() === 401) {
					self::$cooldowns[$index] = now()->addYear();
					continue;
				}

				if ($response->serverError()) {
					throw new \RuntimeException('Groq service unavailable.');
				}
			} catch (ConnectionException $e) {
				continue;
			}
		}

		throw new \RuntimeException('All Groq keys rate-limited. Try again shortly.');
	}
}
