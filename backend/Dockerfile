FROM dunglas/frankenphp

RUN install-php-extensions \
    pcntl \
    pdo_mysql \
    mbstring \
    exif \
    bcmath \
    gd \
    zip \
    opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-interaction --optimize-autoloader --no-dev

RUN mkdir -p /app/database && touch /app/database/database.sqlite
RUN chmod 777 /app/database/database.sqlite

RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache
RUN chmod -R 775 /app/storage /app/bootstrap/cache

RUN php artisan octane:install --server=frankenphp
RUN setcap -r /usr/local/bin/frankenphp

# Run migrations to create tables
RUN php artisan migrate --force

ENTRYPOINT ["php", "artisan", "octane:start", "--server=frankenphp", "--host=0.0.0.0", "--port=8000"]

EXPOSE 8000