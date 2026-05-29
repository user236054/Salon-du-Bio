<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Validator;
use App\Services\CartService;
use App\Services\DeliveryService;

final class DeliveryController
{
    public function estimate(array $input): void
    {
        $errors = Validator::require($input, ['cart_id', 'delivery_region_id']);

        if ($errors) {
            Response::error('Donnees de livraison invalides.', 422, $errors);
            return;
        }

        $db = Database::connection();
        $cartService = new CartService($db);
        $deliveryService = new DeliveryService($db);
        $items = $cartService->getDetailedItems((int) $input['cart_id']);

        if (!$items) {
            Response::error('Panier vide ou produits indisponibles.', 404);
            return;
        }

        $groups = [];

        foreach ($items as $item) {
            $groups[(int) $item['seller_id']][] = $item;
        }

        $sellerDeliveries = [];
        $deliveryTotal = 0.0;
        $maxDays = 0;

        foreach ($groups as $sellerId => $sellerItems) {
            $delivery = $deliveryService->calculateForSeller(
                (int) $sellerId,
                (int) $sellerItems[0]['seller_region_id'],
                (int) $input['delivery_region_id'],
                $sellerItems
            );

            $deliveryTotal += (float) $delivery['fee'];
            $maxDays = max($maxDays, (int) $delivery['estimated_days']);

            $sellerDeliveries[] = [
                'seller_id' => (int) $sellerId,
                'fee' => $delivery['fee'],
                'estimated_days' => $delivery['estimated_days'],
                'priority' => $delivery['priority'],
                'quote_required' => $delivery['quote_required'],
                'message' => $delivery['message'],
            ];
        }

        Response::json([
            'success' => true,
            'data' => [
                'delivery_total' => $deliveryTotal,
                'max_estimated_days' => $maxDays,
                'seller_deliveries' => $sellerDeliveries,
            ],
        ]);
    }
}
