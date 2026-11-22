/* ============================================================
   MERLIN FASHION — LÕI DÙNG CHUNG
   Giỏ hàng (localStorage), định dạng VND, thông báo, tài khoản,
   render card sản phẩm. Được nạp ở mọi trang.
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.MERLIN_CONFIG || {};
  var CART_KEY = "merlin_cart_v1";
  var PROMO_KEY = "merlin_promo_v1";
  var ACCOUNTS_KEY = "merlin_accounts_v1";
  var AUTH_KEY = "merlin_auth_v1";
  var ORDERS_KEY = "merlin_orders_v1";

  /* ---------- Tiện ích chung ---------- */

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var val = JSON.parse(raw);
      return val === null || val === undefined ? fallback : val;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function formatVND(value) {
    var n = Math.round(Number(value) || 0);
    return new Intl.NumberFormat("vi-VN").format(n) + "₫";
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/`/g, "&#96;");
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function getProduct(id) {
    return (window.PRODUCTS || []).filter(function (p) { return p.id === id; })[0] || null;
  }

  /* ---------- Giỏ hàng ---------- */

  function getCart() {
    var cart = readJSON(CART_KEY, []);
    if (!Array.isArray(cart)) return [];
    return cart.filter(function (item) {
      return item && item.id && item.size && getProduct(item.id);
    });
  }

  function writeCart(cart) {
    writeJSON(CART_KEY, cart);
    if (!cart.length) localStorage.removeItem(PROMO_KEY);
    updateBadges();
    document.dispatchEvent(new CustomEvent("merlin:cart-updated"));
  }

  function detailedCart() {
    return getCart().map(function (item) {
      var product = getProduct(item.id);
      var qty = Math.max(1, parseInt(item.qty, 10) || 1);
      return {
        key: item.id + "::" + item.size,
        id: item.id,
        size: item.size,
        qty: qty,
        product: product,
        unitPrice: product.price,
        lineTotal: product.price * qty
      };
    });
  }

  function addItem(id, size, qty) {
    var product = getProduct(id);
    if (!product) return { ok: false, message: "Không tìm thấy sản phẩm." };
    if (!size) return { ok: false, message: "Vui lòng chọn size trước khi thêm vào giỏ." };

    qty = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
    var cart = getCart();
    var found = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id && cart[i].size === size) { found = cart[i]; break; }
    }
    if (found) {
      found.qty = Math.min(99, found.qty + qty);
    } else {
      cart.push({ id: id, size: size, qty: qty });
    }
    writeCart(cart);
    return { ok: true, message: "Đã thêm “" + product.name + "” vào giỏ hàng." };
  }

  function updateQty(key, qty) {
    var cart = getCart();
    qty = parseInt(qty, 10);
    if (!qty || qty < 1) return removeItem(key);
    qty = Math.min(99, qty);
    cart.forEach(function (item) {
      if (item.id + "::" + item.size === key) item.qty = qty;
    });
    writeCart(cart);
  }

  function removeItem(key) {
    writeCart(getCart().filter(function (item) {
      return item.id + "::" + item.size !== key;
    }));
  }

  function clearCart() {
    writeCart([]);
    localStorage.removeItem(PROMO_KEY);
  }

  function getPromo() {
    return readJSON(PROMO_KEY, null);
  }

  function applyPromo(code) {
    code = String(code || "").trim().toUpperCase();
    if (!code) return { ok: false, message: "Vui lòng nhập mã giảm giá." };
    var rule = (cfg.promoCodes || {})[code];
    if (!rule) return { ok: false, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn." };

    var base = calcTotals(null);
    if (rule.minOrder && base.subtotal < rule.minOrder) {
      return { ok: false, message: "Mã " + code + " áp dụng cho đơn từ " + formatVND(rule.minOrder) + "." };
    }
    writeJSON(PROMO_KEY, code);
    document.dispatchEvent(new CustomEvent("merlin:cart-updated"));
    return { ok: true, message: "Áp dụng thành công: " + rule.label + "." };
  }

  function removePromo() {
    localStorage.removeItem(PROMO_KEY);
    document.dispatchEvent(new CustomEvent("merlin:cart-updated"));
  }

  function calcTotals(codeOverride) {
    var items = detailedCart();
    var subtotal = items.reduce(function (sum, item) { return sum + item.lineTotal; }, 0);
    var count = items.reduce(function (sum, item) { return sum + item.qty; }, 0);

    var code = codeOverride === undefined ? getPromo() : codeOverride;
    var rule = code ? (cfg.promoCodes || {})[code] : null;
    var discount = 0;
    var shipping = Number(cfg.shippingFee) || 0;

    if (rule) {
      if (rule.type === "percent") {
        discount = Math.round(subtotal * (Number(rule.value) || 0) / 100);
      } else if (rule.type === "amount") {
        discount = Math.min(Number(rule.value) || 0, subtotal);
      } else if (rule.type === "shipping") {
        shipping = 0;
      }
    }

    var freeShipThreshold = Number(cfg.freeShipThreshold) || 0;
    if (freeShipThreshold && subtotal >= freeShipThreshold) shipping = 0;

    var total = Math.max(0, subtotal - discount + shipping);

    return {
      items: items,
      count: count,
      subtotal: subtotal,
      discount: discount,
      shipping: shipping,
      total: total,
      promo: rule ? { code: code, type: rule.type, value: rule.value, label: rule.label } : null,
      freeShipGap: freeShipThreshold ? Math.max(0, freeShipThreshold - subtotal) : 0,
      freeShipThreshold: freeShipThreshold
    };
  }

  function updateBadges() {
    var count = getCart().reduce(function (sum, item) { return sum + item.qty; }, 0);
    var badges = document.querySelectorAll("[data-cart-count]");
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = count > 99 ? "99+" : String(count);
      badges[i].classList.toggle("is-empty", count === 0);
      badges[i].setAttribute("aria-label", count + " sản phẩm trong giỏ hàng");
    }
  }

  /* ---------- Tài khoản (lưu cục bộ — bản demo) ---------- */

  function getAccount() {
    var acc = readJSON(AUTH_KEY, null);
    if (!acc || !acc.email) return null;
    return acc;
  }

  function getAccounts() {
    var list = readJSON(ACCOUNTS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
  }

  function register(name, email, password) {
    name = String(name || "").trim();
    email = String(email || "").trim().toLowerCase();
    if (name.length < 2) return { ok: false, message: "Vui lòng nhập họ tên." };
    if (!isValidEmail(email)) return { ok: false, message: "Email chưa đúng định dạng." };
    if (String(password || "").length < 6) return { ok: false, message: "Mật khẩu cần ít nhất 6 ký tự." };

    var accounts = getAccounts();
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].email === email) return { ok: false, message: "Email này đã được đăng ký." };
    }
    accounts.push({ name: name, email: email, password: password, createdAt: Date.now() });
    writeJSON(ACCOUNTS_KEY, accounts);
    writeJSON(AUTH_KEY, { name: name, email: email });
    document.dispatchEvent(new CustomEvent("merlin:auth-updated"));
    return { ok: true, message: "Đăng ký thành công. Chào " + name + "!" };
  }

  function login(email, password) {
    email = String(email || "").trim().toLowerCase();
    var accounts = getAccounts();
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].email === email && accounts[i].password === password) {
        writeJSON(AUTH_KEY, { name: accounts[i].name, email: accounts[i].email });
        document.dispatchEvent(new CustomEvent("merlin:auth-updated"));
        return { ok: true, message: "Đăng nhập thành công. Chào " + accounts[i].name + "!" };
      }
    }
    return { ok: false, message: "Email hoặc mật khẩu không đúng." };
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    document.dispatchEvent(new CustomEvent("merlin:auth-updated"));
  }

  /* ---------- Đơn hàng (lưu cục bộ) ---------- */

  function getOrders() {
    var list = readJSON(ORDERS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function saveOrder(order) {
    var orders = getOrders();
    orders.unshift(order);
    writeJSON(ORDERS_KEY, orders.slice(0, 100));
  }

  function makeOrderCode() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var stamp = "" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + pad(d.getHours()) + pad(d.getMinutes());
    var rand = Math.floor(100 + Math.random() * 900);
    return "MF-" + stamp + "-" + rand;
  }

  /* ---------- Toast ---------- */

  function toast(message, type) {
    var stack = document.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }
    var el = document.createElement("div");
    el.className = "toast" + (type ? " toast--" + type : "");
    el.setAttribute("role", "status");
    el.innerHTML = '<span class="toast-dot" aria-hidden="true"></span><span>' + escapeHtml(message) + "</span>";
    stack.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-in"); });
    window.setTimeout(function () {
      el.classList.remove("is-in");
      window.setTimeout(function () { el.remove(); }, 320);
    }, 2800);
  }

  /* ---------- Render card sản phẩm ---------- */

  function discountPercent(product) {
    if (!product.oldPrice || product.oldPrice <= product.price) return 0;
    return Math.round((1 - product.price / product.oldPrice) * 100);
  }

  function productCard(product) {
    var discount = discountPercent(product);
    var labels = window.CATEGORY_LABELS || {};
    var cat = [labels[product.category], labels[product.type]].filter(Boolean).join(" · ");
    var badge = discount
      ? '<span class="product-badge">-' + discount + "%</span>"
      : product.featured
        ? '<span class="product-badge product-badge--new">Yêu thích</span>'
        : "";
    var oldPrice = product.oldPrice && product.oldPrice > product.price
      ? "<s>" + formatVND(product.oldPrice) + "</s>"
      : "";

    return (
      '<article class="product-card">' +
        '<div class="product-media">' +
          '<a href="product.html?id=' + encodeURIComponent(product.id) + '" aria-label="' + escapeAttr(product.name) + '">' +
            '<img src="' + escapeAttr(product.image) + '" alt="' + escapeAttr(product.name) + '" loading="lazy" width="360" height="480">' +
          "</a>" +
          badge +
          '<button type="button" class="product-quick" data-add="' + escapeAttr(product.id) + '"' +
            ' data-size="' + escapeAttr(product.sizes[0]) + '">Thêm nhanh</button>' +
        "</div>" +
        '<div class="product-info">' +
          '<p class="product-cat">' + escapeHtml(cat) + "</p>" +
          '<h3 class="product-name"><a href="product.html?id=' + encodeURIComponent(product.id) + '">' +
            escapeHtml(product.name) + "</a></h3>" +
          '<div class="product-price"><strong>' + formatVND(product.price) + "</strong>" + oldPrice + "</div>" +
        "</div>" +
      "</article>"
    );
  }

  /* ---------- Sự kiện toàn cục: thêm nhanh vào giỏ ---------- */

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-add]");
    if (!btn) return;
    event.preventDefault();
    var id = btn.getAttribute("data-add");
    var product = getProduct(id);
    var size = btn.getAttribute("data-size") || (product ? product.sizes[0] : null);
    var result = addItem(id, size, 1);
    toast(result.message, result.ok ? "success" : "error");
  });

  /* ---------- Áp cấu hình vào giao diện ---------- */

  function applyConfig() {
    var nodes = document.querySelectorAll("[data-freeship]");
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = formatVND(cfg.freeShipThreshold);

    nodes = document.querySelectorAll("[data-hotline]");
    for (var j = 0; j < nodes.length; j++) {
      nodes[j].textContent = cfg.hotline;
      if (cfg.hotlineRaw) nodes[j].href = "tel:" + cfg.hotlineRaw;
    }

    nodes = document.querySelectorAll("[data-email]");
    for (var k = 0; k < nodes.length; k++) {
      nodes[k].textContent = cfg.email;
      if (cfg.email) nodes[k].href = "mailto:" + cfg.email;
    }
  }

  function init() {
    updateBadges();
    applyConfig();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ---------- Xuất API ---------- */

  window.Merlin = {
    config: cfg,
    formatVND: formatVND,
    qs: qs,
    getProduct: getProduct,
    escapeHtml: escapeHtml,
    getCart: getCart,
    detailedCart: detailedCart,
    addItem: addItem,
    updateQty: updateQty,
    removeItem: removeItem,
    clearCart: clearCart,
    getPromo: getPromo,
    applyPromo: applyPromo,
    removePromo: removePromo,
    totals: calcTotals,
    updateBadges: updateBadges,
    toast: toast,
    getAccount: getAccount,
    register: register,
    login: login,
    logout: logout,
    getOrders: getOrders,
    saveOrder: saveOrder,
    makeOrderCode: makeOrderCode,
    productCard: productCard,
    discountPercent: discountPercent
  };
})();
