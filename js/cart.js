/* ============================================================
   TRANG GIỎ HÀNG & THANH TOÁN
   ============================================================ */
(function () {
  "use strict";

  var Merlin = window.Merlin;
  if (!Merlin) return;

  var cfg = Merlin.config;
  var cartView = document.getElementById("cartView");
  var cartItemsEl = document.getElementById("cartItems");
  var emptyEl = document.getElementById("cartEmpty");
  var checkoutSection = document.getElementById("checkoutSection");
  var checkoutCard = document.getElementById("checkoutCard");
  var form = document.getElementById("checkoutForm");
  var successEl = document.getElementById("orderSuccess");
  var promoForm = document.getElementById("promoForm");
  var promoInput = document.getElementById("promoInput");
  var promoApplied = document.getElementById("promoApplied");
  var promoLabel = document.getElementById("promoLabel");
  var removePromoBtn = document.getElementById("removePromo");
  var bankBox = document.getElementById("bankBox");
  var toCheckoutBtn = document.getElementById("toCheckout");

  var orderPlaced = false;
  var lastOrder = null;

  /* ---------- Render giỏ hàng ---------- */

  function render() {
    if (orderPlaced) return;
    var totals = Merlin.totals();
    var isEmpty = totals.items.length === 0;

    cartView.hidden = isEmpty;
    checkoutSection.hidden = isEmpty;
    emptyEl.hidden = !isEmpty;

    if (isEmpty) {
      cartItemsEl.innerHTML = "";
      return;
    }

    cartItemsEl.innerHTML = totals.items.map(function (item) {
      var p = item.product;
      return (
        '<div class="cart-item" data-key="' + Merlin.escapeHtml(item.key) + '">' +
          '<div class="cart-item__media">' +
            '<a href="product.html?id=' + encodeURIComponent(item.id) + '">' +
              '<img src="' + Merlin.escapeHtml(p.image) + '" alt="' + Merlin.escapeHtml(p.name) + '" loading="lazy">' +
            "</a>" +
          "</div>" +
          "<div>" +
            '<div class="cart-item__name">' +
              '<a href="product.html?id=' + encodeURIComponent(item.id) + '">' + Merlin.escapeHtml(p.name) + "</a>" +
            "</div>" +
            '<div class="cart-item__meta">Size ' + Merlin.escapeHtml(item.size) + " · " + Merlin.formatVND(item.unitPrice) + " / sản phẩm</div>" +
            '<div class="qty qty--sm cart-item__qty">' +
              '<button type="button" data-qty="-1" aria-label="Giảm số lượng">−</button>' +
              '<input type="number" value="' + item.qty + '" min="1" max="99" data-qty-input aria-label="Số lượng">' +
              '<button type="button" data-qty="1" aria-label="Tăng số lượng">+</button>' +
            "</div>" +
          "</div>" +
          '<div class="cart-item__price">' +
            "<strong>" + Merlin.formatVND(item.lineTotal) + "</strong>" +
            "<span>" + Merlin.formatVND(item.unitPrice) + " / sp</span>" +
          "</div>" +
          '<button class="cart-item__remove" type="button" data-remove aria-label="Xóa sản phẩm">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
          "</button>" +
        "</div>"
      );
    }).join("");

    /* Tóm tắt */
    document.getElementById("sumSubtotal").textContent = Merlin.formatVND(totals.subtotal);
    document.getElementById("sumDiscount").textContent = "-" + Merlin.formatVND(totals.discount);
    document.getElementById("sumShipping").textContent = totals.shipping === 0 ? "Miễn phí" : Merlin.formatVND(totals.shipping);
    document.getElementById("sumTotal").textContent = Merlin.formatVND(totals.total);

    var lineDiscount = document.getElementById("lineDiscount");
    lineDiscount.hidden = totals.discount === 0;

    /* Miễn phí ship */
    var threshold = totals.freeShipThreshold || cfg.freeShipThreshold;
    var progress = threshold ? Math.min(100, Math.round((totals.subtotal / threshold) * 100)) : 100;
    var fill = document.getElementById("freeshipFill");
    if (fill) fill.style.width = progress + "%";
    document.getElementById("freeshipText").innerHTML = totals.freeShipGap > 0
      ? "Thêm <strong>" + Merlin.formatVND(totals.freeShipGap) + "</strong> để được miễn phí giao hàng."
      : "<strong>Tuyệt vời!</strong> Đơn của bạn được miễn phí giao hàng.";

    /* Mã giảm giá */
    if (totals.promo) {
      promoApplied.hidden = false;
      promoLabel.textContent = totals.promo.code + " — " + totals.promo.label;
    } else {
      promoApplied.hidden = true;
    }

    /* Thông tin ngân hàng */
    if (cfg.bank) {
      document.getElementById("bankName").textContent = cfg.bank.bankName;
      document.getElementById("bankAccountName").textContent = cfg.bank.accountName;
      document.getElementById("bankAccountNumber").textContent = cfg.bank.accountNumber;
    }
  }

  /* ---------- Sự kiện giỏ hàng ---------- */

  cartItemsEl.addEventListener("click", function (event) {
    var row = event.target.closest("[data-key]");
    if (!row) return;
    var key = row.getAttribute("data-key");

    if (event.target.closest("[data-remove]")) {
      Merlin.removeItem(key);
      Merlin.toast("Đã xóa sản phẩm khỏi giỏ hàng.");
      render();
      return;
    }

    var btn = event.target.closest("[data-qty]");
    if (btn) {
      var input = row.querySelector("[data-qty-input]");
      var current = parseInt(input.value, 10) || 1;
      var next = Math.max(1, Math.min(99, current + parseInt(btn.getAttribute("data-qty"), 10)));
      Merlin.updateQty(key, next);
      render();
    }
  });

  cartItemsEl.addEventListener("change", function (event) {
    if (!event.target.matches("[data-qty-input]")) return;
    var row = event.target.closest("[data-key]");
    Merlin.updateQty(row.getAttribute("data-key"), parseInt(event.target.value, 10));
    render();
  });

  if (promoForm) {
    promoForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var result = Merlin.applyPromo(promoInput.value);
      Merlin.toast(result.message, result.ok ? "success" : "error");
      if (result.ok) promoInput.value = "";
      render();
    });
  }

  if (removePromoBtn) {
    removePromoBtn.addEventListener("click", function () {
      Merlin.removePromo();
      Merlin.toast("Đã bỏ mã giảm giá.");
      render();
    });
  }

  if (toCheckoutBtn) {
    toCheckoutBtn.addEventListener("click", function () {
      checkoutSection.scrollIntoView({ behavior: "smooth", block: "start" });
      var nameInput = document.getElementById("customerName");
      if (nameInput) window.setTimeout(function () { nameInput.focus({ preventScroll: true }); }, 450);
    });
  }

  /* ---------- Thanh toán ---------- */

  var paymentInputs = document.querySelectorAll('input[name="payment"]');
  for (var i = 0; i < paymentInputs.length; i++) {
    paymentInputs[i].addEventListener("change", function () {
      bankBox.classList.toggle("is-visible", this.value === "bank" && this.checked);
    });
  }

  function getPayment() {
    var checked = document.querySelector('input[name="payment"]:checked');
    return checked ? checked.value : "cod";
  }

  function setError(id, message) {
    var input = document.getElementById(id);
    var error = document.querySelector('[data-error-for="' + id + '"]');
    if (input) input.classList.toggle("is-invalid", !!message);
    if (error) error.textContent = message || "";
  }

  function clearErrors() {
    var inputs = form.querySelectorAll(".is-invalid");
    for (var i = 0; i < inputs.length; i++) inputs[i].classList.remove("is-invalid");
    var errors = form.querySelectorAll(".field-error");
    for (var j = 0; j < errors.length; j++) errors[j].textContent = "";
  }

  function normalizePhone(value) {
    return String(value || "").replace(/[\s.\-()]/g, "");
  }

  function validate() {
    clearErrors();
    var firstInvalid = null;

    function check(id, ok, message) {
      if (!ok) {
        setError(id, message);
        if (!firstInvalid) firstInvalid = document.getElementById(id);
      }
    }

    var name = document.getElementById("customerName").value.trim();
    var phone = normalizePhone(document.getElementById("customerPhone").value);
    var email = document.getElementById("customerEmail").value.trim();
    var province = document.getElementById("customerProvince").value;
    var address = document.getElementById("customerAddress").value.trim();

    check("customerName", name.length >= 2, "Vui lòng nhập họ tên (ít nhất 2 ký tự).");
    check("customerPhone", /^(0\d{9}|\+?84\d{9})$/.test(phone), "Số điện thoại chưa đúng (VD: 0912345678).");
    if (email) {
      check("customerEmail", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), "Email chưa đúng định dạng.");
    }
    check("customerProvince", !!province, "Vui lòng chọn tỉnh / thành phố.");
    check("customerAddress", address.length >= 8, "Vui lòng nhập địa chỉ chi tiết.");

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return !firstInvalid;
  }

  function orderText(order) {
    var lines = [];
    lines.push("ĐƠN HÀNG " + order.code);
    lines.push("Ngày: " + new Date(order.createdAt).toLocaleString("vi-VN"));
    lines.push("Khách: " + order.customer.name + " — " + order.customer.phone);
    if (order.customer.email) lines.push("Email: " + order.customer.email);
    lines.push("Địa chỉ: " + order.customer.address + ", " + order.customer.province);
    if (order.customer.note) lines.push("Ghi chú: " + order.customer.note);
    lines.push("Thanh toán: " + (order.payment === "bank" ? "Chuyển khoản" : "COD"));
    lines.push("---");
    order.items.forEach(function (item) {
      lines.push("+ " + item.name + " (size " + item.size + ") x" + item.qty + " = " + Merlin.formatVND(item.price * item.qty));
    });
    lines.push("---");
    lines.push("Tạm tính: " + Merlin.formatVND(order.subtotal));
    if (order.discount) lines.push("Giảm giá: -" + Merlin.formatVND(order.discount) + (order.promoCode ? " (" + order.promoCode + ")" : ""));
    lines.push("Phí ship: " + (order.shipping ? Merlin.formatVND(order.shipping) : "Miễn phí"));
    lines.push("TỔNG CỘNG: " + Merlin.formatVND(order.total));
    return lines.join("\n");
  }

  function showSuccess(order) {
    orderPlaced = true;
    lastOrder = order;

    cartView.hidden = true;
    checkoutSection.hidden = true;
    emptyEl.hidden = true;
    successEl.hidden = false;

    document.getElementById("successCode").textContent = order.code;
    document.getElementById("successPayment").textContent =
      order.payment === "bank" ? "Chuyển khoản ngân hàng" : "Thanh toán khi nhận hàng (COD)";
    document.getElementById("successAddress").textContent =
      order.customer.address + ", " + order.customer.province;

    var summary = document.getElementById("successSummary");
    summary.innerHTML = order.items.map(function (item) {
      return '<div class="order-success__row"><span>' + Merlin.escapeHtml(item.name) +
        " (size " + Merlin.escapeHtml(item.size) + ") × " + item.qty +
        "</span><span>" + Merlin.formatVND(item.price * item.qty) + "</span></div>";
    }).join("") +
      '<div class="order-success__row"><span>Tạm tính</span><span>' + Merlin.formatVND(order.subtotal) + "</span></div>" +
      (order.discount ? '<div class="order-success__row"><span>Giảm giá</span><span>-' + Merlin.formatVND(order.discount) + "</span></div>" : "") +
      '<div class="order-success__row"><span>Phí ship</span><span>' +
      (order.shipping ? Merlin.formatVND(order.shipping) : "Miễn phí") + "</span></div>" +
      '<div class="order-success__row"><span>Tổng cộng</span><span>' + Merlin.formatVND(order.total) + "</span></div>";

    var note = document.getElementById("successNote");
    note.textContent = cfg.orderWebhookUrl
      ? "Đơn hàng đã được gửi về hệ thống cửa hàng. Chúng tôi sẽ liên hệ xác nhận trong 30 phút."
      : "Đơn hàng đã được lưu trên thiết bị này. Gửi đơn qua Zalo để cửa hàng xác nhận nhanh nhất.";

    var zalo = document.getElementById("zaloOrder");
    zalo.href = "https://zalo.me/" + String(cfg.zalo || "").replace(/\D/g, "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function copyOrder() {
    if (!lastOrder) return;
    var text = orderText(lastOrder);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { Merlin.toast("Đã sao chép nội dung đơn hàng.", "success"); },
        function () { fallbackCopy(text); }
      );
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      Merlin.toast("Đã sao chép nội dung đơn hàng.", "success");
    } catch (e) {
      Merlin.toast("Không sao chép được, bạn vui lòng chụp màn hình đơn hàng.", "error");
    }
    ta.remove();
  }

  function sendToWebhook(order) {
    if (!cfg.orderWebhookUrl) return;
    fetch(cfg.orderWebhookUrl, {
      method: cfg.orderWebhookMethod || "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(order)
    }).catch(function () {
      /* Không chặn luồng đặt hàng nếu webhook lỗi. */
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validate()) {
        Merlin.toast("Vui lòng kiểm tra lại thông tin giao hàng.", "error");
        return;
      }

      var totals = Merlin.totals();
      if (totals.items.length === 0) {
        Merlin.toast("Giỏ hàng đang trống.", "error");
        return;
      }

      var order = {
        code: Merlin.makeOrderCode(),
        createdAt: new Date().toISOString(),
        payment: getPayment(),
        customer: {
          name: document.getElementById("customerName").value.trim(),
          phone: document.getElementById("customerPhone").value.trim(),
          email: document.getElementById("customerEmail").value.trim(),
          province: document.getElementById("customerProvince").value,
          address: document.getElementById("customerAddress").value.trim(),
          note: document.getElementById("customerNote").value.trim()
        },
        items: totals.items.map(function (item) {
          return {
            id: item.id,
            name: item.product.name,
            size: item.size,
            qty: item.qty,
            price: item.unitPrice
          };
        }),
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        total: totals.total,
        promoCode: totals.promo ? totals.promo.code : null,
        status: "new"
      };

      Merlin.saveOrder(order);
      sendToWebhook(order);
      Merlin.clearCart();
      showSuccess(order);
      Merlin.toast("Đặt hàng thành công. Cảm ơn bạn!", "success");
    });
  }

  var copyBtn = document.getElementById("copyOrder");
  if (copyBtn) copyBtn.addEventListener("click", copyOrder);

  /* ---------- Khởi tạo ---------- */

  document.addEventListener("merlin:cart-updated", render);

  // Điền sẵn thông tin nếu đã đăng nhập
  var account = Merlin.getAccount();
  if (account) {
    if (account.name) document.getElementById("customerName").value = account.name;
    if (account.email) document.getElementById("customerEmail").value = account.email;
  }

  render();
})();
