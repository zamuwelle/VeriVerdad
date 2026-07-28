<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecretTokenMiddleware
{
	/**
	 * Handle an incoming request.
	 *
	 * @param  Closure(Request): (Response)  $next
	 */
	public function handle(Request $request, Closure $next)
	{
		$secretToken = config('secret.token');
		
		if (empty($secretToken) || $request->header('X-Secret-Token') !== $secretToken) {
			abort(401);
		}

		return $next($request);
	}
}