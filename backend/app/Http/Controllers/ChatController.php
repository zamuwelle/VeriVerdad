<?php

namespace App\Http\Controllers;

use App\Services\ChatService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
	public function chat(Request $request)
	{
		try {
			$chat = app(ChatService::class);
			$result = $chat->sendMessage(
				auth()->id(),
				$request->input('conversation_id'),
				$request->input('message'),
				$request->input('message_id'),
				$request->boolean('verify')
			);
			return response()->json([
				'conversation_id' => $result['conversation']->id,
				'reply' => $result['reply'],
				'reasoning' => $result['reasoning'],
				'model' => $result['model'],
				'usage' => $result['usage']
			]);
		} catch (\RuntimeException $e) {
			return response()->json(['message' => $e->getMessage()], 503);
		}
	}

	public function index()
	{
		return $this->success(app(ChatService::class)->getUserConversations(auth()->id()));
	}

	public function show($id)
	{
		return $this->success(app(ChatService::class)->getConversation($id, auth()->id()));
	}

	public function update($id)
	{
		return $this->success(app(ChatService::class)->updateConversation($id, auth()->id(), request('title')));
	}

	public function destroy($id)
	{
		app(ChatService::class)->deleteConversation($id, auth()->id());
		return response()->noContent();
	}
}
