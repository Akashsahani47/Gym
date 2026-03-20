import { jsPDF } from 'jspdf';

const monthLabel = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return new Date(+y, +m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

const methodMap = { cash: 'Cash', online: 'Online', card: 'Card', bank_transfer: 'Bank Transfer' };

// ── Draw helpers ──────────────────────────────────────────────────────────────

function drawRoundedRect(doc, x, y, w, h, r, { fill, stroke } = {}) {
  if (fill) { doc.setFillColor(...fill); }
  if (stroke) { doc.setDrawColor(...stroke); doc.setLineWidth(0.4); }
  const mode = fill && stroke ? 'FD' : fill ? 'F' : stroke ? 'S' : 'F';
  doc.roundedRect(x, y, w, h, r, r, mode);
}

function drawLine(doc, x1, y1, x2, y2, color, width = 0.3) {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.line(x1, y1, x2, y2);
}

function text(doc, str, x, y, { font = 'helvetica', style = 'normal', size = 10, color = [30, 30, 30], align = 'left', maxWidth } = {}) {
  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(str || '', x, y, { align, maxWidth });
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateInvoice(payment) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();   // 210
  const H = doc.internal.pageSize.getHeight();   // 297
  const M = 18; // margin
  const R = M;  // right margin from edge
  const CW = W - M * 2; // content width
  let y = 0;

  // ── Derived data ──
  const invoiceId = `INV-${(payment._id || '000000').slice(-8).toUpperCase()}`;
  const issueDate = fmtDate(payment.paidAt || payment.updatedAt || new Date());
  const period = monthLabel(payment.month);
  const amount = fmtCurrency(payment.amount);

  // ── Colors ──
  const BRAND   = [26, 26, 46];       // deep navy
  const ACCENT  = [218, 255, 0];      // #DAFF00
  const BLACK   = [20, 20, 20];
  const DARK    = [50, 50, 50];
  const MID     = [100, 100, 100];
  const LIGHT   = [150, 150, 150];
  const BORDER  = [220, 220, 220];
  const BG_GRAY = [248, 248, 248];
  const WHITE   = [255, 255, 255];
  const GREEN   = [22, 163, 74];

  // =====================================================================
  //  HEADER — Top accent stripe + branding
  // =====================================================================

  // Thin accent bar at very top
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, W, 4, 'F');

  // Dark header band
  doc.setFillColor(...BRAND);
  doc.rect(0, 4, W, 36, 'F');

  // Brand name
  text(doc, 'ZELVOO', M, 20, { style: 'bold', size: 22, color: WHITE });
  text(doc, 'Gym Management', M, 27, { size: 9, color: [180, 180, 190] });

  // "INVOICE" on the right
  text(doc, 'INVOICE', W - R, 20, { style: 'bold', size: 20, color: ACCENT, align: 'right' });
  text(doc, invoiceId, W - R, 27, { size: 9, color: [180, 180, 190], align: 'right' });

  y = 50;

  // =====================================================================
  //  INVOICE META — 3 columns
  // =====================================================================

  const metaCols = [
    { label: 'Invoice Number', value: invoiceId },
    { label: 'Issue Date', value: issueDate },
    { label: 'Billing Period', value: period },
  ];

  const colW = CW / 3;
  metaCols.forEach((col, i) => {
    const cx = M + i * colW;
    text(doc, col.label, cx, y, { size: 7.5, color: LIGHT, style: 'bold' });
    text(doc, col.value, cx, y + 5.5, { size: 10, color: BLACK, style: 'bold' });
  });

  y += 16;
  drawLine(doc, M, y, W - R, y, BORDER);
  y += 10;

  // =====================================================================
  //  BILL TO / FROM — Two card-style boxes
  // =====================================================================

  const boxW = (CW - 8) / 2;
  const boxH = 28;

  // Bill To box
  drawRoundedRect(doc, M, y, boxW, boxH, 3, { fill: BG_GRAY, stroke: BORDER });
  text(doc, 'BILL TO', M + 6, y + 7, { size: 7, color: LIGHT, style: 'bold' });
  text(doc, payment.memberName || 'Member', M + 6, y + 14, { size: 11, color: BLACK, style: 'bold' });
  text(doc, payment.memberEmail || '', M + 6, y + 20, { size: 8.5, color: MID });

  // From box
  const fromX = M + boxW + 8;
  drawRoundedRect(doc, fromX, y, boxW, boxH, 3, { fill: BG_GRAY, stroke: BORDER });
  text(doc, 'FROM', fromX + 6, y + 7, { size: 7, color: LIGHT, style: 'bold' });
  text(doc, payment.gymName || 'Gym', fromX + 6, y + 14, { size: 11, color: BLACK, style: 'bold' });
  text(doc, 'Membership Services', fromX + 6, y + 20, { size: 8.5, color: MID });

  y += boxH + 12;

  // =====================================================================
  //  TABLE
  // =====================================================================

  const tableX = M;
  const tableW = CW;
  const cols = { desc: tableX + 5, plan: tableX + 90, method: tableX + 130, amount: tableX + tableW - 5 };

  // Table header
  drawRoundedRect(doc, tableX, y, tableW, 11, 2, { fill: BRAND });
  const headerY = y + 7.5;
  text(doc, 'DESCRIPTION', cols.desc, headerY, { size: 7.5, color: WHITE, style: 'bold' });
  text(doc, 'PLAN', cols.plan, headerY, { size: 7.5, color: WHITE, style: 'bold' });
  text(doc, 'METHOD', cols.method, headerY, { size: 7.5, color: WHITE, style: 'bold' });
  text(doc, 'AMOUNT', cols.amount, headerY, { size: 7.5, color: WHITE, style: 'bold', align: 'right' });

  y += 11;

  // Table row
  const rowH = 14;
  drawRoundedRect(doc, tableX, y, tableW, rowH, 0, { stroke: BORDER });
  const rowY = y + 9;
  text(doc, `Membership fee - ${period}`, cols.desc, rowY, { size: 9.5, color: DARK });
  text(doc, payment.planName || '-', cols.plan, rowY, { size: 9, color: MID });
  text(doc, methodMap[payment.method] || payment.method || '-', cols.method, rowY, { size: 9, color: MID });
  text(doc, amount, cols.amount, rowY, { size: 10, color: BLACK, style: 'bold', align: 'right' });

  y += rowH;

  // Table footer row (subtotal line)
  drawRoundedRect(doc, tableX, y, tableW, 12, 0, { fill: BG_GRAY, stroke: BORDER });
  text(doc, 'Subtotal', cols.method, y + 8, { size: 8.5, color: MID });
  text(doc, amount, cols.amount, y + 8, { size: 9.5, color: DARK, style: 'bold', align: 'right' });
  y += 12;

  // Discount / Tax row (0 for now — keeps layout professional)
  drawRoundedRect(doc, tableX, y, tableW, 10, 0, { stroke: BORDER });
  text(doc, 'Tax / Discount', cols.method, y + 7, { size: 8, color: LIGHT });
  text(doc, '-', cols.amount, y + 7, { size: 9, color: LIGHT, align: 'right' });
  y += 10;

  // =====================================================================
  //  TOTAL BOX
  // =====================================================================

  y += 4;
  const totalW = 82;
  const totalX = W - R - totalW;

  drawRoundedRect(doc, totalX, y, totalW, 22, 4, { fill: BRAND });

  // Accent stripe on left side of total box
  doc.setFillColor(...ACCENT);
  doc.roundedRect(totalX, y, 4, 22, 4, 4, 'F');
  // Cover the right curves of the accent stripe
  doc.setFillColor(...BRAND);
  doc.rect(totalX + 2, y, 4, 22, 'F');

  text(doc, 'TOTAL', totalX + 10, y + 9, { size: 8, color: [180, 180, 200] });
  text(doc, amount, totalX + totalW - 8, y + 9, { size: 14, color: ACCENT, style: 'bold', align: 'right' });

  // Paid badge
  text(doc, 'PAID', totalX + 10, y + 17, { size: 8, color: GREEN, style: 'bold' });
  text(doc, issueDate, totalX + totalW - 8, y + 17, { size: 7.5, color: [160, 160, 170], align: 'right' });

  y += 32;

  // =====================================================================
  //  PAYMENT DETAILS — small info row
  // =====================================================================

  drawRoundedRect(doc, M, y, CW, 16, 3, { fill: BG_GRAY, stroke: BORDER });
  const detailY = y + 6;

  text(doc, 'Payment Status', M + 6, detailY, { size: 7, color: LIGHT });
  text(doc, 'PAID', M + 6, detailY + 6, { size: 9, color: GREEN, style: 'bold' });

  text(doc, 'Payment Method', M + 50, detailY, { size: 7, color: LIGHT });
  text(doc, methodMap[payment.method] || '-', M + 50, detailY + 6, { size: 9, color: DARK, style: 'bold' });

  text(doc, 'Paid On', M + 105, detailY, { size: 7, color: LIGHT });
  text(doc, issueDate, M + 105, detailY + 6, { size: 9, color: DARK, style: 'bold' });

  if (payment.notes) {
    text(doc, 'Note', M + 145, detailY, { size: 7, color: LIGHT });
    text(doc, payment.notes, M + 145, detailY + 6, { size: 8, color: MID, maxWidth: 30 });
  }

  y += 26;

  // =====================================================================
  //  FOOTER
  // =====================================================================

  const footerY = H - 28;

  // Divider
  drawLine(doc, M, footerY, W - R, footerY, BORDER);

  // Thank you
  text(doc, 'Thank you for choosing Zelvoo!', W / 2, footerY + 7, { size: 10, color: DARK, style: 'bold', align: 'center' });
  text(doc, 'This is a computer-generated invoice and does not require a signature.', W / 2, footerY + 13, { size: 7.5, color: LIGHT, align: 'center' });

  // Bottom accent bar
  doc.setFillColor(...ACCENT);
  doc.rect(0, H - 4, W, 4, 'F');

  // ── Save ──
  doc.save(`Invoice-${invoiceId}-${payment.month || 'payment'}.pdf`);
}
