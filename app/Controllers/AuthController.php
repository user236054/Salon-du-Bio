<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Session;
use App\Core\Validator;
use Throwable;

final class AuthController
{
    public function register(array $input): void
    {
        $errors = Validator::require($input, ['full_name', 'phone', 'password']);

        if ($errors || strlen((string) $input['password']) < 8) {
            Response::error('Donnees inscription invalides. Mot de passe minimum 8 caracteres.', 422, $errors);
            return;
        }

        $db = Database::connection();

        try {
            $stmt = $db->prepare(
                "INSERT INTO users (full_name, email, phone, password_hash, role)
                VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([
                trim((string) $input['full_name']),
                $input['email'] ?? null,
                trim((string) $input['phone']),
                password_hash((string) $input['password'], PASSWORD_DEFAULT),
                $input['role'] ?? 'customer',
            ]);

            Response::json([
                'success' => true,
                'message' => 'Compte cree.',
                'data' => ['user_id' => (int) $db->lastInsertId()],
            ], 201);
        } catch (Throwable $e) {
            Response::error('Impossible de creer le compte. Telephone ou email deja utilise.', 400);
        }
    }

    public function login(array $input): void
    {
        $errors = Validator::require($input, ['identifier', 'password']);

        if ($errors) {
            Response::error('Identifiants requis.', 422, $errors);
            return;
        }

        $db = Database::connection();
        $stmt = $db->prepare(
            "SELECT * FROM users
            WHERE (email = ? OR phone = ?) AND status = 'active'
            LIMIT 1"
        );
        $stmt->execute([$input['identifier'], $input['identifier']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify((string) $input['password'], $user['password_hash'])) {
            Response::error('Identifiants incorrects.', 401);
            return;
        }

        Session::login($user);

        Response::json([
            'success' => true,
            'message' => 'Connexion reussie.',
            'data' => Session::user(),
        ]);
    }

    public function me(): void
    {
        Response::json([
            'success' => true,
            'data' => Session::user(),
        ]);
    }

    public function logout(): void
    {
        Session::logout();

        Response::json([
            'success' => true,
            'message' => 'Deconnexion reussie.',
        ]);
    }
}
