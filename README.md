# Raitek O&M – Checklist bảo trì quý và bàn giao điện mặt trời

Ứng dụng web cài lên điện thoại (PWA) để đi kiểm tra hiện trạng, audit và **nhận bàn giao O&M** dự án điện mặt trời
(áp mái, mặt đất, nổi). Chạy **offline** ngoài công trường, không cần server, không cần đăng nhập.

## Tính năng

- **22 nhóm, 297 hạng mục** theo form *FM-HOGY-OM-002 – Checklist of construction quality assessment*
  (thang lên mái, lan can & dây cứu sinh, sàn thao tác, tấm pin, khung rail, trạm thời tiết, tiếp địa, nước vệ sinh,
  nhà inverter, inverter, cáp DC/AC, máng cáp, tủ điện, tủ giám sát & Internet, khóa & biển cảnh báo, mặt bằng sau
  thi công, trạm biến áp, PCCC), cộng thêm hồ sơ bàn giao, tủ DC, đo đếm & chốt chỉ số, vật tư dự phòng.
  Mỗi hạng mục có tiêu chí đánh giá (nút **i**).
- Hạng mục tự lọc theo **loại dự án** (áp mái / mặt đất / nổi). Thêm được hạng mục riêng cho từng nhóm.
- Mỗi hạng mục: **Đạt / Không đạt / N/A**, ô **giá trị đo** (V, A, MΩ, Ω, °C, kWh, %), ghi chú, ảnh.
- **Cấu trúc khoa học**: 11 phần A–K theo dòng năng lượng (hồ sơ → tiếp cận mái → dàn pin → DC → inverter → AC & lưới
  → tiếp địa → giám sát → phụ trợ → PCCC → mặt bằng); trong mỗi nhóm chia nhóm con theo trình tự bố trí → liên kết →
  vật liệu → đấu nối → vận hành → nhãn, biển báo → đo kiểm.
- **Camera trong ứng dụng**: chụp liên tục nhiều ảnh, chuyển *Mục trước / Mục sau* và chấm Đạt / Không đạt / N/A ngay
  trên màn hình camera; có đèn (Android). Nút camera nhanh ở góc mỗi hạng mục.
- **Ảnh có vị trí**: góc ảnh có bản đồ nhỏ (OpenStreetMap) làm mờ với ghim vị trí, mã hạng mục, tọa độ GPS ±m và địa chỉ
  dự án; không ghi giờ. Mất mạng thì vẫn có tọa độ, bản đồ thay bằng khung lưới. Tắt được trong Cài đặt.
- **Danh sách tồn tại (punch list)** phân mức **A** (nghiêm trọng – xử lý trước bàn giao), **B** (quan trọng – xử lý
  theo thời hạn), **C** (khuyến nghị), kèm người chịu trách nhiệm và hạn khắc phục.
- **Kết luận tự động** (đủ điều kiện / có điều kiện / chưa đủ điều kiện nhận bàn giao), có thể chỉnh tay.
- **Chữ ký điện tử** 3 bên: Chủ đầu tư, bên bàn giao (EPC), bên nhận (O&M).
- **Xuất biên bản**: file **PDF** tạo ngay trên điện thoại, chạy cả khi offline. Phần chính gồm thông tin, tổng hợp,
  danh sách tồn tại, kết luận và chữ ký; phụ lục gồm bảng chi tiết và **ảnh mỗi hạng mục một trang** (tối đa 4 ảnh/trang).
  Mẫu biên bản mang nhận diện Raitek (logo, màu chàm – vàng), **Excel .xlsx** (sheet Checklist + sheet Tồn tại), file **HTML** gửi qua Zalo/email,
  **sao chép tóm tắt** dạng text.
- **Sao lưu / khôi phục** file `.json` (gồm cả ảnh) để chuyển máy hoặc lưu hồ sơ.

- **Đồng bộ Lark Base** (tùy chọn): mở app ngay trong Lark Workplace, tự đẩy % hoàn thành, kết quả từng hạng mục,
  ảnh và PDF lên Lark Base qua cầu nối chạy trên máy chủ nội bộ. Xem [docs/LARK-SETUP.md](docs/LARK-SETUP.md).

## Bảo trì bảo dưỡng định kỳ quý

Chế độ thứ hai của ứng dụng (nút **Tạo đợt bảo trì quý** ở trang chủ). Checklist không cố định mà được nhân ra từ hai thứ:

- **Bộ đầu việc theo loại thiết bị** trong [`js/pm.js`](js/pm.js): khu mái, thang, inverter, tủ điện AC, giám sát, cảm biến,
  tiếp địa, điểm đấu nối, PCCC… Mỗi đầu việc có tần suất (quý / 6 tháng / năm), yêu cầu bằng chứng (ảnh, giá trị đo),
  cờ "cần cắt điện" và dòng tương ứng trên mẫu checklist quý A–H đang ký với chủ đầu tư.
- **Hồ sơ thiết bị của dự án**: danh mục thiết bị và khu vực, lập một lần từ bản vẽ hoàn công. Nhập bằng file `.json`,
  lập nhanh theo số lượng, hoặc thêm / sửa từng thiết bị ở tab **Thông tin**. Hồ sơ lưu trên máy, quý sau chọn lại.

Mỗi thiết bị là một nhóm riêng (INV1, INV2, DB1…) nên thiết bị nào chưa làm xong hiện ngay trên danh sách. Các nhóm xếp
theo **khu vực**, đúng lộ trình đi tại hiện trường. Biên bản có thêm bảng tổng hợp theo mẫu A–H, danh sách hạng mục
"Đạt" còn thiếu ảnh / số đo, và phần theo dõi tồn tại của quý trước ("Tạo đợt quý kế tiếp" mang theo tồn tại chưa đóng
và số đo để đối chiếu).

File hồ sơ thiết bị:

```json
{ "app": "raitek-pm-site", "v": 1,
  "info": { "project": "…", "dc": "520,18", "ac": "450" },
  "zones": ["Trước khi lên mái", "Mái xưởng A", "Trạm inverter", "Kết thúc"],
  "assets": [{ "k": "inv", "id": "INV1", "n": "Inverter 01 – …", "z": "Trạm inverter", "d": "15 string × 19 tấm", "opt": [] }],
  "notes": ["Điểm cần xác nhận tại hiện trường"] }
```

`k` là loại thiết bị (`pre`, `ladder`, `roof`, `ws`, `inv`, `db`, `mon`, `gnd`, `pump`, `ff`, `cable`, `msb`, `tba`, `end`);
`id` là mã duy nhất, **không đổi sau khi đã có kết quả**; `z` là khu vực; `opt` bật đầu việc tùy chọn (`apfc` tủ có tụ bù,
`zx` có chống phát ngược). Hồ sơ dự án của khách hàng không nằm trong mã nguồn.

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
- `x: 1` hạng mục đã bỏ: ẩn ở biên bản mới, vẫn hiện ở biên bản cũ đã có kết quả
- **Không đổi hay dùng lại mã cũ**: kết quả đã lưu trên điện thoại gắn với mã hạng mục

Sau khi sửa bất kỳ file nào, tăng `VERSION` trong [`sw.js`](sw.js) (vd. `pvho-v2`) để điện thoại tải bản mới.

## Cấu trúc

```
index.html            khung trang
css/app.css           giao diện (sáng/tối, tối ưu đọc ngoài nắng)
js/checklist.js       bộ hạng mục kiểm tra (bàn giao / audit)
js/pm.js              bộ đầu việc bảo trì quý theo loại thiết bị
js/app.js             logic ứng dụng, lưu trữ, xuất biên bản
js/brand.js           logo Raitek (nhúng sẵn, dùng cho ứng dụng và PDF)
js/xlsx.js            tạo file Excel .xlsx (không cần thư viện ngoài)
js/pdf.js             tạo file PDF biên bản (jsPDF, font Noto Sans tiếng Việt)
js/vendor/            thư viện PDF + font, chạy offline (xem LICENSES.md)
sw.js                 service worker – chạy offline
manifest.webmanifest  thông tin cài đặt PWA
tools/build_artifact.py  đóng gói 1 file HTML để xem trước
server/               cầu nối Lark Base (Node.js, chạy trên máy chủ nội bộ)
docs/LARK-SETUP.md    hướng dẫn kết nối Lark
```

Chạy thử trên máy tính: `python3 -m http.server 8000` rồi mở `http://localhost:8000`.
