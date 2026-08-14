<?php

namespace App\Jobs;

use App\Models\Conversation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class SyncConversationJob implements ShouldQueue
{
	use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

	public function __construct(public $conversationId) {}

	public function handle()
	{
		$conversation = Conversation::find($this->conversationId);

		if (! $conversation) {
			return;
		}

		try {
			DB::connection('postgres_backup')->table('conversations')->updateOrInsert(['id' => $conversation->id], [
				'user_id' => $conversation->user_id,
				'title' => $conversation->title,
				'created_at' => $conversation->created_at,
				'updated_at' => $conversation->updated_at,
			]);
		} catch (\Throwable $e) {
			file_put_contents(storage_path('logs/sync_errors.log'), date('c') . ' ' . $e->getMessage() . PHP_EOL, FILE_APPEND);
		}
	}
}