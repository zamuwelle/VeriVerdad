<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up()
	{
		Schema::create('cache', function ($table) {
			$table->string('key')->primary();
			$table->text('value');
			$table->integer('expiration');
		});
	}

	public function down()
	{
		Schema::dropIfExists('cache');
	}
};
