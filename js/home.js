/* ============================================================
   TRANG CHỦ — render danh mục & sản phẩm nổi bật
   ============================================================ */
(function () {
  "use strict";

  var Merlin = window.Merlin;
  if (!Merlin) return;

  /* Danh mục */
  var catEl = document.getElementById("homeCategories");
  if (catEl && Array.isArray(window.CATEGORIES)) {
    catEl.innerHTML = window.CATEGORIES.map(function (cat) {
      return (
        '<a class="cat-tile" href="' + Merlin.escapeHtml(cat.link) + '">' +
          '<img src="' + Merlin.escapeHtml(cat.image) + '" alt="' + Merlin.escapeHtml(cat.name) +
            '" loading="lazy" width="600" height="750">' +
          '<div class="cat-tile__body">' +
            "<h3>" + Merlin.escapeHtml(cat.name) + "</h3>" +
            "<p>" + Merlin.escapeHtml(cat.desc) + "</p>" +
            '<span class="cat-tile__arrow" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>' +
              "</svg>" +
            "</span>" +
          "</div>" +
        "</a>"
      );
    }).join("");
  }

  /* Sản phẩm nổi bật: ưu tiên sản phẩm featured, đủ 8 item */
  var stat = document.getElementById("statProducts");
  if (stat && Array.isArray(window.PRODUCTS)) stat.textContent = window.PRODUCTS.length + "+";

  var grid = document.getElementById("featuredGrid");
  if (grid && Array.isArray(window.PRODUCTS)) {
    var featured = window.PRODUCTS.filter(function (p) { return p.featured; });
    var rest = window.PRODUCTS.filter(function (p) { return !p.featured; });
    var list = featured.concat(rest).slice(0, 8);
    grid.innerHTML = list.map(Merlin.productCard).join("");
  }
})();
