/* ============================================================
   MERLIN FASHION — CẤU HÌNH CỬA HÀNG
   Sửa các giá trị dưới đây để đổi thông tin shop, cước phí,
   mã giảm giá và nơi nhận đơn. Không cần đụng vào file khác.
   ============================================================ */

window.MERLIN_CONFIG = {
  // --- Thông tin shop ---
  shopName: "Merlin Fashion",
  tagline: "Refresh Your Wardrobe",
  hotline: "0909 123 456",
  hotlineRaw: "0909123456",
  email: "hello@merlinfashion.vn",
  address: "12 Nguyễn Huệ, Hoàn Kiếm, Hà Nội",
  zalo: "0909123456", // số Zalo nhận đơn
  facebook: "https://facebook.com/merlinfashion",

  // --- Giao hàng ---
  shippingFee: 30000,        // phí giao hàng cố định (VND)
  freeShipThreshold: 500000, // miễn phí ship từ đơn đạt mức này (VND)

  // --- Mã giảm giá ---
  // type: "percent" (giảm theo %) | "amount" (giảm tiền cố định) | "shipping" (miễn phí ship)
  promoCodes: {
    MERLIN10: { type: "percent", value: 10, label: "Giảm 10% toàn bộ đơn hàng" },
    FREESHIP: { type: "shipping", value: 100, label: "Miễn phí giao hàng toàn quốc" },
    WELCOME50: { type: "amount", value: 50000, label: "Giảm 50.000₫ cho đơn từ 300.000₫", minOrder: 300000 }
  },

  // --- Nhận đơn tự động (tuỳ chọn) ---
  // Dán endpoint của Formspree / Google Apps Script / webhook riêng vào đây.
  // Khi có giá trị, trang sẽ POST đơn hàng (JSON) đến URL này khi khách đặt hàng.
  // Bỏ trống = chỉ lưu đơn trong trình duyệt và gửi qua Zalo/email thủ công.
  orderWebhookUrl: "",
  orderWebhookMethod: "POST",

  // --- Thông tin chuyển khoản (hiển thị khi khách chọn thanh toán chuyển khoản) ---
  bank: {
    bankName: "Vietcombank",
    accountName: "MERLIN FASHION",
    accountNumber: "0123456789",
    branch: "Chi nhánh Hà Nội"
  }
};
