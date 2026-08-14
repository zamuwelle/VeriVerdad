<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['username', 'email', 'password'])]
#[Hidden(['password'])]
class User extends Authenticatable
{
	use HasApiTokens, HasFactory;

	protected function casts()
	{
		return [
			'password' => 'hashed'
		];
	}

	public function conversations()
	{
		return $this->hasMany(Conversation::class);
	}

	public function quizzes()
	{
		return $this->hasMany(Quiz::class);
	}
}
