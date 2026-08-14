<?php

namespace App\Http\Controllers;

use App\Models\User;

class LeaderboardController extends Controller
{
	public function index()
	{
		$chatLeaderboard = User::select('id', 'username')
			->withCount('conversations')
			->orderByDesc('conversations_count')
			->get();
		$quizLeaderboard = User::select('id', 'username')
			->withSum('quizzes as total_score', 'score')
			->orderByDesc('total_score')
			->get()
			->each(fn($u) => $u->total_score = $u->total_score ?? 0);
		$overallScores = [];
		foreach ($chatLeaderboard as $u) {
			$overallScores[$u->id] = ['id' => $u->id, 'username' => $u->username, 'score' => (int) $u->conversations_count];
		}
		foreach ($quizLeaderboard as $u) {
			$overallScores[$u->id] = [
				'id' => $u->id,
				'username' => $u->username,
				'score' => ($overallScores[$u->id]['score'] ?? 0) + (int) $u->total_score
			];
		}
		$overallLeaderboard = collect($overallScores)->sortByDesc('score')->values()->all();
		return $this->success(compact('chatLeaderboard', 'quizLeaderboard', 'overallLeaderboard'));
	}
}
