<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class SyncUserJob implements ShouldQueue
{
	use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

	public function __construct(public $userId) {}

	public function handle()
	{
		$user = User::find($this->userId);

		if (! $user) {
			file_put_contents(storage_path('logs/sync_errors.log'), date('c') . ' User not found: ' . $this->userId . PHP_EOL, FILE_APPEND);
			return;
		}

		try {
			DB::connection('postgres_backup')->table('users')->updateOrInsert(['id' => $user->id], [
				'username' => $user->username,
				'email' => $user->email,
				'password' => $user->password,
				'created_at' => $user->created_at,
				'updated_at' => $user->updated_at,
			]);
			file_put_contents(storage_path('logs/sync_errors.log'), date('c') . ' SyncUserJob succeeded for user: ' . $user->id . PHP_EOL, FILE_APPEND);
		} catch (\Throwable $e) {
			file_put_contents(storage_path('logs/sync_errors.log'), date('c') . ' ' . $e->getMessage() . PHP_EOL, FILE_APPEND);
		}
	}
}