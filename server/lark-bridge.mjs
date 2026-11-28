#!/usr/bin/env node
/*
 * Raitek PV Handover – cầu nối Lark Base
 * ---------------------------------------
 * Máy chủ nhỏ chạy trên máy chủ nội bộ, giữ App Secret của ứng dụng Lark và đẩy dữ liệu
 * từ app trên điện thoại lên Lark Base. Không cần cài thư viện: chỉ cần Node.js 18+.
 *
 *   node lark-bridge.mjs          chạy máy chủ (mặc định cổng 8787)
 *   node lark-bridge.mjs setup    tạo / bổ sung các bảng và trường trong Lark Base rồi thoát
 *
 * Cấu hình bằng biến môi trường hoặc file .env cạnh file này (xem .env.example).
 */
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ---------------- cấu hình ---------------- */
const HERE = path.dirname(fileURLToPath(import.meta.url));
loadDotEnv(path.join(HERE, '.env'));
const CFG = {
  port: +(process.env.PORT || 8787),
  host: process.env.HOST || '0.0.0.0',
  open: (process.env.LARK_OPEN_URL || 'https://open.larksuite.com').replace(/\/$/, ''),
  accounts: (process.env.LARK_ACCOUNTS_URL || 'https://accounts.larksuite.com').replace(/\/$/, ''),
  appId: process.env.LARK_APP_ID || '',
  appSecret: process.env.LARK_APP_SECRET || '',
  base: baseToken(process.env.LARK_BASE_TOKEN || ''),
  publicUrl: (process.env.PUBLIC_URL || '').replace(/\/$/, ''),
  origins: (process.env.ALLOWED_ORIGINS || 'https://mtryha11.github.io').split(',').map((s) => s.trim()).filter(Boolean),
  sessionSecret: process.env.SESSION_SECRET || '',
  sessionDays: +(process.env.SESSION_DAYS || 30),
  // Chuyển ghi âm ghi chú thành chữ. Không có STT_API_KEY thì tính năng tắt.
  // STT_PROVIDER=elevenlabs (mặc định, mô hình Scribe) hoặc openai (Whisper / dịch vụ tương thích OpenAI).
  sttKey: process.env.STT_API_KEY || process.env.ELEVENLABS_API_KEY || '',
  sttProvider: (process.env.STT_PROVIDER || 'elevenlabs').toLowerCase(),
  sttUrl: process.env.STT_URL || '',
  sttModel: process.env.STT_MODEL || '',
  sttLang: process.env.STT_LANGUAGE || 'vi',
  // Thuật ngữ chuyên ngành để mô hình viết đúng (cách nhau bằng dấu phẩy).
  sttTerms: (process.env.STT_KEYTERMS || 'inverter, string, MPPT, MC4, DC switch, ACB, MCCB, MCB, SPD, tủ MSB, tủ DB, busbar, đầu cốt, cáp DC, cáp AC, máng cáp, tiếp địa, rail, kẹp giữa, kẹp biên, chân L, tấm pin, hotspot, diode bypass, quạt tản nhiệt, logger, router, UPS, megaohm, ampe kìm, kWh, kWp, PV1, PV2')
    .split(',').map((x) => x.trim()).filter(Boolean).slice(0, 100)
};
// Chấp nhận cả token lẫn nguyên đường dẫn Base (…/base/<token>?table=…&view=…): chỉ lấy phần token.
function baseToken(raw) {
  const v = String(raw).trim();
  const m = v.match(/\/base\/([A-Za-z0-9]+)/);
  return m ? m[1] : v.split(/[?&#/\s]/)[0];
}
function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const log = (...a) => console.log(new Date().toISOString(), ...a);

/* ---------------- cấu trúc bảng trên Lark Base ---------------- */
// Kiểu trường Lark Base: 1 văn bản, 2 số, 3 chọn một, 5 ngày, 17 tệp đính kèm, 18 liên kết một chiều.
const T = { text: 1, number: 2, select: 3, date: 5, attachment: 17, link: 18 };
const UI = { text: 'Text', number: 'Number', select: 'SingleSelect', date: 'DateTime', attachment: 'Attachment', link: 'SingleLink' };
const SCHEMA = {
  insp: {
    name: 'Biên bản',
    fields: [ // trường đầu tiên là trường chính
      ['Mã biên bản', 'text'], ['Dự án', 'text'], ['Mã dự án', 'text'],
      ['Mục đích', 'select', ['Nhận bàn giao O&M', 'Audit hiện trạng', 'Kiểm tra định kỳ']],
      ['Loại dự án', 'select', ['Áp mái (Rooftop)', 'Mặt đất (Ground-mounted)', 'Nổi trên mặt nước (Floating)']],
      ['Trạng thái', 'select', ['Đang kiểm tra', 'Đã kiểm xong']],
      ['Hoàn thành (%)', 'number'], ['Tổng hạng mục', 'number'], ['Đạt', 'number'], ['Không đạt', 'number'],
      ['N/A', 'number'], ['Chưa kiểm', 'number'], ['Tồn tại A', 'number'], ['Tồn tại B', 'number'], ['Tồn tại C', 'number'],
      ['Kết luận', 'text'], ['Ngày kiểm tra', 'date'], ['Người kiểm tra', 'text'], ['Địa điểm', 'text'], ['Tọa độ GPS', 'text'],
      ['Công suất DC (kWp)', 'number'], ['Chủ đầu tư', 'text'], ['Bên bàn giao (EPC)', 'text'], ['Đơn vị O&M', 'text'],
      ['Biên bản PDF', 'attachment'], ['Chi tiết kết quả (Excel)', 'attachment'], ['Người đồng bộ', 'text'], ['Cập nhật lúc', 'date']
      // Các cột theo từng Phần (% hoàn thành, số không đạt, ảnh) do app gửi kèm kiểu và được tạo tự động.
    ]
  },
  items: {
    name: 'Tồn tại', // chỉ các hạng mục Không đạt (tiết kiệm số bản ghi)
    fields: [
      ['Khóa', 'text'], ['Biên bản', 'link', 'insp'], ['Mã biên bản', 'text'], ['Dự án', 'text'],
      ['Phần', 'text'], ['Nhóm', 'text'], ['Nhóm con', 'text'], ['Mã hạng mục', 'text'], ['Nội dung kiểm tra', 'text'],
      ['Kết quả', 'select', ['Đạt', 'Không đạt', 'N/A', 'Chưa kiểm']], ['Mức độ', 'select', ['A', 'B', 'C']],
      ['Ghi chú / mô tả tồn tại', 'text'], ['Giá trị đo', 'text'], ['Đơn vị', 'text'],
      ['Trách nhiệm', 'text'], ['Hạn khắc phục', 'date'], ['Ảnh', 'attachment'], ['Số ảnh', 'number'], ['Vị trí GPS', 'text'],
      // Do người dùng cập nhật trên Lark; cầu nối không bao giờ ghi đè trường này.
      ['Tình trạng khắc phục', 'select', ['Chưa xử lý', 'Đang xử lý', 'Đã khắc phục']],
      ['Người kiểm tra', 'text'], ['Cập nhật lúc', 'date']
    ]
  }
};
// Bảng "Thiết bị bảo trì <kỳ>" (bảo trì quý): mỗi thiết bị một dòng; mỗi hạng mục của thiết bị một cặp cột
// "HM nn" (mã, nội dung, kết quả, số đo, ghi chú) và "Ảnh nn" (ảnh của riêng hạng mục đó). Mỗi kỳ một bảng
// riêng vì Lark Base giới hạn 20.000 tệp đính kèm trong một bảng.
const DEV_SLOTS = 16;
const DEV_FIELDS = [
  ['Khóa', 'text'], ['Mã biên bản', 'text'], ['Dự án', 'text'], ['Đợt', 'text'], ['Khu vực', 'text'], ['Thiết bị', 'text'], ['Loại thiết bị', 'text'], ['Mô tả', 'text'],
  ['Hoàn thành (%)', 'number'], ['Đạt', 'number'], ['Không đạt', 'number'], ['N/A', 'number'], ['Chưa làm', 'number'], ['Số ảnh', 'number'],
  ['Ngày thực hiện', 'date'], ['Người thực hiện', 'text'],
  ...Array.from({ length: DEV_SLOTS }, (_, i) => { const n = String(i + 1).padStart(2, '0'); return [[`HM ${n}`, 'text'], [`Ảnh ${n}`, 'attachment']]; }).flat(),
  ['Hạng mục khác', 'text'], ['Ảnh khác', 'attachment'], ['Người đồng bộ', 'text'], ['Cập nhật lúc', 'date']
];
// Kiểu của từng cột đang có trên Base (đọc khi khởi động; cập nhật khi tạo cột mới).
const ftypes = { insp: new Map(), items: new Map() };
const TYPE_NAME = { 1: 'text', 2: 'number', 3: 'select', 5: 'date', 17: 'attachment', 18: 'link' };
const DYNAMIC_OK = new Set(['text', 'number', 'date', 'attachment']);

/* ---------------- gọi Lark Open API ---------------- */
let tenantTok = { v: '', exp: 0 }, appTok = { v: '', exp: 0 };
async function tokenOf(kind) {
  const box = kind === 'app' ? appTok : tenantTok;
  if (box.v && Date.now() < box.exp - 300000) return box.v;
  const r = await fetch(`${CFG.open}/open-apis/auth/v3/${kind === 'app' ? 'app' : 'tenant'}_access_token/internal`, {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ app_id: CFG.appId, app_secret: CFG.appSecret })
  });
  const j = await r.json();
  if (j.code !== 0) throw new LarkError(`Không lấy được ${kind}_access_token: ${j.msg} (mã ${j.code})`, j.code);
  box.v = j[kind === 'app' ? 'app_access_token' : 'tenant_access_token']; box.exp = Date.now() + (j.expire || 7200) * 1000;
  return box.v;
}
class LarkError extends Error { constructor(msg, code, status) { super(msg); this.code = code; this.status = status; } }
const RETRY_CODES = new Set([1254290, 1254291, 1254607, 99991400]); // quá tải / xung đột ghi / thử lại sau
async function lark(method, p, body, { tries = 5 } = {}) {
  for (let i = 0; ; i++) {
    const tok = await tokenOf('tenant');
    const opt = { method, headers: { Authorization: `Bearer ${tok}` } };
    if (body instanceof FormData) opt.body = body;
    else if (body !== undefined) { opt.body = JSON.stringify(body); opt.headers['Content-Type'] = 'application/json; charset=utf-8'; }
    const r = await fetch(CFG.open + p, opt);
    let j; try { j = await r.json(); } catch (e) { j = { code: -1, msg: `HTTP ${r.status}` }; }
    if (j.code === 0) return j.data || {};
    if ((r.status === 429 || RETRY_CODES.has(j.code)) && i < tries) { await sleep(500 * 2 ** i + Math.random() * 300); continue; }
    if ((j.code === 99991663 || j.code === 99991661) && i < 1) { tenantTok = { v: '', exp: 0 }; continue; } // token hết hạn
    throw new LarkError(`Lark ${method} ${p.split('?')[0]}: ${j.msg} (mã ${j.code})`, j.code, r.status);
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Ghi tuần tự theo từng bảng để tránh lỗi xung đột ghi đồng thời của Base.
const locks = new Map();
function serial(key, fn) {
  const prev = locks.get(key) || Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(key, next.catch(() => {}));
  return next;
}

/* ---------------- tạo bảng / trường ---------------- */
let tables = null; // { insp: table_id, items: table_id }
async function ensureTables() {
  if (tables) return tables;
  if (!CFG.base) throw new LarkError('Chưa cấu hình LARK_BASE_TOKEN');
  const ids = {};
  const list = async () => {
    const out = []; let page = '';
    do { const d = await lark('GET', `/open-apis/bitable/v1/apps/${CFG.base}/tables?page_size=100${page ? `&page_token=${page}` : ''}`); out.push(...(d.items || [])); page = d.has_more ? d.page_token : ''; } while (page);
    return out;
  };
  const fieldBody = ([name, type, extra]) => {
    const f = { field_name: name, type: T[type], ui_type: UI[type] };
    if (type === 'select') f.property = { options: extra.map((o) => ({ name: o })) };
    if (type === 'number') f.property = { formatter: '0' };
    if (type === 'link') f.property = { table_id: ids[extra], multiple: false };
    return f;
  };
  for (const key of ['insp', 'items']) {
    const def = SCHEMA[key];
    const existing = (await list()).find((t) => t.name === def.name);
    if (existing) {
      ids[key] = existing.table_id;
      const have = new Set();
      let page = '';
      do {
        const d = await lark('GET', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${ids[key]}/fields?page_size=100${page ? `&page_token=${page}` : ''}`);
        (d.items || []).forEach((f) => { have.add(f.field_name); ftypes[key].set(f.field_name, TYPE_NAME[f.type] || 'other'); }); page = d.has_more ? d.page_token : '';
      } while (page);
      for (const f of def.fields) {
        if (!have.has(f[0])) { await lark('POST', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${ids[key]}/fields`, fieldBody(f)); ftypes[key].set(f[0], f[1]); log(`+ trường "${f[0]}" trong bảng "${def.name}"`); }
      }
    } else {
      const d = await lark('POST', `/open-apis/bitable/v1/apps/${CFG.base}/tables`, { table: { name: def.name, default_view_name: 'Tất cả', fields: def.fields.map(fieldBody) } });
      ids[key] = d.table_id; def.fields.forEach((f) => ftypes[key].set(f[0], f[1])); log(`+ bảng "${def.name}" (${d.table_id})`);
    }
  }
  tables = ids;
  ensureTables.fieldBody = fieldBody;
  return ids;
}
// Tạo các cột còn thiếu mà app gửi kèm kiểu (vd. "% hoàn thành – A. Hồ sơ & tài liệu": number).
async function ensureFields(key, types) {
  const ids = await ensureTables();
  for (const [name, type] of Object.entries(types || {})) {
    if (ftypes[key].has(name) || !DYNAMIC_OK.has(type) || name.length > 90) continue;
    await lark('POST', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${ids[key]}/fields`, ensureTables.fieldBody([name, type]));
    ftypes[key].set(name, type); log(`+ trường "${name}" trong bảng "${SCHEMA[key].name}"`);
  }
}

/* ---------------- chuyển dữ liệu app → giá trị trường Lark ---------------- */
function toLark(tbl, data, { forUpdate }) {
  const out = {};
  const types = tbl instanceof Map ? tbl : ftypes[tbl];
  for (const [name, val] of Object.entries(data || {})) {
    const type = types.get(name);
    if (!type || type === 'other' || name === 'Tình trạng khắc phục') continue;
    const empty = val === null || val === undefined || val === '' || (Array.isArray(val) && !val.length);
    if (empty) { if (forUpdate && type !== 'link') out[name] = null; continue; }
    if (type === 'number') { const n = Number(String(val).replace(',', '.')); if (isFinite(n)) out[name] = n; }
    else if (type === 'date') { const t = typeof val === 'number' ? val : Date.parse(val); if (isFinite(t)) out[name] = t; }
    else if (type === 'attachment') out[name] = val.map((t) => ({ file_token: String(t) }));
    else if (type === 'link') out[name] = [String(val)];
    else out[name] = String(val);
  }
  return out;
}
async function searchKeys(tableId, field, value, keyField) {
  const map = {}; let page = '';
  do {
    const d = await lark('POST', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${tableId}/records/search?page_size=500${page ? `&page_token=${page}` : ''}`,
      { field_names: [keyField], filter: { conjunction: 'and', conditions: [{ field_name: field, operator: 'is', value: [value] }] } });
    for (const it of d.items || []) {
      let k = it.fields && it.fields[keyField];
      if (Array.isArray(k)) k = k.map((x) => (x && x.text) || x).join('');
      if (k) map[k] = it.record_id;
    }
    page = d.has_more ? d.page_token : '';
  } while (page);
  return map;
}

/* ---------------- bảng thiết bị bảo trì theo kỳ ---------------- */
const devTables = new Map(); // tên bảng -> { id, name, types }
function devTableName(period) {
  const p = String(period || '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 20);
  return p ? `Thiết bị bảo trì ${p}` : 'Thiết bị bảo trì';
}
async function ensureDevTable(period) {
  await ensureTables();
  const name = devTableName(period);
  if (devTables.has(name)) return devTables.get(name);
  return serial('devtable:' + name, async () => {
    if (devTables.has(name)) return devTables.get(name);
    const fieldBody = ensureTables.fieldBody;
    const types = new Map();
    let id = '', page = '';
    do {
      const d = await lark('GET', `/open-apis/bitable/v1/apps/${CFG.base}/tables?page_size=100${page ? `&page_token=${page}` : ''}`);
      const hit = (d.items || []).find((t) => t.name === name); if (hit) { id = hit.table_id; break; }
      page = d.has_more ? d.page_token : '';
    } while (page);
    if (id) {
      page = '';
      do {
        const d = await lark('GET', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${id}/fields?page_size=100${page ? `&page_token=${page}` : ''}`);
        (d.items || []).forEach((f) => types.set(f.field_name, TYPE_NAME[f.type] || 'other')); page = d.has_more ? d.page_token : '';
      } while (page);
      for (const f of DEV_FIELDS) {
        if (!types.has(f[0])) { await lark('POST', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${id}/fields`, fieldBody(f)); types.set(f[0], f[1]); }
      }
    } else {
      const d = await lark('POST', `/open-apis/bitable/v1/apps/${CFG.base}/tables`, { table: { name, default_view_name: 'Tất cả', fields: DEV_FIELDS.map(fieldBody) } });
      id = d.table_id; DEV_FIELDS.forEach((f) => types.set(f[0], f[1])); log(`+ bảng "${name}" (${id})`);
    }
    const t = { id, name, types };
    devTables.set(name, t);
    return t;
  });
}

/* ---------------- tải tệp đính kèm từ Base về (đồng bộ xuống máy khác) ---------------- */
async function mediaDownload(token, hint) {
  const tok = await tokenOf('tenant');
  const get = (q) => fetch(`${CFG.open}/open-apis/drive/v1/medias/${token}/download${q}`, { headers: { Authorization: `Bearer ${tok}` } });
  let r = await get('');
  // Base bật phân quyền nâng cao: Lark đòi kèm bảng chứa tệp.
  if (!r.ok && hint) r = await get(`?extra=${encodeURIComponent(JSON.stringify({ bitablePerm: { tableId: hint } }))}`);
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try { const j = await r.json(); if (j.msg) msg = `${j.msg} (mã ${j.code})`; } catch (e) { /* không phải JSON */ }
    throw new LarkError(`Không tải được tệp từ Lark: ${msg}. Kiểm tra ứng dụng Lark đã có quyền xem / tải tệp (bitable:app hoặc drive:drive:readonly).`, 502, 502);
  }
  return { buf: Buffer.from(await r.arrayBuffer()), mime: (r.headers.get('content-type') || 'application/octet-stream').split(';')[0] };
}
let sttGood = null; // [mô hình, có kèm thuật ngữ] đã gọi thành công
const cellText = (v) => (Array.isArray(v) ? v.map((x) => (x && x.text) || (typeof x === 'string' ? x : '')).join('') : v == null ? '' : String(v));

/* ---------------- phiên đăng nhập (token ký HMAC) ---------------- */
const b64u = (buf) => Buffer.from(buf).toString('base64url');
function sign(obj) { const p = b64u(JSON.stringify(obj)); return `${p}.${b64u(crypto.createHmac('sha256', CFG.sessionSecret).update(p).digest())}`; }
function verify(tok) {
  const [p, s] = String(tok || '').split('.');
  if (!p || !s) return null;
  const good = b64u(crypto.createHmac('sha256', CFG.sessionSecret).update(p).digest());
  if (s.length !== good.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(good))) return null;
  try { const o = JSON.parse(Buffer.from(p, 'base64url').toString()); return o.exp > Date.now() ? o : null; } catch (e) { return null; }
}
const originOk = (u) => { try { return CFG.origins.includes(new URL(u).origin); } catch (e) { return false; } };

async function exchangeCode(code) {
  const redirect = `${CFG.publicUrl}/auth/callback`;
  // Cách mới (OAuth v2); nếu ứng dụng chưa bật thì dùng cách cũ (OIDC v1).
  try {
    const r = await fetch(`${CFG.open}/open-apis/authen/v2/oauth/token`, {
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ grant_type: 'authorization_code', client_id: CFG.appId, client_secret: CFG.appSecret, code, redirect_uri: redirect })
    });
    const j = await r.json();
    const t = j.access_token || (j.data && j.data.access_token);
    if (t) return t;
    log('OAuth v2 không thành công, thử OIDC v1:', j.error_description || j.msg || j.code);
  } catch (e) { log('OAuth v2 lỗi, thử OIDC v1:', e.message); }
  const appT = await tokenOf('app');
  const r = await fetch(`${CFG.open}/open-apis/authen/v1/oidc/access_token`, {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${appT}` },
    body: JSON.stringify({ grant_type: 'authorization_code', code })
  });
  const j = await r.json();
  if (j.code !== 0) throw new LarkError(`Đăng nhập Lark thất bại: ${j.msg} (mã ${j.code})`, j.code);
  return j.data.access_token;
}
async function userInfo(userToken) {
  const r = await fetch(`${CFG.open}/open-apis/authen/v1/user_info`, { headers: { Authorization: `Bearer ${userToken}` } });
  const j = await r.json();
  if (j.code !== 0) throw new LarkError(`Không đọc được thông tin người dùng: ${j.msg} (mã ${j.code})`, j.code);
  return j.data;
}

/* ---------------- HTTP ---------------- */
function send(res, status, obj, origin) {
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (origin && CFG.origins.includes(origin)) Object.assign(h, { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' });
  res.writeHead(status, h); res.end(JSON.stringify(obj));
}
function redirect(res, url) { res.writeHead(302, { Location: url, 'Cache-Control': 'no-store' }); res.end(); }
function readBody(req, limit = 40 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on('data', (c) => { n += c.length; if (n > limit) { reject(new LarkError('Dữ liệu gửi lên quá lớn', 413, 413)); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(new LarkError('JSON không hợp lệ', 400, 400)); } });
    req.on('error', reject);
  });
}

const routes = {
  'GET /': async () => ({ service: 'Raitek PV Handover – cầu nối Lark Base', ok: true, health: '/health', hint: 'Mở ứng dụng từ Lark Workplace để đăng nhập và đồng bộ' }),
  'GET /health': async () => {
    const configured = !!(CFG.appId && CFG.appSecret && CFG.base && CFG.sessionSecret && CFG.publicUrl);
    let error = null;
    if (configured && !tables) { try { await ensureTables(); } catch (e) { error = e.message; } } // thử kết nối lại, báo lỗi cụ thể
    return { ok: true, configured, tables: tables || null, error, base: CFG.base ? CFG.base.slice(0, 4) + '…' + CFG.base.slice(-3) : '' };
  },

  'GET /auth/login': async ({ url, res }) => {
    const ret = url.searchParams.get('return') || '';
    if (!originOk(ret)) throw new LarkError('Địa chỉ quay về không được phép (kiểm tra ALLOWED_ORIGINS)', 400, 400);
    const state = sign({ r: ret, n: crypto.randomBytes(8).toString('hex'), exp: Date.now() + 10 * 60000 });
    const q = new URLSearchParams({ client_id: CFG.appId, app_id: CFG.appId, redirect_uri: `${CFG.publicUrl}/auth/callback`, response_type: 'code', state });
    redirect(res, `${CFG.accounts}/open-apis/authen/v1/authorize?${q}`);
  },
  'GET /auth/callback': async ({ url, res }) => {
    const st = verify(url.searchParams.get('state'));
    if (!st) throw new LarkError('Phiên đăng nhập hết hạn, hãy thử lại', 400, 400);
    const code = url.searchParams.get('code');
    if (!code) { redirect(res, `${st.r}#lark_error=${encodeURIComponent('Bạn chưa đồng ý đăng nhập')}`); return; }
    const u = await userInfo(await exchangeCode(code));
    const tok = sign({ oid: u.open_id, name: u.name || u.en_name || '', exp: Date.now() + CFG.sessionDays * 86400000 });
    log(`đăng nhập: ${u.name} (${u.open_id})`);
    redirect(res, `${st.r}#lark_token=${tok}`);
  },

  'GET /api/me': async ({ user }) => ({ name: user.name, open_id: user.oid, base: CFG.base ? `${CFG.open.replace('open.', '')}/base/${CFG.base}` : '', features: ['devices', 'pull'].concat(CFG.sttKey ? ['stt'] : []), devSlots: DEV_SLOTS }),

  // Danh sách công việc của cả nhóm đang có trên Base (để tải về máy khác và làm tiếp). ?id=… chỉ lấy một công việc.
  'GET /api/inspections': async ({ url }) => {
    const ids = await ensureTables();
    const names = ['Mã biên bản', 'Dự án', 'Mục đích', 'Đợt bảo trì', 'Hoàn thành (%)', 'Người đồng bộ', 'Cập nhật lúc', 'Phiên bản dữ liệu', 'Dữ liệu đồng bộ'].filter((n) => ftypes.insp.has(n));
    const id = url.searchParams.get('id');
    const q = { field_names: names, sort: [{ field_name: 'Cập nhật lúc', desc: true }] };
    if (id) q.filter = { conjunction: 'and', conditions: [{ field_name: 'Mã biên bản', operator: 'is', value: [id] }] };
    const d = await lark('POST', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${ids.insp}/records/search?page_size=${id ? 5 : 100}`, q);
    const items = (d.items || []).map((it) => {
      const f = it.fields || {}; const st = (f['Dữ liệu đồng bộ'] || [])[0];
      return { rec: it.record_id, id: cellText(f['Mã biên bản']), project: cellText(f['Dự án']), purpose: cellText(f['Mục đích']), period: cellText(f['Đợt bảo trì']),
        pct: +f['Hoàn thành (%)'] || 0, by: cellText(f['Người đồng bộ']), at: +f['Cập nhật lúc'] || 0, ver: +f['Phiên bản dữ liệu'] || 0, state: st ? st.file_token : '' };
    }).filter((x) => x.id); // state rỗng = công việc chưa có file dữ liệu đồng bộ (đồng bộ bằng bản app cũ): app hiện kèm giải thích
    return { items };
  },

  // Tải một tệp đính kèm (ảnh, file dữ liệu đồng bộ) từ Base về app. ?t=insp|items|dev&p=<kỳ> là gợi ý bảng chứa tệp.
  'GET /api/media': async ({ url }) => {
    const token = (url.searchParams.get('token') || '').replace(/[^A-Za-z0-9_-]/g, '');
    if (!token) throw new LarkError('Thiếu mã tệp', 400, 400);
    const ids = await ensureTables(); const t = url.searchParams.get('t');
    let hint = t === 'items' ? ids.items : ids.insp;
    if (t === 'dev') { const name = devTableName(url.searchParams.get('p')); hint = devTables.has(name) ? devTables.get(name).id : (await ensureDevTable(url.searchParams.get('p'))).id; }
    const f = await mediaDownload(token, hint);
    if (f.buf.length > 25 * 1024 * 1024) throw new LarkError('Tệp lớn hơn 25 MB', 413, 413);
    return { data: f.buf.toString('base64'), mime: f.mime };
  },

  // Chuyển ghi âm ghi chú thành chữ.
  'POST /api/stt': async ({ body }) => {
    if (!CFG.sttKey) throw new LarkError('Máy chủ chưa cấu hình STT_API_KEY', 501, 501);
    const buf = Buffer.from(String(body.data || '').replace(/^data:[^,]*,/, ''), 'base64');
    if (!buf.length) throw new LarkError('Ghi âm rỗng', 400, 400);
    if (buf.length > 24 * 1024 * 1024) throw new LarkError('Ghi âm lớn hơn 24 MB', 413, 413);
    const mime = String(body.mime || 'audio/webm').split(';')[0].toLowerCase();
    const ext = { 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'm4a', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/ogg': 'ogg' }[mime] || 'webm';
    const file = () => [new Blob([buf], { type: mime }), `ghi-chu.${ext}`];
    const call = async (url, headers, fd) => {
      let r;
      try { r = await fetch(url, { method: 'POST', headers, body: fd, signal: AbortSignal.timeout(90000) }); }
      catch (e) { throw new LarkError('Không gọi được dịch vụ chuyển giọng nói: ' + e.message, 502, 502); }
      const j = await r.json().catch(() => ({}));
      const d = j.detail || j.error || {};
      return { ok: r.ok, status: r.status, text: String(j.text || '').trim(), msg: (typeof d === 'string' ? d : d.message || d.status) || 'HTTP ' + r.status };
    };
    const fail = (x) => { throw new LarkError(`Dịch vụ chuyển giọng nói báo lỗi: ${x.msg}`, 502, 502); };

    if (CFG.sttProvider === 'openai') {
      const fd = new FormData();
      fd.append('file', ...file()); fd.append('model', CFG.sttModel || 'whisper-1'); fd.append('response_format', 'json'); fd.append('temperature', '0');
      if (CFG.sttLang) fd.append('language', CFG.sttLang);
      if (CFG.sttTerms.length) fd.append('prompt', 'Ghi chú bảo trì hệ thống điện mặt trời. Thuật ngữ: ' + CFG.sttTerms.join(', ') + '.');
      const x = await call(CFG.sttUrl || 'https://api.openai.com/v1/audio/transcriptions', { Authorization: `Bearer ${CFG.sttKey}` }, fd);
      if (!x.ok) fail(x);
      return { text: x.text };
    }

    // ElevenLabs Scribe. Thử lần lượt: mô hình đã cấu hình kèm thuật ngữ → không kèm thuật ngữ → mô hình đời trước,
    // vì không phải mô hình / gói nào cũng nhận danh sách thuật ngữ.
    const url = CFG.sttUrl || 'https://api.elevenlabs.io/v1/speech-to-text';
    const models = [...new Set([CFG.sttModel || 'scribe_v3', 'scribe_v2', 'scribe_v1'])];
    let tries = models.flatMap((m) => [[m, true], [m, false]]);
    if (sttGood) tries = [sttGood].concat(tries.filter(([m, t]) => m !== sttGood[0] || t !== sttGood[1])); // cách đã chạy được lần trước
    let last = null;
    for (const [model, terms] of tries) {
      if (terms && !CFG.sttTerms.length) continue;
      const fd = new FormData();
      fd.append('file', ...file()); fd.append('model_id', model); fd.append('tag_audio_events', 'false');
      if (CFG.sttLang) fd.append('language_code', CFG.sttLang);
      if (terms) CFG.sttTerms.forEach((t) => fd.append('keyterms', t));
      last = await call(url, { 'xi-api-key': CFG.sttKey }, fd);
      if (last.ok) { if (!sttGood || sttGood[0] !== model || sttGood[1] !== terms) { sttGood = [model, terms]; log(`STT: dùng ${model}${terms ? ' kèm thuật ngữ' : ''}`); } return { text: last.text }; }
      if ([401, 402, 403, 429].includes(last.status) || last.status >= 500) break; // sai khóa, hết hạn mức, quá tải: thử tiếp cũng vô ích
      log(`STT: ${model}${terms ? ' + thuật ngữ' : ''} bị từ chối (${last.msg}), thử cách khác`);
    }
    fail(last);
  },

  // Tạo / cập nhật 1 dòng trong bảng "Biên bản".
  'POST /api/sync/inspection': async ({ body, user }) => {
    const ids = await ensureTables();
    const data = Object.assign({}, body.data, { 'Mã biên bản': body.inspId, 'Người đồng bộ': user.name, 'Cập nhật lúc': Date.now() });
    return serial(ids.insp, async () => {
      await ensureFields('insp', body.types);
      let rec = body.recordId;
      if (!rec) rec = (await searchKeys(ids.insp, 'Mã biên bản', body.inspId, 'Mã biên bản'))[body.inspId];
      if (rec) {
        try { await lark('PUT', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${ids.insp}/records/${rec}`, { fields: toLark('insp', data, { forUpdate: true }) }); return { recordId: rec }; }
        catch (e) { if (e.code !== 1254043 && !/RecordIdNotFound|not ?found/i.test(e.message)) throw e; } // dòng đã bị xóa trên Lark → tạo lại
      }
      const d = await lark('POST', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${ids.insp}/records`, { fields: toLark('insp', data, { forUpdate: false }) });
      return { recordId: d.record.record_id };
    });
  },

  // Xóa các dòng tồn tại không còn "Không đạt".
  'POST /api/sync/items-delete': async ({ body }) => {
    const ids = await ensureTables();
    const recs = (body.recordIds || []).filter(Boolean).slice(0, 500);
    return serial(ids.items, async () => {
      for (let i = 0; i < recs.length; i += 100) {
        try { await lark('POST', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${ids.items}/records/batch_delete`, { records: recs.slice(i, i + 100) }); }
        catch (e) { if (e.code !== 1254043) throw e; } // đã bị xóa trên Lark
      }
      return { deleted: recs.length };
    });
  },

  // Tạo / cập nhật nhiều dòng trong bảng "Tồn tại".
  'POST /api/sync/items': async ({ body, user }) => {
    const ids = await ensureTables();
    const items = (body.items || []).slice(0, 500);
    return serial(ids.items, async () => {
      const out = {};
      const needLookup = items.some((x) => !x.recordId);
      const known = needLookup ? await searchKeys(ids.items, 'Mã biên bản', body.inspId, 'Khóa') : {};
      const upd = [], crt = [];
      for (const x of items) {
        const data = Object.assign({}, x.data, { 'Khóa': x.key, 'Mã biên bản': body.inspId, 'Biên bản': body.inspRecordId, 'Người kiểm tra': user.name, 'Cập nhật lúc': Date.now() });
        const rec = x.recordId || known[x.key];
        if (rec) upd.push({ key: x.key, record_id: rec, fields: toLark('items', data, { forUpdate: true }) });
        else crt.push({ key: x.key, fields: toLark('items', data, { forUpdate: false }) });
      }
      for (let i = 0; i < upd.length; i += 100) {
        const chunk = upd.slice(i, i + 100);
        await lark('POST', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${ids.items}/records/batch_update`, { records: chunk.map(({ record_id, fields }) => ({ record_id, fields })) });
        chunk.forEach((c) => { out[c.key] = c.record_id; });
      }
      for (let i = 0; i < crt.length; i += 100) {
        const chunk = crt.slice(i, i + 100);
        const d = await lark('POST', `/open-apis/bitable/v1/apps/${CFG.base}/tables/${ids.items}/records/batch_create`, { records: chunk.map(({ fields }) => ({ fields })) });
        (d.records || []).forEach((r, k) => { out[chunk[k].key] = r.record_id; });
      }
      return { ids: out };
    });
  },

  // Bảo trì quý: tạo / cập nhật các dòng thiết bị trong bảng "Thiết bị bảo trì <kỳ>".
  // body.keep (nếu có) = toàn bộ khóa còn hiệu lực của biên bản; dòng nào không nằm trong đó sẽ bị xóa.
  'POST /api/sync/devices': async ({ body, user }) => {
    const t = await ensureDevTable(body.period);
    const rows = (body.rows || []).slice(0, 200);
    const api = `/open-apis/bitable/v1/apps/${CFG.base}/tables/${t.id}/records`;
    return serial(t.id, async () => {
      const out = {};
      const needKeys = rows.some((x) => !x.recordId) || Array.isArray(body.keep);
      const known = needKeys ? await searchKeys(t.id, 'Mã biên bản', body.inspId, 'Khóa') : {};
      const full = (x) => Object.assign({}, x.data, { 'Khóa': x.key, 'Mã biên bản': body.inspId, 'Người đồng bộ': user.name, 'Cập nhật lúc': Date.now() });
      const create = async (list) => {
        for (let i = 0; i < list.length; i += 50) {
          const chunk = list.slice(i, i + 50);
          const d = await lark('POST', `${api}/batch_create`, { records: chunk.map((x) => ({ fields: toLark(t.types, full(x), { forUpdate: false }) })) });
          (d.records || []).forEach((r, k) => { out[chunk[k].key] = r.record_id; });
        }
      };
      const upd = [], crt = [];
      for (const x of rows) { const rec = x.recordId || known[x.key]; if (rec) upd.push(Object.assign({ rec }, x)); else crt.push(x); }
      for (let i = 0; i < upd.length; i += 50) {
        const chunk = upd.slice(i, i + 50);
        try {
          await lark('POST', `${api}/batch_update`, { records: chunk.map((x) => ({ record_id: x.rec, fields: toLark(t.types, full(x), { forUpdate: true }) })) });
          chunk.forEach((x) => { out[x.key] = x.rec; });
        } catch (e) {
          if (e.code !== 1254043 && !/RecordIdNotFound|not ?found/i.test(e.message)) throw e;
          await create(chunk); // dòng đã bị xóa trên Lark → tạo lại
        }
      }
      await create(crt);
      if (Array.isArray(body.keep)) {
        const keep = new Set(body.keep);
        const gone = Object.entries(known).filter(([k]) => !keep.has(k)).map(([, id]) => id);
        for (let i = 0; i < gone.length; i += 100) {
          try { await lark('POST', `${api}/batch_delete`, { records: gone.slice(i, i + 100) }); } catch (e) { if (e.code !== 1254043) throw e; }
        }
      }
      return { ids: out, table: t.name };
    });
  },

  // Tải ảnh / PDF lên Base, trả về file_token để gắn vào trường tệp đính kèm.
  'POST /api/upload': async ({ body }) => {
    await ensureTables();
    const buf = Buffer.from(String(body.data || ''), 'base64');
    if (!buf.length) throw new LarkError('Tệp rỗng', 400, 400);
    if (buf.length > 20 * 1024 * 1024) throw new LarkError('Tệp lớn hơn 20 MB, Lark không nhận qua cách tải này', 413, 413);
    const name = String(body.name || 'file').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 120);
    const fd = new FormData();
    fd.append('file_name', name);
    fd.append('parent_type', body.kind === 'file' ? 'bitable_file' : 'bitable_image');
    fd.append('parent_node', CFG.base);
    fd.append('size', String(buf.length));
    fd.append('file', new Blob([buf]), name);
    const d = await lark('POST', '/open-apis/drive/v1/medias/upload_all', fd);
    return { file_token: d.file_token };
  }
};

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  const url = new URL(req.url, 'http://x');
  if (req.method === 'OPTIONS') {
    const h = { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '86400' };
    if (origin && CFG.origins.includes(origin)) Object.assign(h, { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' });
    res.writeHead(204, h); res.end(); return;
  }
  const fn = routes[`${req.method} ${url.pathname.replace(/\/$/, '') || '/'}`];
  try {
    if (!fn) { send(res, 404, { error: 'Không có đường dẫn này' }, origin); return; }
    let user = null;
    if (url.pathname.startsWith('/api/')) {
      user = verify((req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
      if (!user) { send(res, 401, { error: 'Chưa đăng nhập Lark hoặc phiên đã hết hạn' }, origin); return; }
    }
    const body = req.method === 'POST' ? await readBody(req) : {};
    const out = await fn({ req, res, url, body, user });
    if (!res.headersSent) send(res, 200, out, origin);
  } catch (e) {
    log('LỖI', req.method, url.pathname, e.message);
    if (!res.headersSent) send(res, e.status || 502, { error: e.message, code: e.code }, origin);
  }
});

/* ---------------- khởi động ---------------- */
function checkConfig() {
  const miss = [['LARK_APP_ID', CFG.appId], ['LARK_APP_SECRET', CFG.appSecret], ['LARK_BASE_TOKEN', CFG.base], ['SESSION_SECRET', CFG.sessionSecret], ['PUBLIC_URL', CFG.publicUrl]].filter(([, v]) => !v).map(([k]) => k);
  if (miss.length) { console.error('Thiếu cấu hình: ' + miss.join(', ') + ' (xem .env.example)'); process.exit(1); }
  if (CFG.sessionSecret.length < 32) { console.error('SESSION_SECRET cần ít nhất 32 ký tự ngẫu nhiên'); process.exit(1); }
}
if (process.argv[2] === 'setup') {
  checkConfig();
  ensureTables().then((ids) => { log('Lark Base đã sẵn sàng:', JSON.stringify(ids)); process.exit(0); })
    .catch((e) => { console.error(e.message); process.exit(1); });
} else {
  checkConfig();
  server.listen(CFG.port, CFG.host, () => {
    log(`Cầu nối Lark chạy tại ${CFG.host}:${CFG.port}; công khai: ${CFG.publicUrl}; cho phép: ${CFG.origins.join(', ')}`);
    ensureTables().then((ids) => log('Bảng Lark:', JSON.stringify(ids))).catch((e) => log('Chưa kết nối được Lark Base:', e.message));
  });
}
