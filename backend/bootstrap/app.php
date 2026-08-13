<?php

use App\Http\Middleware\SecretTokenMiddleware;
use Illuminate\Foundation\Application;

return Application::configure(basePath: dirname(__DIR__))
	->withRouting(
		api: __DIR__ . '/../routes/api.php',
		web: __DIR__ . '/../routes/web.php',
	)
	->withMiddleware(function ($middleware) {
		$middleware->alias([
			'secret.token' => SecretTokenMiddleware::class,
		]);
	})
	->withExceptions(function ($exceptions) {
		$exceptions->shouldRenderJsonWhen(
			fn($request) => $request->is('api/*'),
		);
	})->create();
