<?php

namespace App\Core;

use PDO;

final class Auth
{
    public static function user(): ?array
    {
        return Session::user();
    }

    public static function userId(): ?int
    {
        $user = self::user();

        return $user ? (int) $user['id'] : null;
    }

    public static function requireUser(): array
    {
        $user = self::user();

        if (!$user) {
            throw new \DomainException('Connexion requise.');
        }

        return $user;
    }

    public static function requireRole(string $role): array
    {
        $user = self::requireUser();

        if (($user['role'] ?? null) !== $role) {
            throw new \DomainException('Acces non autorise.');
        }

        return $user;
    }

    public static function sellerIdForCurrentUser(PDO $db): ?int
    {
        $userId = self::userId();

        if (!$userId) {
            return null;
        }

        $stmt = $db->prepare(
            "SELECT id FROM sellers
            WHERE user_id = ? AND status = 'approved'
            ORDER BY id DESC
            LIMIT 1"
        );
        $stmt->execute([$userId]);
        $sellerId = $stmt->fetchColumn();

        return $sellerId ? (int) $sellerId : null;
    }

    public static function requireAdmin(): array
    {
        return self::requireRole('admin');
    }

    public static function requireApprovedSeller(PDO $db): int
    {
        $user = self::requireRole('seller');
        $stmt = $db->prepare(
            "SELECT id FROM sellers
            WHERE user_id = ? AND status = 'approved'
            ORDER BY id DESC
            LIMIT 1"
        );
        $stmt->execute([(int) $user['id']]);
        $sellerId = $stmt->fetchColumn();

        if (!$sellerId) {
            throw new \DomainException('Boutique vendeur non approuvee.');
        }

        return (int) $sellerId;
    }

    public static function resolveSellerId(PDO $db, array $input): int
    {
        $user = self::user();

        if ($user) {
            return self::requireApprovedSeller($db);
        }

        return (int) ($input['seller_id'] ?? 0);
    }
}
