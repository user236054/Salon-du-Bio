-- MVP initial data for marketplace

-- Countries
INSERT INTO countries (id, name, code, currency) VALUES (1, 'Côte d\'Ivoire', 'CI', 'XOF')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Regions (example)
INSERT INTO regions (id, country_id, name, slug) VALUES
(1, 1, 'Abidjan', 'abidjan'),
(2, 1, 'Yamoussoukro', 'yamoussoukro'),
(3, 1, 'Grand-Bassam', 'grand-bassam')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Units
INSERT INTO units (id, name, symbol) VALUES
(1, 'kilogramme', 'kg'),
(2, 'litre', 'L'),
(3, 'pièce', 'pc'),
(4, 'sachet', 'sachet'),
(5, 'bouteille', 'btl'),
(6, 'plateau', 'plateau')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Default category
INSERT INTO product_categories (id, name, slug) VALUES (1, 'Général', 'general')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Default admin user and seller for MVP (seller_id = 1 used by product create)
INSERT INTO users (id, full_name, email, phone, password_hash, role, status) VALUES
(1, 'Demo Seller', 'seller@example.local', '+22500000000', 'DEMO_HASH', 'seller', 'active')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO sellers (id, user_id, region_id, shop_name, slug, status) VALUES
(1, 1, 1, 'Boutique Demo', 'boutique-demo', 'approved')
ON DUPLICATE KEY UPDATE shop_name = VALUES(shop_name);

-- Simple delivery rule: same region default, others charge extra
INSERT INTO delivery_rules (country_id, seller_id, product_type, from_region_id, to_region_id, base_fee, fee_per_kg, max_delivery_days, quote_required, message) VALUES
(1, NULL, NULL, NULL, NULL, 500, 200, 3, 0, 'Produit expédié hors zone de production. Des frais supplémentaires peuvent s\'appliquer.')
ON DUPLICATE KEY UPDATE base_fee = VALUES(base_fee);
