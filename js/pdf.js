/* Tạo file PDF biên bản trực tiếp trên điện thoại (không cần hộp thoại In).
 * Dùng jsPDF + AutoTable + font Noto Sans (tiếng Việt), tải lười khi bấm "Xuất PDF".
 *   PVHO_PDF.build(model) -> Promise<Blob>   (model do app.js tạo: reportModel())
 */
(function () {
  'use strict';
  const NAVY = [18, 58, 107];
  const GRID = [184, 194, 208];
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

    const PW = 210, PH = 297, M = 12, CW = PW - 2 * M, BOTTOM = PH - 15;
    let y = M;
    const ensure = (h) => { if (y + h > BOTTOM) { doc.addPage(); y = M; } };
    const lh = (size) => size * 0.3528 * 1.3; // pt -> mm, kèm giãn dòng
    function para(t, { size = 9, bold = false, color = [20, 20, 20], align = 'left', x = M, w = CW, gap = 1.5 } = {}) {
      doc.setFont('NS', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
      const lines = doc.splitTextToSize(fx(t), w);
      ensure(lines.length * lh(size));
      const ax = align === 'center' ? x + w / 2 : x;
      doc.text(lines, ax, y + lh(size) * 0.78, { align, lineHeightFactor: 1.3 });
      y += lines.length * lh(size) + gap;
    }
    // need: chừa chỗ cho phần nội dung đầu tiên để tiêu đề không bị rơi một mình cuối trang.
    function heading(t, need = 30) {
      ensure(need + 11);
      y += 2;
      doc.setFillColor(...NAVY); doc.rect(M, y, CW, 7, 'F');
      doc.setFont('NS', 'bold'); doc.setFontSize(9.5); doc.setTextColor(255, 255, 255);
      doc.text(fx(t).toUpperCase(), M + 2.2, y + 4.8);
      y += 9;
    }
    function table(opts) {
      window.autoTable(doc, Object.assign({
        startY: y, margin: { left: M, right: M, top: M, bottom: PH - BOTTOM }, theme: 'grid',
        styles: { font: 'NS', fontSize: 8.3, cellPadding: 1.4, lineColor: GRID, lineWidth: 0.2, textColor: [20, 20, 20], overflow: 'linebreak', valign: 'top' },
        headStyles: { fillColor: [238, 242, 247], textColor: [20, 20, 20], fontStyle: 'bold', valign: 'middle' },
        rowPageBreak: 'avoid'
      }, opts));
      y = doc.lastAutoTable.finalY + 3;
    }
    // Lưới ảnh 2 cột, ảnh lớn giữ nguyên tỉ lệ. caption giữ cùng trang với hàng ảnh đầu.
    async function photoBlock(caption, note, srcs, sev) {
      const imgs = (await Promise.all(srcs.map(imgInfo))).filter(Boolean);
      if (!imgs.length) return;
      const colW = (CW - 4) / 2, maxH = 92;
      const rows = [];
      for (let i = 0; i < imgs.length; i += 2) {
        const pair = imgs.slice(i, i + 2).map((im) => {
          let w = colW, h = colW * im.h / im.w;
          if (h > maxH) { h = maxH; w = maxH * im.w / im.h; }
          return Object.assign({ dw: w, dh: h }, im);
        });
        rows.push({ pair, h: Math.max(...pair.map((p) => p.dh)) });
      }
      doc.setFont('NS', 'bold'); doc.setFontSize(9);
      const capLines = doc.splitTextToSize(fx(caption), CW - (sev ? 9 : 0));
      doc.setFont('NS', 'normal'); doc.setFontSize(8.5);
      const noteLines = note ? doc.splitTextToSize(fx(note), CW) : [];
      const capH = capLines.length * lh(9) + noteLines.length * lh(8.5) + 2;
      ensure(capH + rows[0].h + 3);
      let cx = M;
      if (sev) {
        doc.setFillColor(...SEVC[sev]); doc.roundedRect(M, y + 0.3, 6.5, 4.4, 0.8, 0.8, 'F');
        doc.setFont('NS', 'bold'); doc.setFontSize(8.5); doc.setTextColor(255, 255, 255); doc.text(sev, M + 3.25, y + 3.5, { align: 'center' });
        cx = M + 9;
      }
      doc.setFont('NS', 'bold'); doc.setFontSize(9); doc.setTextColor(20, 20, 20);
      doc.text(capLines, cx, y + lh(9) * 0.78, { lineHeightFactor: 1.3 }); y += capLines.length * lh(9);
      if (noteLines.length) {
        doc.setFont('NS', 'normal'); doc.setFontSize(8.5); doc.setTextColor(60, 60, 60);
        doc.text(noteLines, M, y + lh(8.5) * 0.78, { lineHeightFactor: 1.3 }); y += noteLines.length * lh(8.5);
      }
      y += 2;
      rows.forEach((r, ri) => {
        if (ri) ensure(r.h + 3);
        r.pair.forEach((p, i) => {
          const x0 = M + i * (colW + 4) + (colW - p.dw) / 2;
          try { doc.addImage(p.src, fmtOf(p.src), x0, y, p.dw, p.dh, undefined, 'FAST'); } catch (e) { /* bỏ qua ảnh lỗi */ }
          doc.setDrawColor(...GRID); doc.setLineWidth(0.2); doc.rect(x0, y, p.dw, p.dh);
        });
        y += r.h + 3;
      });
      y += 2;
    }

    /* ----- đầu trang ----- */
    doc.setFont('NS', 'bold'); doc.setFontSize(9.5); doc.setTextColor(20, 20, 20);
    const omLines = doc.splitTextToSize(fx(m.om || ''), 80);
    doc.text(omLines, M + 40, y + 3.5, { align: 'center', lineHeightFactor: 1.3 });
    doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', PW - M - 50, y + 3.5, { align: 'center' });
    doc.text('Độc lập – Tự do – Hạnh phúc', PW - M - 50, y + 8.2, { align: 'center' });
    doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.3); doc.line(PW - M - 72, y + 9.6, PW - M - 28, y + 9.6);
    y += Math.max(14, omLines.length * lh(9.5) + 4);
    para(m.title.toUpperCase(), { size: 14, bold: true, align: 'center', gap: 1 });
    para(m.sub, { size: 9.5, align: 'center', color: [60, 60, 60], gap: 3 });

    let k = 1;
    /* ----- 1. thông tin chung ----- */
    heading(`${k++}. Thông tin chung`);
    const infoBody = [];
    for (let i = 0; i < m.info.length; i += 2) infoBody.push([fx(m.info[i][0]), fx(m.info[i][1]), fx((m.info[i + 1] || [])[0] || ''), fx((m.info[i + 1] || [])[1] || '')]);
    if (m.team) infoBody.push([fx('Thành phần tham gia'), { content: fx(m.team), colSpan: 3 }]);
    const lab = { fontStyle: 'bold', fillColor: [246, 248, 251], cellWidth: 32 };
    table({ body: infoBody, columnStyles: { 0: lab, 2: lab } });

    /* ----- 2. tổng hợp ----- */
    heading(`${k++}. Tổng hợp kết quả`);
    const c = { halign: 'center', cellWidth: 17 };
    table({
      head: [['Nhóm hạng mục', 'Tổng', 'Đạt', 'Không đạt', 'N/A', 'Chưa KT']],
      body: m.summary.map((r) => r.map(fx)).concat([[{ content: 'Tổng cộng', styles: { fontStyle: 'bold' } }].concat(m.totals.map((v) => ({ content: String(v), styles: { fontStyle: 'bold' } })))]),
      columnStyles: { 1: c, 2: c, 3: { halign: 'center', cellWidth: 20 }, 4: c, 5: c },
      headStyles: { halign: 'center', fillColor: [238, 242, 247], textColor: [20, 20, 20], fontStyle: 'bold' }
    });
    para(m.sevLine, { size: 8.3, color: [60, 60, 60], gap: 2 });

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
        columnStyles: { 0: { halign: 'center', cellWidth: 8 }, 1: { cellWidth: 16 }, 3: { cellWidth: 10 }, 4: { cellWidth: 24 }, 5: { cellWidth: 19, halign: 'center' }, 6: { cellWidth: 10, halign: 'center' } }
      });
    } else para('Không ghi nhận tồn tại.', { size: 9 });

    /* ----- 4. hình ảnh tồn tại ----- */
    const withPh = m.punch.filter((p) => p.photos.length);
    if (withPh.length) {
      heading(`${k++}. Hình ảnh tồn tại`, 100);
      for (const p of withPh) await photoBlock(`${p.no}. ${p.c} – ${p.t}`, p.note, p.photos, p.sev);
    }

    /* ----- 5. kết luận + chữ ký ----- */
    doc.setFont('NS', 'bold'); doc.setFontSize(10);
    const vLines = doc.splitTextToSize(fx(m.verdict), CW - 6);
    doc.setFont('NS', 'normal'); doc.setFontSize(9);
    const nLines = m.verdictNote ? doc.splitTextToSize(fx(m.verdictNote), CW - 6) : [];
    const boxH = vLines.length * lh(10) + nLines.length * lh(9) + 5;
    heading(`${k++}. Kết luận`, boxH + 60); // khung kết luận + chữ ký luôn cùng một trang
    doc.setDrawColor(...NAVY); doc.setLineWidth(0.5); doc.rect(M, y, CW, boxH);
    doc.setFont('NS', 'bold'); doc.setFontSize(10); doc.setTextColor(20, 20, 20);
    doc.text(vLines, M + 3, y + 2.5 + lh(10) * 0.78, { lineHeightFactor: 1.3 });
    if (nLines.length) { doc.setFont('NS', 'normal'); doc.setFontSize(9); doc.text(nLines, M + 3, y + 2.5 + vLines.length * lh(10) + lh(9) * 0.78, { lineHeightFactor: 1.3 }); }
    y += boxH + 6;

    ensure(56);
    const sw = CW / 3;
    const sigImgs = await Promise.all(m.signs.map((s) => s.img ? imgInfo(s.img) : null));
    m.signs.forEach((s, i) => {
      const cx = M + sw * i + sw / 2; let yy = y;
      doc.setFont('NS', 'bold'); doc.setFontSize(8.5); doc.setTextColor(20, 20, 20);
      const l1 = doc.splitTextToSize(fx(s.label.toUpperCase()), sw - 4); doc.text(l1, cx, yy + 3, { align: 'center', lineHeightFactor: 1.3 }); yy += l1.length * lh(8.5);
      doc.setFont('NS', 'normal');
      if (s.org) { const l2 = doc.splitTextToSize(fx(s.org), sw - 4); doc.text(l2, cx, yy + 3, { align: 'center', lineHeightFactor: 1.3 }); yy += l2.length * lh(8.5); }
      doc.setFontSize(7.5); doc.setTextColor(110, 110, 110); doc.text('(Ký, ghi rõ họ tên)', cx, yy + 3, { align: 'center' }); yy += 4.5;
      const im = sigImgs[i];
      if (im) { let h = 20, w = h * im.w / im.h; if (w > sw - 6) { w = sw - 6; h = w * im.h / im.w; } try { doc.addImage(im.src, fmtOf(im.src), cx - w / 2, yy + 1, w, h); } catch (e) { /* ignore */ } }
      yy += 23;
      doc.setFont('NS', 'bold'); doc.setFontSize(9); doc.setTextColor(20, 20, 20);
      if (s.name) { doc.text(fx(s.name), cx, yy + 3, { align: 'center' }); yy += lh(9); }
      if (s.title) { doc.setFont('NS', 'normal'); doc.setFontSize(8.5); doc.text(fx(s.title), cx, yy + 3, { align: 'center' }); }
    });
    y += 52;

    /* ----- 6. chi tiết ----- */
    heading(`${k++}. Chi tiết kết quả kiểm tra`);
    const body = [];
    for (const sec of m.detail) {
      body.push([{ content: fx(sec.title), colSpan: 5, styles: { fontStyle: 'bold', fillColor: [238, 242, 247] } }]);
      for (const r of sec.rows) {
        body.push([fx(r.c), fx(r.t),
          { content: fx(r.res) + (r.sev ? ` (${r.sev})` : ''), styles: { textColor: STC[r.s || 'none'], fontStyle: r.s === 'na' ? 'normal' : 'bold', halign: 'center' } },
          { content: fx(r.val), styles: { halign: 'center' } }, fx(r.note)]);
      }
    }
    table({
      head: [['Mã', 'Nội dung kiểm tra', 'Kết quả', 'Giá trị đo', 'Ghi chú']], body,
      columnStyles: { 0: { cellWidth: 15 }, 2: { cellWidth: 19 }, 3: { cellWidth: 21 }, 4: { cellWidth: 48 } }
    });

    /* ----- 7. phụ lục ảnh ----- */
    if (m.appendix.length) {
      heading(`${k++}. Phụ lục hình ảnh`, 100);
      for (const a of m.appendix) await photoBlock(`${a.c} – ${a.t}`, a.note, a.photos);
    }

    /* ----- chân trang ----- */
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i); doc.setFont('NS', 'normal'); doc.setFontSize(7.5); doc.setTextColor(120, 120, 120);
      doc.setDrawColor(...GRID); doc.setLineWidth(0.2); doc.line(M, PH - 11, PW - M, PH - 11);
      doc.text(doc.splitTextToSize(fx(m.footer), CW - 25)[0], M, PH - 7);
      doc.text(`Trang ${i}/${n}`, PW - M, PH - 7, { align: 'right' });
    }
    return doc.output('blob');
  }

  window.PVHO_PDF = { build };
})();
