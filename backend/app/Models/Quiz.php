<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'conversation_id', 'score', 'submitted_at'])]
class Quiz extends Model
{
	protected $casts = [
		'submitted_at' => 'datetime'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function conversation()
	{
		return $this->belongsTo(Conversation::class);
	}
}
