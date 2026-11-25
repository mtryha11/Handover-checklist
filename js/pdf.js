/* Tạo file PDF biên bản trực tiếp trên điện thoại (không cần hộp thoại In).
 * Dùng jsPDF + AutoTable + font Noto Sans (tiếng Việt), tải lười khi bấm "Xuất PDF".
 *   PVHO_PDF.build(model) -> Promise<Blob>   (model do app.js tạo: reportModel())
 *
 * Bố cục: phần chính (thông tin, tổng hợp, tồn tại, kết luận + chữ ký), sau đó các phụ lục:
 * bảng chi tiết, ảnh tồn tại và ảnh hiện trường khác (mỗi hạng mục một trang).
 */
(function () {
  'use strict';
  // Màu nhận diện Raitek
  const INDIGO = [25, 13, 130];
  const GOLD = [242, 184, 15];
  const TINT = [236, 235, 247];
  const GRID = [196, 194, 220];
  const SEVC = { A: [195, 40, 31], B: [194, 106, 0], C: [31, 95, 194] };
  const STC = { ok: [23, 128, 63], nok: [195, 40, 31], na: [102, 116, 138], none: [160, 106, 0] };

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res;
      s.onerror = () => rej(new Error('Không tải được ' + src)); document.head.appendChild(s);
    });
  }
  async function ensureLibs() {
    if (!(window.jspdf && window.jspdf.jsPDF)) await loadScript('js/vendor/jspdf.umd.min.js');
    if (!window.autoTable) await loadScript('js/vendor/jspdf.plugin.autotable.min.js');
    if (!window.PVHO_PDF_FONTS) await loadScript('js/vendor/pdf-fonts.js');
  }
  // Font PDF thiếu ≥ ≤ →: thay bằng ký tự tương đương.
  const fx = (s) => String(s == null ? '' : s).normalize('NFC').replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/→/g, '->').replace(/Ω/g, 'Ω');
  function imgInfo(src) {
    return new Promise((res) => {
      const i = new Image();
      i.onload = () => res({ src, w: i.naturalWidth || 4, h: i.naturalHeight || 3 });
      i.onerror = () => res(null); i.src = src;
    });
  }
  const fmtOf = (src) => /^data:image\/png/i.test(src) ? 'PNG' : 'JPEG';

  async function build(m) {
    await ensureLibs();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    doc.addFileToVFS('NS-R.ttf', window.PVHO_PDF_FONTS.regular); doc.addFont('NS-R.ttf', 'NS', 'normal');
    doc.addFileToVFS('NS-B.ttf', window.PVHO_PDF_FONTS.bold); doc.addFont('NS-B.ttf', 'NS', 'bold');
    doc.setFont('NS', 'normal'); doc.setLineHeightFactor(1.3);
    const logo = window.RAITEK_LOGO ? await imgInfo(window.RAITEK_LOGO) : null;

    const PW = 210, PH = 297, M = 13, CW = PW - 2 * M, BOTTOM = PH - 16;
    let y = M;
    const newPage = () => { doc.addPage(); y = M; };
    const ensure = (h) => { if (y + h > BOTTOM) newPage(); };
    const lh = (size) => size * 0.3528 * 1.3; // pt -> mm, kèm giãn dòng
    const lines = (t, size, bold, w) => { doc.setFont('NS', bold ? 'bold' : 'normal'); doc.setFontSize(size); return doc.splitTextToSize(fx(t), w); };
    function write(ls, x, size, bold, color, align) {
      doc.setFont('NS', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
      doc.text(ls, x, y + lh(size) * 0.78, { align: align || 'left', lineHeightFactor: 1.3 });
      y += ls.length * lh(size);
    }
    function para(t, { size = 10, bold = false, color = [25, 25, 35], align = 'left', gap = 1.5 } = {}) {
      const ls = lines(t, size, bold, CW); ensure(ls.length * lh(size));
      write(ls, align === 'center' ? PW / 2 : M, size, bold, color, align); y += gap;
    }
    // Tiêu đề mục: dải chàm, vạch vàng bên trái. need = chỗ chừa cho nội dung đầu tiên.
    function heading(t, need = 32) {
      ensure(need + 13);
      y += 3;
      doc.setFillColor(...INDIGO); doc.rect(M, y, CW, 8.5, 'F');
      doc.setFillColor(...GOLD); doc.rect(M, y, 2.2, 8.5, 'F');
      doc.setFont('NS', 'bold'); doc.setFontSize(11.5); doc.setTextColor(255, 255, 255);
      doc.text(fx(t).toUpperCase(), M + 5, y + 5.9);
      y += 11;
    }
    function table(opts) {
      window.autoTable(doc, Object.assign({
        startY: y, margin: { left: M, right: M, top: M, bottom: PH - BOTTOM }, theme: 'grid',
        styles: { font: 'NS', fontSize: 9, cellPadding: 1.6, lineColor: GRID, lineWidth: 0.2, textColor: [25, 25, 35], overflow: 'linebreak', valign: 'top' },
        headStyles: { fillColor: TINT, textColor: INDIGO, fontStyle: 'bold', valign: 'middle' },
        rowPageBreak: 'avoid'
      }, opts));
      y = doc.lastAutoTable.finalY + 3.5;
    }

    // Một hạng mục ảnh = một trang (tối đa 4 ảnh/trang, nhiều hơn thì sang trang "tiếp").
    async function photoPages(appxTitle, items) {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const imgs = (await Promise.all(it.photos.map(imgInfo))).filter(Boolean);
        for (let c = 0; c < imgs.length; c += 4) {
          newPage();
          if (i === 0 && c === 0) heading(appxTitle, 0);
          photoHeader(it, c > 0);
          photoGrid(imgs.slice(c, c + 4));
        }
      }
    }
    function photoHeader(it, cont) {
      doc.setFont('NS', 'bold'); doc.setFontSize(9); doc.setTextColor(110, 110, 130);
      doc.text(fx(it.eyebrow + (cont ? ' (tiếp)' : '')).toUpperCase(), M, y + 3); y += 6;
      let tx = M;
      if (it.sev) {
        doc.setFillColor(...SEVC[it.sev]); doc.roundedRect(M, y + 0.4, 9, 6.6, 1, 1, 'F');
        doc.setFont('NS', 'bold'); doc.setFontSize(12); doc.setTextColor(255, 255, 255);
        doc.text(it.sev, M + 4.5, y + 5.3, { align: 'center' });
        tx = M + 12;
      }
      write(lines(it.title, 14, true, CW - (tx - M)), tx, 14, true, INDIGO); y += 1.5;
      if (it.note) { write(lines(it.note, 11, false, CW), M, 11, false, [30, 30, 40]); y += 1; }
      if (it.meta) { write(lines(it.meta, 9.5, false, CW), M, 9.5, false, [90, 90, 110]); }
      y += 2;
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.8); doc.line(M, y, PW - M, y);
      y += 4;
    }
    // Chọn lưới 1 hoặc 2 cột cho diện tích ảnh hiển thị lớn nhất trong phần trang còn lại.
    function photoGrid(imgs) {
      const H = BOTTOM - y, gap = 4;
      let best = null;
      for (const cols of [1, 2]) {
        if (cols > imgs.length) continue;
        const rows = Math.ceil(imgs.length / cols);
        const cw = (CW - gap * (cols - 1)) / cols, ch = (H - gap * (rows - 1)) / rows;
        const fit = imgs.map((im) => { const sc = Math.min(cw / im.w, ch / im.h); return { w: im.w * sc, h: im.h * sc }; });
        const area = fit.reduce((a, f) => a + f.w * f.h, 0);
        if (!best || area > best.area) best = { cols, rows, cw, ch, fit, area };
      }
      // Xếp các hàng sát nhau từ trên xuống (chiều cao hàng = ảnh cao nhất trong hàng).
      let yy = y;
      for (let r = 0; r < best.rows; r++) {
        const row = imgs.slice(r * best.cols, r * best.cols + best.cols);
        const fits = best.fit.slice(r * best.cols, r * best.cols + row.length);
        const rowH = Math.max(...fits.map((f) => f.h));
        const rowW = row.length * best.cw + (row.length - 1) * gap;
        row.forEach((im, cc) => {
          const f = fits[cc];
          const x0 = M + (CW - rowW) / 2 + cc * (best.cw + gap) + (best.cw - f.w) / 2;
          try { doc.addImage(im.src, fmtOf(im.src), x0, yy, f.w, f.h, undefined, 'FAST'); } catch (e) { /* bỏ qua ảnh lỗi */ }
          doc.setDrawColor(...GRID); doc.setLineWidth(0.25); doc.rect(x0, yy, f.w, f.h);
        });
        yy += rowH + gap;
      }
      y = BOTTOM;
    }

    /* ----- đầu trang: logo + đơn vị | quốc hiệu ----- */
    const top = y;
    if (logo) { try { doc.addImage(logo.src, 'PNG', M, top, 17, 17); } catch (e) { /* ignore */ } }
    const orgX = M + (logo ? 20 : 0);
    doc.setFont('NS', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...INDIGO);
    const orgL = doc.splitTextToSize(fx(m.om || 'RAITEK'), 72);
    doc.text(orgL, orgX, top + 8.5 - (orgL.length - 1) * lh(10.5) / 2, { lineHeightFactor: 1.3 });
    doc.setTextColor(25, 25, 35); doc.setFontSize(10);
    doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', PW - M - 48, top + 5, { align: 'center' });
    doc.text('Độc lập – Tự do – Hạnh phúc', PW - M - 48, top + 10, { align: 'center' });
    doc.setDrawColor(25, 25, 35); doc.setLineWidth(0.3); doc.line(PW - M - 70, top + 11.6, PW - M - 26, top + 11.6);
    y = top + 20;
    doc.setDrawColor(...GOLD); doc.setLineWidth(1); doc.line(M, y, PW - M, y);
    y += 7;
    para(m.title.toUpperCase(), { size: 16, bold: true, align: 'center', color: INDIGO, gap: 1.5 });
    para(m.sub, { size: 11, align: 'center', color: [70, 70, 90], gap: 4 });

    let k = 1;
    /* ----- 1. thông tin chung ----- */
    heading(`${k++}. Thông tin chung`);
    const infoBody = [];
    for (let i = 0; i < m.info.length; i += 2) infoBody.push([fx(m.info[i][0]), fx(m.info[i][1]), fx((m.info[i + 1] || [])[0] || ''), fx((m.info[i + 1] || [])[1] || '')]);
    if (m.team) infoBody.push([fx('Thành phần tham gia'), { content: fx(m.team), colSpan: 3 }]);
    const lab = { fontStyle: 'bold', fillColor: [246, 246, 251], cellWidth: 33 };
    table({ body: infoBody, columnStyles: { 0: lab, 2: lab } });

    /* ----- 2. tổng hợp ----- */
    heading(`${k++}. Tổng hợp kết quả`);
    const c = { halign: 'center', cellWidth: 17 };
    table({
      head: [['Nhóm hạng mục', 'Tổng', 'Đạt', 'Không đạt', 'N/A', 'Chưa KT']],
      body: m.summary.map((r) => r.map(fx)).concat([[{ content: 'Tổng cộng', styles: { fontStyle: 'bold' } }].concat(m.totals.map((v) => ({ content: String(v), styles: { fontStyle: 'bold' } })))]),
      columnStyles: { 1: c, 2: c, 3: { halign: 'center', cellWidth: 21 }, 4: c, 5: c }
    });
    para(m.sevLine, { size: 9, color: [70, 70, 90], gap: 2 });

    /* ----- 3. danh sách tồn tại ----- */
    heading(`${k++}. Danh sách tồn tại`);
    if (m.punch.length) {
      table({
        head: [['TT', 'Mã', 'Nội dung tồn tại', 'Mức', 'Trách nhiệm', 'Hạn', 'Ảnh']],
        body: m.punch.map((p) => [
          String(p.no), fx(p.c),
          { content: fx(p.t) + (p.note ? '\n' + fx(p.note) : '') + (p.val ? '\nGiá trị đo: ' + fx(p.val) : '') },
          { content: p.sev, styles: { fillColor: SEVC[p.sev], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' } },
          fx(p.resp), fx(p.due), p.photos.length ? String(p.photos.length) : ''
        ]),
        columnStyles: { 0: { halign: 'center', cellWidth: 9 }, 1: { cellWidth: 17 }, 3: { cellWidth: 11 }, 4: { cellWidth: 25 }, 5: { cellWidth: 21, halign: 'center' }, 6: { cellWidth: 11, halign: 'center' } }
      });
    } else para('Không ghi nhận tồn tại.');

    /* ----- 4. kết luận + chữ ký (luôn cùng trang) ----- */
    const vL = lines(m.verdict, 12, true, CW - 8);
    const nL = m.verdictNote ? lines(m.verdictNote, 10, false, CW - 8) : [];
    const boxH = vL.length * lh(12) + nL.length * lh(10) + 6;
    heading(`${k++}. Kết luận`, boxH + 64);
    doc.setDrawColor(...INDIGO); doc.setLineWidth(0.6); doc.rect(M, y, CW, boxH);
    doc.setFillColor(...GOLD); doc.rect(M, y, 2, boxH, 'F');
    const by = y; y += 3;
    write(vL, M + 5, 12, true, INDIGO);
    if (nL.length) write(nL, M + 5, 10, false, [30, 30, 40]);
    y = by + boxH + 7;

    const sw = CW / 3;
    const sigImgs = await Promise.all(m.signs.map((s) => s.img ? imgInfo(s.img) : null));
    m.signs.forEach((s, i) => {
      const cx = M + sw * i + sw / 2; let yy = y;
      doc.setFont('NS', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...INDIGO);
      const l1 = doc.splitTextToSize(fx(s.label.toUpperCase()), sw - 4); doc.text(l1, cx, yy + 3, { align: 'center', lineHeightFactor: 1.3 }); yy += l1.length * lh(9.5);
      doc.setFont('NS', 'normal'); doc.setTextColor(25, 25, 35);
      if (s.org) { const l2 = doc.splitTextToSize(fx(s.org), sw - 4); doc.text(l2, cx, yy + 3, { align: 'center', lineHeightFactor: 1.3 }); yy += l2.length * lh(9.5); }
      doc.setFontSize(8); doc.setTextColor(120, 120, 130); doc.text('(Ký, ghi rõ họ tên)', cx, yy + 3, { align: 'center' }); yy += 4.5;
      const im = sigImgs[i];
      if (im) { let h = 20, w = h * im.w / im.h; if (w > sw - 6) { w = sw - 6; h = w * im.h / im.w; } try { doc.addImage(im.src, fmtOf(im.src), cx - w / 2, yy + 1, w, h); } catch (e) { /* ignore */ } }
      yy += 23;
      doc.setFont('NS', 'bold'); doc.setFontSize(10); doc.setTextColor(25, 25, 35);
      if (s.name) { doc.text(fx(s.name), cx, yy + 3, { align: 'center' }); yy += lh(10); }
      if (s.title) { doc.setFont('NS', 'normal'); doc.setFontSize(9); doc.text(fx(s.title), cx, yy + 3, { align: 'center' }); }
    });
    y += 54;

    /* ----- phụ lục ----- */
    let ax = 1;
    newPage();
    heading(`Phụ lục ${ax++}. Chi tiết kết quả kiểm tra`);
    const body = [];
    for (const sec of m.detail) {
      body.push([{ content: fx(sec.title), colSpan: 5, styles: { fontStyle: 'bold', fillColor: TINT, textColor: INDIGO } }]);
      for (const r of sec.rows) {
        body.push([fx(r.c), fx(r.t),
          { content: fx(r.res) + (r.sev ? ` (${r.sev})` : ''), styles: { textColor: STC[r.s || 'none'], fontStyle: r.s === 'na' ? 'normal' : 'bold', halign: 'center' } },
          { content: fx(r.val), styles: { halign: 'center' } }, fx(r.note)]);
      }
    }
    table({
      head: [['Mã', 'Nội dung kiểm tra', 'Kết quả', 'Giá trị đo', 'Ghi chú']], body,
      columnStyles: { 0: { cellWidth: 16 }, 2: { cellWidth: 21 }, 3: { cellWidth: 22 }, 4: { cellWidth: 48 } }
    });

    const withPh = m.punch.filter((p) => p.photos.length);
    if (withPh.length) {
      await photoPages(`Phụ lục ${ax++}. Hình ảnh tồn tại`, withPh.map((p) => ({
        eyebrow: `Tồn tại ${p.no}/${m.punch.length} · ${p.c}`, title: p.t, note: p.note, sev: p.sev, photos: p.photos,
        meta: [p.resp ? 'Trách nhiệm: ' + p.resp : '', p.due ? 'Hạn khắc phục: ' + p.due : '', p.val ? 'Giá trị đo: ' + p.val : ''].filter(Boolean).join('  ·  ')
      })));
    }
    if (m.appendix.length) {
      await photoPages(`Phụ lục ${ax++}. Hình ảnh hiện trường khác`, m.appendix.map((a) => ({ eyebrow: a.c, title: a.t, note: a.note, photos: a.photos })));
    }

    /* ----- chân trang ----- */
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i);
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.6); doc.line(M, PH - 12, PW - M, PH - 12);
      if (logo && i > 1) { try { doc.addImage(logo.src, 'PNG', M, PH - 10.2, 5, 5); } catch (e) { /* ignore */ } }
      doc.setFont('NS', 'normal'); doc.setFontSize(8); doc.setTextColor(110, 110, 130);
      doc.text(doc.splitTextToSize(fx(m.footer), CW - 32)[0], M + (logo && i > 1 ? 7 : 0), PH - 6.8);
      doc.text(`Trang ${i}/${n}`, PW - M, PH - 6.8, { align: 'right' });
    }
    return doc.output('blob');
  }

  window.PVHO_PDF = { build };
})();
