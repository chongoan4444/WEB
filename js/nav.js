/* ============================================================
   MERLIN FASHION — ĐIỀU HƯỚNG
   Menu mobile, làm nổi bật trang hiện tại, badge giỏ hàng.
   ============================================================ */
(function () {
  "use strict";

  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-main-nav]");
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.classList.toggle("is-active", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", open);
  }

  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("is-open"));
  });

  // Đóng menu khi bấm ra ngoài hoặc bấm một link
  document.addEventListener("click", function (event) {
    if (!nav.classList.contains("is-open")) return;
    if (nav.contains(event.target) || toggle.contains(event.target)) return;
    setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  // Làm nổi bật link của trang hiện tại
  var path = location.pathname.split("/").pop() || "index.html";
  if (path === "product.html") path = "products.html"; // trang chi tiết thuộc mục Sản phẩm
  var links = nav.querySelectorAll("a");
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute("href") || "";
    if (href === path || (path === "" && href === "index.html")) {
      links[i].classList.add("is-active");
      links[i].setAttribute("aria-current", "page");
    }
  }

  // Cập nhật badge mỗi khi giỏ hàng thay đổi
  document.addEventListener("merlin:cart-updated", function () {
    if (window.Merlin) window.Merlin.updateBadges();
  });

  // Đổ bóng header khi cuộn trang
  var header = document.querySelector("[data-site-header]");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
