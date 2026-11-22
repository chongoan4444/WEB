/* ============================================================
   TRANG LIÊN HỆ
   ============================================================ */
(function () {
  "use strict";

  var Merlin = window.Merlin;
  if (!Merlin) return;

  var cfg = Merlin.config;

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value) el.textContent = value;
  }

  setText("contactAddress", cfg.address);
  setText("contactPhone", cfg.hotline);
  setText("contactEmailLink", cfg.email);

  var phoneLink = document.getElementById("contactPhone");
  if (phoneLink && cfg.hotlineRaw) phoneLink.href = "tel:" + cfg.hotlineRaw;

  var emailLink = document.getElementById("contactEmailLink");
  if (emailLink && cfg.email) emailLink.href = "mailto:" + cfg.email;

  var zaloLink = document.getElementById("contactZalo");
  if (zaloLink && cfg.zalo) zaloLink.href = "https://zalo.me/" + String(cfg.zalo).replace(/\D/g, "");

  var form = document.getElementById("contactForm");
  if (!form) return;

  function setError(id, message) {
    var input = document.getElementById(id);
    var error = document.querySelector('[data-error-for="' + id + '"]');
    if (input) input.classList.toggle("is-invalid", !!message);
    if (error) error.textContent = message || "";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = document.getElementById("contactName").value.trim();
    var email = document.getElementById("contactEmail").value.trim();
    var topic = document.getElementById("contactTopic").value;
    var message = document.getElementById("contactMessage").value.trim();
    var ok = true;

    setError("contactName", name.length >= 2 ? "" : "Vui lòng nhập họ tên.");
    setError("contactEmail", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : "Email chưa đúng định dạng.");
    setError("contactMessage", message.length >= 10 ? "" : "Vui lòng nhập nội dung (ít nhất 10 ký tự).");

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 10) {
      ok = false;
    }

    if (!ok) {
      Merlin.toast("Vui lòng kiểm tra lại thông tin.", "error");
      return;
    }

    var subject = "Liên hệ Merlin Fashion — " + topic;
    var body =
      "Họ tên: " + name + "\n" +
      "Email: " + email + "\n" +
      "Chủ đề: " + topic + "\n\n" +
      "Nội dung:\n" + message + "\n";

    window.location.href = "mailto:" + cfg.email +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    Merlin.toast("Đã mở ứng dụng email để gửi tin nhắn.", "success");
  });
})();
