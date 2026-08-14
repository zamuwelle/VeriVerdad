<?php

namespace App\Jobs;

use App\Models\Quiz;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class SyncQuizJob implements ShouldQueue
{
	use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

	public function __construct(public $quizId) {}

	public function handle()
	{
		$quiz = Quiz::find($this->quizId);

		if (! $quiz) {
			return;
		}

		try {
			DB::connection('postgres_backup')->table('quizzes')->updateOrInsert(['id' => $quiz->id], [
				'user_id' => $quiz->user_id,
				'conversation_id' => $quiz->conversation_id,
				'score' => $quiz->score,
			]);
		} catch (\Throwable $e) {
			file_put_contents(storage_path('logs/sync_errors.log'), date('c') . ' ' . $e->getMessage() . PHP_EOL, FILE_APPEND);
		}
	}
}