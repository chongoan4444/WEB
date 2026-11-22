/* ============================================================
   TRANG CHI TIẾT SẢN PHẨM
   ============================================================ */
(function () {
  "use strict";

  var Merlin = window.Merlin;
  if (!Merlin) return;

  var product = Merlin.getProduct(Merlin.qs("id"));

  function notFound() {
    var pdp = document.getElementById("pdp");
    if (!pdp) return;
    pdp.innerHTML =
      '<div class="empty-state" style="grid-column: 1 / -1">' +
        '<h3>Không tìm thấy sản phẩm</h3>' +
        "<p>Sản phẩm có thể đã bị gỡ hoặc liên kết không đúng.</p>" +
        '<a class="btn btn--outline" href="products.html">Về trang sản phẩm</a>' +
      "</div>";
    document.getElementById("crumbName").textContent = "Không tìm thấy";
    var relatedSection = document.getElementById("relatedSection");
    if (relatedSection) relatedSection.hidden = true;
    document.title = "Không tìm thấy sản phẩm — Merlin Fashion";
  }

  if (!product) {
    notFound();
    return;
  }

  var labels = window.CATEGORY_LABELS || {};
  var selectedSize = null;
  var qty = 1;

  /* --- Đổ dữ liệu --- */
  document.title = product.name + " — Merlin Fashion";
  document.getElementById("crumbName").textContent = product.name;

  var img = document.getElementById("pdpImage");
  img.src = product.image;
  img.alt = product.name;

  document.getElementById("pdpName").textContent = product.name;
  document.getElementById("pdpCategory").textContent = labels[product.category] || "";
  document.getElementById("pdpType").textContent = labels[product.type] || "";

  var priceEl = document.getElementById("pdpPrice");
  var oldEl = document.getElementById("pdpOldPrice");
  priceEl.textContent = Merlin.formatVND(product.price);
  if (product.oldPrice && product.oldPrice > product.price) {
    oldEl.textContent = Merlin.formatVND(product.oldPrice);
    oldEl.hidden = false;
    var badge = document.getElementById("pdpBadge");
    var off = Merlin.discountPercent(product);
    badge.textContent = "Giảm " + off + "%";
    badge.hidden = false;
  }

  var descEl = document.getElementById("pdpDesc");
  var descLong = document.getElementById("pdpDescLong");
  descEl.textContent = product.desc;
  descLong.textContent = product.desc;

  var materialEl = document.getElementById("pdpMaterial");
  materialEl.textContent = (product.material ? "Chất liệu: " + product.material + ". " : "") +
    (product.care ? "Bảo quản: " + product.care + "." : "");

  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", product.name + " — " + product.desc);

  /* --- Size --- */
  var sizesEl = document.getElementById("pdpSizes");
  var hintEl = document.getElementById("sizeHint");
  var addBtn = document.getElementById("pdpAdd");
  var buyBtn = document.getElementById("pdpBuy");

  sizesEl.innerHTML = product.sizes.map(function (size) {
    return '<button type="button" class="size-btn" data-size="' + Merlin.escapeHtml(size) + '">' +
      Merlin.escapeHtml(size) + "</button>";
  }).join("");

  sizesEl.addEventListener("click", function (event) {
    var btn = event.target.closest(".size-btn");
    if (!btn) return;
    selectedSize = btn.getAttribute("data-size");
    var all = sizesEl.querySelectorAll(".size-btn");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("is-active");
    btn.classList.add("is-active");
    hintEl.textContent = "Đã chọn size " + selectedSize;
  });

  /* --- Số lượng --- */
  var qtyInput = document.getElementById("qtyInput");
  var qtyMinus = document.getElementById("qtyMinus");
  var qtyPlus = document.getElementById("qtyPlus");

  function setQty(value) {
    qty = Math.max(1, Math.min(99, parseInt(value, 10) || 1));
    qtyInput.value = qty;
  }

  qtyMinus.addEventListener("click", function () { setQty(qty - 1); });
  qtyPlus.addEventListener("click", function () { setQty(qty + 1); });
  qtyInput.addEventListener("change", function () { setQty(this.value); });

  /* --- Thêm vào giỏ / mua ngay --- */
  function tryAdd() {
    if (!selectedSize) {
      hintEl.textContent = "Vui lòng chọn size trước khi mua.";
      Merlin.toast("Vui lòng chọn size sản phẩm.", "error");
      sizesEl.classList.add("size-list--error");
      window.setTimeout(function () { sizesEl.classList.remove("size-list--error"); }, 900);
      return false;
    }
    var result = Merlin.addItem(product.id, selectedSize, qty);
    Merlin.toast(result.message, result.ok ? "success" : "error");
    return result.ok;
  }

  addBtn.addEventListener("click", tryAdd);
  buyBtn.addEventListener("click", function () {
    if (tryAdd()) window.location.href = "cart.html";
  });

  document.getElementById("openSizeGuide").addEventListener("click", function () {
    var guide = document.getElementById("sizeGuide");
    if (!guide) return;
    guide.open = true;
    guide.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* --- Sản phẩm liên quan --- */
  var related = (window.PRODUCTS || []).filter(function (p) {
    return p.id !== product.id && p.category === product.category;
  });
  if (related.length < 4) {
    var extra = (window.PRODUCTS || []).filter(function (p) {
      return p.id !== product.id && p.category !== product.category;
    });
    related = related.concat(extra);
  }
  document.getElementById("relatedGrid").innerHTML = related.slice(0, 4).map(Merlin.productCard).join("");
})();
