<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up()
	{
		Schema::create('messages', function ($table) {
			$table->uuid('id')->primary();
			$table->foreignUuid('conversation_id')->constrained()->cascadeOnDelete();
			$table->string('role');
			$table->text('content');
			$table->text('reasoning')->nullable();
			$table->timestamps();

			$table->index(['conversation_id', 'created_at']);
		});
	}

	public function down()
	{
		Schema::dropIfExists('messages');
	}
};
