<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;

final class ProductController
{
    public function index(): void
    {
        $db = Database::connection();
        $stmt = $db->query(
            "SELECT
                p.id,
                p.name,
                p.slug,
                p.description,
                p.product_type,
                p.is_perishable,
                p.region_id,
                r.name AS region_name,
                c.name AS category_name,
                s.shop_name,
                MIN(pv.id) AS variant_id,
                MIN(pv.price) AS starting_price,
                u.symbol AS unit_symbol,
                MAX(CASE WHEN pi.is_main = 1 THEN pi.image_path ELSE NULL END) AS image_path
            FROM products p
            JOIN sellers s ON s.id = p.seller_id
            JOIN regions r ON r.id = p.region_id
            JOIN product_categories c ON c.id = p.category_id
            JOIN product_variants pv ON pv.product_id = p.id AND pv.status = 'active'
            JOIN units u ON u.id = pv.unit_id
            LEFT JOIN product_images pi ON pi.product_id = p.id
            WHERE p.status = 'active' AND s.status = 'approved'
            GROUP BY
                p.id,
                p.name,
                p.slug,
                p.description,
                p.product_type,
                p.is_perishable,
                p.region_id,
                r.name,
                c.name,
                s.shop_name,
                u.symbol
            ORDER BY p.created_at DESC
            LIMIT 48"
        );

        Response::json([
            'success' => true,
            'data' => $stmt->fetchAll(),
        ]);
    }

    public function create(array $input): void
    {
        // Accept multipart/form-data (fields in $input from Router->input will be $_POST)
        $errors = \App\Core\Validator::require($input, ['name', 'price', 'stock', 'unit_id', 'region_id']);

        if ($errors) {
            Response::error('Donnees produit invalides.', 422, $errors);
            return;
        }

        $name = trim((string) ($input['name'] ?? ''));
        $price = (float) $input['price'];
        $stock = (float) $input['stock'];
        $unitId = (int) $input['unit_id'];
        $regionId = (int) $input['region_id'];
        $categoryId = (int) ($input['category_id'] ?? 1);
        $description = trim((string) ($input['description'] ?? ''));

        if ($price <= 0 || $stock < 0 || $unitId <= 0 || $regionId <= 0) {
            Response::error('Valeurs numeriques invalides.', 422);
            return;
        }

        $db = \App\Core\Database::connection();

        // Validate unit exists
        $stmt = $db->prepare('SELECT id FROM units WHERE id = ?');
        $stmt->execute([$unitId]);
        if (!$stmt->fetch()) {
            Response::error('Unite introuvable.', 422);
            return;
        }

        // Validate region exists
        $stmt = $db->prepare('SELECT id FROM regions WHERE id = ?');
        $stmt->execute([$regionId]);
        if (!$stmt->fetch()) {
            Response::error('Region introuvable.', 422);
            return;
        }

        // Handle image upload (optional)
        $imagePath = null;
        if (!empty($_FILES['image']['name'])) {
            $file = $_FILES['image'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                Response::error('Erreur upload image.', 400);
                return;
            }

            $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            if (!isset($allowed[$mime])) {
                Response::error('Type d image non autorise.', 415);
                return;
            }

            if ($file['size'] > 5 * 1024 * 1024) {
                Response::error('Image trop volumineuse (max 5MB).', 413);
                return;
            }

            $ext = $allowed[$mime];
            $uploadDir = __DIR__ . '/../../public/uploads/products';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            $filename = bin2hex(random_bytes(12)) . '.' . $ext;
            $dest = $uploadDir . '/' . $filename;

            if (!move_uploaded_file($file['tmp_name'], $dest)) {
                Response::error('Impossible d enregistrer l image.', 500);
                return;
            }

            // Public path
            $imagePath = '/uploads/products/' . $filename;
        }

        // For MVP assign seller_id = 1 (default seller created by seed)
        $sellerId = 1;

        try {
            $db->beginTransaction();

            $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($name));

            $stmt = $db->prepare('INSERT INTO products (seller_id, category_id, region_id, name, slug, description, status) VALUES (?, ?, ?, ?, ?, ?, ? )');
            $stmt->execute([$sellerId, $categoryId, $regionId, $name, $slug, $description, 'active']);
            $productId = (int) $db->lastInsertId();

            // Insert variant as default
            $sku = 'SKU-' . strtoupper(substr(sha1(uniqid((string) $productId, true)), 0, 8));
            $label = $input['label'] ?? 'Standard';
            $quantityValue = (float) ($input['quantity_value'] ?? 1);

            $stmt = $db->prepare('INSERT INTO product_variants (product_id, unit_id, sku, label, quantity_value, price, stock, reserved_stock, weight_kg, status) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)');
            $stmt->execute([$productId, $unitId, $sku, $label, $quantityValue, $price, $stock, 0.0, 'active']);

            if ($imagePath) {
                $stmt = $db->prepare('INSERT INTO product_images (product_id, image_path, is_main) VALUES (?, ?, 1)');
                $stmt->execute([$productId, $imagePath]);
            }

            $db->commit();

            Response::json([
                'success' => true,
                'message' => 'Produit cree.',
                'data' => ['product_id' => $productId],
            ], 201);
        } catch (\Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            Response::error('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }
}
