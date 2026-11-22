/* ============================================================
   TRANG TÀI KHOẢN — đăng nhập / đăng ký / lịch sử đơn
   ============================================================ */
(function () {
  "use strict";

  var Merlin = window.Merlin;
  if (!Merlin) return;

  var authCard = document.getElementById("authCard");
  var accountCard = document.getElementById("accountCard");
  var tabLogin = document.getElementById("tabLogin");
  var tabRegister = document.getElementById("tabRegister");
  var loginForm = document.getElementById("loginForm");
  var registerForm = document.getElementById("registerForm");

  function setError(id, message) {
    var input = document.getElementById(id);
    var error = document.querySelector('[data-error-for="' + id + '"]');
    if (input) input.classList.toggle("is-invalid", !!message);
    if (error) error.textContent = message || "";
  }

  function clearErrors(form) {
    var inputs = form.querySelectorAll(".is-invalid");
    for (var i = 0; i < inputs.length; i++) inputs[i].classList.remove("is-invalid");
    var errors = form.querySelectorAll(".field-error");
    for (var j = 0; j < errors.length; j++) errors[j].textContent = "";
  }

  function switchTab(showLogin) {
    tabLogin.classList.toggle("is-active", showLogin);
    tabRegister.classList.toggle("is-active", !showLogin);
    tabLogin.setAttribute("aria-selected", showLogin ? "true" : "false");
    tabRegister.setAttribute("aria-selected", showLogin ? "false" : "true");
    loginForm.hidden = !showLogin;
    registerForm.hidden = showLogin;
  }

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener("click", function () { switchTab(true); });
    tabRegister.addEventListener("click", function () { switchTab(false); });
  }

  function renderOrders(email) {
    var list = document.getElementById("orderList");
    var orders = Merlin.getOrders().filter(function (order) {
      return !email || (order.customer && order.customer.email === email);
    });

    if (!orders.length) {
      list.innerHTML = '<p class="text-muted">Bạn chưa có đơn hàng nào. <a href="products.html" style="color: var(--pink); text-decoration: underline">Mua sắm ngay</a></p>';
      return;
    }

    list.innerHTML = orders.map(function (order) {
      var date = new Date(order.createdAt).toLocaleDateString("vi-VN");
      return (
        '<div class="order-row">' +
          "<strong>" + Merlin.escapeHtml(order.code) + " · " + Merlin.formatVND(order.total) + "</strong>" +
          "<span>" + date + " · " + (order.payment === "bank" ? "Chuyển khoản" : "COD") + " · " +
            order.items.length + " sản phẩm</span>" +
        "</div>"
      );
    }).join("");
  }

  function renderAccount() {
    var account = Merlin.getAccount();
    var loggedIn = !!account;

    authCard.hidden = loggedIn;
    accountCard.hidden = !loggedIn;

    if (loggedIn) {
      document.getElementById("accountName").textContent = "Xin chào, " + account.name;
      document.getElementById("accountEmail").textContent = account.email;
      renderOrders(account.email);
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(loginForm);

      var email = document.getElementById("loginEmail").value.trim();
      var password = document.getElementById("loginPassword").value;

      var ok = true;
      if (!email) { setError("loginEmail", "Vui lòng nhập email."); ok = false; }
      if (!password) { setError("loginPassword", "Vui lòng nhập mật khẩu."); ok = false; }
      if (!ok) return;

      var result = Merlin.login(email, password);
      Merlin.toast(result.message, result.ok ? "success" : "error");
      if (result.ok) {
        loginForm.reset();
        renderAccount();
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(registerForm);

      var name = document.getElementById("regName").value.trim();
      var email = document.getElementById("regEmail").value.trim();
      var password = document.getElementById("regPassword").value;

      var ok = true;
      if (name.length < 2) { setError("regName", "Vui lòng nhập họ tên."); ok = false; }
      if (!email) { setError("regEmail", "Vui lòng nhập email."); ok = false; }
      if (password.length < 6) { setError("regPassword", "Mật khẩu cần ít nhất 6 ký tự."); ok = false; }
      if (!ok) return;

      var result = Merlin.register(name, email, password);
      Merlin.toast(result.message, result.ok ? "success" : "error");
      if (result.ok) {
        registerForm.reset();
        renderAccount();
      }
    });
  }

  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      Merlin.logout();
      Merlin.toast("Đã đăng xuất.");
      renderAccount();
    });
  }

  document.addEventListener("merlin:auth-updated", renderAccount);

  renderAccount();
})();
