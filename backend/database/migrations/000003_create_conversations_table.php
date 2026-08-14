<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up()
	{
		Schema::create('conversations', function ($table) {
			$table->uuid('id')->primary();
			$table->foreignId('user_id')->constrained()->cascadeOnDelete();
			$table->string('title')->nullable();
			$table->timestamps();
		});
	}

	public function down()
	{
		Schema::dropIfExists('conversations');
	}
};
