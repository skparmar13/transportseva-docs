<?php

// Read-only local diagnosis: no tokens, passwords, query bindings or row data
// are printed, and no database schema/data is changed.
$started = hrtime(true);
$backend = $argv[1] ?? 'C:/laragon/www/ts/transportseva-api';
$email = $argv[2] ?? 'verify-truck-owner-1793028294862-62@transportseva.test';
chdir($backend);
require $backend.'/vendor/autoload.php';
$autoloaded = hrtime(true);
$app = require $backend.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$booted = hrtime(true);
\Illuminate\Support\Facades\DB::connection()->getPdo();
$connected = hrtime(true);
$user = \Modules\User\Models\User::query()->where('email', $email)->firstOrFail();
\Illuminate\Support\Facades\Auth::setUser($user);
$samples = [];
foreach ([20, 100] as $limit) {
    $request = \Illuminate\Http\Request::create('/api/marketplace-bookings', 'GET', ['per_page' => $limit]);
    $app->instance('request', $request);
    \Illuminate\Support\Facades\DB::flushQueryLog();
    \Illuminate\Support\Facades\DB::enableQueryLog();
    $requestStarted = hrtime(true);
    $response = $app->make(\Modules\Booking\Http\Controllers\MarketplaceBookingController::class)->index($request);
    $data = $response->getData(true);
    $elapsed = (hrtime(true) - $requestStarted) / 1e6;
    $queries = \Illuminate\Support\Facades\DB::getQueryLog();
    \Illuminate\Support\Facades\DB::disableQueryLog();
    $tables = [];
    foreach ($queries as $query) {
        if (preg_match('/from `([a-zA-Z0-9_]+)`/i', $query['query'], $match)) {
            $tables[$match[1]] = ($tables[$match[1]] ?? 0) + 1;
        }
    }
    $samples[] = [
        'per_page' => $limit, 'status' => $response->getStatusCode(),
        'rows' => count($data['data']), 'request_ms' => round($elapsed, 2),
        'query_count' => count($queries), 'sql_ms' => round(array_sum(array_column($queries, 'time')), 2),
        'queries_by_table' => $tables,
    ];
}
echo json_encode([
    'database' => \Illuminate\Support\Facades\DB::connection()->getDatabaseName(),
    'db_host' => config('database.connections.mysql.host'),
    'autoload_ms' => round(($autoloaded - $started) / 1e6, 2),
    'bootstrap_ms' => round(($booted - $autoloaded) / 1e6, 2),
    'db_connect_ms' => round(($connected - $booted) / 1e6, 2),
    'php' => PHP_VERSION, 'opcache_enabled' => ini_get('opcache.enable_cli'),
    'samples' => $samples,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL;
