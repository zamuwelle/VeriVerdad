<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
	public function register(RegisterRequest $request)
	{
		return $this->success([
			'user' => $user = User::create($request->validated()),
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
		// Get all users except the currently logged-in user
		$users = User::where('id', '!=', auth()->id())
			->select('id', 'username')
			->get();

		return $this->success($users);
	}
}
