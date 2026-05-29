-- Importer d'abord database/marketplace_schema.sql.
-- Puis importer ce fichier pour creer des donnees de demonstration.

INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES
('Admin SIBIO', 'admin@sibio.local', '+2250700000000', '$2y$10$Q9AzSBAJ0a2C.Oze0FJyD.Wj01Rr/Sffk/0ud8z4jWbHE9kcU.bfS', 'admin', 'active'),
('Cooperative Riz Yamoussoukro', 'riz@sibio.local', '+2250700000001', '$2y$10$Q9AzSBAJ0a2C.Oze0FJyD.Wj01Rr/Sffk/0ud8z4jWbHE9kcU.bfS', 'seller', 'active'),
('Huilerie Bio Abidjan', 'huile@sibio.local', '+2250700000002', '$2y$10$Q9AzSBAJ0a2C.Oze0FJyD.Wj01Rr/Sffk/0ud8z4jWbHE9kcU.bfS', 'seller', 'active'),
('Savonnerie Naturelle Bouake', 'savon@sibio.local', '+2250700000003', '$2y$10$Q9AzSBAJ0a2C.Oze0FJyD.Wj01Rr/Sffk/0ud8z4jWbHE9kcU.bfS', 'seller', 'active'),
('Client Demo', 'client@sibio.local', '+2250700000004', '$2y$10$Q9AzSBAJ0a2C.Oze0FJyD.Wj01Rr/Sffk/0ud8z4jWbHE9kcU.bfS', 'customer', 'active');

-- Mot de passe demo pour tous les comptes : password

INSERT INTO sellers
(user_id, region_id, shop_name, slug, description, phone, status, commission_rate)
VALUES
(2, (SELECT id FROM regions WHERE slug = 'yamoussoukro'), 'Cooperative Riz Yamoussoukro', 'cooperative-riz-yamoussoukro', 'Producteur de riz local biologique.', '+2250700000001', 'approved', 10.00),
(3, (SELECT id FROM regions WHERE slug = 'abidjan'), 'Huilerie Bio Abidjan', 'huilerie-bio-abidjan', 'Huiles vegetales bio et locales.', '+2250700000002', 'approved', 12.00),
(4, (SELECT id FROM regions WHERE slug = 'gbeke'), 'Savonnerie Naturelle Bouake', 'savonnerie-naturelle-bouake', 'Savons naturels artisanaux.', '+2250700000003', 'approved', 8.00);

INSERT INTO products
(seller_id, category_id, region_id, name, slug, description, product_type, is_perishable, status)
VALUES
((SELECT id FROM sellers WHERE slug = 'cooperative-riz-yamoussoukro'), (SELECT id FROM product_categories WHERE slug = 'epicerie'), (SELECT id FROM regions WHERE slug = 'yamoussoukro'), 'Riz local bio', 'riz-local-bio', 'Riz local cultive a Yamoussoukro.', 'heavy', 0, 'active'),
((SELECT id FROM sellers WHERE slug = 'huilerie-bio-abidjan'), (SELECT id FROM product_categories WHERE slug = 'epicerie'), (SELECT id FROM regions WHERE slug = 'abidjan'), 'Huile de palme bio', 'huile-de-palme-bio', 'Huile de palme artisanale.', 'normal', 0, 'active'),
((SELECT id FROM sellers WHERE slug = 'savonnerie-naturelle-bouake'), (SELECT id FROM product_categories WHERE slug = 'cosmetique'), (SELECT id FROM regions WHERE slug = 'gbeke'), 'Savon naturel karite', 'savon-naturel-karite', 'Savon naturel au beurre de karite.', 'normal', 0, 'active'),
((SELECT id FROM sellers WHERE slug = 'cooperative-riz-yamoussoukro'), (SELECT id FROM product_categories WHERE slug = 'alimentaire'), (SELECT id FROM regions WHERE slug = 'yamoussoukro'), 'Attieke frais', 'attieke-frais', 'Attieke frais pret a consommer.', 'fresh', 1, 'active');

INSERT INTO product_variants
(product_id, unit_id, sku, label, quantity_value, price, stock, low_stock_threshold, weight_kg, status)
VALUES
((SELECT id FROM products WHERE slug = 'riz-local-bio'), (SELECT id FROM units WHERE symbol = 'kg'), 'RIZ-YAK-1KG', '1kg', 1, 600, 200, 20, 1.000, 'active'),
((SELECT id FROM products WHERE slug = 'riz-local-bio'), (SELECT id FROM units WHERE symbol = 'kg'), 'RIZ-YAK-5KG', '5kg', 5, 2800, 80, 10, 5.000, 'active'),
((SELECT id FROM products WHERE slug = 'riz-local-bio'), (SELECT id FROM units WHERE symbol = 'kg'), 'RIZ-YAK-25KG', '25kg', 25, 13000, 30, 5, 25.000, 'active'),
((SELECT id FROM products WHERE slug = 'huile-de-palme-bio'), (SELECT id FROM units WHERE symbol = 'L'), 'HUI-ABJ-1L', '1L', 1, 1200, 150, 15, 1.100, 'active'),
((SELECT id FROM products WHERE slug = 'huile-de-palme-bio'), (SELECT id FROM units WHERE symbol = 'L'), 'HUI-ABJ-5L', '5L', 5, 5500, 50, 8, 5.500, 'active'),
((SELECT id FROM products WHERE slug = 'savon-naturel-karite'), (SELECT id FROM units WHERE symbol = 'unite'), 'SAV-GBE-1', '1 unite', 1, 700, 300, 30, 0.200, 'active'),
((SELECT id FROM products WHERE slug = 'attieke-frais'), (SELECT id FROM units WHERE symbol = 'sachet'), 'ATT-YAK-SACHET', '1 sachet', 1, 500, 100, 15, 0.500, 'active');

INSERT INTO product_images (product_id, image_path, is_main, sort_order) VALUES
((SELECT id FROM products WHERE slug = 'riz-local-bio'), 'logo_sibio_nouveau.png', 1, 0),
((SELECT id FROM products WHERE slug = 'huile-de-palme-bio'), 'logo_sibio_nouveau.png', 1, 0),
((SELECT id FROM products WHERE slug = 'savon-naturel-karite'), 'logo_sibio_nouveau.png', 1, 0),
((SELECT id FROM products WHERE slug = 'attieke-frais'), 'logo_sibio_nouveau.png', 1, 0);

INSERT INTO delivery_rules
(country_id, seller_id, product_type, from_region_id, to_region_id, base_fee, fee_per_kg, fee_per_item, max_delivery_days, priority, quote_required, message)
VALUES
(1, (SELECT id FROM sellers WHERE slug = 'cooperative-riz-yamoussoukro'), NULL, (SELECT id FROM regions WHERE slug = 'yamoussoukro'), (SELECT id FROM regions WHERE slug = 'abidjan'), 2500, 150, 0, 10, 0, 0, 'Expedition Yamoussoukro vers Abidjan. Des frais supplementaires peuvent s appliquer.'),
(1, (SELECT id FROM sellers WHERE slug = 'huilerie-bio-abidjan'), NULL, (SELECT id FROM regions WHERE slug = 'abidjan'), (SELECT id FROM regions WHERE slug = 'abidjan'), 500, 100, 0, 2, 0, 0, 'Livraison locale Abidjan.'),
(1, (SELECT id FROM sellers WHERE slug = 'savonnerie-naturelle-bouake'), NULL, (SELECT id FROM regions WHERE slug = 'gbeke'), (SELECT id FROM regions WHERE slug = 'abidjan'), 3000, 120, 0, 10, 0, 0, 'Expedition Bouake vers Abidjan. Des frais supplementaires peuvent s appliquer.');
