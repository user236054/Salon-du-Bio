<?php

namespace App\Services;

use PDO;

final class NotificationService
{
    public function __construct(private PDO $db)
    {
    }

    public function create(int $userId, string $type, string $title, string $message, array $data = [], string $channel = 'dashboard'): void
    {
        $stmt = $this->db->prepare(
            "INSERT INTO notifications (user_id, channel, type, title, message, data)
            VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $userId,
            $channel,
            $type,
            $title,
            $message,
            $data ? json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
        ]);
    }
}
