# Raitek PV Handover – Checklist bàn giao O&M điện mặt trời

Ứng dụng web cài lên điện thoại (PWA) để đi kiểm tra hiện trạng, audit và **nhận bàn giao O&M** dự án điện mặt trời
(áp mái, mặt đất, nổi). Chạy **offline** ngoài công trường, không cần server, không cần đăng nhập.

## Tính năng

- **15 nhóm, 150 hạng mục chuẩn**: hồ sơ pháp lý & tài liệu, tấm pin, khung giá đỡ, cáp DC/string, tủ DC, inverter,
  tủ AC, trạm biến áp/trung thế, tiếp địa & chống sét, SCADA, đo đếm, PCCC & an toàn, mặt bằng, vật tư dự phòng,
  hiệu suất & đào tạo. Mỗi hạng mục có tiêu chí đánh giá (nút **i**).
- Hạng mục tự lọc theo **loại dự án** (áp mái / mặt đất / nổi). Thêm được hạng mục riêng cho từng nhóm.
- Mỗi hạng mục: **Đạt / Không đạt / N/A**, ô **giá trị đo** (V, A, MΩ, Ω, °C, kWh, %), ghi chú, ảnh.
- **Chụp ảnh hiện trường**: ảnh được nén (~200–400 KB) và **đóng dấu mã hạng mục + tên dự án + thời gian**.
- **Danh sách tồn tại (punch list)** phân mức **A** (nghiêm trọng – xử lý trước bàn giao), **B** (quan trọng – xử lý
  theo thời hạn), **C** (khuyến nghị), kèm người chịu trách nhiệm và hạn khắc phục.
- **Kết luận tự động** (đủ điều kiện / có điều kiện / chưa đủ điều kiện nhận bàn giao), có thể chỉnh tay.
- **Chữ ký điện tử** 3 bên: Chủ đầu tư, bên bàn giao (EPC), bên nhận (O&M).
- **Xuất biên bản**: file **PDF** tạo ngay trên điện thoại, chạy cả khi offline. Phần chính gồm thông tin, tổng hợp,
  danh sách tồn tại, kết luận và chữ ký; phụ lục gồm bảng chi tiết và **ảnh mỗi hạng mục một trang** (tối đa 4 ảnh/trang).
  Mẫu biên bản mang nhận diện Raitek (logo, màu chàm – vàng), **Excel .xlsx** (sheet Checklist + sheet Tồn tại), file **HTML** gửi qua Zalo/email,
  **sao chép tóm tắt** dạng text.
- **Sao lưu / khôi phục** file `.json` (gồm cả ảnh) để chuyển máy hoặc lưu hồ sơ.

## Cài lên điện thoại

1. Mở đường dẫn GitHub Pages của ứng dụng (xem mục bên dưới) bằng **Safari** (iPhone) hoặc **Chrome** (Android).
2. iPhone: nút **Chia sẻ → Thêm vào MH chính**. Android: **⋮ → Cài đặt ứng dụng / Thêm vào màn hình chính**.
3. Mở ứng dụng một lần khi có mạng; sau đó dùng được hoàn toàn offline.

> Dữ liệu lưu **trên chính điện thoại** (IndexedDB). Xóa dữ liệu trình duyệt sẽ mất biên bản – hãy **Sao lưu (.json)**
> sau mỗi đợt kiểm tra.

## Đăng lên GitHub Pages (một lần)

1. Gộp nhánh này vào `main`.
2. Vào **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Workflow `.github/workflows/pages.yml` tự chạy khi có thay đổi trên `main`. Đường dẫn có dạng
   `https://<tài-khoản>.github.io/<tên-repo>/`.

Repo riêng tư (private) cần gói GitHub trả phí mới bật được Pages. Cách khác: chép các file `index.html`,
`manifest.webmanifest`, `sw.js`, `css/`, `js/`, `icons/` lên bất kỳ máy chủ web tĩnh nào có HTTPS
(Netlify, Cloudflare Pages, máy chủ nội bộ…).

## Chỉnh sửa bộ checklist

Toàn bộ hạng mục nằm trong [`js/checklist.js`](js/checklist.js). Mỗi hạng mục:

```js
{ c: 'DC-12', t: 'Đo điện trở cách điện string (+/PE, −/PE)', u: 'MΩ', h: 'IEC 62446-1: ... tối thiểu 1 MΩ', s: 'roof ground' }
```

- `c` mã (duy nhất) · `t` nội dung · `h` tiêu chí (tùy chọn) · `u` đơn vị đo (tùy chọn)
- `s` loại dự án áp dụng: `roof`, `ground`, `float` (bỏ trống = tất cả)

Sau khi sửa bất kỳ file nào, tăng `VERSION` trong [`sw.js`](sw.js) (vd. `pvho-v2`) để điện thoại tải bản mới.

## Cấu trúc

```
index.html            khung trang
css/app.css           giao diện (sáng/tối, tối ưu đọc ngoài nắng)
js/checklist.js       bộ hạng mục kiểm tra
js/app.js             logic ứng dụng, lưu trữ, xuất biên bản
js/brand.js           logo Raitek (nhúng sẵn, dùng cho ứng dụng và PDF)
js/xlsx.js            tạo file Excel .xlsx (không cần thư viện ngoài)
js/pdf.js             tạo file PDF biên bản (jsPDF, font Noto Sans tiếng Việt)
js/vendor/            thư viện PDF + font, chạy offline (xem LICENSES.md)
sw.js                 service worker – chạy offline
manifest.webmanifest  thông tin cài đặt PWA
tools/build_artifact.py  đóng gói 1 file HTML để xem trước
```

Chạy thử trên máy tính: `python3 -m http.server 8000` rồi mở `http://localhost:8000`.
