/* Service worker: lưu toàn bộ ứng dụng vào bộ nhớ đệm để chạy offline ngoài công trường.
 * Tăng VERSION mỗi khi sửa file để điện thoại tải bản mới. */
const VERSION = 'pvho-v9';
const SHELL = [
  './', 'index.html', 'css/app.css', 'js/checklist.js', 'js/brand.js', 'js/xlsx.js', 'js/pdf.js', 'js/app.js',
  'js/vendor/jspdf.umd.min.js', 'js/vendor/jspdf.plugin.autotable.min.js', 'js/vendor/pdf-fonts.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  // cache: 'reload' bỏ qua bộ nhớ đệm HTTP để bản mới không bị lẫn file cũ.
  e.waitUntil(caches.open(VERSION)
    .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Font chữ Google: dùng bản đã lưu, cập nhật ngầm khi có mạng.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(VERSION + '-fonts').then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;

  // Ứng dụng: ưu tiên bộ nhớ đệm (chạy offline), cập nhật ngầm khi có mạng.
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit || c.match('index.html'));
    return hit || net;
  }));
});
