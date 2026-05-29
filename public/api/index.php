<?php

require dirname(__DIR__, 2) . '/app/bootstrap.php';

use App\Core\Response;

try {
    $router = require dirname(__DIR__, 2) . '/app/routes/api.php';
    $path = $_GET['route'] ?? '/';
    $router->dispatch($_SERVER['REQUEST_METHOD'], $path);
} catch (Throwable $e) {
    Response::error('Erreur serveur.', 500, [
        'debug' => getenv('APP_DEBUG') ? $e->getMessage() : null,
    ]);
}
