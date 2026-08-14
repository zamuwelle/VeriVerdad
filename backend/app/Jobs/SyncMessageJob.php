<?php

namespace App\Jobs;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class SyncMessageJob implements ShouldQueue
{
	use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

	public function __construct(public $messageId) {}

	public function handle()
	{
		$message = Message::find($this->messageId);

		if (! $message) {
			return;
		}

		try {
			DB::connection('postgres_backup')->table('messages')->updateOrInsert(['id' => $message->id], [
				'conversation_id' => $message->conversation_id,
				'role' => $message->role,
				'content' => $message->content,
				'reasoning' => $message->reasoning,
				'created_at' => $message->created_at,
				'updated_at' => $message->updated_at,
			]);
		} catch (\Throwable $e) {
			file_put_contents(storage_path('logs/sync_errors.log'), date('c') . ' ' . $e->getMessage() . PHP_EOL, FILE_APPEND);
		}
	}
}