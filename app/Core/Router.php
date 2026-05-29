<?php

namespace App\Core;

final class Router
{
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    private function add(string $method, string $path, callable $handler): void
    {
        $this->routes[$method][$this->normalize($path)] = $handler;
    }

    public function dispatch(string $method, string $path): void
    {
        $path = $this->normalize($path);
        $handler = $this->routes[$method][$path] ?? null;

        if (!$handler) {
            Response::error('Route introuvable.', 404);
            return;
        }

        $handler($this->input());
    }

    private function normalize(string $path): string
    {
        $path = parse_url($path, PHP_URL_PATH) ?: '/';
        return '/' . trim($path, '/');
    }

    private function input(): array
    {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw ?: '', true);

        if (is_array($json)) {
            return $json;
        }

        return $_POST ?: $_GET;
    }
}
