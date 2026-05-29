const MarketplaceApi = {
  baseUrl: "/public/api/index.php",

  async request(route, options = {}) {
    const { params: queryParams = {}, ...fetchOptions } = options;
    const params = new URLSearchParams({ route });
    Object.entries(queryParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...fetchOptions,
    });

    const payload = await response.json();

    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || "Erreur API marketplace.");
    }

    return payload;
  },

  products() {
    return this.request("/products");
  },

  metadata() {
    return this.request("/metadata");
  },

  register(data) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  me() {
    return this.request("/auth/me");
  },

  logout() {
    return this.request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  cart(cartId) {
    return this.request("/cart", {
      params: { cart_id: cartId },
    });
  },

  addCartItem(data) {
    return this.request("/cart/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateCartItem(data) {
    return this.request("/cart/items/update", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  removeCartItem(data) {
    return this.request("/cart/items/remove", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  estimateDelivery(data) {
    return this.request("/delivery/estimate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  applySeller(data) {
    return this.request("/sellers/apply", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  sellerMe() {
    return this.request("/seller/me");
  },

  updateSellerStatus(data) {
    return this.request("/admin/sellers/status", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  adminSellers() {
    return this.request("/admin/sellers");
  },

  sellerDashboard(sellerId) {
    return this.request("/seller/dashboard", {
      params: { seller_id: sellerId },
    });
  },

  createSellerProduct(data) {
    return this.request("/seller/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  sellerProducts(sellerId) {
    return this.request("/seller/products", {
      params: { seller_id: sellerId },
    });
  },

  updateSellerProduct(data) {
    return this.request("/seller/products/update", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateSellerProductStatus(data) {
    return this.request("/seller/products/status", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  addSellerProductVariant(data) {
    return this.request("/seller/products/variants", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  sellerOrders(sellerId) {
    return this.request("/seller/orders", {
      params: { seller_id: sellerId },
    });
  },

  updateSellerOrderStatus(data) {
    return this.request("/seller/orders/status", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  checkout(data) {
    return this.request("/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
