<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;

class ChatService
{
	public function sendMessage($userId, $conversationId, $content, $messageId = null, $verify = false)
	{
		$conversation = $conversationId ? Conversation::where('user_id', $userId)->findOrFail($conversationId) : Conversation::create(['user_id' => $userId]);

		if ($messageId) {
			$target = Message::where('conversation_id', $conversation->id)->findOrFail($messageId);
			Message::where('conversation_id', $conversation->id)->where('created_at', '>=', $target->created_at)->delete();
			Message::where('conversation_id', $conversation->id)->count() === 0 && $conversation->update(['title' => null]);
		}

		if (is_null($conversation->title)) {
			$titleResult = app(GroqService::class)->chat([
				['role' => 'system', 'content' => 'Summarize the user message into a short 3 to 5 word title. Reply with only the title, no punctuation.'],
				['role' => 'user', 'content' => $content]
			]);
			$conversation->update(['title' => $titleResult['reply']]);
		}

		$history = Message::where('conversation_id', $conversation->id)->orderByDesc('created_at')->limit(20)->get()->reverse()->values();

		$systemPrompt = <<<'PROMPT'
You are Veribot, a digital detective assistant for VeriVerdad promoting Media and Information Literacy (MIL) through the CRAAP framework (Currency, Relevance, Authority, Accuracy, Purpose).

Rules:
1. Speak in a friendly, concise, conversational tone. Do not use emoji spam.
2. If the user mentions, asks about, or disputes a questionable, viral, medical, political, or factual claim, answer clearly and append [VERIFY] at the very end.
3. If fulfilling a verification request (web search results enabled), summarize the verified facts and include the full URL for every source you reference, and append [OFFER_QUIZ] at the very end.
4. When quizzing the user, run a quick 3-round detective challenge in the current conversation:
   - For each round, present a realistic misinformation scenario and ask what red flag or verification step applies.
   - Give exactly 3 answer choices. Each choice must be a real, specific, plausible answer written in plain language, never a placeholder like "Option A" or "Option B". Append them at the very end in this format: [CHOICES: first real answer | second real answer | third real answer]
   - The user is also free to type their own answer instead of picking one of the 3, so evaluate whatever they respond with, typed or chosen, on its own merit.
   - When the user answers, explain if it is correct and why based on the relevant CRAAP pillar.
   - In rounds 1 and 2, proceed immediately to the next scenario with 3 new choices.
   - In round 3, conclude with the final score, a key CRAAP takeaway tip, and no choices so chat resumes normally.
PROMPT;

		$groqMessages = array_merge(
			[['role' => 'system', 'content' => $systemPrompt]],
			$history->map(fn($msg) => ['role' => $msg->role, 'content' => $msg->content])->all(),
			[['role' => 'user', 'content' => $content]]
		);

		$groq = app(GroqService::class);
		$result = $verify
			? $groq->chat($groqMessages, [['type' => 'browser_search']], 'openai/gpt-oss-20b')
			: $groq->chat($groqMessages);

		Message::create(['conversation_id' => $conversation->id, 'role' => 'user', 'content' => $content]);
		Message::create(['conversation_id' => $conversation->id, 'role' => 'assistant', 'content' => $result['reply'], 'reasoning' => $result['reasoning']]);

		return [
			'conversation' => $conversation,
			'reply' => $result['reply'],
			'reasoning' => $result['reasoning'],
			'model' => $result['model'],
			'usage' => $result['usage']
		];
	}

	public function getUserConversations($userId)
	{
		return Conversation::where('user_id', $userId)->latest()->get();
	}

	public function getConversation($id, $userId)
	{
		return Conversation::where('user_id', $userId)->with('messages')->findOrFail($id);
	}

	public function updateConversation($id, $userId, $title)
	{
		return tap(Conversation::where('user_id', $userId)->findOrFail($id))->update(['title' => $title]);
	}

	public function deleteConversation($id, $userId)
	{
		Conversation::where('user_id', $userId)->findOrFail($id)->delete();
	}
}
