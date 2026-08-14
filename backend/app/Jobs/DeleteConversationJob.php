<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class DeleteConversationJob implements ShouldQueue
{
	use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

	public function __construct(public $conversationId) {}

	public function handle()
	{
		try {
			DB::connection('postgres_backup')->table('conversations')->where('id', $this->conversationId)->delete();
			DB::connection('postgres_backup')->table('messages')->where('conversation_id', $this->conversationId)->delete();
		} catch (\Throwable $e) {
			file_put_contents(storage_path('logs/sync_errors.log'), date('c') . ' ' . $e->getMessage() . PHP_EOL, FILE_APPEND);
		}
	}
}