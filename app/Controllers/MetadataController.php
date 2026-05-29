<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;

final class MetadataController
{
    public function index(): void
    {
        $db = Database::connection();

        Response::json([
            'success' => true,
            'data' => [
                'regions' => $db->query('SELECT id, name, slug FROM regions ORDER BY name')->fetchAll(),
                'categories' => $db->query('SELECT id, name, slug FROM product_categories ORDER BY name')->fetchAll(),
                'units' => $db->query('SELECT id, name, symbol FROM units ORDER BY name')->fetchAll(),
            ],
        ]);
    }
}
