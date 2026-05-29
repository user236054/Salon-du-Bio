<?php

namespace App\Services;

use DomainException;
use PDO;

final class StockService
{
    public function __construct(private PDO $db)
    {
    }

    public function reserveVariant(int $variantId, int $sellerId, float $quantity, ?int $orderId = null): void
    {
        $stmt = $this->db->prepare(
            'SELECT stock, reserved_stock FROM product_variants WHERE id = ? FOR UPDATE'
        );
        $stmt->execute([$variantId]);
        $variant = $stmt->fetch();

        if (!$variant) {
            throw new DomainException('Variante produit introuvable.');
        }

        $available = (float) $variant['stock'] - (float) $variant['reserved_stock'];

        if ($quantity <= 0 || $quantity > $available) {
            throw new DomainException('Stock insuffisant pour une variante du panier.');
        }

        $update = $this->db->prepare(
            'UPDATE product_variants SET reserved_stock = reserved_stock + ? WHERE id = ?'
        );
        $update->execute([$quantity, $variantId]);

        $movement = $this->db->prepare(
            "INSERT INTO stock_movements
            (variant_id, seller_id, movement_type, quantity, reference_type, reference_id, note)
            VALUES (?, ?, 'reserved', ?, 'order', ?, 'Reservation checkout')"
        );
        $movement->execute([$variantId, $sellerId, $quantity, $orderId]);
    }
}
