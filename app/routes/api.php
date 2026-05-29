<?php

use App\Controllers\AdminSellerController;
use App\Controllers\AuthController;
use App\Controllers\CheckoutController;
use App\Controllers\CartController;
use App\Controllers\DeliveryController;
use App\Controllers\MetadataController;
use App\Controllers\ProductController;
use App\Controllers\SellerController;
use App\Controllers\SellerDashboardController;
use App\Controllers\SellerOrderController;
use App\Controllers\SellerProductController;
use App\Core\Router;

$router = new Router();

$router->post('/auth/register', fn (array $input) => (new AuthController())->register($input));
$router->post('/auth/login', fn (array $input) => (new AuthController())->login($input));
$router->get('/auth/me', fn () => (new AuthController())->me());
$router->post('/auth/logout', fn () => (new AuthController())->logout());
$router->get('/metadata', fn () => (new MetadataController())->index());
$router->get('/products', fn () => (new ProductController())->index());
$router->get('/cart', fn (array $input) => (new CartController())->show($input));
$router->post('/cart/items', fn (array $input) => (new CartController())->addItem($input));
$router->post('/cart/items/update', fn (array $input) => (new CartController())->updateItem($input));
$router->post('/cart/items/remove', fn (array $input) => (new CartController())->removeItem($input));
$router->post('/delivery/estimate', fn (array $input) => (new DeliveryController())->estimate($input));
$router->post('/checkout', fn (array $input) => (new CheckoutController())->create($input));
$router->get('/seller/me', fn () => (new SellerController())->me());
$router->post('/sellers/apply', fn (array $input) => (new SellerController())->apply($input));
$router->get('/admin/sellers', fn () => (new AdminSellerController())->index());
$router->post('/admin/sellers/status', fn (array $input) => (new AdminSellerController())->updateStatus($input));
$router->get('/seller/dashboard', fn (array $input) => (new SellerDashboardController())->summary($input));
$router->get('/seller/products', fn (array $input) => (new SellerProductController())->index($input));
$router->post('/seller/products', fn (array $input) => (new SellerProductController())->create($input));
$router->post('/seller/products/update', fn (array $input) => (new SellerProductController())->update($input));
$router->post('/seller/products/status', fn (array $input) => (new SellerProductController())->changeStatus($input));
$router->post('/seller/products/variants', fn (array $input) => (new SellerProductController())->addVariant($input));
$router->get('/seller/orders', fn (array $input) => (new SellerOrderController())->index($input));
$router->get('/seller/orders/show', fn (array $input) => (new SellerOrderController())->show($input));
$router->post('/seller/orders/status', fn (array $input) => (new SellerOrderController())->updateStatus($input));
// Public endpoints for MVP
$router->get('/units', fn () => (new \App\Controllers\UnitsController())->index());
$router->post('/products/create', fn (array $input) => (new \App\Controllers\ProductController())->create($input));
$router->post('/cart/add', fn (array $input) => (new CartController())->addItem($input));
$router->post('/orders/create', fn (array $input) => (new CheckoutController())->create($input));

return $router;
