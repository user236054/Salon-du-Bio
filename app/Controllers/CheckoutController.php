<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Validator;
use App\Services\CartService;
use App\Services\CheckoutService;
use App\Services\CommissionService;
use App\Services\DeliveryService;
use App\Services\NotificationService;
use App\Services\PaymentService;
use App\Services\StockService;
use Throwable;

final class CheckoutController
{
    public function create(array $input): void
    {
        $errors = Validator::require($input, [
            'cart_id',
            'customer_name',
            'customer_phone',
            'delivery_region_id',
            'delivery_address',
            'payment_provider',
        ]);

        if ($errors) {
            Response::error('Donnees invalides.', 422, $errors);
            return;
        }

        $db = Database::connection();
        $checkout = new CheckoutService(
            $db,
            new CartService($db),
            new StockService($db),
            new DeliveryService($db),
            new CommissionService(),
            new PaymentService($db),
            new NotificationService($db)
        );

        try {
            $result = $checkout->checkout((int) $input['cart_id'], [
                'user_id' => $input['user_id'] ?? null,
                'customer_name' => trim((string) $input['customer_name']),
                'customer_phone' => trim((string) $input['customer_phone']),
                'customer_email' => $input['customer_email'] ?? null,
                'delivery_region_id' => (int) $input['delivery_region_id'],
                'delivery_address' => trim((string) $input['delivery_address']),
            ], (string) $input['payment_provider']);

            Response::json([
                'success' => true,
                'message' => 'Commande creee. Paiement en attente.',
                'data' => $result,
            ], 201);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
