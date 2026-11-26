# Kết nối PV Handover với Lark Base (larksuite.com)

Sau khi cài xong:

- Ứng dụng mở ngay trong **Lark → Workplace**, đăng nhập tự động bằng tài khoản Lark.
- Mọi kết quả kiểm tra tự đẩy lên Lark Base khi có mạng: % hoàn thành, số Đạt / Không đạt / N/A, tồn tại A/B/C,
  từng hạng mục, ghi chú, ảnh (có GPS), file PDF biên bản.
- Ngoài công trường mất sóng vẫn làm bình thường; dữ liệu nằm trên điện thoại và tự gửi khi có mạng lại.

```
Điện thoại (app, lưu trên máy trước) ──HTTPS──▶ Cầu nối (máy chủ nội bộ Raitek, giữ App Secret) ──▶ Lark Base
```

Thời gian cài đặt: khoảng 45–60 phút. Cần: quyền tạo ứng dụng trên Lark Developer Console, một máy chủ nội bộ có
Node.js 18+ (hoặc Docker), và một tên miền HTTPS trỏ về máy chủ đó.

---

## Bước 1 – Tạo Lark Base trống

1. Trong Lark, tạo một **Base** mới, đặt tên ví dụ `PV Handover – Raitek`.
2. Mở Base, nhìn thanh địa chỉ: `https://xxx.larksuite.com/base/`**`AbCdEf123456`**`?table=...`
   Phần in đậm (sau `/base/`, trước `?`) là **Base token** – ghi lại.
3. Không cần tạo bảng: cầu nối tự tạo 2 bảng **Biên bản** và **Kết quả hạng mục** với đủ cột.

## Bước 2 – Tạo ứng dụng trên Lark Developer Console

1. Vào <https://open.larksuite.com/app> → **Create Custom App** (Tạo ứng dụng tự xây dựng).
   Tên: `Raitek PV Handover`, biểu tượng: logo Raitek.
2. **Credentials & Basic Info**: ghi lại **App ID** (dạng `cli_...`) và **App Secret**.
   App Secret là mật khẩu của ứng dụng: chỉ nhập vào file `.env` trên máy chủ, không gửi qua chat / email.
3. **Permissions & Scopes** – thêm quyền:
   - Base: xem, chỉnh sửa và quản lý Base (`bitable:app`).
   - Tải tệp / ảnh lên tài liệu (Drive – upload media).
   - Đăng nhập người dùng: lấy thông tin cơ bản của người dùng (tên, open_id).

   Nếu thiếu quyền, log của cầu nối sẽ ghi lỗi Lark kèm **tên quyền còn thiếu** – thêm đúng quyền đó rồi phát hành lại.
4. **Security Settings → Redirect URLs**: thêm `https://<tên-miền-cầu-nối>/auth/callback`
   (ví dụ `https://lark-bridge.raitek.vn/auth/callback`).
5. **Features → Web App** (Ứng dụng web): bật, điền **Desktop homepage** và **Mobile homepage**:

   ```
   https://mtryha11.github.io/Handover-checklist/index.html?lark=https://lark-bridge.raitek.vn
   ```

   Tham số `?lark=` giúp mọi người mở từ Lark là app tự biết địa chỉ cầu nối, không phải cài đặt tay.
6. **Version Management & Release**: tạo phiên bản, chọn phạm vi sử dụng (toàn công ty hoặc nhóm O&M) → gửi duyệt.
   Admin Lark của công ty duyệt là app xuất hiện trong Workplace.

## Bước 3 – Cho ứng dụng quyền sửa Base

Mở Base ở Bước 1 → nút **…** (góc trên phải) → **Add Document App / Thêm ứng dụng tài liệu** → chọn
`Raitek PV Handover` → quyền **Can edit (Có thể chỉnh sửa)**.

## Bước 4 – Cài cầu nối trên máy chủ nội bộ

Thư mục `server/` trong repo gồm: `lark-bridge.mjs` (chương trình, không cần cài thư viện), `.env.example`,
`Dockerfile`, `lark-bridge.service` (systemd).

### 4.1 Cấu hình

```bash
sudo mkdir -p /opt/lark-bridge && sudo cp server/lark-bridge.mjs server/.env.example /opt/lark-bridge/
cd /opt/lark-bridge && sudo cp .env.example .env && sudo nano .env
openssl rand -hex 32      # dán kết quả vào SESSION_SECRET
```

| Biến | Giá trị |
|---|---|
| `LARK_APP_ID` | App ID ở Bước 2 |
| `LARK_APP_SECRET` | App Secret ở Bước 2 |
| `LARK_BASE_TOKEN` | Base token ở Bước 1 |
| `PUBLIC_URL` | `https://lark-bridge.raitek.vn` (địa chỉ HTTPS công khai của cầu nối) |
| `ALLOWED_ORIGINS` | `https://mtryha11.github.io` |
| `SESSION_SECRET` | chuỗi ngẫu nhiên 64 ký tự |

```bash
sudo chmod 600 .env
node lark-bridge.mjs setup     # tạo 2 bảng trong Base; chạy lại bao nhiêu lần cũng được
```

### 4.2 Chạy thường trực (chọn một cách)

**systemd**

```bash
sudo cp server/lark-bridge.service /etc/systemd/system/
sudo chown -R www-data /opt/lark-bridge
sudo systemctl enable --now lark-bridge
journalctl -u lark-bridge -f      # xem log
```

**Docker**

```bash
cd server && docker build -t lark-bridge .
docker run -d --name lark-bridge --restart always --env-file /opt/lark-bridge/.env -p 8787:8787 lark-bridge
```

### 4.3 HTTPS và mở ra Internet

Điện thoại ngoài công trường dùng 4G nên cầu nối phải truy cập được từ Internet qua **HTTPS**. Ví dụ Nginx
(chứng chỉ Let's Encrypt):

```nginx
server {
  listen 443 ssl http2;
  server_name lark-bridge.raitek.vn;
  ssl_certificate     /etc/letsencrypt/live/lark-bridge.raitek.vn/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/lark-bridge.raitek.vn/privkey.pem;
  client_max_body_size 40m;            # ảnh, PDF
  location / {
    proxy_pass http://127.0.0.1:8787;
    proxy_set_header Host $host;
    proxy_read_timeout 120s;
  }
}
```

Không mở được cổng ra Internet thì có thể dùng Cloudflare Tunnel trỏ về `http://127.0.0.1:8787`.

Kiểm tra: mở `https://lark-bridge.raitek.vn/health` → thấy `{"ok":true,"configured":true,...}`.

## Bước 5 – Dùng thử

1. Trên điện thoại, mở **Lark → Workplace → Raitek PV Handover**. App tự đăng nhập Lark (lần đầu Lark hỏi đồng ý).
   Mở bằng trình duyệt thường thì vào **Cài đặt → Máy chủ đồng bộ Lark Base → Đăng nhập Lark**.
2. Mở một biên bản: trên màn hình Hạng mục có dòng **"Lark: đã đồng bộ lúc …"**.
3. Ở tab Biên bản → Xuất PDF → **Lưu PDF vào Lark Base**.

## Bước 6 – Dựng view và dashboard trên Lark Base

Bảng **Kết quả hạng mục**:

- View **Tồn tại**: lọc `Kết quả = Không đạt`, nhóm theo `Biên bản`, sắp theo `Mức độ`.
- View **Kanban khắc phục**: kiểu Kanban theo `Tình trạng khắc phục` (Chưa xử lý / Đang xử lý / Đã khắc phục).
  Cột này do người dùng Lark cập nhật; app không ghi đè.
- View **Gallery ảnh**: kiểu Gallery, ảnh bìa = `Ảnh`.

Dashboard:

- Thẻ số: tổng biên bản, trung bình `Hoàn thành (%)`, tổng `Tồn tại A`.
- Biểu đồ cột: `Hoàn thành (%)` theo `Dự án`.
- Biểu đồ: số dòng `Kết quả = Không đạt` theo `Phần` / `Nhóm` / `Mức độ`.

## Dữ liệu được đồng bộ

| Bảng | Mỗi dòng | Cập nhật khi |
|---|---|---|
| Biên bản | 1 đợt kiểm tra | % hoàn thành, số lượng, kết luận, thông tin dự án thay đổi; PDF được lưu |
| Kết quả hạng mục | 1 hạng mục × 1 biên bản | kết quả, mức độ, ghi chú, giá trị đo, trách nhiệm, hạn, ảnh thay đổi |

- Đồng bộ chạy nền ~8 giây sau mỗi thay đổi, khi mở biên bản và khi điện thoại có mạng trở lại; chỉ gửi phần thay đổi.
- Ảnh gửi từng ảnh một (~300 KB/ảnh). Một biên bản ~300 dòng ở bảng Kết quả hạng mục – kiểm tra giới hạn số dòng/bảng
  theo gói Lark của công ty.
- Xóa biên bản trên điện thoại **không** xóa dữ liệu trên Lark.

## Xử lý sự cố

| Hiện tượng | Nguyên nhân / cách xử lý |
|---|---|
| "Không kết nối được máy chủ đồng bộ" | Kiểm tra `https://…/health`, HTTPS, tường lửa, `ALLOWED_ORIGINS`. |
| Đăng nhập báo lỗi redirect | Redirect URL ở Bước 2.4 phải trùng `PUBLIC_URL/auth/callback`. |
| Log: `BaseTokenNotFound` / không có quyền | Sai `LARK_BASE_TOKEN` hoặc chưa làm Bước 3. |
| Log: thiếu quyền (mã 99991672…) | Thêm quyền ghi trong log ở Bước 2.3, phát hành phiên bản mới. |
| "Phiên đăng nhập Lark đã hết hạn" | Đăng nhập lại (mặc định giữ 30 ngày, đổi bằng `SESSION_DAYS`). |
