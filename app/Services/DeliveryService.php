<?php

namespace App\Services;

use PDO;

final class DeliveryService
{
    public function __construct(private PDO $db)
    {
    }

    public function calculateForSeller(int $sellerId, int $fromRegionId, int $toRegionId, array $items): array
    {
        $countryId = (int) (require dirname(__DIR__, 2) . '/config/app.php')['default_country_id'];
        $weight = 0.0;
        $quantity = 0.0;
        $priority = false;
        $productTypes = [];

        foreach ($items as $item) {
            $quantity += (float) $item['quantity'];
            $weight += (float) $item['weight_kg'] * (float) $item['quantity'];
            $priority = $priority || (bool) $item['is_perishable'];
            $productTypes[] = $item['product_type'];
        }

        $rule = $this->findBestRule($countryId, $sellerId, $fromRegionId, $toRegionId, $productTypes);

        if (!$rule) {
            $sameRegion = $fromRegionId === $toRegionId;
            return [
                'fee' => $sameRegion ? 0.0 : 2000.0,
                'estimated_days' => $sameRegion ? 3 : 10,
                'priority' => $priority,
                'quote_required' => false,
                'message' => $sameRegion
                    ? 'Livraison dans la region de production.'
                    : 'Produit expedie hors zone de production. Des frais supplementaires peuvent s appliquer.',
            ];
        }

        $fee = (float) $rule['base_fee']
            + ($weight * (float) $rule['fee_per_kg'])
            + ($quantity * (float) $rule['fee_per_item'])
            + ((float) $rule['estimated_distance_km'] * (float) $rule['distance_fee_per_km']);

        return [
            'fee' => round($fee, 2),
            'estimated_days' => (int) $rule['max_delivery_days'],
            'priority' => $priority || (bool) $rule['priority'],
            'quote_required' => (bool) $rule['quote_required'],
            'message' => $rule['message'],
        ];
    }

    private function findBestRule(int $countryId, int $sellerId, int $fromRegionId, int $toRegionId, array $productTypes): ?array
    {
        $placeholders = implode(',', array_fill(0, max(count($productTypes), 1), '?'));
        $params = array_merge(
            [$countryId, $sellerId, $fromRegionId, $toRegionId],
            $productTypes ?: ['normal']
        );

        $stmt = $this->db->prepare(
            "SELECT *
            FROM delivery_rules
            WHERE country_id = ?
              AND (seller_id IS NULL OR seller_id = ?)
              AND (from_region_id IS NULL OR from_region_id = ?)
              AND (to_region_id IS NULL OR to_region_id = ?)
              AND (product_type IS NULL OR product_type IN ($placeholders))
            ORDER BY
              seller_id IS NOT NULL DESC,
              product_type IS NOT NULL DESC,
              from_region_id IS NOT NULL DESC,
              to_region_id IS NOT NULL DESC
            LIMIT 1"
        );
        $stmt->execute($params);
        $rule = $stmt->fetch();

        return $rule ?: null;
    }
}
