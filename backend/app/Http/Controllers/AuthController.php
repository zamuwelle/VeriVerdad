<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Services\SyncService;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
	public function register(RegisterRequest $request, SyncService $sync)
	{
		$user = User::create($request->validated());
		$sync->syncUser($user);

		return $this->success([
			'user' => $user,
			'token' => $user->createToken('auth-token')->plainTextToken
		]);
	}

	public function login(LoginRequest $request)
	{
		$user = User::where('email', $request->email)->first();

		if (! $user || ! Hash::check($request->password, $user->password)) {
			return $this->error('Incorrect email or password.', 401);
		}

		return $this->success([
			'user' => $user,
			'token' => $user->createToken('auth-token')->plainTextToken
		]);
	}

	public function logout()
	{
		$user = request()->user();
		if ($user) {
			$user->currentAccessToken()->delete();
		}

		return response()->noContent();
	}

	public function users()
	{
		$sync = app(SyncService::class);
		$sync->syncFromPostgres();

		$users = User::select('id', 'username')
			->withCount('conversations')
			->orderByDesc('conversations_count')
			->get();

		return $this->success($users);
	}
}
