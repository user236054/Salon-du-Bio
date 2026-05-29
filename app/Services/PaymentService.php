<?php

namespace App\Services;

use PDO;

final class PaymentService
{
    public function __construct(private PDO $db)
    {
    }

    public function createPendingPayment(int $orderId, float $amount, string $provider): array
    {
        $reference = 'PAY-' . date('YmdHis') . '-' . bin2hex(random_bytes(4));
        $stmt = $this->db->prepare(
            "INSERT INTO payments (order_id, provider, amount, internal_reference, status)
            VALUES (?, ?, ?, ?, 'pending')"
        );
        $stmt->execute([$orderId, $provider, $amount, $reference]);

        return [
            'id' => (int) $this->db->lastInsertId(),
            'internal_reference' => $reference,
            'status' => 'pending',
        ];
    }
}
