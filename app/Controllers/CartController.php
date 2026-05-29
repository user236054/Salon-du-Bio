<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Validator;

final class CartController
{
    public function show(array $input): void
    {
        $cartId = (int) ($input['cart_id'] ?? 0);

        if ($cartId <= 0) {
            Response::error('cart_id requis.', 422);
            return;
        }

        $db = Database::connection();
        $stmt = $db->prepare(
            "SELECT
                ci.id,
                ci.quantity,
                pv.id AS variant_id,
                pv.label AS variant_label,
                pv.price,
                pv.weight_kg,
                u.symbol AS unit_symbol,
                p.id AS product_id,
                p.name AS product_name,
                p.product_type,
                p.region_id,
                s.id AS seller_id,
                s.shop_name,
                (ci.quantity * pv.price) AS line_total
            FROM cart_items ci
            JOIN product_variants pv ON pv.id = ci.variant_id
            JOIN units u ON u.id = pv.unit_id
            JOIN products p ON p.id = pv.product_id
            JOIN sellers s ON s.id = p.seller_id
            WHERE ci.cart_id = ?
            ORDER BY s.shop_name, p.name"
        );
        $stmt->execute([$cartId]);
        $items = $stmt->fetchAll();

        $subtotal = array_reduce($items, fn (float $sum, array $item) => $sum + (float) $item['line_total'], 0.0);

        Response::json([
            'success' => true,
            'data' => [
                'cart_id' => $cartId,
                'items' => $items,
                'subtotal' => $subtotal,
            ],
        ]);
    }

    public function addItem(array $input): void
    {
        $errors = Validator::require($input, ['variant_id', 'quantity']);

        if ($errors || !Validator::positiveNumber($input['quantity'])) {
            Response::error('Donnees panier invalides.', 422, $errors);
            return;
        }

        $db = Database::connection();
        $cartId = (int) ($input['cart_id'] ?? 0);

        if ($cartId <= 0) {
            $cartId = $this->createCart($db, $input);
        }

        $variantId = (int) $input['variant_id'];
        $quantity = (float) $input['quantity'];

        $stmt = $db->prepare(
            "SELECT pv.stock, pv.reserved_stock, pv.status, p.status AS product_status, s.status AS seller_status
            FROM product_variants pv
            JOIN products p ON p.id = pv.product_id
            JOIN sellers s ON s.id = p.seller_id
            WHERE pv.id = ?"
        );
        $stmt->execute([$variantId]);
        $variant = $stmt->fetch();

        if (!$variant || $variant['status'] !== 'active' || $variant['product_status'] !== 'active' || $variant['seller_status'] !== 'approved') {
            Response::error('Produit indisponible.', 404);
            return;
        }

        if ($quantity > ((float) $variant['stock'] - (float) $variant['reserved_stock'])) {
            Response::error('Stock insuffisant.', 409);
            return;
        }

        $stmt = $db->prepare(
            "INSERT INTO cart_items (cart_id, variant_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)"
        );
        $stmt->execute([$cartId, $variantId, $quantity]);

        Response::json([
            'success' => true,
            'message' => 'Produit ajoute au panier.',
            'data' => ['cart_id' => $cartId],
        ], 201);
    }

    public function updateItem(array $input): void
    {
        $errors = Validator::require($input, ['cart_id', 'variant_id', 'quantity']);

        if ($errors || !Validator::positiveNumber($input['quantity'])) {
            Response::error('Donnees panier invalides.', 422, $errors);
            return;
        }

        $cartId = (int) $input['cart_id'];
        $variantId = (int) $input['variant_id'];
        $quantity = (float) $input['quantity'];

        if ($cartId <= 0 || $variantId <= 0) {
            Response::error('cart_id et variant_id requis.', 422);
            return;
        }

        $db = Database::connection();
        $stmt = $db->prepare(
            "SELECT stock, reserved_stock FROM product_variants WHERE id = ?"
        );
        $stmt->execute([$variantId]);
        $variant = $stmt->fetch();

        if (!$variant) {
            Response::error('Variante introuvable.', 404);
            return;
        }

        $available = (float) $variant['stock'] - (float) $variant['reserved_stock'];

        if ($quantity > $available) {
            Response::error('Stock insuffisant.', 409);
            return;
        }

        $stmt = $db->prepare(
            'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND variant_id = ?'
        );
        $stmt->execute([$quantity, $cartId, $variantId]);

        if ($stmt->rowCount() === 0) {
            Response::error('Article introuvable dans le panier.', 404);
            return;
        }

        Response::json([
            'success' => true,
            'message' => 'Quantite du panier mise a jour.',
            'data' => ['cart_id' => $cartId],
        ]);
    }

    public function removeItem(array $input): void
    {
        $errors = Validator::require($input, ['cart_id', 'variant_id']);

        if ($errors) {
            Response::error('Donnees panier invalides.', 422, $errors);
            return;
        }

        $cartId = (int) $input['cart_id'];
        $variantId = (int) $input['variant_id'];

        if ($cartId <= 0 || $variantId <= 0) {
            Response::error('cart_id et variant_id requis.', 422);
            return;
        }

        $db = Database::connection();
        $stmt = $db->prepare('DELETE FROM cart_items WHERE cart_id = ? AND variant_id = ?');
        $stmt->execute([$cartId, $variantId]);

        Response::json([
            'success' => true,
            'message' => 'Article supprime du panier.',
            'data' => ['cart_id' => $cartId],
        ]);
    }

    private function createCart(\PDO $db, array $input): int
    {
        $stmt = $db->prepare('INSERT INTO carts (user_id, session_id) VALUES (?, ?)');
        $stmt->execute([
            $input['user_id'] ?? null,
            $input['session_id'] ?? bin2hex(random_bytes(16)),
        ]);

        return (int) $db->lastInsertId();
    }
}
