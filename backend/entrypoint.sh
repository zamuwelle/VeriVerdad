#!/bin/sh
php artisan migrate --force --database=postgres_backup
php artisan migrate --force
php artisan queue:clear

(while true; do
	php artisan schedule:run
	sleep 60
done) &

php artisan queue:work --sleep=3 --tries=3 &

php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=8000