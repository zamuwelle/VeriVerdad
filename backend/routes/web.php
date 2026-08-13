<?php

use Illuminate\Support\Facades\Route;

Route::get('favicon.ico', fn() => response()->noContent());
Route::get('/health', fn() => response('ok', 200));
