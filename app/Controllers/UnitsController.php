<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;

final class UnitsController
{
    public function index(): void
    {
        $db = Database::connection();
        $stmt = $db->query('SELECT id, name, symbol FROM units ORDER BY id ASC');
        $units = $stmt->fetchAll();

        Response::json([
            'success' => true,
            'data' => $units,
        ]);
    }
}
