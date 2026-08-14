<?php

namespace App\Services;

use App\Jobs\DeleteConversationJob;
use App\Jobs\SyncConversationJob;
use App\Jobs\SyncMessageJob;
use App\Jobs\SyncQuizJob;
use App\Jobs\SyncUserJob;
use Illuminate\Support\Facades\DB;

class SyncService
{
	protected function pg($table)
	{
		return DB::connection('postgres_backup')->table($table);
	}

	public function syncUser($user)
	{
		SyncUserJob::dispatch($user->id);
	}

	public function syncConversation($conversation)
	{
		SyncConversationJob::dispatch($conversation->id);
	}

	public function syncMessage($message)
	{
		SyncMessageJob::dispatch($message->id);
	}

	public function syncQuiz($quiz)
	{
		SyncQuizJob::dispatch($quiz->id);
	}

	public function deleteConversation($id)
	{
		DeleteConversationJob::dispatch($id);
	}

	public function bootstrapFromPostgres()
	{
		try {
			if (DB::connection('sqlite')->table('users')->count() > 0) {
				return;
			}

			$this->syncFromPostgres();
		} catch (\Throwable $e) {
			file_put_contents(storage_path('logs/sync_errors.log'), date('c') . ' ' . $e->getMessage() . PHP_EOL, FILE_APPEND);
		}
	}

	public function syncFromPostgres()
	{
		try {
			$pgUsers = $this->pg('users')->get()->keyBy('id');
			$sqliteUsers = DB::connection('sqlite')->table('users')->get()->keyBy('id');

			foreach ($pgUsers as $id => $user) {
				if (!isset($sqliteUsers[$id]) || $sqliteUsers[$id]->updated_at != $user->updated_at) {
					DB::connection('sqlite')->table('users')->updateOrInsert(['id' => $id], (array) $user);
				}
			}

			$pgConvs = $this->pg('conversations')->get()->keyBy('id');
			$sqliteConvs = DB::connection('sqlite')->table('conversations')->get()->keyBy('id');

			foreach ($pgConvs as $id => $conv) {
				if (!isset($sqliteConvs[$id]) || $sqliteConvs[$id]->updated_at != $conv->updated_at) {
					DB::connection('sqlite')->table('conversations')->updateOrInsert(['id' => $id], (array) $conv);
				}
			}

			$pgMsgs = $this->pg('messages')->get()->keyBy('id');
			$sqliteMsgs = DB::connection('sqlite')->table('messages')->get()->keyBy('id');

			foreach ($pgMsgs as $id => $msg) {
				if (!isset($sqliteMsgs[$id]) || $sqliteMsgs[$id]->updated_at != $msg->updated_at) {
					DB::connection('sqlite')->table('messages')->updateOrInsert(['id' => $id], (array) $msg);
				}
			}
		} catch (\Throwable $e) {
			file_put_contents(storage_path('logs/sync_errors.log'), date('c') . ' ' . $e->getMessage() . PHP_EOL, FILE_APPEND);
		}
	}
}