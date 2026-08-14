<?php

namespace App\Providers;

use App\Services\SyncService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
	public function register()
	{
	}

	public function boot()
	{
		if (env('APP_ENV') == 'production') {
			$this->app['request']->server->set('HTTPS', true);
		}

		app(SyncService::class)->bootstrapFromPostgres();
	}
}
