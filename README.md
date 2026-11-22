# Merlin Fashion 🛍️ — Web bán hàng thời trang (bản tĩnh)

Trang web bán hàng thời trang nam nữ, giày dép và phụ kiện, được nâng cấp từ template HTML/CSS/JS gốc của repo. Giữ nguyên nhận diện **Merlin Fashion** (hồng `#f84258`, serif Playfair Display, logo script) nhưng xây lại thành một cửa hàng hoạt động được thật sự.

> **Triết lý:** không cần cài đặt, không build tool, không database. Mở file là chạy — nhưng vẫn có giỏ hàng, mã giảm giá, trang chi tiết sản phẩm và đặt hàng COD.

---

## ✨ Tính năng

| Nhóm | Chi tiết |
|---|---|
| **Trang chủ** | Hero, 4 danh mục, 8 sản phẩm nổi bật, banner ưu đãi, câu chuyện thương hiệu |
| **Danh mục sản phẩm** | 32 sản phẩm, lọc Nữ/Nam/Đang giảm giá, lọc theo loại (áo/quần/giày), tìm kiếm, sắp xếp theo giá/tên, đồng bộ URL |
| **Chi tiết sản phẩm** | Ảnh lớn, giá/valeur cũ, chọn size, tăng giảm số lượng, bảng size, accordion mô tả – chất liệu – chính sách, sản phẩm liên quan |
| **Giỏ hàng** | Lưu `localStorage`, tăng/giảm số lượng, xóa từng món, tính tổng, thanh tiến độ miễn phí ship, mã giảm giá |
| **Thanh toán** | Form giao hàng có validate, chọn COD hoặc chuyển khoản, sinh mã đơn, lưu đơn cục bộ, gửi đơn qua Zalo / sao chép nội dung |
| **Tài khoản** | Đăng ký/đăng nhập/đăng xuất (lưu cục bộ), lịch sử đơn hàng theo email |
| **Liên hệ** | Thông tin shop, form gửi email, 5 câu hỏi thường gặp |
| **Khác** | Responsive mobile, menu burger, toast thông báo, badge số lượng giỏ hàng, favicon, SEO meta |

### Mã giảm giá có sẵn (cấu hình trong `js/config.js`)

- `MERLIN10` — giảm 10% toàn bộ đơn hàng
- `FREESHIP` — miễn phí giao hàng
- `WELCOME50` — giảm 50.000₫ cho đơn từ 300.000₫

---

## 🚀 Chạy dự án

Bất kỳ static server nào cũng được. Ví dụ:

```bash
# Python
python3 -m http.server 8000

# hoặc Node
npx serve .
```

Mở `http://localhost:8000`.

> Không cần `npm install`. Toàn bộ JS là vanilla, không thư viện ngoài (trừ Google Fonts).

---

## 📁 Cấu trúc

```
.
├── index.html            # Trang chủ
├── products.html         # Danh sách sản phẩm (lọc/tìm kiếm)
├── product.html          # Chi tiết sản phẩm (?id=...)
├── cart.html             # Giỏ hàng + thanh toán
├── categories.html       # Danh mục
├── merlin.html           # Câu chuyện thương hiệu
├── contact.html          # Liên hệ & FAQ
├── login.html            # Đăng nhập / đăng ký / tài khoản
├── css/
│   └── shop.css          # Design system duy nhất
├── js/
│   ├── config.js         # ⚙️ Thông tin shop, cước phí, mã giảm giá, webhook
│   ├── data.js           # 📦 Dữ liệu 32 sản phẩm (VND)
│   ├── shop.js           # Lõi: giỏ hàng, format VND, toast, tài khoản
│   ├── nav.js            # Menu mobile, active link, badge
│   ├── home.js           # Render trang chủ
│   ├── products.js       # Lọc / tìm kiếm / sắp xếp
│   ├── product.js        # Trang chi tiết
│   ├── cart.js           # Trang giỏ hàng + thanh toán
│   ├── account.js        # Trang tài khoản
│   └── contact.js        # Trang liên hệ
└── images/               # Ảnh sản phẩm & lifestyle
```

---

## 🛠️ Tuỳ chỉnh

### 1. Đổi thông tin cửa hàng

Mở **`js/config.js`** và sửa: tên shop, hotline, email, địa chỉ, số Zalo, phí ship, mức miễn phí ship, mã giảm giá, thông tin ngân hàng.

### 2. Thêm / sửa sản phẩm

Mở **`js/data.js`**, thêm một object vào mảng `PRODUCTS`:

```js
{
  id: "nu-dress-moi",              // unique, không dấu cách
  name: "Tên sản phẩm",
  price: 590000,                   // VND
  oldPrice: 790000,                // null nếu không giảm giá
  category: "nu",                  // "nu" | "nam"
  type: "ao",                      // "ao" | "quan" | "giay"
  image: "images/products-img/women/kurti1.png",
  sizes: ["S", "M", "L", "XL"],
  featured: true,                  // hiện ở mục "Sản phẩm nổi bật"
  desc: "Mô tả ngắn...",
  material: "Chất liệu...",
  care: "Hướng dẫn bảo quản..."
}
```

Lưu lại, reload trang — sản phẩm mới xuất hiện ở trang danh sách, tìm kiếm và trang chủ (nếu `featured`).

### 3. Nhận đơn tự động (tuỳ chọn)

Trang sẽ lưu đơn vào `localStorage` và cho phép gửi qua Zalo/sao chép. Nếu muốn nhận đơn về email/Google Sheet tự động:

1. Tạo form miễn phí tại [Formspree](https://formspree.io) (hoặc Google Apps Script webhook).
2. Dán URL vào `orderWebhookUrl` trong `js/config.js`.
3. Khi khách đặt hàng, trang sẽ `POST` JSON đơn hàng đến URL đó.

Payload gửi đi gồm: `code`, `createdAt`, `payment`, `customer`, `items`, `subtotal`, `discount`, `shipping`, `total`, `promoCode`.

---

## ⚠️ Hạn chế của bản tĩnh (và hướng nâng cấp)

Đây là **web tĩnh thuần** nên:

- Tài khoản & mật khẩu lưu trong `localStorage` — **không bảo mật thật**, không đồng bộ giữa thiết bị.
- Giỏ hàng/đơn hàng chỉ tồn tại trên trình duyệt của khách.
- Chưa có thanh toán trực tuyến (VNPay/MoMo), chưa có admin quản trị, chưa có tồn kho.

Phù hợp với: cửa hàng nhỏ bán COD, landing page bán hàng, portfolio, demo.

Khi cần bán hàng quy mô lớn hơn, nên nâng cấp:

- **Next.js + Prisma + PostgreSQL** — backend thật, đăng nhập JWT/session, quản trị sản phẩm & đơn hàng.
- **VNPay / MoMo / ZaloPay** — cổng thanh toán nội địa.
- **NextAuth / Clerk** — xác thực an toàn.
- **Cloudinary / S3** — lưu trữ ảnh sản phẩm.

---

## 🙏 Ghi công

- Template gốc: [singh-shivani/Merlin-Fashion](https://github.com/singh-shivani/Merlin-Fashion) — HTML/CSS/JS template.
- Ảnh: Unsplash & các nguồn công khai được sử dụng trong template gốc.
- Bộ thiết kế mới: `css/shop.css` — viết lại toàn bộ, giữ nhận diện Merlin.

© 2026 Merlin Fashion.
