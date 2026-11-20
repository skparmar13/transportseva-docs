<?php
require 'C:/laragon/www/ts/transportseva-api/vendor/autoload.php';
// Do not boot a second Laravel kernel here: it leaves extra exception handlers
// installed in PHPUnit. Each test boots its own application normally.
$read = fn($key) => $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
if ($read('APP_ENV') !== 'testing' || $read('DB_DATABASE') !== 'transportseva_employee_test'
    || filled($read('DB_URL')) || is_file('C:/laragon/www/ts/transportseva-api/bootstrap/cache/config.php')) {
    throw new RuntimeException('Booking regression tests require the isolated transportseva_employee_test database.');
}
