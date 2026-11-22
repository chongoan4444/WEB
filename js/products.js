/* ============================================================
   TRANG SẢN PHẨM — lọc, tìm kiếm, sắp xếp
   ============================================================ */
(function () {
  "use strict";

  var Merlin = window.Merlin;
  var grid = document.getElementById("productGrid");
  var empty = document.getElementById("emptyState");
  var countEl = document.getElementById("resultCount");
  var searchInput = document.getElementById("searchInput");
  var typeSelect = document.getElementById("typeSelect");
  var sortSelect = document.getElementById("sortSelect");
  var resetBtn = document.getElementById("resetFilters");
  var pills = document.querySelectorAll("[data-cat]");

  if (!grid || !Merlin) return;

  var state = {
    category: Merlin.qs("category") || "all",
    type: Merlin.qs("type") || "all",
    q: Merlin.qs("q") || "",
    sort: Merlin.qs("sort") || "default"
  };

  if (Merlin.qs("sale") === "1") state.category = "sale";
  if (["all", "nu", "nam", "sale"].indexOf(state.category) === -1) state.category = "all";
  if (["all", "ao", "quan", "giay"].indexOf(state.type) === -1) state.type = "all";
  if (["default", "price-asc", "price-desc", "name"].indexOf(state.sort) === -1) state.sort = "default";

  function getFiltered() {
    var list = (window.PRODUCTS || []).slice();

    if (state.category === "sale") {
      list = list.filter(function (p) { return p.oldPrice && p.oldPrice > p.price; });
    } else if (state.category === "nu" || state.category === "nam") {
      list = list.filter(function (p) { return p.category === state.category; });
    }

    if (state.type !== "all") {
      list = list.filter(function (p) { return p.type === state.type; });
    }

    var q = state.q.trim().toLowerCase();
    if (q) {
      list = list.filter(function (p) {
        return (p.name + " " + (p.desc || "")).toLowerCase().indexOf(q) !== -1;
      });
    }

    if (state.sort === "price-asc") {
      list.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sort === "price-desc") {
      list.sort(function (a, b) { return b.price - a.price; });
    } else if (state.sort === "name") {
      list.sort(function (a, b) { return a.name.localeCompare(b.name, "vi"); });
    }

    return list;
  }

  function syncControls() {
    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.toggle("is-active", pills[i].getAttribute("data-cat") === state.category);
    }
    if (searchInput) searchInput.value = state.q;
    if (typeSelect) typeSelect.value = state.type;
    if (sortSelect) sortSelect.value = state.sort;
  }

  function syncURL() {
    var params = new URLSearchParams();
    if (state.category === "sale") params.set("sale", "1");
    else if (state.category !== "all") params.set("category", state.category);
    if (state.type !== "all") params.set("type", state.type);
    if (state.q.trim()) params.set("q", state.q.trim());
    if (state.sort !== "default") params.set("sort", state.sort);

    var query = params.toString();
    try {
      history.replaceState(null, "", "products.html" + (query ? "?" + query : ""));
    } catch (e) {
      /* history API có thể bị chặn khi mở trực tiếp file:// — bỏ qua. */
    }
  }

  function render() {
    var list = getFiltered();
    grid.innerHTML = list.map(Merlin.productCard).join("");
    if (countEl) countEl.textContent = list.length + " sản phẩm";
    if (empty) empty.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
    syncControls();
    syncURL();
  }

  /* Sự kiện */
  for (var i = 0; i < pills.length; i++) {
    pills[i].addEventListener("click", function () {
      state.category = this.getAttribute("data-cat");
      render();
    });
  }

  if (searchInput) {
    var timer = null;
    searchInput.addEventListener("input", function () {
      window.clearTimeout(timer);
      var value = this.value;
      timer = window.setTimeout(function () {
        state.q = value;
        render();
      }, 160);
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", function () {
      state.type = this.value;
      render();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      state.sort = this.value;
      render();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      state = { category: "all", type: "all", q: "", sort: "default" };
      render();
    });
  }

  render();
})();
