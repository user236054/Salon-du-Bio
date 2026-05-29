<?php

namespace App\Services;

use PDO;

final class CartService
{
    public function __construct(private PDO $db)
    {
    }

    public function getDetailedItems(int $cartId): array
    {
        $stmt = $this->db->prepare(
            "SELECT
                ci.quantity,
                pv.id AS variant_id,
                pv.product_id,
                pv.sku,
                pv.label AS variant_label,
                pv.price,
                pv.stock,
                pv.reserved_stock,
                pv.weight_kg,
                u.symbol AS unit_symbol,
                p.name AS product_name,
                p.product_type,
                p.is_perishable,
                p.region_id AS production_region_id,
                s.id AS seller_id,
                s.user_id AS seller_user_id,
                s.region_id AS seller_region_id,
                s.commission_rate
            FROM cart_items ci
            JOIN product_variants pv ON pv.id = ci.variant_id
            JOIN units u ON u.id = pv.unit_id
            JOIN products p ON p.id = pv.product_id
            JOIN sellers s ON s.id = p.seller_id
            WHERE ci.cart_id = ?
              AND pv.status = 'active'
              AND p.status = 'active'
              AND s.status = 'approved'"
        );
        $stmt->execute([$cartId]);

        return $stmt->fetchAll();
    }

    public function clear(int $cartId): void
    {
        $stmt = $this->db->prepare('DELETE FROM cart_items WHERE cart_id = ?');
        $stmt->execute([$cartId]);
    }
}
