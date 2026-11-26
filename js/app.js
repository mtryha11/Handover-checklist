/* PV Handover Checklist – ứng dụng checklist nhận bàn giao O&M điện mặt trời.
 * Không cần server: dữ liệu lưu trong IndexedDB của trình duyệt trên điện thoại.
 */
(function () {
  'use strict';

  const CL = window.CHECKLIST;
  const ARTIFACT = !!window.__ARTIFACT__;
  const STANDALONE = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const $app = document.getElementById('app');
  const $modal = document.getElementById('modal-root');
  const $toast = document.getElementById('toast');
  const $print = document.getElementById('print-root');

  /* ---------------- icons ---------------- */
  const sv = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const I = {
    back: sv('<path d="M15 18l-6-6 6-6"/>'),
    chev: sv('<path d="M9 18l6-6-6-6"/>', 'class="chev"'),
    plus: sv('<path d="M12 5v14M5 12h14"/>'),
    check: sv('<path d="M20 6L9 17l-5-5"/>'),
    x: sv('<path d="M18 6L6 18M6 6l12 12"/>'),
    cam: sv('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'),
    img: sv('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
    list: sv('<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>'),
    flag: sv('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>'),
    doc: sv('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>'),
    info: sv('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
    gear: sv('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    search: sv('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>'),
    print: sv('<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'),
    table: sv('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
    share: sv('<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>'),
    copy: sv('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    save: sv('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
    upload: sv('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>'),
    pin: sv('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
    pen: sv('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    trash: sv('<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>'),
    dup: sv('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V4a2 2 0 0 1 2-2h10"/>'),
    sun: sv('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>')
  };
  const LOGO = window.RAITEK_LOGO ? `<img class="brand-mark" src="${window.RAITEK_LOGO}" alt="Raitek">` : '';

  /* ---------------- constants ---------------- */
  const ST = { ok: 'Đạt', nok: 'Không đạt', na: 'N/A' };
  const SEV = {
    A: { short: 'Nghiêm trọng', desc: 'Ảnh hưởng an toàn hoặc khả năng phát điện. Phải khắc phục trước khi nhận bàn giao.' },
    B: { short: 'Quan trọng', desc: 'Khắc phục trong thời hạn cam kết sau bàn giao (ví dụ 30 ngày).' },
    C: { short: 'Khuyến nghị', desc: 'Cải thiện, theo dõi thêm; không ảnh hưởng việc nhận bàn giao.' }
  };
  const PURPOSE = {
    handover: { label: 'Nhận bàn giao O&M', title: 'Biên bản kiểm tra hiện trạng và nhận bàn giao O&M' },
    audit: { label: 'Audit hiện trạng', title: 'Biên bản audit hiện trạng hệ thống điện mặt trời' },
    periodic: { label: 'Kiểm tra định kỳ', title: 'Biên bản kiểm tra định kỳ hệ thống điện mặt trời' }
  };
  const VERDICT = {
    handover: {
      ok: 'Đủ điều kiện nhận bàn giao O&M',
      cond: 'Nhận bàn giao có điều kiện – bên giao khắc phục các tồn tại theo thời hạn đã thống nhất',
      no: 'Chưa đủ điều kiện nhận bàn giao – cần khắc phục tồn tại mức A trước'
    },
    audit: {
      ok: 'Hệ thống đạt yêu cầu',
      cond: 'Hệ thống đạt yêu cầu, còn tồn tại cần khắc phục',
      no: 'Hệ thống chưa đạt yêu cầu – cần khắc phục ngay các tồn tại mức A'
    }
  };
  VERDICT.periodic = VERDICT.audit;
  const SIGN_ROLES = [
    { k: 'owner', label: 'Đại diện Chủ đầu tư', org: 'owner' },
    { k: 'giver', label: 'Đại diện bên bàn giao (EPC)', org: 'epc' },
    { k: 'receiver', label: 'Đại diện bên nhận (O&M)', org: 'om' }
  ];
  const INFO_FIELDS = [
    { k: 'project', l: 'Tên dự án', req: 1, span: 1 },
    { k: 'pcode', l: 'Mã dự án' },
    { k: 'purpose', l: 'Mục đích kiểm tra', type: 'select', opts: Object.fromEntries(Object.entries(PURPOSE).map(([k, v]) => [k, v.label])) },
    { k: 'type', l: 'Loại dự án', type: 'select', opts: CL.types },
    { k: 'address', l: 'Địa điểm', span: 1 },
    { k: 'gps', l: 'Tọa độ GPS', gps: 1 },
    { k: 'conn', l: 'Cấp điện áp đấu nối', ph: 'VD: 0,4 kV / 22 kV' },
    { k: 'dc', l: 'Công suất DC (kWp)', im: 'decimal' },
    { k: 'ac', l: 'Công suất AC (kW)', im: 'decimal' },
    { k: 'module', l: 'Tấm pin (hãng / model / số lượng)', span: 1 },
    { k: 'inverter', l: 'Inverter (hãng / model / số lượng)', span: 1 },
    { k: 'owner', l: 'Chủ đầu tư' },
    { k: 'epc', l: 'Tổng thầu EPC / bên bàn giao' },
    { k: 'om', l: 'Đơn vị O&M nhận bàn giao' },
    { k: 'cod', l: 'Ngày COD', type: 'date' },
    { k: 'date', l: 'Ngày kiểm tra', type: 'date', req: 1 },
    { k: 'inspector', l: 'Người kiểm tra' },
    { k: 'team', l: 'Thành phần tham gia', type: 'textarea', span: 1, ph: 'Họ tên – chức vụ – đơn vị' },
    { k: 'weather', l: 'Thời tiết', ph: 'Nắng / mây / mưa' },
    { k: 'irr', l: 'Bức xạ lúc kiểm tra (W/m²)', im: 'decimal' },
    { k: 'temp', l: 'Nhiệt độ môi trường (°C)', im: 'decimal' }
  ];

  /* ---------------- utils ---------------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const pad2 = (n) => String(n).padStart(2, '0');
  const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };
  const fmtDate = (iso) => { if (!iso) return ''; const [y, m, d] = String(iso).split('-'); return d ? `${d}/${m}/${y}` : iso; };
  const fmtDT = (t) => { const d = new Date(t); return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
  const slug = (s) => String(s || 'du-an').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'du-an';
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };

  function toast(msg, ms = 2200) {
    $toast.textContent = msg; $toast.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { $toast.hidden = true; }, ms);
  }

  /* ---------------- storage (IndexedDB, falls back to memory) ---------------- */
  const store = {
    db: null, mem: { insp: new Map(), photos: new Map() },
    async open() {
      try {
        this.db = await new Promise((res, rej) => {
          const r = indexedDB.open('pv-handover', 1);
          r.onupgradeneeded = () => {
            const d = r.result;
            d.createObjectStore('insp', { keyPath: 'id' });
            d.createObjectStore('photos', { keyPath: 'id' }).createIndex('insp', 'insp');
          };
          r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
        });
      } catch (e) { this.db = null; }
      return !!this.db;
    },
    req(name, mode, fn) {
      if (!this.db) return Promise.resolve(fn(null));
      return new Promise((res, rej) => {
        const t = this.db.transaction(name, mode); const r = fn(t.objectStore(name));
        t.oncomplete = () => res(r && 'result' in r ? r.result : undefined);
        t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
      });
    },
    all(name) { return this.db ? this.req(name, 'readonly', (s) => s.getAll()) : Promise.resolve([...this.mem[name].values()]); },
    get(name, id) { return this.db ? this.req(name, 'readonly', (s) => s.get(id)) : Promise.resolve(this.mem[name].get(id)); },
    put(name, obj) { if (!this.db) { this.mem[name].set(obj.id, JSON.parse(JSON.stringify(obj))); return Promise.resolve(); } return this.req(name, 'readwrite', (s) => s.put(obj)); },
    del(name, id) { if (!this.db) { this.mem[name].delete(id); return Promise.resolve(); } return this.req(name, 'readwrite', (s) => s.delete(id)); },
    photosOf(inspId) {
      if (!this.db) return Promise.resolve([...this.mem.photos.values()].filter((p) => p.insp === inspId));
      return this.req('photos', 'readonly', (s) => s.index('insp').getAll(inspId));
    }
  };

  /* ---------------- state ---------------- */
  const settings = Object.assign({ inspector: '', om: '', theme: 'system', geoStamp: true }, lsGet('pvho-settings', {}));
  const S = { view: 'home', tab: 'check', sec: null, filter: 'all', q: '', list: [], isNew: false, focus: null };
  let cur = null;            // inspection đang mở
  const photoCache = new Map(); // ảnh gốc (chỉ dùng khi xem từng ảnh và khi xuất file)
  const thumbCache = new Map(); // ảnh thu nhỏ để hiển thị trong ứng dụng (tránh tràn bộ nhớ trên iPhone)
  const PH_BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  const openSet = new Set(); // item mở rộng
  const hintSet = new Set(); // item đang hiện tiêu chí

  function applyTheme() {
    const el = document.documentElement;
    if (settings.theme === 'light' || settings.theme === 'dark') el.setAttribute('data-theme', settings.theme);
    else if (el.getAttribute('data-pvho-theme')) el.removeAttribute('data-theme');
    if (settings.theme !== 'system') el.setAttribute('data-pvho-theme', '1');
  }

  let saveT = null;
  function touch() {
    if (!cur) return;
    cur.updated = Date.now();
    clearTimeout(saveT); saveT = setTimeout(flush, 350);
  }
  function flush() { clearTimeout(saveT); saveT = null; if (cur) return store.put('insp', cur).catch(() => toast('Không lưu được dữ liệu – bộ nhớ có thể đã đầy')); }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);

  /* ---------------- checklist helpers ---------------- */
  // Hạng mục đã bỏ (x) chỉ hiện khi biên bản này đã có kết quả / ghi chú / ảnh cho nó.
  const hasData = (c) => { const r = cur.res[c]; return !!(r && (r.s || r.note || r.val || (r.ph && r.ph.length))); };
  const applies = (it) => (!it.s || it.s.split(' ').includes(cur.info.type)) && (!it.x || hasData(it.c));
  const secItems = (sec) => sec.items.filter(applies).concat((cur.custom || []).filter((x) => x.sec === sec.id).map((x) => Object.assign({ g: 'Hạng mục bổ sung' }, x)));
  const allItems = () => CL.sections.flatMap((sec) => secItems(sec).map((it) => Object.assign({ secId: sec.id }, it)));
  const secById = (id) => CL.sections.find((s) => s.id === id);
  const R = (c) => cur.res[c] || (cur.res[c] = {});
  function count(items) {
    const n = { ok: 0, nok: 0, na: 0, none: 0, total: items.length, A: 0, B: 0, C: 0 };
    for (const it of items) {
      const r = cur.res[it.c]; const s = r && r.s;
      if (s) n[s]++; else n.none++;
      if (s === 'nok') n[r.sev || 'B']++;
    }
    n.done = n.total - n.none;
    n.pct = n.total ? Math.round((n.done / n.total) * 100) : 0;
    return n;
  }
  function autoVerdict(n) { return n.A ? 'no' : (n.B || n.C) ? 'cond' : 'ok'; }
  function verdictOf(n) {
    const v = (cur.verdict && cur.verdict.v) || autoVerdict(n);
    return { key: v, text: VERDICT[cur.info.purpose || 'handover'][v] };
  }

  function newInspection() {
    return {
      id: uid(), created: Date.now(), updated: Date.now(), clv: CL.version,
      info: { project: '', purpose: 'handover', type: 'roof', date: todayISO(), inspector: settings.inspector, om: settings.om },
      res: {}, custom: [], sign: {}, verdict: { v: '', note: '' }
    };
  }

  /* ---------------- navigation ---------------- */
  function go(view, opts = {}) {
    Object.assign(S, { view }, opts);
    render(true);
    try { if (S.view !== 'home' && !(history.state && history.state.pvho)) history.pushState({ pvho: 1 }, ''); } catch (e) { /* ignore */ }
  }
  function goUp() {
    if (S.view === 'sec') go('insp', { tab: 'check' });
    else if (S.view === 'insp' || S.view === 'info') { flush(); cur = null; geoStop(); loadHome(); }
    else loadHome();
  }
  window.addEventListener('popstate', () => {
    if ($modal.innerHTML) { closeModal(); }
    else if (S.view !== 'home') goUp();
  });

  async function loadHome() {
    S.list = (await store.all('insp')).sort((a, b) => b.updated - a.updated);
    S.view = 'home'; render(true);
  }
  async function openInsp(id, tab = 'check') {
    const it = await store.get('insp', id);
    if (!it) return toast('Không tìm thấy biên bản');
    cur = it; cur.res = cur.res || {}; cur.custom = cur.custom || []; cur.sign = cur.sign || {}; cur.verdict = cur.verdict || { v: '', note: '' };
    photoCache.clear(); thumbCache.clear(); openSet.clear(); hintSet.clear();
    const photos = await store.photosOf(id);
    photos.forEach((p) => { photoCache.set(p.id, p.data); if (p.thumb) thumbCache.set(p.id, p.thumb); });
    setTimeout(() => fillThumbs(id, photos.filter((p) => !p.thumb)), 300);
    geoStart();
    go('insp', { tab, q: '', filter: 'all' });
  }

  /* ---------------- rendering ---------------- */
  function topbar({ title, sub, back = true, actions = '', progress = null }) {
    return `<header class="topbar"><div class="topbar-in">
      ${back ? `<button class="icon-btn" data-act="up" aria-label="Quay lại">${I.back}</button>` : LOGO}
      <div class="ttl"><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</div>${actions}
    </div>${progress != null ? `<div class="progress-strip"><i id="prog" style="width:${progress}%"></i></div>` : ''}</header>`;
  }
  function tabbar() {
    const n = count(allItems());
    const t = (k, ic, l, badge) => `<button class="tab ${S.tab === k && (S.view === 'insp' || (k === 'check' && S.view === 'sec')) ? 'on' : ''}" data-act="tab" data-v="${k}">${ic}<span>${l}</span>${badge ? `<span class="badge">${badge}</span>` : ''}</button>`;
    return `<nav class="tabbar" aria-label="Điều hướng"><div class="tabbar-in">
      ${t('check', I.list, 'Hạng mục')}${t('punch', I.flag, 'Tồn tại', n.nok)}${t('report', I.doc, 'Biên bản')}${t('info', I.info, 'Thông tin')}
    </div></nav>`;
  }
  function bar(n) {
    const w = (x) => (n.total ? (x / n.total) * 100 : 0).toFixed(2);
    return `<div class="bar" aria-hidden="true"><i class="b-ok" style="width:${w(n.ok)}%"></i><i class="b-nok" style="width:${w(n.nok)}%"></i><i class="b-na" style="width:${w(n.na)}%"></i></div>`;
  }
  function stats(n) {
    return `<div class="stats" id="stats">
      <div class="stat ok"><b>${n.ok}</b><span>Đạt</span></div>
      <div class="stat nok"><b>${n.nok}</b><span>Không đạt</span></div>
      <div class="stat na"><b>${n.na}</b><span>N/A</span></div>
      <div class="stat"><b>${n.none}</b><span>Chưa kiểm</span></div></div>`;
  }

  function render(resetScroll) {
    const y = window.scrollY;
    let html = '';
    if (S.view === 'home') html = viewHome();
    else if (S.view === 'info') html = viewInfo(true);
    else if (S.view === 'sec') html = viewSection();
    else if (S.view === 'insp') html = S.tab === 'punch' ? viewPunch() : S.tab === 'report' ? viewReport() : S.tab === 'info' ? viewInfo(false) : viewOverview();
    $app.innerHTML = html;
    window.scrollTo(0, resetScroll ? 0 : y);
    if (S.focus) { const el = document.getElementById(S.focus); S.focus = null; if (el) { el.scrollIntoView({ block: 'center' }); el.animate && el.animate([{ outline: '3px solid var(--sun)' }, { outline: '3px solid transparent' }], { duration: 1400 }); } }
  }

  /* ----- home ----- */
  function viewHome() {
    const cards = S.list.map((x) => {
      cur = x; const n = count(allItems()); cur = null;
      const p = PURPOSE[x.info.purpose] || PURPOSE.handover;
      return `<button class="card insp-card" data-act="open" data-id="${x.id}">
        <div class="row"><h3 class="grow">${esc(x.info.project || 'Chưa đặt tên')}</h3><span class="chip sun">${n.pct}%</span></div>
        <div class="insp-meta"><span>${esc(p.label)}</span><span>${esc(CL.types[x.info.type] || '')}</span>${x.info.dc ? `<span>${esc(x.info.dc)} kWp</span>` : ''}<span>${fmtDate(x.info.date)}</span></div>
        ${bar(n)}
        <div class="chips"><span class="chip ok">${n.ok} đạt</span><span class="chip nok">${n.nok} không đạt</span>${n.A ? `<span class="chip nok">${n.A} mức A</span>` : ''}<span class="chip">${n.none} chưa kiểm</span></div>
      </button>`;
    }).join('');
    return `${topbar({ title: 'Raitek PV Handover', sub: 'Checklist nhận bàn giao O&M điện mặt trời', back: false, actions: `<button class="icon-btn" data-act="settings" aria-label="Cài đặt">${I.gear}</button>` })}
    <main class="wrap no-tabs">
      <section class="card hero-card">
        <h2>Bắt đầu một đợt kiểm tra</h2>
        <p class="muted small" style="margin:0">${CL.sections.filter((s) => s.items.some((i) => !i.x)).length} nhóm, ${CL.sections.reduce((a, s) => a + s.items.filter((i) => !i.x).length, 0)} hạng mục theo form đánh giá chất lượng công trình: thang, lan can, sàn thao tác, tấm pin, rail, trạm thời tiết, tiếp địa, nước vệ sinh, nhà inverter, inverter, cáp, máng cáp, tủ điện, giám sát, biển báo, PCCC, trạm biến áp, hồ sơ. Ảnh chụp được đóng dấu mã hạng mục và thời gian.</p>
        <button class="btn sun block" data-act="new">${I.plus} Tạo biên bản mới</button>
      </section>
      <div class="row"><span class="eyebrow grow">Biên bản đã lưu (${S.list.length})</span>
        <label class="btn ghost" style="min-height:38px;font-size:13px">${I.upload} Nhập file sao lưu<input type="file" accept=".json,application/json" data-import hidden></label></div>
      ${cards || `<div class="card empty">${I.doc}<p>Chưa có biên bản nào trên máy này.</p><button class="btn" data-act="demo">Mở biên bản ví dụ</button></div>`}
      ${!store.db ? '<p class="note-box">Trình duyệt đang chặn bộ nhớ lưu trữ. Dữ liệu chỉ tồn tại tới khi đóng trang – hãy xuất file sao lưu.</p>' : ''}
      <p class="muted small" style="text-align:center">Dữ liệu chỉ lưu trên điện thoại này. Xuất file sao lưu (.json) để chuyển máy hoặc lưu trữ.</p>
    </main>`;
  }

  /* ----- info form ----- */
  function viewInfo(isNew) {
    const f = cur.info;
    const field = (d) => {
      const id = 'f-' + d.k; const v = f[d.k] == null ? '' : f[d.k];
      let input;
      if (d.type === 'select') input = `<select id="${id}" data-info="${d.k}">${Object.entries(d.opts).map(([k, l]) => `<option value="${k}" ${v === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      else if (d.type === 'textarea') input = `<textarea id="${id}" data-info="${d.k}" placeholder="${esc(d.ph || '')}">${esc(v)}</textarea>`;
      else input = `<input id="${id}" data-info="${d.k}" type="${d.type || 'text'}" value="${esc(v)}" ${d.im ? `inputmode="${d.im}"` : ''} placeholder="${esc(d.ph || '')}" ${d.req ? 'required' : ''}>`;
      if (d.gps) input = `<div class="row" style="flex-wrap:nowrap">${input}<button class="btn" data-act="gps" aria-label="Lấy tọa độ GPS" style="flex:none">${I.pin}</button></div>`;
      return `<div class="field ${d.span ? 'span2' : ''}"><label for="${id}">${esc(d.l)}${d.req ? ' *' : ''}</label>${input}</div>`;
    };
    const body = `<div class="card pad form-section"><div class="form-grid">${INFO_FIELDS.map(field).join('')}</div>
      <p class="muted small" style="margin:0">Loại dự án quyết định hạng mục hiển thị (VD: áp mái có kiểm tra chống thấm, lối đi trên mái; mặt đất có móng cọc, hàng rào, thoát nước).</p></div>`;
    if (isNew) {
      return `${topbar({ title: 'Biên bản mới', sub: 'Thông tin dự án' })}
      <main class="wrap no-tabs">${body}<button class="btn sun block" data-act="create">${I.check} Tạo và bắt đầu kiểm tra</button></main>`;
    }
    return `${topbar({ title: cur.info.project || 'Chưa đặt tên', sub: 'Thông tin dự án', progress: count(allItems()).pct })}
    <main class="wrap">${body}
      <section class="card pad form-section"><h2>Quản lý biên bản</h2>
        <div class="btn-grid">
          <button class="btn" data-act="export-json">${I.save} Sao lưu (.json)</button>
          <button class="btn" data-act="dup">${I.dup} Dùng làm mẫu</button>
          <button class="btn danger" data-act="delete">${I.trash} Xóa biên bản</button>
        </div>
        <p class="muted small" style="margin:0">"Dùng làm mẫu" tạo biên bản mới giữ nguyên thông tin dự án và hạng mục bổ sung, kết quả kiểm tra để trống – dùng cho lần kiểm tra lại.</p>
      </section>
    </main>${tabbar()}`;
  }

  /* ----- overview ----- */
  function filterItems(items) {
    const q = S.q.trim().toLowerCase();
    return items.filter((it) => {
      const r = cur.res[it.c] || {};
      if (S.filter === 'none' && r.s) return false;
      if (S.filter === 'nok' && r.s !== 'nok') return false;
      if (S.filter === 'photo' && !(r.ph && r.ph.length)) return false;
      if (q && !(it.c.toLowerCase().includes(q) || it.t.toLowerCase().includes(q) || (r.note || '').toLowerCase().includes(q))) return false;
      return true;
    });
  }
  function filterChips() {
    const f = (k, l) => `<button class="fbtn ${S.filter === k ? 'on' : ''}" data-act="filter" data-v="${k}">${l}</button>`;
    return `<div class="filters" role="group" aria-label="Lọc">${f('all', 'Tất cả')}${f('none', 'Chưa kiểm')}${f('nok', 'Không đạt')}${f('photo', 'Có ảnh')}</div>`;
  }
  function viewOverview() {
    const all = allItems(); const n = count(all);
    const searching = S.q.trim() || S.filter !== 'all';
    let list;
    if (searching) {
      const items = filterItems(all);
      list = items.length ? `<div class="items">${items.map((it) => itemHTML(it, true)).join('')}</div>` : '<div class="card empty"><p>Không có hạng mục phù hợp.</p></div>';
    } else {
      let lastPart = '';
      list = `<div class="sec-list">${CL.sections.map((sec) => {
        const its = secItems(sec); if (!its.length) return '';
        const c = count(its);
        const head = sec.part !== lastPart ? `<div class="part-head"><span class="part-id">${esc(sec.part)}</span><span>${esc(sec.partTitle)}</span></div>` : '';
        lastPart = sec.part;
        return head + `<button class="card sec-row" data-act="sec" data-v="${sec.id}">
          <span class="sec-code ${c.none === 0 ? 'done' : ''}">${sec.id}</span>
          <span style="min-width:0"><h3>${esc(sec.title)}</h3>
            <span class="sub"><span>${c.done}/${c.total}</span>${c.nok ? `<span style="color:var(--nok);font-weight:600">${c.nok} không đạt</span>` : ''}${c.na ? `<span>${c.na} N/A</span>` : ''}</span>${bar(c)}</span>
          ${I.chev}</button>`;
      }).join('')}</div>`;
    }
    return `${topbar({ title: cur.info.project || 'Chưa đặt tên', sub: `${(PURPOSE[cur.info.purpose] || PURPOSE.handover).label} · ${fmtDate(cur.info.date)} · ${n.pct}% hoàn thành`, progress: n.pct })}
    <main class="wrap">
      ${stats(n)}
      <div class="search">${I.search}<input class="inp" id="q" type="search" placeholder="Tìm mã, nội dung, ghi chú…" value="${esc(S.q)}" data-search></div>
      ${filterChips()}
      ${list}
    </main>${tabbar()}`;
  }

  /* ----- section ----- */
  function viewSection() {
    const sec = secById(S.sec); const its = secItems(sec); const n = count(its);
    const shown = filterItems(its);
    const visibleSecs = CL.sections.filter((s) => secItems(s).length);
    const vi = visibleSecs.findIndex((s) => s.id === sec.id);
    const prev = visibleSecs[vi - 1], next = visibleSecs[vi + 1];
    return `${topbar({ title: sec.title, sub: `Phần ${sec.part} · ${sec.partTitle} · ${n.done}/${n.total} hạng mục`, progress: count(allItems()).pct })}
    <main class="wrap">
      <div class="sec-head">${stats(n)}${filterChips()}</div>
      <div class="items">${groupedItems(shown) || '<div class="card empty"><p>Không có hạng mục phù hợp bộ lọc.</p></div>'}</div>
      <div class="btn-grid">
        <button class="btn" data-act="add-item">${I.plus} Thêm hạng mục</button>
        ${n.none ? `<button class="btn ghost" data-act="sec-na">Đánh N/A ${n.none} mục chưa kiểm</button>` : ''}
      </div>
      <div class="sec-nav">
        ${prev ? `<button class="btn" data-act="sec" data-v="${prev.id}">${I.back} ${prev.id}</button>` : '<span></span>'}
        ${next ? `<button class="btn primary" data-act="sec" data-v="${next.id}">${next.id} – tiếp ${I.chev}</button>` : `<button class="btn primary" data-act="tab" data-v="report">Xem biên bản ${I.chev}</button>`}
      </div>
    </main>${tabbar()}`;
  }

  function groupedItems(items) {
    let lg = null;
    return items.map((it) => {
      const h = it.g && it.g !== lg ? `<h3 class="grp">${esc(it.g)}</h3>` : '';
      lg = it.g; return h + itemHTML(it, false);
    }).join('');
  }
  function photosHTML(c, ids, removable) {
    return (ids || []).map((id) => photoCache.has(id) ? `<button class="ph" data-act="ph-view" data-c="${c}" data-id="${id}" aria-label="Xem ảnh"><img src="${thumbCache.get(id) || PH_BLANK}" data-ph="${id}" alt="" loading="lazy" decoding="async"></button>` : '').join('');
  }
  function itemHTML(it, showSec) {
    const c = it.c; const r = cur.res[c] || {}; const st = r.s || '';
    const open = st === 'nok' || openSet.has(c);
    const hintOn = hintSet.has(c);
    const nph = (r.ph || []).length;
    const secName = showSec ? (secById(it.secId) || {}).title : '';
    const detail = open ? `<div class="detail">
        ${st === 'nok' ? `<div class="sev" role="group" aria-label="Mức độ">${['A', 'B', 'C'].map((k) => `<button class="sv-${k} ${(r.sev || 'B') === k ? 'on' : ''}" data-act="sev" data-v="${k}" data-c="${c}"><b>${k}</b>${SEV[k].short}</button>`).join('')}</div>` : ''}
        <textarea class="inp" id="n-${c}" data-f="note" data-c="${c}" placeholder="${st === 'nok' ? 'Mô tả tồn tại, vị trí (dãy / string / tủ / inverter số…)' : 'Ghi chú'}">${esc(r.note || '')}</textarea>
        ${st === 'nok' ? `<div class="two"><div class="field"><label for="rp-${c}">Trách nhiệm xử lý</label><input class="inp" id="rp-${c}" data-f="resp" data-c="${c}" value="${esc(r.resp || '')}" placeholder="EPC / CĐT / O&M"></div>
          <div class="field"><label for="du-${c}">Hạn khắc phục</label><input class="inp" type="date" id="du-${c}" data-f="due" data-c="${c}" value="${esc(r.due || '')}"></div></div>` : ''}
        ${nph ? `<div class="photos">${photosHTML(c, r.ph)}</div>` : ''}
        <div class="photo-add">
          <button class="btn" data-act="cam-open" data-c="${c}">${I.cam} Chụp ảnh</button>
          <label class="btn">${I.img} Chọn từ máy<input type="file" accept="image/*" multiple data-photo="${c}" data-src="lib"></label>
        </div>
        ${it.custom ? `<button class="btn danger" data-act="del-item" data-c="${c}">${I.trash} Xóa hạng mục bổ sung</button>` : ''}
      </div>` : '';
    const moreLabel = [r.note ? 'có ghi chú' : '', nph ? `${nph} ảnh` : ''].filter(Boolean).join(', ');
    return `<article class="card item ${st ? 'st-' + st : ''}" id="it-${c}">
      <div class="item-head"><div style="min-width:0"><div class="item-code">${c}${it.custom ? ' · bổ sung' : ''}${it.x ? ' · đã bỏ khỏi checklist' : ''}${secName ? ` · <span class="sec-name">${esc(secName)}</span>` : ''}</div><p class="item-t">${esc(it.t)}</p></div>
        <div class="item-tools">${it.h ? `<button class="info-btn ${hintOn ? 'on' : ''}" data-act="hint" data-c="${c}" aria-label="Tiêu chí đánh giá" aria-expanded="${hintOn}">i</button>` : ''}<button class="info-btn cam-quick" data-act="cam-open" data-c="${c}" aria-label="Chụp ảnh hạng mục ${c}">${I.cam}${nph ? `<span>${nph}</span>` : ''}</button>
          <input type="file" accept="image/*" capture="environment" data-photo="${c}" data-src="cam" id="capin-${c}" hidden></div></div>
      ${it.h && hintOn ? `<p class="hint">${esc(it.h)}</p>` : ''}
      <div class="seg" role="group" aria-label="Kết quả">
        <button class="s-ok ${st === 'ok' ? 'on' : ''}" data-act="st" data-v="ok" data-c="${c}" aria-pressed="${st === 'ok'}">${I.check} Đạt</button>
        <button class="s-nok ${st === 'nok' ? 'on' : ''}" data-act="st" data-v="nok" data-c="${c}" aria-pressed="${st === 'nok'}">${I.x} Không đạt</button>
        <button class="s-na ${st === 'na' ? 'on' : ''}" data-act="st" data-v="na" data-c="${c}" aria-pressed="${st === 'na'}">N/A</button>
      </div>
      ${it.u ? `<div class="meas"><label for="v-${c}">Giá trị đo</label><input class="inp mono" id="v-${c}" data-f="val" data-c="${c}" value="${esc(r.val || '')}" placeholder="VD: 2,1 hoặc 820–835"><span class="unit">${esc(it.u)}</span></div>` : ''}
      ${detail}
      ${!open ? `<button class="more-btn" data-act="more" data-c="${c}">${I.cam} Ghi chú / ảnh${moreLabel ? ` (${moreLabel})` : ''}</button>` : (st !== 'nok' ? `<button class="more-btn" data-act="less" data-c="${c}">Thu gọn</button>` : '')}
    </article>`;
  }
  function findItem(c) { return allItems().find((x) => x.c === c); }
  function refreshItem(c) {
    const el = document.getElementById('it-' + c); const it = findItem(c);
    if (el && it) el.outerHTML = itemHTML(it, S.view === 'insp');
    refreshCounters();
  }
  function refreshCounters() {
    const all = allItems(); const n = count(all);
    const p = document.getElementById('prog'); if (p) p.style.width = n.pct + '%';
    const st = document.getElementById('stats');
    if (st) st.outerHTML = stats(S.view === 'sec' ? count(secItems(secById(S.sec))) : n);
    const tb = document.querySelector('.tabbar'); if (tb) tb.outerHTML = tabbar();
  }

  /* ----- punch list ----- */
  function punchItems() {
    const order = { A: 0, B: 1, C: 2 };
    return allItems().filter((it) => (cur.res[it.c] || {}).s === 'nok')
      .sort((a, b) => order[cur.res[a.c].sev || 'B'] - order[cur.res[b.c].sev || 'B']);
  }
  function viewPunch() {
    const items = punchItems(); const n = count(allItems());
    const cards = items.map((it) => {
      const r = cur.res[it.c]; const sv = r.sev || 'B';
      return `<article class="card punch ${sv}">
        <div class="row"><span class="sev-tag ${sv}">${sv}</span><span class="item-code grow">${it.c} · ${esc(secById(it.secId).title)}</span></div>
        <p class="item-t" style="margin:0">${esc(it.t)}</p>
        ${r.note ? `<p class="hint">${esc(r.note)}</p>` : '<p class="small" style="margin:0;color:var(--sev-b)">Chưa mô tả tồn tại</p>'}
        ${r.val ? `<div class="small mono">Giá trị đo: ${esc(r.val)} ${esc(it.u || '')}</div>` : ''}
        ${(r.resp || r.due) ? `<div class="insp-meta">${r.resp ? `<span>Trách nhiệm: <b>${esc(r.resp)}</b></span>` : ''}${r.due ? `<span>Hạn: <b>${fmtDate(r.due)}</b></span>` : ''}</div>` : ''}
        ${(r.ph || []).length ? `<div class="photos">${photosHTML(it.c, r.ph)}</div>` : ''}
        <button class="more-btn" data-act="goto" data-c="${it.c}" data-sec="${it.secId}">${I.pen} Sửa trong checklist</button>
      </article>`;
    }).join('');
    return `${topbar({ title: 'Danh sách tồn tại', sub: `${n.nok} tồn tại · A: ${n.A} · B: ${n.B} · C: ${n.C}`, progress: n.pct })}
    <main class="wrap">
      <section class="card pad legend">${['A', 'B', 'C'].map((k) => `<div><span class="sev-tag ${k}">${k}</span><span><b>${SEV[k].short}.</b> ${SEV[k].desc}</span></div>`).join('')}</section>
      ${cards || `<div class="card empty">${I.check}<p>Chưa ghi nhận tồn tại nào.</p></div>`}
      ${items.length ? `<button class="btn block" data-act="copy-punch">${I.copy} Sao chép danh sách tồn tại (gửi Zalo / email)</button>` : ''}
    </main>${tabbar()}`;
  }

  /* ----- report ----- */
  function viewReport() {
    const n = count(allItems()); const v = verdictOf(n); const auto = autoVerdict(n);
    const purpose = cur.info.purpose || 'handover';
    const signBoxes = SIGN_ROLES.map((r) => {
      const s = cur.sign[r.k] || {};
      return `<div class="card sign-box"><div class="eyebrow">${esc(r.label)}</div>
        <div class="sig">${s.img ? `<img src="${s.img}" alt="Chữ ký">` : '<span class="muted small">Chưa ký</span>'}</div>
        <div class="small"><b>${esc(s.name || '')}</b>${s.title ? ` – ${esc(s.title)}` : ''}</div>
        <button class="btn" data-act="sign" data-v="${r.k}">${I.pen} ${s.img ? 'Ký lại' : 'Ký tên'}</button></div>`;
    }).join('');
    return `${topbar({ title: 'Biên bản', sub: cur.info.project, progress: n.pct })}
    <main class="wrap">
      ${n.none ? `<p class="note-box" style="color:var(--sev-b)"><b>Còn ${n.none} hạng mục chưa kiểm tra.</b> Biên bản vẫn xuất được, các mục này ghi "Chưa KT".</p>` : ''}
      <section class="verdict ${v.key}">
        <span class="eyebrow">Kết luận</span><b>${esc(v.text)}</b>
        <span class="small muted">Đề xuất tự động theo tồn tại: ${n.A} mức A, ${n.B} mức B, ${n.C} mức C.</span>
        <div class="field"><label for="vsel">Chọn kết luận</label>
          <select id="vsel" data-verdict>${['', 'ok', 'cond', 'no'].map((k) => `<option value="${k}" ${(cur.verdict.v || '') === k ? 'selected' : ''}>${k ? esc(VERDICT[purpose][k]) : 'Tự động: ' + esc(VERDICT[purpose][auto])}</option>`).join('')}</select></div>
        <div class="field"><label for="vnote">Ý kiến / kiến nghị</label><textarea id="vnote" class="inp" data-vnote placeholder="VD: EPC hoàn thành khắc phục mục A trước ngày…; O&M tiếp nhận vận hành từ ngày…">${esc(cur.verdict.note || '')}</textarea></div>
      </section>
      <div class="eyebrow">Chữ ký xác nhận</div>
      <div class="sign-grid">${signBoxes}</div>
      <div class="eyebrow">Xuất biên bản</div>
      ${ARTIFACT ? '<p class="note-box">Bạn đang mở bản xem trước, nơi tải file bị chặn. Dùng "Sao chép" bên dưới, hoặc mở bản cài đặt (GitHub Pages) để xuất PDF / Excel đầy đủ.</p>' : ''}
      <div class="btn-grid">
        ${ARTIFACT ? '' : `<button class="btn primary" data-act="export-pdf">${I.doc} Xuất PDF</button>`}
        <button class="btn" data-act="share-html">${I.share} Gửi biên bản (HTML)</button>
        <button class="btn" data-act="export-xlsx">${I.table} Xuất Excel (.xlsx)</button>
        <button class="btn" data-act="copy-summary">${I.copy} Sao chép tóm tắt</button>
        ${ARTIFACT ? `<button class="btn" data-act="copy-csv">${I.copy} Sao chép bảng (dán vào Excel)</button>` : ''}
        <button class="btn" data-act="export-json">${I.save} Sao lưu (.json)</button>
        ${!ARTIFACT && !STANDALONE ? `<button class="btn" data-act="print">${I.print} In trực tiếp</button>` : ''}
      </div>
      <div class="eyebrow">Xem trước</div>
      <div class="report-wrap">${reportHTML(reportModel({ thumbs: true }))}</div>
    </main>${tabbar()}`;
  }

  // Dữ liệu biên bản dùng chung cho xem trước, file HTML và file PDF.
  function reportModel(opts = {}) {
    const f = cur.info; const all = allItems(); const n = count(all);
    const P = PURPOSE[f.purpose] || PURPOSE.handover;
    // Xem trước trong ứng dụng dùng ảnh thu nhỏ; file PDF / HTML dùng ảnh gốc.
    const phs = (r) => (r.ph || []).filter((id) => photoCache.has(id)).map((id) => opts.thumbs ? (thumbCache.get(id) || PH_BLANK) : photoCache.get(id));
    const secs = CL.sections.map((s) => ({ s, its: secItems(s) })).filter((x) => x.its.length);
    return {
      title: P.title, om: f.om || '', project: f.project || '',
      sub: `Dự án: ${f.project || ''}${f.dc ? ' – ' + f.dc + ' kWp' : ''} · Ngày ${fmtDate(f.date)}`,
      info: [
        ['Tên dự án', f.project], ['Mã dự án', f.pcode], ['Loại dự án', CL.types[f.type]], ['Mục đích', P.label],
        ['Địa điểm', f.address], ['Tọa độ GPS', f.gps], ['Công suất DC', f.dc ? f.dc + ' kWp' : ''], ['Công suất AC', f.ac ? f.ac + ' kW' : ''],
        ['Tấm pin', f.module], ['Inverter', f.inverter], ['Cấp điện áp đấu nối', f.conn], ['Ngày COD', fmtDate(f.cod)],
        ['Chủ đầu tư', f.owner], ['Bên bàn giao (EPC)', f.epc], ['Đơn vị O&M', f.om], ['Ngày kiểm tra', fmtDate(f.date)],
        ['Người kiểm tra', f.inspector], ['Thời tiết', [f.weather, f.irr ? f.irr + ' W/m²' : '', f.temp ? f.temp + ' °C' : ''].filter(Boolean).join(' · ')]
      ].map(([a, b]) => [a, b || '']),
      team: f.team || '',
      summary: secs.map(({ s, its }) => { const c = count(its); return { part: s.part, partTitle: s.partTitle, cells: [`${s.id} – ${s.title}`, c.total, c.ok, c.nok, c.na, c.none].map(String) }; }),
      totals: [n.total, n.ok, n.nok, n.na, n.none],
      counts: n,
      sevLine: `Tồn tại theo mức độ: A ${n.A} · B ${n.B} · C ${n.C}. A – ${SEV.A.short}: ${SEV.A.desc} B – ${SEV.B.short}: ${SEV.B.desc} C – ${SEV.C.short}: ${SEV.C.desc}`,
      punch: punchItems().map((it, i) => {
        const r = cur.res[it.c];
        return { no: i + 1, c: it.c, t: it.t, text: (r.note || '').trim() || 'Không đạt: ' + it.t, note: r.note || '', sev: r.sev || 'B', resp: r.resp || '', due: fmtDate(r.due), val: r.val ? `${r.val} ${it.u || ''}`.trim() : '', photos: phs(r) };
      }),
      verdict: verdictOf(n).text, verdictNote: cur.verdict.note || '',
      signs: SIGN_ROLES.map((r) => { const s = cur.sign[r.k] || {}; return { label: r.label, org: f[r.org] || '', name: s.name || '', title: s.title || '', img: s.img || '' }; }),
      detail: secs.map(({ s, its }) => ({
        title: `${s.id} – ${s.title}`, part: s.part, partTitle: s.partTitle,
        rows: its.map((it) => {
          const r = cur.res[it.c] || {};
          return { g: it.g || '', c: it.c, t: it.t, s: r.s || '', res: r.s ? ST[r.s] : 'Chưa KT', sev: r.s === 'nok' ? (r.sev || 'B') : '', val: r.val ? `${r.val} ${it.u || ''}`.trim() : '', note: r.note || '' };
        })
      })),
      appendix: all.map((it) => ({ it, r: cur.res[it.c] || {} })).filter(({ r }) => r.s !== 'nok' && phs(r).length)
        .map(({ it, r }) => ({ c: it.c, t: it.t, note: r.note || '', photos: phs(r) })),
      footer: `${f.project || ''} · ${P.title}`,
      stamp: `Raitek PV Handover Checklist · bộ checklist ${cur.clv || CL.version} · xuất lúc ${fmtDT(Date.now())}`
    };
  }

  function reportHTML(m) {
    m = m || reportModel();
    const res = (r) => `<span class="r-${r.s || 'none'}">${esc(r.res)}</span>${r.sev ? ` <span class="sev ${r.sev}">${r.sev}</span>` : ''}`;
    let info = '';
    for (let i = 0; i < m.info.length; i += 2) info += `<tr><td>${esc(m.info[i][0])}</td><td>${esc(m.info[i][1])}</td><td>${esc(m.info[i + 1][0])}</td><td>${esc(m.info[i + 1][1])}</td></tr>`;
    if (m.team) info += `<tr><td>Thành phần tham gia</td><td colspan="3" style="white-space:pre-line">${esc(m.team)}</td></tr>`;
    const n = m.counts;
    let k = 1;
    const withPh = m.punch.filter((p) => p.photos.length);
    const logo = window.RAITEK_LOGO ? `<img class="rpt-logo" src="${window.RAITEK_LOGO}" alt="Raitek">` : '';
    const photoPage = (eyebrow, title, note, meta, photos, sev, first) => `<section class="ph-page${first ? ' first' : ''}">
        <p class="ph-eyebrow">${esc(eyebrow)}</p>
        <h3 class="ph-title">${sev ? `<span class="sev ${sev}">${sev}</span> ` : ''}${esc(title)}</h3>
        ${note ? `<p class="ph-note">${esc(note)}</p>` : ''}${meta ? `<p class="ph-meta">${esc(meta)}</p>` : ''}
        <div class="ph-grid n${Math.min(photos.length, 4)}">${photos.map((src) => `<img src="${src}" alt="" loading="lazy" decoding="async">`).join('')}</div></section>`;
    const metaOf = (p) => [p.resp ? 'Trách nhiệm: ' + p.resp : '', p.due ? 'Hạn khắc phục: ' + p.due : '', p.val ? 'Giá trị đo: ' + p.val : ''].filter(Boolean).join(' · ');
    const appx = [];
    appx.push(`<h2 class="appx">Phụ lục ${appx.length + 1}. Chi tiết kết quả kiểm tra</h2>
      <table><tr><th>Mã</th><th>Nội dung kiểm tra</th><th class="c">Kết quả</th><th class="c">Giá trị đo</th><th>Ghi chú</th></tr>
        ${m.detail.map((sec, i) => (i === 0 || m.detail[i - 1].part !== sec.part ? `<tr class="part"><td colspan="5">PHẦN ${esc(sec.part)} – ${esc(sec.partTitle.toUpperCase())}</td></tr>` : '') + `<tr><th colspan="5">${esc(sec.title)}</th></tr>` + sec.rows.map((r, j) => (r.g && (j === 0 || sec.rows[j - 1].g !== r.g) ? `<tr class="grp"><td colspan="5">${esc(r.g)}</td></tr>` : '') + `<tr><td class="code">${esc(r.c)}</td><td>${esc(r.t)}</td><td class="c">${res(r)}</td><td class="c">${esc(r.val)}</td><td>${esc(r.note)}</td></tr>`).join('')).join('')}</table>`);
    if (withPh.length) appx.push(`<h2 class="appx">Phụ lục ${appx.length + 1}. Hình ảnh tồn tại</h2>` + withPh.map((p, i) => photoPage(`Tồn tại ${p.no}/${m.punch.length} · ${p.c}`, p.text, '', metaOf(p), p.photos, p.sev, i === 0)).join(''));
    if (m.appendix.length) appx.push(`<h2 class="appx">Phụ lục ${appx.length + 1}. Hình ảnh hiện trường khác</h2>` + m.appendix.map((a, i) => photoPage(a.c, a.t, a.note, '', a.photos, '', i === 0)).join(''));
    return `<div class="rpt">
      <table class="rpt-head"><tr><td class="rh-org">${logo}<div>${esc(m.om || 'RAITEK')}</div></td><td class="rh-nat"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><b>Độc lập – Tự do – Hạnh phúc</b></td></tr></table>
      <h1>${esc(m.title)}</h1>
      <p class="rpt-sub">${esc(m.sub)}</p>
      <h2>${k++}. Thông tin chung</h2><table class="info">${info}</table>
      <h2>${k++}. Tổng hợp kết quả</h2>
      <table class="sum"><tr><th style="text-align:left">Nhóm hạng mục</th><th>Tổng</th><th>Đạt</th><th>Không đạt</th><th>N/A</th><th>Chưa KT</th></tr>
        ${m.summary.map((r, i) => (i === 0 || m.summary[i - 1].part !== r.part ? `<tr class="part"><td colspan="6" style="text-align:left">PHẦN ${esc(r.part)} – ${esc(r.partTitle.toUpperCase())}</td></tr>` : '') + `<tr><td style="text-align:left;padding-left:16px">${esc(r.cells[0])}</td>${r.cells.slice(1).map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}
        <tr><th style="text-align:left">Tổng cộng</th>${m.totals.map((v) => `<th>${v}</th>`).join('')}</tr></table>
      <p style="margin:6px 0 0">Tồn tại theo mức độ: <span class="sev A">A</span> ${n.A} · <span class="sev B">B</span> ${n.B} · <span class="sev C">C</span> ${n.C}. (A – ${SEV.A.short}: ${SEV.A.desc} B – ${SEV.B.short}: ${SEV.B.desc} C – ${SEV.C.short}: ${SEV.C.desc})</p>
      <h2>${k++}. Danh sách tồn tại</h2>
      ${m.punch.length ? `<table><tr><th class="c">TT</th><th>Mã</th><th>Nội dung tồn tại</th><th class="c">Mức</th><th>Trách nhiệm</th><th class="c">Hạn</th><th class="c">Ảnh</th></tr>
        ${m.punch.map((p) => `<tr><td class="c">${p.no}</td><td class="code">${esc(p.c)}</td><td style="white-space:pre-line">${esc(p.text)}${p.val ? `<br>Giá trị đo: ${esc(p.val)}` : ''}</td><td class="c"><span class="sev ${p.sev}">${p.sev}</span></td><td>${esc(p.resp)}</td><td class="c">${esc(p.due)}</td><td class="c">${p.photos.length || ''}</td></tr>`).join('')}</table>` : '<p>Không ghi nhận tồn tại.</p>'}
      <h2>${k++}. Kết luận</h2>
      <div class="verdict-p"><b>${esc(m.verdict)}</b>${m.verdictNote ? `<div style="white-space:pre-line;margin-top:4px">${esc(m.verdictNote)}</div>` : ''}</div>
      <div class="signs">${m.signs.map((s) => `<div class="s"><b>${esc(s.label.toUpperCase())}</b>${s.org ? `<div>${esc(s.org)}</div>` : ''}<div style="font-style:italic;color:#666">(Ký, ghi rõ họ tên)</div>${s.img ? `<img src="${s.img}" alt="">` : '<div class="sp"></div>'}<b>${esc(s.name)}</b>${s.title ? `<div>${esc(s.title)}</div>` : ''}</div>`).join('')}</div>
      ${appx.join('')}
      <p class="foot">${esc(m.stamp)}</p>
    </div>`;
  }

  /* ---------------- exports ---------------- */
  function download(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function shareOrDownload(blob, name, title) {
    try {
      const file = new File([blob], name, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    download(blob, name); toast('Đã tải file: ' + name);
  }
  const baseName = () => `${slug(cur.info.project)}_${(cur.info.date || todayISO()).replace(/-/g, '')}`;

  function csvText(sep) {
    const f = cur.info; const q = (v) => { v = String(v == null ? '' : v); return sep === '\t' ? v.replace(/[\t\n\r]+/g, ' ') : /[",\n\r;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const rows = [
      ['Dự án', f.project], ['Mục đích', (PURPOSE[f.purpose] || PURPOSE.handover).label], ['Loại', CL.types[f.type]], ['Địa điểm', f.address],
      ['Công suất DC (kWp)', f.dc], ['Công suất AC (kW)', f.ac], ['Chủ đầu tư', f.owner], ['EPC', f.epc], ['O&M', f.om],
      ['Ngày kiểm tra', fmtDate(f.date)], ['Người kiểm tra', f.inspector], ['Kết luận', verdictOf(count(allItems())).text], [],
      ['Nhóm', 'Mã', 'Nội dung kiểm tra', 'Kết quả', 'Mức độ', 'Giá trị đo', 'Đơn vị', 'Ghi chú', 'Trách nhiệm', 'Hạn khắc phục', 'Số ảnh']
    ];
    for (const it of allItems()) {
      const r = cur.res[it.c] || {};
      rows.push([secById(it.secId).title, it.c, it.t, r.s ? ST[r.s] : 'Chưa KT', r.s === 'nok' ? (r.sev || 'B') : '', r.val, it.u, r.note, r.resp, fmtDate(r.due), (r.ph || []).length || '']);
    }
    return rows.map((r) => r.map(q).join(sep)).join('\r\n');
  }
  function exportXLSX() {
    const f = cur.info; const n = count(allItems()); const H = (v) => ({ v, s: 1 }); const W = (v) => ({ v, s: 2 });
    const info = [
      [{ v: PURPOSE[f.purpose || 'handover'].title.toUpperCase(), s: 3 }], [],
      ['Dự án', f.project], ['Mã dự án', f.pcode], ['Mục đích', (PURPOSE[f.purpose] || PURPOSE.handover).label], ['Loại dự án', CL.types[f.type]],
      ['Địa điểm', f.address], ['Công suất DC (kWp)', f.dc], ['Công suất AC (kW)', f.ac], ['Chủ đầu tư', f.owner], ['Bên bàn giao (EPC)', f.epc],
      ['Đơn vị O&M', f.om], ['Ngày kiểm tra', fmtDate(f.date)], ['Người kiểm tra', f.inspector],
      ['Kết quả', `${n.ok} đạt · ${n.nok} không đạt (A ${n.A} / B ${n.B} / C ${n.C}) · ${n.na} N/A · ${n.none} chưa kiểm`],
      ['Kết luận', verdictOf(n).text], ['Ý kiến / kiến nghị', cur.verdict.note || ''], []
    ].map((r) => r.length === 2 ? [{ v: r[0], s: 3 }, r[1] || ''] : r);
    const head = ['Phần', 'Nhóm', 'Nhóm con', 'Mã', 'Nội dung kiểm tra', 'Kết quả', 'Mức độ', 'Giá trị đo', 'Đơn vị', 'Ghi chú', 'Trách nhiệm', 'Hạn khắc phục', 'Số ảnh'].map(H);
    const rows = allItems().map((it) => {
      const r = cur.res[it.c] || {};
      const sec = secById(it.secId);
      return [W(`${sec.part}. ${sec.partTitle}`), W(sec.title), W(it.g || ''), W(it.c), W(it.t), W(r.s ? ST[r.s] : 'Chưa KT'), W(r.s === 'nok' ? (r.sev || 'B') : ''), W(r.val || ''), W(it.u || ''), W(r.note || ''), W(r.resp || ''), W(fmtDate(r.due)), W((r.ph || []).length || '')];
    });
    const punch = punchItems().map((it, i) => {
      const r = cur.res[it.c];
      return [W(i + 1), W(it.c), W((r.note || '').trim() || 'Không đạt: ' + it.t), W(r.sev || 'B'), W(r.val ? `${r.val} ${it.u || ''}` : ''), W(r.resp || ''), W(fmtDate(r.due)), W(''), W('')];
    });
    const blob = window.miniXLSX([
      { name: 'Checklist', widths: [22, 24, 22, 9, 60, 11, 8, 13, 8, 45, 15, 14, 8], rows: info.concat([head], rows) },
      { name: 'Tồn tại', widths: [5, 9, 70, 7, 14, 15, 14, 16, 30], freezeRow: 1, rows: [['TT', 'Mã', 'Nội dung tồn tại', 'Mức', 'Giá trị đo', 'Trách nhiệm', 'Hạn khắc phục', 'Ngày hoàn thành', 'Xác nhận / ghi chú'].map(H)].concat(punch) }
    ]);
    shareOrDownload(blob, baseName() + '.xlsx', 'Checklist ' + cur.info.project);
  }
  function standaloneHTML() {
    return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(PURPOSE[cur.info.purpose || 'handover'].title)} – ${esc(cur.info.project)}</title>
<style>:root{--f-body:"Be Vietnam Pro",Arial,sans-serif;--f-mono:Consolas,monospace}body{margin:0;background:#fff}${REPORT_CSS}
@media screen{.rpt{max-width:900px;margin:0 auto;min-width:0}}@media print{@page{size:A4;margin:12mm 10mm}.rpt{padding:0}.rpt tr,.rpt img{break-inside:avoid}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>${reportHTML()}</body></html>`;
  }
  function exportJSON() {
    const photos = [];
    for (const r of Object.values(cur.res)) for (const id of r.ph || []) if (photoCache.has(id)) photos.push({ id, data: photoCache.get(id) });
    const data = JSON.stringify({ app: 'pv-handover', v: 1, exported: Date.now(), insp: cur, photos });
    shareOrDownload(new Blob([data], { type: 'application/json' }), baseName() + '.json', 'Sao lưu ' + cur.info.project);
  }
  async function importJSON(file) {
    try {
      const d = JSON.parse(await file.text());
      if (d.app !== 'pv-handover' || !d.insp) throw new Error('bad');
      const insp = d.insp;
      if (await store.get('insp', insp.id)) { insp.id = uid(); insp.info.project = (insp.info.project || '') + ' (bản nhập)'; }
      const map = {};
      for (const p of d.photos || []) { const nid = uid(); map[p.id] = nid; await store.put('photos', { id: nid, insp: insp.id, data: p.data, ts: Date.now() }); }
      for (const r of Object.values(insp.res || {})) if (r.ph) r.ph = r.ph.map((id) => map[id]).filter(Boolean);
      insp.updated = Date.now();
      await store.put('insp', insp);
      toast('Đã nhập: ' + (insp.info.project || 'biên bản'));
      loadHome();
    } catch (e) { toast('File không đúng định dạng sao lưu của ứng dụng'); }
  }
  async function copyText(text, okMsg) {
    try { await navigator.clipboard.writeText(text); toast(okMsg); }
    catch (e) {
      openModal(`<h2>Sao chép thủ công</h2><p class="muted small" style="margin:0">Trình duyệt không cho tự sao chép. Chạm vào ô, chọn tất cả rồi sao chép.</p><textarea class="inp" style="min-height:240px" readonly id="copybox">${esc(text)}</textarea><button class="btn block" data-act="close">Đóng</button>`);
      const t = document.getElementById('copybox'); t.focus(); t.select();
    }
  }
  function summaryText(punchOnly) {
    const f = cur.info; const n = count(allItems());
    const lines = [];
    if (!punchOnly) {
      lines.push(`${(PURPOSE[f.purpose] || PURPOSE.handover).label.toUpperCase()} – ${f.project}`);
      lines.push(`Ngày: ${fmtDate(f.date)}${f.inspector ? ' · Người kiểm tra: ' + f.inspector : ''}`);
      if (f.dc) lines.push(`Công suất: ${f.dc} kWp${f.ac ? ' / ' + f.ac + ' kW' : ''}`);
      lines.push(`Kết quả: ${n.ok} đạt · ${n.nok} không đạt (A ${n.A} / B ${n.B} / C ${n.C}) · ${n.na} N/A · ${n.none} chưa kiểm`);
      lines.push(`Kết luận: ${verdictOf(n).text}`);
      lines.push('');
    }
    lines.push(`DANH SÁCH TỒN TẠI – ${f.project}`);
    punchItems().forEach((it, i) => {
      const r = cur.res[it.c];
      lines.push(`${i + 1}. [${r.sev || 'B'}] ${it.c}: ${(r.note || '').trim() || 'Không đạt: ' + it.t}${r.resp ? ' · TN: ' + r.resp : ''}${r.due ? ' · Hạn: ' + fmtDate(r.due) : ''}`);
    });
    return lines.join('\n');
  }
  let pdfOut = null;
  async function exportPDF() {
    openModal('<h2>Đang tạo PDF…</h2><p class="muted small" style="margin:0">Biên bản nhiều ảnh có thể mất vài giây. Vui lòng không tắt màn hình.</p>');
    try {
      await flush();
      if (!window.PVHO_PDF) await new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'js/pdf.js'; sc.onload = res; sc.onerror = () => rej(new Error('Không tải được bộ tạo PDF')); document.head.appendChild(sc); });
      const blob = await window.PVHO_PDF.build(reportModel());
      pdfOut = { blob, name: baseName() + '.pdf' };
      const file = new File([blob], pdfOut.name, { type: 'application/pdf' });
      const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
      openModal(`<h2>PDF đã sẵn sàng</h2><p class="muted small" style="margin:0">${esc(pdfOut.name)} · ${(blob.size / 1048576).toFixed(1)} MB</p>
        <div class="form-section">
          ${canShare ? `<button class="btn primary block" data-act="pdf-share">${I.share} Chia sẻ / Lưu vào Tệp, Zalo, Mail…</button>` : ''}
          <button class="btn ${canShare ? '' : 'primary'} block" data-act="pdf-download">${I.save} Tải về máy</button>
          <button class="btn block" data-act="pdf-open">${I.doc} Mở xem</button>
          <button class="btn ghost block" data-act="close">Đóng</button>
        </div>`);
    } catch (e) {
      openModal(`<h2>Chưa tạo được PDF</h2><p style="margin:0">${esc(e && e.message ? e.message : e)}</p><p class="muted small" style="margin:0">Nếu đang offline lần đầu sau khi cập nhật, hãy mở ứng dụng khi có mạng một lần. Trong lúc chờ có thể dùng "Gửi biên bản (HTML)".</p><button class="btn block" data-act="close">Đóng</button>`);
    }
  }
  async function pdfShare() {
    if (!pdfOut) return;
    try { await navigator.share({ files: [new File([pdfOut.blob], pdfOut.name, { type: 'application/pdf' })], title: pdfOut.name }); }
    catch (e) { if (!e || e.name !== 'AbortError') { download(pdfOut.blob, pdfOut.name); toast('Đã tải file: ' + pdfOut.name); } }
  }
  function pdfOpen() {
    if (!pdfOut) return;
    const w = window.open(URL.createObjectURL(pdfOut.blob), '_blank');
    if (!w) { download(pdfOut.blob, pdfOut.name); toast('Đã tải file: ' + pdfOut.name); }
  }

  async function doPrint() {
    $print.innerHTML = reportHTML();
    await Promise.all([...$print.querySelectorAll('img')].map((img) => img.complete ? 0 : new Promise((r) => { img.onload = img.onerror = r; })));
    window.print();
    if (ARTIFACT) toast('Bản xem trước không mở được hộp thoại in');
  }

  /* ---------------- photos ---------------- */
  function loadImage(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

  /* ----- vị trí GPS ----- */
  const geo = { fix: null, watch: null, state: 'idle' }; // state: idle | wait | ok | denied
  const geoOn = () => settings.geoStamp !== false;
  function geoStart() {
    if (!geoOn() || !navigator.geolocation || geo.watch !== null) return;
    geo.state = geo.fix ? 'ok' : 'wait';
    try {
      geo.watch = navigator.geolocation.watchPosition((p) => {
        geo.fix = { lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy || 0), ts: Date.now() };
        geo.state = 'ok'; camGeoChip();
      }, (e) => { geo.state = e.code === 1 ? 'denied' : (geo.fix ? 'ok' : 'wait'); camGeoChip(); },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 });
    } catch (e) { geo.watch = null; }
  }
  function geoStop() { if (geo.watch !== null) { try { navigator.geolocation.clearWatch(geo.watch); } catch (e) { /* ignore */ } geo.watch = null; } }
  const freshFix = () => (geo.fix && Date.now() - geo.fix.ts < 180000 ? geo.fix : null);

  // Đọc tọa độ GPS trong EXIF của ảnh JPEG chọn từ thư viện (nếu điện thoại còn giữ).
  async function exifGps(file) {
    try {
      if (!/jpe?g/i.test(file.type || '') && !/\.jpe?g$/i.test(file.name || '')) return null;
      const v = new DataView(await file.slice(0, 256 * 1024).arrayBuffer());
      if (v.getUint16(0) !== 0xFFD8) return null;
      let o = 2;
      while (o + 10 < v.byteLength) {
        const mk = v.getUint16(o), len = v.getUint16(o + 2);
        if ((mk & 0xFF00) !== 0xFF00) break;
        if (mk === 0xFFE1 && v.getUint32(o + 4) === 0x45786966) return parseExifGps(v, o + 10);
        o += 2 + len;
      }
    } catch (e) { /* ignore */ }
    return null;
  }
  function parseExifGps(v, t) {
    const le = v.getUint16(t) === 0x4949;
    const u16 = (p) => v.getUint16(t + p, le), u32 = (p) => v.getUint32(t + p, le);
    const ifd0 = u32(4), n = u16(ifd0); let gps = 0;
    for (let i = 0; i < n; i++) { const e = ifd0 + 2 + i * 12; if (u16(e) === 0x8825) gps = u32(e + 8); }
    if (!gps) return null;
    const m = u16(gps), tags = {};
    for (let i = 0; i < m; i++) {
      const e = gps + 2 + i * 12, tag = u16(e), type = u16(e + 2), cnt = u32(e + 4);
      if (type === 2) tags[tag] = String.fromCharCode(v.getUint8(t + e + 8));
      else if (type === 5 && cnt === 3) { const off = u32(e + 8); tags[tag] = [0, 1, 2].map((k) => u32(off + k * 8) / (u32(off + k * 8 + 4) || 1)); }
    }
    if (!tags[2] || !tags[4]) return null;
    const dms = (a) => a[0] + a[1] / 60 + a[2] / 3600;
    let lat = dms(tags[2]), lng = dms(tags[4]);
    if (tags[1] === 'S') lat = -lat;
    if (tags[3] === 'W') lng = -lng;
    if (!isFinite(lat) || !isFinite(lng) || (lat === 0 && lng === 0)) return null;
    return { lat, lng, acc: 0 };
  }

  // Bản đồ nhỏ (OpenStreetMap) quanh vị trí chụp; không có mạng thì trả về null.
  const tileCache = new Map(), insetCache = new Map();
  let tileFailAt = 0; // mất mạng: bỏ qua bản đồ 60 giây để ảnh được lưu ngay
  function loadTile(k) {
    if (!tileCache.has(k)) {
      tileCache.set(k, new Promise((res, rej) => {
        const img = new Image(); img.crossOrigin = 'anonymous';
        const to = setTimeout(() => { tileCache.delete(k); rej(new Error('timeout')); }, 3500);
        img.onload = () => { clearTimeout(to); res(img); };
        img.onerror = () => { clearTimeout(to); tileCache.delete(k); rej(new Error('tile')); };
        img.src = `https://tile.openstreetmap.org/${k}.png`;
      }));
    }
    return tileCache.get(k);
  }
  async function mapInset(lat, lng) {
    if (ARTIFACT || navigator.onLine === false || Date.now() - tileFailAt < 60000) return null;
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (insetCache.has(key)) return insetCache.get(key);
    const z = 17, S = 256, n = 2 ** z, lr = lat * Math.PI / 180;
    const px = (lng + 180) / 360 * n * 256, py = (1 - Math.log(Math.tan(lr) + 1 / Math.cos(lr)) / Math.PI) / 2 * n * 256;
    const x0 = px - S / 2, y0 = py - S / 2;
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const ctx = cv.getContext('2d');
    try {
      const jobs = [];
      for (let tx = Math.floor(x0 / 256); tx <= Math.floor((x0 + S) / 256); tx++) {
        for (let ty = Math.floor(y0 / 256); ty <= Math.floor((y0 + S) / 256); ty++) {
          jobs.push(loadTile(`${z}/${tx}/${ty}`).then((img) => ctx.drawImage(img, tx * 256 - x0, ty * 256 - y0)));
        }
      }
      await Promise.all(jobs);
      cv.toDataURL('image/png'); // kiểm tra canvas không bị "taint"
    } catch (e) { tileFailAt = Date.now(); return null; }
    if (insetCache.size > 30) insetCache.clear();
    insetCache.set(key, cv);
    return cv;
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  // Dấu trên ảnh: bản đồ mờ + ghim vị trí ở góc dưới trái, mã hạng mục, tọa độ (không ghi giờ).
  function drawStamp(ctx, w, h, label, loc, inset) {
    const m = Math.min(w, h), pad = Math.round(m * 0.022), fs = Math.max(13, Math.round(m * 0.028)), lh = Math.round(fs * 1.38);
    const font = (b) => `${b ? 700 : 500} ${fs}px "Be Vietnam Pro", Arial, sans-serif`;
    const lines = [label];
    if (loc) lines.push(`${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}${loc.acc ? `  ±${loc.acc} m` : ''}`);
    if (loc && cur && cur.info.address) lines.push(cur.info.address);
    const ms = loc ? Math.round(m * 0.24) : 0;
    const maxText = w - pad * 4 - (ms ? ms + pad : 0);
    ctx.save();
    const fit = (txt, b) => { ctx.font = font(b); let s = txt; while (ctx.measureText(s).width > maxText && s.length > 4) s = s.slice(0, -2); return s === txt ? s : s.trim() + '…'; };
    const shown = lines.map((l, i) => fit(l, i === 0));
    const textW = Math.max(...shown.map((l, i) => { ctx.font = font(i === 0); return ctx.measureText(l).width; }));
    const boxH = Math.max(ms, shown.length * lh) + pad, boxW = (ms ? ms + pad : 0) + textW + pad * 1.5;
    const bx = pad, by = h - pad - boxH;
    ctx.fillStyle = 'rgba(12, 8, 50, .48)'; rr(ctx, bx, by, boxW, boxH, pad * 0.6); ctx.fill();
    if (ms) {
      const mx = bx + pad / 2, my = by + pad / 2, cx = mx + ms / 2, cy = my + ms / 2;
      ctx.save(); rr(ctx, mx, my, ms, ms, pad * 0.45); ctx.clip();
      if (inset) { ctx.globalAlpha = 0.78; ctx.drawImage(inset, mx, my, ms, ms); ctx.globalAlpha = 1; }
      else {
        ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.fillRect(mx, my, ms, ms);
        ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1;
        for (let k = 1; k < 4; k++) { const d = ms * k / 4; ctx.beginPath(); ctx.moveTo(mx + d, my); ctx.lineTo(mx + d, my + ms); ctx.moveTo(mx, my + d); ctx.lineTo(mx + ms, my + d); ctx.stroke(); }
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = Math.max(1, m * 0.0025); rr(ctx, mx, my, ms, ms, pad * 0.45); ctx.stroke();
      const r = ms * 0.075; // ghim
      ctx.fillStyle = '#e53935'; ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, r * 0.22);
      ctx.beginPath(); ctx.arc(cx, cy - r * 1.35, r, Math.PI * 0.85, Math.PI * 2.15); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy - r * 1.35, r * 0.38, 0, Math.PI * 2); ctx.fill();
      if (inset) { ctx.font = `500 ${Math.max(8, Math.round(fs * 0.42))}px Arial, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText('© OpenStreetMap', mx + ms - 3, my + ms - 2); ctx.textAlign = 'left'; }
    }
    const tx = bx + pad * 0.75 + (ms ? ms + pad / 2 : 0);
    const ty0 = by + pad / 2 + (Math.max(ms, shown.length * lh) - shown.length * lh) / 2;
    ctx.textBaseline = 'middle';
    shown.forEach((l, i) => { ctx.font = font(i === 0); ctx.fillStyle = i === 0 ? '#ffffff' : 'rgba(255,255,255,.88)'; ctx.fillText(l, tx, ty0 + lh * i + lh / 2); });
    ctx.restore();
  }
  async function makePhoto(src, sw, sh, label, loc) {
    const sc = Math.min(1, 1600 / Math.max(sw, sh)), w = Math.round(sw * sc), h = Math.round(sh * sc);
    const useLoc = geoOn() ? loc : null;
    const inset = useLoc ? await mapInset(useLoc.lat, useLoc.lng) : null;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d'); ctx.drawImage(src, 0, 0, w, h);
    drawStamp(ctx, w, h, label, useLoc, inset);
    const data = cv.toDataURL('image/jpeg', 0.72);
    const thumb = thumbOf(cv, w, h);
    cv.width = cv.height = 0; // giải phóng bộ nhớ canvas ngay
    return { data, thumb, geo: useLoc ? { lat: useLoc.lat, lng: useLoc.lng, acc: useLoc.acc } : null };
  }
  const photoLabel = (c) => `${c} · ${cur.info.project || ''}`.slice(0, 70);
  async function savePhoto(c, made) {
    const id = uid();
    await store.put('photos', { id, insp: cur.id, code: c, data: made.data, thumb: made.thumb, geo: made.geo, ts: Date.now() });
    photoCache.set(id, made.data); thumbCache.set(id, made.thumb);
    const r = R(c); r.ph = r.ph || []; r.ph.push(id); touch();
    return id;
  }
  // kind: 'cam' = vừa chụp bằng camera máy (dùng vị trí hiện tại), 'lib' = chọn từ thư viện (chỉ dùng GPS trong ảnh)
  async function addPhotos(c, files, kind) {
    if (!files || !files.length) return;
    toast(`Đang xử lý ${files.length} ảnh…`, 6000);
    let n = 0;
    for (const file of files) {
      const url = URL.createObjectURL(file);
      try {
        const loc = (await exifGps(file)) || (kind === 'cam' ? freshFix() : null);
        const img = await loadImage(url);
        await savePhoto(c, await makePhoto(img, img.naturalWidth, img.naturalHeight, photoLabel(c), loc));
        img.src = PH_BLANK; n++;
      } catch (e) { /* skip */ } finally { URL.revokeObjectURL(url); }
    }
    openSet.add(c); refreshItem(c);
    toast(n ? `Đã thêm ${n} ảnh` : 'Không đọc được ảnh');
  }
  function thumbOf(src, w, h) {
    const sc = Math.min(1, 400 / Math.max(w, h));
    const tc = document.createElement('canvas'); tc.width = Math.round(w * sc); tc.height = Math.round(h * sc);
    tc.getContext('2d').drawImage(src, 0, 0, tc.width, tc.height);
    const t = tc.toDataURL('image/jpeg', 0.7); tc.width = tc.height = 0;
    return t;
  }
  // Tạo ảnh thu nhỏ cho ảnh chụp từ phiên bản trước (chưa có thumb), từng ảnh một, rồi lưu lại.
  async function fillThumbs(inspId, list) {
    for (const p of list) {
      if (!cur || cur.id !== inspId) return;
      if (!photoCache.has(p.id) || thumbCache.has(p.id)) continue;
      try {
        const img = await loadImage(p.data);
        const t = thumbOf(img, img.naturalWidth, img.naturalHeight);
        img.src = PH_BLANK;
        if (!cur || cur.id !== inspId || !photoCache.has(p.id)) continue; // ảnh đã bị xóa trong lúc chờ
        thumbCache.set(p.id, t);
        await store.put('photos', Object.assign({}, p, { thumb: t }));
        document.querySelectorAll(`img[data-ph="${p.id}"]`).forEach((el) => { el.src = t; });
      } catch (e) { /* bỏ qua ảnh lỗi */ }
      await new Promise((r) => setTimeout(r, 30));
    }
  }

  /* ----- camera trong ứng dụng: chụp liên tục, chuyển hạng mục, chấm kết quả ngay trên camera ----- */
  const cam = { stream: null, items: [], idx: 0, queue: Promise.resolve(), pending: 0, torch: false };
  const camSupported = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && !ARTIFACT;
  function openCamera(c) {
    if (!camSupported()) { const f = document.getElementById('capin-' + c); if (f) f.click(); return; }
    cam.items = S.view === 'sec' ? secItems(secById(S.sec)) : allItems();
    cam.idx = Math.max(0, cam.items.findIndex((x) => x.c === c));
    $modal.innerHTML = `<div class="cam" id="cam" role="dialog" aria-label="Camera">
      <video id="cam-video" playsinline muted autoplay></video>
      <div class="cam-flash" id="cam-flash"></div>
      <div class="cam-top">
        <button class="cam-ic" data-act="cam-close" aria-label="Đóng camera">${I.x}</button>
        <div class="cam-item" id="cam-item"></div>
        <span class="cam-geo" id="cam-geo"></span>
      </div>
      <div class="cam-msg" id="cam-msg" hidden></div>
      <div class="cam-bottom">
        <div class="cam-seg" id="cam-seg"></div>
        <div class="cam-strip" id="cam-strip"></div>
        <div class="cam-ctl">
          <button class="cam-nav" data-act="cam-prev" aria-label="Hạng mục trước">${I.back}<span>Mục trước</span></button>
          <button class="cam-shutter" data-act="cam-shot" aria-label="Chụp ảnh"><i></i></button>
          <button class="cam-nav" data-act="cam-next" aria-label="Hạng mục sau"><span>Mục sau</span>${I.chev}</button>
        </div>
        <div class="cam-ctl2">
          <button class="cam-ic" id="cam-torch" data-act="cam-torch" aria-label="Đèn" hidden>${I.sun}</button>
          <button class="btn sun" data-act="cam-close">Xong</button>
        </div>
      </div></div>`;
    camRender(); camGeoChip(); geoStart(); camStart();
  }
  async function camStart() {
    const msg = document.getElementById('cam-msg');
    try {
      cam.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1440 } } });
      const v = document.getElementById('cam-video');
      if (!v) { camStopStream(); return; }
      v.srcObject = cam.stream; await v.play().catch(() => {});
      const tr = cam.stream.getVideoTracks()[0];
      const caps = tr && tr.getCapabilities ? tr.getCapabilities() : {};
      const tb = document.getElementById('cam-torch'); if (tb) tb.hidden = !caps.torch;
      if (msg) msg.hidden = true;
    } catch (e) {
      if (msg) {
        msg.hidden = false;
        msg.innerHTML = `<p>Không mở được camera. Hãy cho phép ứng dụng dùng camera trong cài đặt trình duyệt.</p>
          <label class="btn sun">${I.cam} Dùng camera của máy<input type="file" accept="image/*" capture="environment" data-photo="${cam.items[cam.idx].c}" data-src="cam" hidden></label>`;
      }
    }
  }
  function camStopStream() { if (cam.stream) { cam.stream.getTracks().forEach((t) => t.stop()); cam.stream = null; } cam.torch = false; }
  function closeCamera() {
    camStopStream();
    const it = cam.items[cam.idx];
    $modal.innerHTML = '';
    if (it && S.view === 'sec') { if ((cur.res[it.c] || {}).ph) openSet.add(it.c); S.focus = 'it-' + it.c; }
    render(false);
  }
  function camGeoChip() {
    const el = document.getElementById('cam-geo'); if (!el) return;
    const f = freshFix();
    el.className = 'cam-geo ' + (f ? 'ok' : geo.state === 'denied' ? 'off' : 'wait');
    el.textContent = !geoOn() ? 'Vị trí: tắt' : f ? `GPS ±${f.acc} m` : geo.state === 'denied' ? 'Chưa cho phép vị trí' : 'Đang lấy vị trí…';
  }
  function camRender() {
    const it = cam.items[cam.idx]; if (!it) return;
    const r = cur.res[it.c] || {};
    const head = document.getElementById('cam-item');
    if (head) head.innerHTML = `<b>${esc(it.c)}</b><span class="cam-pos">${cam.idx + 1}/${cam.items.length}</span><p>${esc(it.t)}</p>`;
    const seg = document.getElementById('cam-seg');
    if (seg) seg.innerHTML = ['ok', 'nok', 'na'].map((k) => `<button class="s-${k} ${r.s === k ? 'on' : ''}" data-act="cam-st" data-v="${k}">${ST[k]}</button>`).join('');
    camStrip();
  }
  function camStrip() {
    const it = cam.items[cam.idx]; const el = document.getElementById('cam-strip'); if (!it || !el) return;
    const ids = (cur.res[it.c] || {}).ph || [];
    el.innerHTML = `<span class="cam-count">${ids.length} ảnh${cam.pending ? ` · đang lưu ${cam.pending}` : ''}</span>` +
      ids.slice(-5).map((id) => `<img src="${thumbCache.get(id) || PH_BLANK}" alt="">`).join('');
  }
  function camShot() {
    const v = document.getElementById('cam-video');
    if (!v || !v.videoWidth || !cam.stream) return;
    const it = cam.items[cam.idx]; const c = it.c;
    const fc = document.createElement('canvas'); fc.width = v.videoWidth; fc.height = v.videoHeight;
    fc.getContext('2d').drawImage(v, 0, 0);
    const fl = document.getElementById('cam-flash'); if (fl) { fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go'); }
    try { if (navigator.vibrate) navigator.vibrate(25); } catch (e) { /* ignore */ }
    const loc = freshFix(); const label = photoLabel(c);
    cam.pending++; camStrip();
    cam.queue = cam.queue.then(async () => {
      try { await savePhoto(c, await makePhoto(fc, fc.width, fc.height, label, loc)); }
      catch (e) { toast('Không lưu được ảnh – bộ nhớ có thể đã đầy'); }
      finally { fc.width = fc.height = 0; cam.pending--; if (cam.items[cam.idx] && cam.items[cam.idx].c === c) camStrip(); }
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !document.getElementById('cam')) return;
    const tr = cam.stream && cam.stream.getVideoTracks()[0];
    if (!tr || tr.readyState === 'ended') { camStopStream(); camStart(); }
  });
  function viewPhoto(c, id) {
    const it = findItem(c);
    $modal.innerHTML = `<div class="viewer" role="dialog" aria-label="Ảnh">
      <div class="viewer-bar"><span class="small">${esc(c)} · ${esc(it ? it.t : '')}</span><button class="btn" data-act="close">${I.x}</button></div>
      <img src="${photoCache.get(id)}" alt="">
      <div class="viewer-bar bottom"><span></span><button class="btn danger" data-act="ph-del" data-c="${c}" data-id="${id}">${I.trash} Xóa ảnh</button></div></div>`;
  }

  /* ---------------- modals ---------------- */
  function openModal(inner) { $modal.innerHTML = `<div class="modal-bg" data-act="bg"><div class="modal" role="dialog" aria-modal="true">${inner}</div></div>`; }
  function closeModal() { if (document.getElementById('cam')) { closeCamera(); return; } $modal.innerHTML = ''; }
  let askResolve = null;
  function ask(title, msg, okLabel = 'Đồng ý', danger = false) {
    openModal(`<h2>${esc(title)}</h2><p style="margin:0">${esc(msg)}</p><div class="modal-actions"><button class="btn" data-act="ask-no">Hủy</button><button class="btn ${danger ? 'danger' : 'primary'}" data-act="ask-yes">${esc(okLabel)}</button></div>`);
    return new Promise((res) => { askResolve = res; });
  }
  function settleAsk(v) { const r = askResolve; askResolve = null; closeModal(); if (r) r(v); }

  function settingsModal() {
    openModal(`<h2>Cài đặt</h2>
      <div class="field"><label for="s-insp">Người kiểm tra mặc định</label><input class="inp" id="s-insp" value="${esc(settings.inspector)}"></div>
      <div class="field"><label for="s-om">Đơn vị O&M mặc định</label><input class="inp" id="s-om" value="${esc(settings.om)}"></div>
      <div class="field"><label for="s-geo">Vị trí trên ảnh</label><select class="inp" id="s-geo">
        <option value="on" ${geoOn() ? 'selected' : ''}>Gắn tọa độ GPS và bản đồ nhỏ vào góc ảnh</option>
        <option value="off" ${geoOn() ? '' : 'selected'}>Không gắn vị trí</option></select></div>
      <div class="field"><label for="s-theme">Giao diện</label><select class="inp" id="s-theme">
        ${[['system', 'Theo hệ thống'], ['light', 'Sáng – dễ đọc ngoài nắng'], ['dark', 'Tối']].map(([k, l]) => `<option value="${k}" ${settings.theme === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <p class="muted small" style="margin:0">Bộ checklist ${esc(CL.version)}. Cài lên màn hình chính: Safari → Chia sẻ → "Thêm vào MH chính"; Chrome → ⋮ → "Cài đặt ứng dụng".</p>
      <div class="modal-actions"><button class="btn" data-act="close">Đóng</button><button class="btn primary" data-act="save-settings">Lưu</button></div>`);
  }
  function addItemModal() {
    openModal(`<h2>Thêm hạng mục – ${esc(secById(S.sec).title)}</h2>
      <div class="field"><label for="ni-t">Nội dung kiểm tra</label><textarea class="inp" id="ni-t" placeholder="VD: Kiểm tra quạt thông gió phòng inverter"></textarea></div>
      <div class="field"><label for="ni-u">Đơn vị đo (nếu cần ghi giá trị)</label><input class="inp" id="ni-u" placeholder="VD: V, A, Ω, °C"></div>
      <div class="modal-actions"><button class="btn" data-act="close">Hủy</button><button class="btn primary" data-act="add-item-ok">Thêm</button></div>`);
    setTimeout(() => { const t = document.getElementById('ni-t'); if (t) t.focus(); }, 50);
  }
  function signModal(k) {
    const role = SIGN_ROLES.find((r) => r.k === k); const s = cur.sign[k] || {};
    openModal(`<h2>${esc(role.label)}</h2>
      <div class="two"><div class="field"><label for="sg-n">Họ và tên</label><input class="inp" id="sg-n" value="${esc(s.name || (k === 'receiver' ? cur.info.inspector || '' : ''))}"></div>
      <div class="field"><label for="sg-t">Chức vụ</label><input class="inp" id="sg-t" value="${esc(s.title || '')}"></div></div>
      <canvas class="sigpad" id="sigpad" aria-label="Khung ký tên"></canvas>
      <div class="modal-actions" style="grid-template-columns:1fr 1fr 1fr"><button class="btn" data-act="sig-clear">Xóa nét</button><button class="btn" data-act="close">Hủy</button><button class="btn primary" data-act="sig-save" data-v="${k}">Lưu</button></div>`);
    const cv = document.getElementById('sigpad'); const dpr = window.devicePixelRatio || 1;
    const rect = cv.getBoundingClientRect(); cv.width = rect.width * dpr; cv.height = rect.height * dpr;
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr); ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0b2a66';
    cv._dirty = false; let drawing = false;
    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    cv.addEventListener('pointerdown', (e) => { drawing = true; cv.setPointerCapture(e.pointerId); const [x, y] = pt(e); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + .1, y + .1); ctx.stroke(); cv._dirty = true; });
    cv.addEventListener('pointermove', (e) => { if (!drawing) return; const [x, y] = pt(e); ctx.lineTo(x, y); ctx.stroke(); });
    const end = () => { drawing = false; };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    if (s.img) loadImage(s.img).then((img) => { ctx.drawImage(img, 0, 0, rect.width, rect.height); cv._dirty = true; }).catch(() => {});
  }

  /* ---------------- demo ---------------- */
  async function createDemo() {
    const d = newInspection();
    Object.assign(d.info, {
      project: 'VÍ DỤ – Điện mặt trời áp mái Nhà máy Bao bì An Phát', pcode: 'DEMO-01', type: 'roof',
      address: 'KCN Tân Đức, Đức Hòa, Long An', dc: '998,4', ac: '800', conn: '22 kV', module: 'Mono 580 Wp × 1.722 tấm',
      inverter: '8 × 100 kW string inverter', owner: 'Công ty CP Năng lượng ABC', epc: 'Công ty TNHH Cơ điện XYZ',
      cod: '2026-06-15', weather: 'Nắng, ít mây', irr: '780', temp: '33'
    });
    cur = d;
    let i = 0;
    for (const it of allItems()) {
      i++; if (it.secId === 'TBA' || it.secId === 'HQ') continue;
      d.res[it.c] = { s: i % 11 === 0 ? 'nok' : i % 13 === 0 ? 'na' : 'ok' };
    }
    Object.assign(d.res['DC-04'] = d.res['DC-04'] || {}, { s: 'nok', sev: 'A', note: 'Dãy B3 string 12: connector lai hãng giữa cáp tấm pin và cáp kéo dài, có dấu hiệu biến màu.', resp: 'EPC', due: '2026-12-05' });
    Object.assign(d.res['KC-05'] = d.res['KC-05'] || {}, { s: 'nok', sev: 'B', note: 'Thấm dột tại 3 vị trí bắt vít trục C-D khu xưởng 2.', resp: 'EPC', due: '2026-12-20' });
    Object.assign(d.res['PV-07'] = d.res['PV-07'] || {}, { s: 'nok', sev: 'C', note: 'Bụi dày khu vực gần quạt hút xưởng sơn, đề xuất tăng tần suất vệ sinh.', resp: 'O&M' });
    d.res['DC-12'] = { s: 'ok', val: '≥ 12' }; d.res['TD-03'] = { s: 'ok', val: '2,6' };
    d.res['DD-02'] = { s: 'ok', val: '612.480' };
    cur = null;
    await store.put('insp', d);
    openInsp(d.id);
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act; const c = b.dataset.c; const v = b.dataset.v;
    if (act === 'bg') { if (e.target === b) { if (askResolve) settleAsk(false); else closeModal(); } return; }
    switch (act) {
      case 'up': goUp(); break;
      case 'new': cur = newInspection(); go('info'); break;
      case 'demo': createDemo(); break;
      case 'create': {
        if (!cur.info.project.trim()) { toast('Nhập tên dự án'); document.getElementById('f-project').focus(); return; }
        await store.put('insp', cur); openInsp(cur.id); break;
      }
      case 'open': openInsp(b.dataset.id); break;
      case 'settings': settingsModal(); break;
      case 'save-settings':
        settings.inspector = document.getElementById('s-insp').value.trim();
        settings.om = document.getElementById('s-om').value.trim();
        settings.theme = document.getElementById('s-theme').value;
        settings.geoStamp = document.getElementById('s-geo').value === 'on';
        lsSet('pvho-settings', settings); applyTheme(); closeModal(); toast('Đã lưu cài đặt'); break;
      case 'close': closeModal(); break;
      case 'cam-open': openCamera(c); break;
      case 'cam-close': closeCamera(); break;
      case 'cam-shot': camShot(); break;
      case 'cam-prev': case 'cam-next': {
        const n = cam.items.length; if (!n) break;
        cam.idx = (cam.idx + (act === 'cam-next' ? 1 : -1) + n) % n; camRender(); break;
      }
      case 'cam-st': {
        const it = cam.items[cam.idx]; const r = R(it.c);
        r.s = r.s === v ? undefined : v; if (r.s === 'nok' && !r.sev) r.sev = 'B';
        touch(); camRender(); break;
      }
      case 'cam-torch': {
        const tr = cam.stream && cam.stream.getVideoTracks()[0]; if (!tr) break;
        cam.torch = !cam.torch; tr.applyConstraints({ advanced: [{ torch: cam.torch }] }).catch(() => { cam.torch = false; });
        b.classList.toggle('on', cam.torch); break;
      }
      case 'ask-yes': settleAsk(true); break;
      case 'ask-no': settleAsk(false); break;
      case 'tab': flush(); go('insp', { tab: v }); break;
      case 'sec': go('sec', { sec: v, filter: 'all', q: '' }); break;
      case 'filter': S.filter = v; render(false); break;
      case 'goto': go('sec', { sec: b.dataset.sec, filter: 'all', q: '', focus: 'it-' + c }); break;
      case 'st': {
        const r = R(c);
        r.s = r.s === v ? undefined : v;
        if (r.s === 'nok' && !r.sev) r.sev = 'B';
        if (r.s !== 'nok') openSet.delete(c);
        touch(); refreshItem(c);
        break;
      }
      case 'sev': R(c).sev = v; touch(); refreshItem(c); break;
      case 'hint': hintSet.has(c) ? hintSet.delete(c) : hintSet.add(c); refreshItem(c); break;
      case 'more': openSet.add(c); refreshItem(c); break;
      case 'less': openSet.delete(c); refreshItem(c); break;
      case 'ph-view': viewPhoto(c, b.dataset.id); break;
      case 'ph-del': {
        if (b.dataset.confirm !== '1') { b.dataset.confirm = '1'; b.innerHTML = `${I.trash} Bấm lần nữa để xóa`; return; }
        const r = R(c); r.ph = (r.ph || []).filter((x) => x !== b.dataset.id);
        await store.del('photos', b.dataset.id); photoCache.delete(b.dataset.id); thumbCache.delete(b.dataset.id);
        touch(); closeModal(); if (S.view === 'insp' && S.tab === 'punch') render(false); else refreshItem(c); toast('Đã xóa ảnh'); break;
      }
      case 'sec-na': {
        const its = secItems(secById(S.sec)).filter((it) => !(cur.res[it.c] || {}).s);
        if (!(await ask('Đánh dấu N/A', `${its.length} hạng mục chưa kiểm tra trong nhóm này sẽ được ghi là "Không áp dụng".`))) return;
        its.forEach((it) => { R(it.c).s = 'na'; }); touch(); render(false); break;
      }
      case 'add-item': addItemModal(); break;
      case 'add-item-ok': {
        const t = document.getElementById('ni-t').value.trim(); if (!t) { toast('Nhập nội dung hạng mục'); return; }
        const u = document.getElementById('ni-u').value.trim();
        const nOf = cur.custom.filter((x) => x.sec === S.sec).length + 1;
        let code = `${S.sec}-X${nOf}`; while (cur.custom.some((x) => x.c === code)) code += '_';
        cur.custom.push({ c: code, t, u: u || undefined, sec: S.sec, custom: true });
        touch(); closeModal(); S.focus = 'it-' + code; render(false); break;
      }
      case 'del-item': {
        if (!(await ask('Xóa hạng mục', 'Xóa hạng mục bổ sung này cùng ghi chú và ảnh của nó?', 'Xóa', true))) return;
        for (const id of (cur.res[c] || {}).ph || []) { await store.del('photos', id); photoCache.delete(id); thumbCache.delete(id); }
        cur.custom = cur.custom.filter((x) => x.c !== c); delete cur.res[c]; touch(); render(false); break;
      }
      case 'gps': {
        if (!navigator.geolocation) return toast('Thiết bị không hỗ trợ định vị');
        toast('Đang lấy vị trí…', 8000);
        navigator.geolocation.getCurrentPosition((p) => {
          cur.info.gps = `${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)}`;
          document.getElementById('f-gps').value = cur.info.gps; if (S.view !== 'info') touch(); toast('Đã lấy tọa độ');
        }, () => toast('Không lấy được vị trí – kiểm tra quyền truy cập vị trí'), { enableHighAccuracy: true, timeout: 15000 });
        break;
      }
      case 'export-json': exportJSON(); break;
      case 'export-xlsx': exportXLSX(); break;
      case 'copy-csv': copyText(csvText('\t'), 'Đã sao chép – dán vào Excel / Google Sheets'); break;
      case 'share-html': shareOrDownload(new Blob([standaloneHTML()], { type: 'text/html' }), baseName() + '.html', PURPOSE[cur.info.purpose || 'handover'].title); break;
      case 'print': doPrint(); break;
      case 'export-pdf': exportPDF(); break;
      case 'pdf-share': pdfShare(); break;
      case 'pdf-download': if (pdfOut) { download(pdfOut.blob, pdfOut.name); toast('Đã tải file: ' + pdfOut.name); } break;
      case 'pdf-open': pdfOpen(); break;
      case 'reload': await flush(); location.reload(); break;
      case 'copy-summary': copyText(summaryText(false), 'Đã sao chép tóm tắt'); break;
      case 'copy-punch': copyText(summaryText(true), 'Đã sao chép danh sách tồn tại'); break;
      case 'sign': signModal(v); break;
      case 'sig-clear': { const cv = document.getElementById('sigpad'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); cv._dirty = false; break; }
      case 'sig-save': {
        const cv = document.getElementById('sigpad');
        cur.sign[v] = { name: document.getElementById('sg-n').value.trim(), title: document.getElementById('sg-t').value.trim(), img: cv._dirty ? cv.toDataURL('image/png') : '', ts: Date.now() };
        touch(); closeModal(); render(false); break;
      }
      case 'dup': {
        const d = newInspection();
        d.info = Object.assign({}, cur.info, { date: todayISO(), project: cur.info.project });
        d.custom = JSON.parse(JSON.stringify(cur.custom || []));
        await flush(); await store.put('insp', d); toast('Đã tạo biên bản mới từ mẫu'); openInsp(d.id); break;
      }
      case 'delete': {
        if (!(await ask('Xóa biên bản', `Xóa vĩnh viễn "${cur.info.project}" cùng toàn bộ ảnh trên máy này? Nên sao lưu trước.`, 'Xóa', true))) return;
        const id = cur.id; clearTimeout(saveT); cur = null;
        for (const p of await store.photosOf(id)) await store.del('photos', p.id);
        await store.del('insp', id); toast('Đã xóa biên bản'); loadHome(); break;
      }
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.f && t.dataset.c) { R(t.dataset.c)[t.dataset.f] = t.value; touch(); }
    else if (t.dataset.info) { cur.info[t.dataset.info] = t.value; if (S.view !== 'info') touch(); }
    else if (t.hasAttribute('data-vnote')) { cur.verdict.note = t.value; touch(); }
    else if (t.hasAttribute('data-search')) {
      S.q = t.value; clearTimeout(S._qt);
      S._qt = setTimeout(() => { const pos = t.selectionStart; render(false); const n = document.getElementById('q'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) { /* ignore */ } } }, 250);
    }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.photo) { const fs = [...t.files]; t.value = ''; if (document.getElementById('cam')) closeCamera(); addPhotos(t.dataset.photo, fs, t.dataset.src); }
    else if (t.hasAttribute('data-import')) { if (t.files[0]) importJSON(t.files[0]); t.value = ''; }
    else if (t.hasAttribute('data-verdict')) { cur.verdict.v = t.value; touch(); render(false); }
    else if (t.dataset.info === 'type' || t.dataset.info === 'purpose') { cur.info[t.dataset.info] = t.value; if (S.view !== 'info') { touch(); } }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $modal.innerHTML) { if (askResolve) settleAsk(false); else closeModal(); }
  });

  /* ---------------- report CSS (shared by preview, print & HTML export) ---------------- */
  const REPORT_CSS = `
.rpt{font:12.5px/1.5 var(--f-body);color:#111;background:#fff;padding:18px;min-width:640px}
.rpt .rpt-head{border:0;margin-bottom:8px;border-bottom:2px solid #f2b80f}
.rpt .rpt-head td{border:0;vertical-align:middle}
.rpt .rh-org{width:46%;font-weight:700;color:#190d82;font-size:13px}
.rpt .rh-org{display:flex;align-items:center;gap:10px}
.rpt .rpt-logo{width:54px;height:54px;flex:none}
.rpt .rh-nat{text-align:center}
.rpt h1{font-size:21px;text-align:center;margin:14px 0 4px;text-transform:uppercase;letter-spacing:.02em;color:#190d82;text-wrap:balance}
.rpt .rpt-sub{text-align:center;color:#444;margin:0 0 14px;font-size:13.5px}
.rpt h2{font-size:15px;margin:20px 0 8px;padding:7px 10px;background:#190d82;color:#fff;text-transform:uppercase;letter-spacing:.03em;border-left:6px solid #f2b80f}
.rpt h2.appx{margin-top:28px}
.rpt table{width:100%;border-collapse:collapse}
.rpt th,.rpt td{border:1px solid #c4c2dc;padding:5px 7px;vertical-align:top;text-align:left}
.rpt th{background:#ecebf7;font-weight:600}
.rpt td.c,.rpt th.c,.rpt .sum td,.rpt .sum th{text-align:center}
.rpt .code{font-family:var(--f-mono);white-space:nowrap;font-size:11.5px}
.rpt .r-ok{color:#17803f;font-weight:700}.rpt .r-nok{color:#c3281f;font-weight:700}.rpt .r-na{color:#66748a}.rpt .r-none{color:#a06a00}
.rpt .info td:nth-child(odd){width:20%;background:#f6f6fb;font-weight:600}
.rpt tr.part td{background:#190d82;color:#fff;font-weight:700;letter-spacing:.03em}
.rpt tr.grp td{background:#fbf7e6;color:#5a4500;font-weight:600;font-size:11.5px;padding:3px 7px}
.rpt .sev{display:inline-block;padding:0 7px;border-radius:4px;color:#fff;font-weight:700;font-family:var(--f-mono)}
.rpt .sev.A{background:#c3281f}.rpt .sev.B{background:#c26a00}.rpt .sev.C{background:#1f5fc2}
.rpt .verdict-p{border:2px solid #190d82;padding:10px 12px;margin-top:6px;font-size:14px}
.rpt .signs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;text-align:center}
.rpt .signs img{max-height:70px;max-width:100%;display:block;margin:6px auto}
.rpt .signs .sp{height:76px}
.rpt .ph-page{padding:14px 0 18px;border-top:1px dashed #c4c2dc}
.rpt .ph-page.first{border-top:0}
.rpt .ph-eyebrow{margin:0;color:#666;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.rpt .ph-title{margin:4px 0 6px;font-size:18px;line-height:1.35;color:#190d82;text-wrap:balance}
.rpt .ph-title .sev{font-size:15px;vertical-align:2px}
.rpt .ph-note{margin:0 0 4px;font-size:14px}
.rpt .ph-meta{margin:0 0 10px;color:#555;font-size:12.5px}
.rpt .ph-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;border-top:2px solid #f2b80f;padding-top:10px}
.rpt .ph-grid.n1,.rpt .ph-grid.n2{grid-template-columns:1fr}
.rpt .ph-grid img{width:100%;height:auto;max-height:520px;object-fit:contain;background:#f3f3f8;border:1px solid #c4c2dc}
.rpt .foot{margin-top:16px;color:#666;font-size:11px;text-align:center}
@media print{.rpt .ph-page{break-before:page;border-top:0;padding-top:0}.rpt h2.appx{break-before:page}.rpt h2.appx+.ph-page{break-before:auto}
.rpt .ph-grid img{max-height:105mm}.rpt .ph-grid.n1 img{max-height:200mm}.rpt .ph-grid.n2 img{max-height:105mm}}`;

  /* ---------------- boot ---------------- */
  (async function boot() {
    const st = document.createElement('style'); st.textContent = REPORT_CSS; document.head.appendChild(st);
    applyTheme();
    await store.open();
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* ignore */ }
    if (!ARTIFACT && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register('sw.js').catch(() => {});
      // Có bản mới: báo để người dùng tải lại. Dữ liệu đã lưu trong máy không bị ảnh hưởng.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController || document.getElementById('update-bar')) return;
        const bar = document.createElement('div'); bar.id = 'update-bar'; bar.className = 'update-bar';
        bar.innerHTML = '<span>Đã có phiên bản mới của ứng dụng.</span><button class="btn sun" data-act="reload">Cập nhật</button>';
        document.body.appendChild(bar);
      });
    }
    loadHome();
  })();
})();
