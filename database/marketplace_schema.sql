CREATE TABLE countries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    currency VARCHAR(10) NOT NULL DEFAULT 'XOF',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE regions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    country_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id),
    INDEX idx_regions_country (country_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(180) NULL UNIQUE,
    phone VARCHAR(40) NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer','seller','admin') NOT NULL DEFAULT 'customer',
    status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role_status (role, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sellers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    region_id BIGINT UNSIGNED NOT NULL,
    shop_name VARCHAR(160) NOT NULL,
    slug VARCHAR(190) NOT NULL UNIQUE,
    description TEXT NULL,
    phone VARCHAR(40) NULL,
    logo_path VARCHAR(255) NULL,
    banner_path VARCHAR(255) NULL,
    status ENUM('pending','approved','suspended','rejected') NOT NULL DEFAULT 'pending',
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (region_id) REFERENCES regions(id),
    INDEX idx_sellers_user (user_id),
    INDEX idx_sellers_status (status),
    INDEX idx_sellers_region (region_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE units (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    symbol VARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_unit_symbol (symbol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    region_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(180) NOT NULL,
    slug VARCHAR(220) NOT NULL,
    description TEXT NULL,
    product_type ENUM('normal','fresh','fragile','heavy') NOT NULL DEFAULT 'normal',
    is_perishable TINYINT(1) NOT NULL DEFAULT 0,
    shelf_life_days INT NULL,
    status ENUM('draft','active','inactive','rejected') NOT NULL DEFAULT 'draft',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id),
    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    FOREIGN KEY (region_id) REFERENCES regions(id),
    INDEX idx_products_seller (seller_id),
    INDEX idx_products_category_status (category_id, status),
    INDEX idx_products_region_status (region_id, status),
    INDEX idx_products_type (product_type),
    FULLTEXT KEY ft_products_name_description (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    is_main TINYINT(1) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_images_product (product_id, is_main)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_variants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    unit_id BIGINT UNSIGNED NOT NULL,
    sku VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(120) NOT NULL,
    quantity_value DECIMAL(12,2) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    stock DECIMAL(12,2) NOT NULL DEFAULT 0,
    reserved_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
    low_stock_threshold DECIMAL(12,2) NOT NULL DEFAULT 5,
    weight_kg DECIMAL(10,3) NOT NULL DEFAULT 0,
    status ENUM('active','inactive','out_of_stock') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id),
    INDEX idx_variants_product_status (product_id, status),
    INDEX idx_variants_stock (stock, reserved_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_batches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    variant_id BIGINT UNSIGNED NOT NULL,
    batch_number VARCHAR(120) NULL,
    quantity DECIMAL(12,2) NOT NULL,
    expiry_date DATE NULL,
    received_at DATE NULL,
    status ENUM('available','reserved','sold','expired','discarded') NOT NULL DEFAULT 'available',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    INDEX idx_batches_variant (variant_id),
    INDEX idx_batches_expiry (expiry_date, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE carts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    session_id VARCHAR(180) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_carts_user (user_id),
    INDEX idx_carts_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT UNSIGNED NOT NULL,
    variant_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    UNIQUE KEY unique_cart_variant (cart_id, variant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE delivery_rules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    country_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NULL,
    product_type ENUM('normal','fresh','fragile','heavy') NULL,
    from_region_id BIGINT UNSIGNED NULL,
    to_region_id BIGINT UNSIGNED NULL,
    base_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    fee_per_kg DECIMAL(12,2) NOT NULL DEFAULT 0,
    fee_per_item DECIMAL(12,2) NOT NULL DEFAULT 0,
    distance_fee_per_km DECIMAL(12,2) NOT NULL DEFAULT 0,
    estimated_distance_km DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_delivery_days INT NOT NULL DEFAULT 3,
    priority TINYINT(1) NOT NULL DEFAULT 0,
    quote_required TINYINT(1) NOT NULL DEFAULT 0,
    message TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id),
    FOREIGN KEY (seller_id) REFERENCES sellers(id),
    FOREIGN KEY (from_region_id) REFERENCES regions(id),
    FOREIGN KEY (to_region_id) REFERENCES regions(id),
    INDEX idx_delivery_rules_match (country_id, seller_id, product_type, from_region_id, to_region_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(60) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NULL,
    customer_name VARCHAR(160) NOT NULL,
    customer_phone VARCHAR(40) NOT NULL,
    customer_email VARCHAR(180) NULL,
    delivery_region_id BIGINT UNSIGNED NOT NULL,
    delivery_address TEXT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    delivery_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    commission_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_status ENUM('unpaid','pending','paid','partially_refunded','refunded','failed') NOT NULL DEFAULT 'unpaid',
    order_status ENUM('pending','confirmed','partially_shipped','shipped','partially_delivered','delivered','cancelled') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (delivery_region_id) REFERENCES regions(id),
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (order_status),
    INDEX idx_orders_payment (payment_status),
    INDEX idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE seller_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NOT NULL,
    seller_order_number VARCHAR(70) NOT NULL UNIQUE,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    commission_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    seller_gross_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    seller_net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    estimated_delivery_days INT NOT NULL DEFAULT 0,
    status ENUM('pending','confirmed','preparing','shipped','delivered','cancelled','returned') NOT NULL DEFAULT 'pending',
    payment_status ENUM('pending','paid','partially_refunded','refunded') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES sellers(id),
    INDEX idx_seller_orders_order (order_id),
    INDEX idx_seller_orders_seller (seller_id),
    INDEX idx_seller_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE seller_order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    variant_id BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(180) NOT NULL,
    variant_label VARCHAR(120) NOT NULL,
    sku VARCHAR(120) NOT NULL,
    unit_symbol VARCHAR(30) NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    weight_kg DECIMAL(10,3) NOT NULL DEFAULT 0,
    item_status ENUM('pending','confirmed','shipped','delivered','cancelled','returned') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_order_id) REFERENCES seller_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    INDEX idx_seller_order_items_order (seller_order_id),
    INDEX idx_seller_order_items_variant (variant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE deliveries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_order_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NOT NULL,
    from_region_id BIGINT UNSIGNED NOT NULL,
    to_region_id BIGINT UNSIGNED NOT NULL,
    carrier_name VARCHAR(120) NULL,
    tracking_number VARCHAR(120) NULL,
    delivery_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    estimated_days INT NOT NULL DEFAULT 0,
    status ENUM('pending','ready','picked_up','in_transit','delivered','failed','cancelled') NOT NULL DEFAULT 'pending',
    message TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_order_id) REFERENCES seller_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES sellers(id),
    FOREIGN KEY (from_region_id) REFERENCES regions(id),
    FOREIGN KEY (to_region_id) REFERENCES regions(id),
    INDEX idx_deliveries_seller_order (seller_order_id),
    INDEX idx_deliveries_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    provider ENUM('wave','orange_money','mtn_money','card','cash') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'XOF',
    status ENUM('pending','authorized','paid','failed','cancelled','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
    provider_reference VARCHAR(180) NULL,
    internal_reference VARCHAR(180) NOT NULL UNIQUE,
    paid_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    INDEX idx_payments_order (order_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_provider_reference (provider_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payment_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    transaction_type ENUM('authorization','capture','payment','refund','partial_refund','failed') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    provider_reference VARCHAR(180) NULL,
    status ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
    raw_response JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    INDEX idx_payment_transactions_payment (payment_id),
    INDEX idx_payment_transactions_type (transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE seller_earnings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_order_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NOT NULL,
    gross_amount DECIMAL(12,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending','available','paid','cancelled','refunded') NOT NULL DEFAULT 'pending',
    available_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_order_id) REFERENCES seller_orders(id),
    FOREIGN KEY (seller_id) REFERENCES sellers(id),
    INDEX idx_seller_earnings_seller (seller_id),
    INDEX idx_seller_earnings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE seller_payouts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    method ENUM('wave','orange_money','mtn_money','bank_transfer') NOT NULL,
    account_reference VARCHAR(180) NOT NULL,
    status ENUM('requested','processing','paid','failed','cancelled') NOT NULL DEFAULT 'requested',
    transaction_reference VARCHAR(180) NULL,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME NULL,
    FOREIGN KEY (seller_id) REFERENCES sellers(id),
    INDEX idx_seller_payouts_seller (seller_id),
    INDEX idx_seller_payouts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_movements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    variant_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NOT NULL,
    movement_type ENUM('in','out','reserved','released','adjustment','return') NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    reference_type ENUM('order','cart','manual','cancel','return') NOT NULL DEFAULT 'manual',
    reference_id BIGINT UNSIGNED NULL,
    note TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    FOREIGN KEY (seller_id) REFERENCES sellers(id),
    INDEX idx_stock_movements_variant (variant_id),
    INDEX idx_stock_movements_seller (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_reservations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT UNSIGNED NULL,
    order_id BIGINT UNSIGNED NULL,
    variant_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    expires_at DATETIME NOT NULL,
    status ENUM('active','confirmed','expired','cancelled') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    INDEX idx_stock_reservations_variant (variant_id, status),
    INDEX idx_stock_reservations_expires (expires_at, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refunds (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    seller_order_id BIGINT UNSIGNED NULL,
    payment_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT NULL,
    status ENUM('requested','approved','processed','rejected','failed') NOT NULL DEFAULT 'requested',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (seller_order_id) REFERENCES seller_orders(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    INDEX idx_refunds_order (order_id),
    INDEX idx_refunds_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE returns (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_order_item_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    reason TEXT NULL,
    status ENUM('requested','approved','received','rejected','refunded') NOT NULL DEFAULT 'requested',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_order_item_id) REFERENCES seller_order_items(id),
    INDEX idx_returns_item (seller_order_item_id),
    INDEX idx_returns_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    channel ENUM('dashboard','email','sms','whatsapp') NOT NULL DEFAULT 'dashboard',
    type VARCHAR(100) NOT NULL,
    title VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL,
    status ENUM('pending','sent','failed','read') NOT NULL DEFAULT 'pending',
    read_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_notifications_user (user_id, status),
    INDEX idx_notifications_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE webhook_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(80) NOT NULL,
    event_id VARCHAR(180) NOT NULL,
    payload JSON NOT NULL,
    processed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_provider_event (provider, event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO countries (name, code, currency) VALUES ('Cote d''Ivoire', 'CI', 'XOF');

INSERT INTO units (name, symbol) VALUES
('Kilogramme', 'kg'),
('Litre', 'L'),
('Piece', 'unite'),
('Sachet', 'sachet'),
('Bouteille', 'bouteille'),
('Plateau', 'plateau');

INSERT INTO product_categories (name, slug) VALUES
('Alimentaire', 'alimentaire'),
('Cosmetique', 'cosmetique'),
('Artisanat', 'artisanat'),
('Epicerie', 'epicerie'),
('Boisson', 'boisson'),
('Textile', 'textile');

INSERT INTO regions (country_id, name, slug) VALUES
(1, 'Abidjan', 'abidjan'),
(1, 'Agneby-Tiassa', 'agneby-tiassa'),
(1, 'Bafing', 'bafing'),
(1, 'Bagoue', 'bagoue'),
(1, 'Belier', 'belier'),
(1, 'Bere', 'bere'),
(1, 'Boukani', 'boukani'),
(1, 'Cavally', 'cavally'),
(1, 'Folon', 'folon'),
(1, 'Gbeke', 'gbeke'),
(1, 'Goh', 'goh'),
(1, 'Goh-Djiboua', 'goh-djiboua'),
(1, 'Grands-Ponts', 'grands-ponts'),
(1, 'Guemon', 'guemon'),
(1, 'Hambol', 'hambol'),
(1, 'Haut-Sassandra', 'haut-sassandra'),
(1, 'Indenie-Djuablin', 'indenie-djuablin'),
(1, 'Kabadougou', 'kabadougou'),
(1, 'La Me', 'la-me'),
(1, 'Loh-Djiboua', 'loh-djiboua'),
(1, 'Marahoue', 'marahoue'),
(1, 'Moronou', 'moronou'),
(1, 'Nawa', 'nawa'),
(1, 'Nzi', 'nzi'),
(1, 'Poro', 'poro'),
(1, 'San-Pedro', 'san-pedro'),
(1, 'Sud-Comoe', 'sud-comoe'),
(1, 'Tchologo', 'tchologo'),
(1, 'Tonkpi', 'tonkpi'),
(1, 'Worodougou', 'worodougou'),
(1, 'Yamoussoukro', 'yamoussoukro');

INSERT INTO delivery_rules
(country_id, seller_id, product_type, from_region_id, to_region_id, base_fee, fee_per_kg, fee_per_item, max_delivery_days, priority, quote_required, message)
VALUES
(1, NULL, NULL, NULL, NULL, 0, 150, 0, 3, 0, 0, 'Livraison dans la zone de production.'),
(1, NULL, 'fresh', NULL, NULL, 1000, 250, 0, 2, 1, 0, 'Produit frais : livraison prioritaire recommandee.'),
(1, NULL, NULL, NULL, 1, 2000, 200, 0, 10, 0, 0, 'Produit expedie hors zone de production. Des frais supplementaires peuvent s appliquer.');
