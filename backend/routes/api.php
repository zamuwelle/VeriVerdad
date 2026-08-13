<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;

Route::middleware('secret.token')->group(function () {
	Route::post('register', [AuthController::class, 'register']);
	Route::post('login', [AuthController::class, 'login'])->name('login');

	Route::middleware('auth:sanctum')->group(function () {
		Route::post('logout', [AuthController::class, 'logout']);
		Route::post('chat', [ChatController::class, 'chat']);
		Route::get('chats', [ChatController::class, 'index']);
		Route::get('chats/{id}', [ChatController::class, 'show']);
		Route::patch('chats/{id}', [ChatController::class, 'update']);
		Route::delete('chats/{id}', [ChatController::class, 'destroy']);
	});
});
