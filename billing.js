import { $, $$, db, ensureSeed, money, uid, initTheme, setTheme, attachRipples, headerScroll } from './core.js';

// expose helpers for invoice-view share link
window.buildShareLink = (inv)=>{
  const enc = LZString.compressToEncodedURIComponent(JSON.stringify(inv));
  const base = location.origin + location.pathname.replace('billing.html','') + 'invoice-view.html';
  return `${base}?i=${enc}`;
};

window.previewInvoiceObject = ()=> {
  const p = db.patients.find(x=>x.id === $('#invPatient').value) || { name:'(Preview)', phone:'' };
  const sub = Number($('#subTotal').textContent.replace(/[^\d.]/g,''))||0;
  const tax = Number($('#taxTotal').textContent.replace(/[^\d.]/g,''))||0;
  const disc = Number($('#discount').value||0);
  const grand = Math.max(0, sub + tax - disc);
  return {
    id: uid(),
    number: $('#invNumber').value || ('NDC-'+Date.now().toString().slice(-6)),
    date: $('#invDate').value || new Date().toISOString().slice(0,10),
    patient: p,
    lines: currentLines,
    subTotal: sub, taxTotal: tax, discount: disc, grandTotal: grand,
    payMethod: $('#payMethod').value, paidNow: Number($('#paidNow').value||0), due: Math.max(0, grand - Number($('#paidNow').value||0)),
    notes: $('#notes').value,
    clinic: { name: db.settings.clinic, address: db.settings.address, gstin: db.settings.gstin, upiPa: db.settings.upiPa, upiPn: db.settings.upiPn }
  };
};

let currentLines = [];

window.renderLines = function renderLines(){
  const tb = $('#linesTable tbody'); tb.innerHTML='';
  let sub=0, tax=0;
  currentLines.forEach(l=>{
    const lineTax = (l.price * l.qty) * ((l.gst||0)/100);
    const lineTotal = (l.price * l.qty) + lineTax;
    l.tax = lineTax; l.total = lineTotal;
    sub += (l.price*l.qty); tax += lineTax;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${l.name}</td><td>${l.code||''}</td>
      <td><input data-qty="${l.id}" type="number" min="1" value="${l.qty}" style="width:70px"></td>
      <td>${money(l.price)}</td><td>${l.gst||0}</td><td>${money(l.tax)}</td><td>${money(l.total)}</td>
      <td style="text-align:right"><button class="danger" data-del="${l.id}">Remove</button></td>`;
    tb.appendChild(tr);
  });
  const disc = Number($('#discount').value||0);
  const grand = Math.max(0, sub + tax - disc);
  $('#subTotal').textContent = money(sub);
  $('#taxTotal').textContent = money(tax);
  $('#discTotal').textContent = money(disc);
  $('#grandTotal').textContent = money(grand);
  const paid = Number($('#paidNow').value||0);
  $('#dueTotal').textContent = money(grand - paid);
  renderPreview();
  buildQR();
};

function renderPreview(){
  const p = db.patients.find(x=>x.id === $('#invPatient').value);
  const rows = currentLines.map(l=>`<tr><td>${l.name}</td><td>${l.code||''}</td><td>${l.qty}</td><td>${money(l.price)}</td><td>${l.gst||0}</td><td>${money(l.tax)}</td><td>${money(l.total)}</td></tr>`).join('');
  $('#invoicePreview').innerHTML = `
    <div class="row"><div><b>${db.settings.clinic||'Noble Dental Care'}</b><br>${db.settings.address||''}${db.settings.gstin?('<br><b>GSTIN:</b> '+db.settings.gstin):''}</div><div><b>Bill To</b><br>${p?`${p.name}<br>${p.phone||''}`:'—'}</div></div>
    <div class="table" style="margin-top:10px">
      <table><thead><tr><th>Item</th><th>Code</th><th>Qty</th><th>Price</th><th>GST%</th><th>Tax</th><th>Total</th></tr></thead><tbody>${rows||'<tr><td class="muted" colspan="7">Add items…</td></tr>'}</tbody></table>
    </div>`;
}

function buildQR(){
  const box = $('#qrBox'); box.innerHTML='';
  const due = getDue();
  const { upiPa:pa, upiPn:pn } = db.settings;
  if (!pa || !pn || due<=0) { $('#upiText').textContent=''; return; }
  const upi = `upi://pay?pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent(pn)}&am=${due.toFixed(2)}&cu=INR&tn=${encodeURIComponent('INV '+($('#invNumber').value||''))}`;
  $('#upiText').textContent = upi;
  new QRCode(box, { text: upi, width: 188, height: 188 });
}

function getDue(){
  const sub = Number($('#subTotal').textContent.replace(/[^\d.]/g,''))||0;
  const tax = Number($('#taxTotal').textContent.replace(/[^\d.]/g,''))||0;
  const disc = Number($('#discount').value||0);
  const grand = Math.max(0, sub + tax - disc);
  const paid = Number($('#paidNow').value||0);
  return Math.max(0, grand - paid);
}

window.addEventListener('DOMContentLoaded', ()=>{
  initTheme(); attachRipples(); headerScroll(); ensureSeed();
  $('#year').textContent = new Date().getFullYear();
  $('#theme').addEventListener('click', ()=> setTheme(!(document.documentElement.classList.contains('light'))));

  // populate pickers
  const pat = $('#invPatient'); pat.innerHTML = '<option value="">Select patient…</option>';
  db.patients.forEach(p=>{ const o=document.createElement('option'); o.value=p.id; o.textContent=`${p.name} — ${p.phone||''}`; pat.appendChild(o); });
  const items = $('#itemPicker'); items.innerHTML = '<option value="">Select item…</option>';
  db.inventory.forEach(i=>{ const o=document.createElement('option'); o.value=i.id; o.textContent=`${i.name} — ₹${i.price}`; items.appendChild(o); });

  // defaults
  $('#invDate').valueAsDate = new Date();

  // add line
  $('#addLine').addEventListener('click', ()=>{
    const id = $('#itemPicker').value; if(!id) return;
    const qty = Number($('#itemQty').value||1);
    const it = db.inventory.find(x=>x.id===id); if(!it) return;
    currentLines.push({ id: uid(), itemId: it.id, name: it.name, code: it.code, price: it.price, gst: it.gst, qty, tax:0, total:0 });
    $('#itemPicker').value=''; $('#itemQty').value='1';
    renderLines();
  });

  // table actions
  $('#linesTable').addEventListener('input',(e)=>{
    const id = e.target.dataset.qty; if(!id) return;
    const ln = currentLines.find(x=>x.id===id); if(!ln) return;
    ln.qty = Number(e.target.value||1); renderLines();
  });
  $('#linesTable').addEventListener('click',(e)=>{
    const id = e.target.dataset.del; if(!id) return;
    currentLines = currentLines.filter(l=>l.id!==id); renderLines();
  });

  // totals recompute
  $('#discount').addEventListener('input', renderLines);
  $('#paidNow').addEventListener('input', renderLines);
  $('#payMethod').addEventListener('change', renderLines);
  $('#invPatient').addEventListener('change', renderPreview);
  $('#invNumber').addEventListener('input', renderPreview);
  $('#notes').addEventListener('input', renderPreview);

  // save invoice
  $('#saveInvoice').addEventListener('click', ()=>{
    if (!$('#invPatient').value) return;
    if (!currentLines.length) return;
    // decrement stock
    currentLines.forEach(l=>{
      const it = db.inventory.find(i=>i.id===l.itemId);
      if (it) it.stock = Math.max(0, (it.stock||0) - l.qty);
    });
    const sub = Number($('#subTotal').textContent.replace(/[^\d.]/g,''))||0;
    const tax = Number($('#taxTotal').textContent.replace(/[^\d.]/g,''))||0;
    const disc = Number($('#discount').value||0);
    const grand = Math.max(0, sub + tax - disc);
    const invoice = {
      id: uid(),
      number: $('#invNumber').value || ('NDC-'+Date.now().toString().slice(-6)),
      date: $('#invDate').value || new Date().toISOString().slice(0,10),
      patient: db.patients.find(p=>p.id === $('#invPatient').value),
      lines: currentLines,
      subTotal: sub, taxTotal: tax, discount: disc, grandTotal: grand,
      payMethod: $('#payMethod').value, paidNow: Number($('#paidNow').value||0), due: getDue(),
      notes: $('#notes').value,
      clinic: { name: db.settings.clinic, address: db.settings.address, gstin: db.settings.gstin, upiPa: db.settings.upiPa, upiPn: db.settings.upiPn }
    };
    db.invoices = [invoice, ...db.invoices];
    // reset
    currentLines = []; renderLines();
  });

  // PDF
  $('#btnPdf').addEventListener('click', async ()=>{
    const node = document.querySelector('main');
    const canvas = await html2canvas(node, { scale: 2, useCORS:true });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p','pt','a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const ratio = pageW / canvas.width;
    pdf.addImage(canvas.toDataURL('image/png'),'PNG', 20, 20, pageW-40, canvas.height*ratio);
    pdf.save(`Invoice_${($('#invNumber').value||'NDC')}.pdf`);
  });

  // Payment link & WhatsApp
  $('#btnPaymentLink').addEventListener('click', ()=>{
    const inv = window.previewInvoiceObject();
    const url = window.buildShareLink(inv);
    navigator.clipboard.writeText(url).catch(()=>{});
    open(url, '_blank');
  });
  $('#btnWaShare').addEventListener('click', ()=>{
    const inv = window.previewInvoiceObject();
    const url = window.buildShareLink(inv);
    const phone = inv.patient?.phone?.replace(/\D/g,'') || '';
    const msg = `Hello ${inv.patient?.name||''},%0AInvoice ${inv.number||''}%0AAmount: ₹${(inv.grandTotal||0).toFixed(2)}%0A${encodeURIComponent(url)}`;
    const wa = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    open(wa, '_blank');
  });

  // clear
  $('#btnClear').addEventListener('click', ()=>{
    $('#invNumber').value=''; $('#invDate').valueAsDate = new Date();
    $('#invPatient').value=''; $('#discount').value='0'; $('#paidNow').value='0'; $('#notes').value=''; currentLines = []; renderLines();
  });

  // initial
  renderLines();
  // reveal
  $$('.reveal').forEach((el,i)=> setTimeout(()=> el.classList.add('show'), 80*i));
});
