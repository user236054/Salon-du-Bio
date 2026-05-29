<?php

namespace App\Services;

use DomainException;
use PDO;
use Throwable;

final class CheckoutService
{
    public function __construct(
        private PDO $db,
        private CartService $cartService,
        private StockService $stockService,
        private DeliveryService $deliveryService,
        private CommissionService $commissionService,
        private PaymentService $paymentService,
        private NotificationService $notificationService
    ) {
    }

    public function checkout(int $cartId, array $customer, string $paymentProvider): array
    {
        $items = $this->cartService->getDetailedItems($cartId);

        if (!$items) {
            throw new DomainException('Panier vide ou produits indisponibles.');
        }

        $groups = $this->groupBySeller($items);

        $this->db->beginTransaction();

        try {
            $orderId = $this->createGlobalOrder($customer);
            $orderTotals = [
                'subtotal' => 0.0,
                'delivery_total' => 0.0,
                'commission_total' => 0.0,
                'total' => 0.0,
            ];
            $sellerOrders = [];

            foreach ($groups as $sellerId => $sellerItems) {
                $sellerOrder = $this->createSellerOrder(
                    $orderId,
                    (int) $sellerId,
                    $sellerItems,
                    (int) $customer['delivery_region_id']
                );

                foreach ($sellerItems as $item) {
                    $this->stockService->reserveVariant(
                        (int) $item['variant_id'],
                        (int) $sellerId,
                        (float) $item['quantity'],
                        $orderId
                    );
                    $this->createSellerOrderItem($sellerOrder['id'], $item);
                }

                $this->createDelivery($sellerOrder);
                $this->createSellerEarning($sellerOrder);

                $orderTotals['subtotal'] += $sellerOrder['subtotal'];
                $orderTotals['delivery_total'] += $sellerOrder['delivery_fee'];
                $orderTotals['commission_total'] += $sellerOrder['commission_amount'];
                $sellerOrders[] = $sellerOrder;
            }

            $orderTotals['total'] = $orderTotals['subtotal'] + $orderTotals['delivery_total'];
            $this->updateGlobalOrderTotals($orderId, $orderTotals);
            $payment = $this->paymentService->createPendingPayment($orderId, $orderTotals['total'], $paymentProvider);
            $this->notifySellers($sellerOrders, $orderId);
            $this->cartService->clear($cartId);

            $this->db->commit();

            return [
                'order_id' => $orderId,
                'payment' => $payment,
                'totals' => $orderTotals,
                'seller_orders' => $sellerOrders,
            ];
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function groupBySeller(array $items): array
    {
        $groups = [];

        foreach ($items as $item) {
            $groups[(int) $item['seller_id']][] = $item;
        }

        return $groups;
    }

    private function createGlobalOrder(array $customer): int
    {
        $orderNumber = 'SIBIO-' . date('YmdHis') . '-' . bin2hex(random_bytes(3));
        $stmt = $this->db->prepare(
            "INSERT INTO orders
            (order_number, user_id, customer_name, customer_phone, customer_email, delivery_region_id, delivery_address, payment_status, order_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')"
        );
        $stmt->execute([
            $orderNumber,
            $customer['user_id'] ?? null,
            $customer['customer_name'],
            $customer['customer_phone'],
            $customer['customer_email'] ?? null,
            $customer['delivery_region_id'],
            $customer['delivery_address'],
        ]);

        return (int) $this->db->lastInsertId();
    }

    private function createSellerOrder(int $orderId, int $sellerId, array $items, int $deliveryRegionId): array
    {
        $subtotal = 0.0;
        $fromRegionId = (int) $items[0]['seller_region_id'];
        $commissionRate = (float) $items[0]['commission_rate'];

        foreach ($items as $item) {
            if ((float) $item['quantity'] <= 0) {
                throw new DomainException('Quantite invalide.');
            }

            $subtotal += (float) $item['quantity'] * (float) $item['price'];
        }

        $delivery = $this->deliveryService->calculateForSeller($sellerId, $fromRegionId, $deliveryRegionId, $items);
        $commission = $this->commissionService->calculate($subtotal, $commissionRate);
        $sellerOrderNumber = 'SO-' . date('YmdHis') . '-' . $sellerId . '-' . bin2hex(random_bytes(2));

        $stmt = $this->db->prepare(
            "INSERT INTO seller_orders
            (order_id, seller_id, seller_order_number, subtotal, delivery_fee, commission_rate,
             commission_amount, seller_gross_amount, seller_net_amount, estimated_delivery_days)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $orderId,
            $sellerId,
            $sellerOrderNumber,
            $subtotal,
            $delivery['fee'],
            $commission['rate'],
            $commission['amount'],
            $subtotal,
            $commission['seller_net_amount'],
            $delivery['estimated_days'],
        ]);

        return [
            'id' => (int) $this->db->lastInsertId(),
            'order_id' => $orderId,
            'seller_id' => $sellerId,
            'seller_user_id' => (int) $items[0]['seller_user_id'],
            'seller_order_number' => $sellerOrderNumber,
            'from_region_id' => $fromRegionId,
            'to_region_id' => $deliveryRegionId,
            'subtotal' => $subtotal,
            'delivery_fee' => $delivery['fee'],
            'commission_amount' => $commission['amount'],
            'seller_net_amount' => $commission['seller_net_amount'],
            'estimated_delivery_days' => $delivery['estimated_days'],
            'delivery_message' => $delivery['message'],
        ];
    }

    private function createSellerOrderItem(int $sellerOrderId, array $item): void
    {
        $lineTotal = (float) $item['quantity'] * (float) $item['price'];

        $stmt = $this->db->prepare(
            "INSERT INTO seller_order_items
            (seller_order_id, product_id, variant_id, product_name, variant_label, sku, unit_symbol,
             quantity, unit_price, line_total, weight_kg)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $sellerOrderId,
            $item['product_id'],
            $item['variant_id'],
            $item['product_name'],
            $item['variant_label'],
            $item['sku'],
            $item['unit_symbol'],
            $item['quantity'],
            $item['price'],
            $lineTotal,
            $item['weight_kg'],
        ]);
    }

    private function createDelivery(array $sellerOrder): void
    {
        $stmt = $this->db->prepare(
            "INSERT INTO deliveries
            (seller_order_id, seller_id, from_region_id, to_region_id, delivery_fee, estimated_days, message)
            VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $sellerOrder['id'],
            $sellerOrder['seller_id'],
            $sellerOrder['from_region_id'],
            $sellerOrder['to_region_id'],
            $sellerOrder['delivery_fee'],
            $sellerOrder['estimated_delivery_days'],
            $sellerOrder['delivery_message'],
        ]);
    }

    private function createSellerEarning(array $sellerOrder): void
    {
        $availableAt = date('Y-m-d H:i:s', strtotime('+7 days'));
        $stmt = $this->db->prepare(
            "INSERT INTO seller_earnings
            (seller_order_id, seller_id, gross_amount, commission_amount, net_amount, available_at)
            VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $sellerOrder['id'],
            $sellerOrder['seller_id'],
            $sellerOrder['subtotal'],
            $sellerOrder['commission_amount'],
            $sellerOrder['seller_net_amount'],
            $availableAt,
        ]);
    }

    private function updateGlobalOrderTotals(int $orderId, array $totals): void
    {
        $stmt = $this->db->prepare(
            "UPDATE orders
            SET subtotal = ?, delivery_total = ?, commission_total = ?, total = ?
            WHERE id = ?"
        );
        $stmt->execute([
            $totals['subtotal'],
            $totals['delivery_total'],
            $totals['commission_total'],
            $totals['total'],
            $orderId,
        ]);
    }

    private function notifySellers(array $sellerOrders, int $orderId): void
    {
        foreach ($sellerOrders as $sellerOrder) {
            $this->notificationService->create(
                $sellerOrder['seller_user_id'],
                'new_seller_order',
                'Nouvelle commande recue',
                'Une nouvelle sous-commande vendeur vous a ete attribuee.',
                [
                    'order_id' => $orderId,
                    'seller_order_id' => $sellerOrder['id'],
                ]
            );
        }
    }
}
