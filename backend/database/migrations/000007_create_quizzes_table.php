<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up()
	{
		Schema::create('quizzes', function ($table) {
			$table->id();
			$table->foreignId('user_id')->constrained()->cascadeOnDelete();
			$table->foreignUuid('conversation_id')->nullable()->constrained()->nullOnDelete();
			$table->integer('score');
			$table->timestamp('submitted_at');
		});
	}

	public function down()
	{
		Schema::dropIfExists('quizzes');
	}
};
