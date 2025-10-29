import { $, $$, db, ensureSeed, money, initTheme, setTheme, attachRipples, headerScroll } from './core.js';

window.addEventListener('DOMContentLoaded', ()=>{
  initTheme(); attachRipples(); headerScroll(); ensureSeed();
  $('#year').textContent = new Date().getFullYear();
  $('#theme').addEventListener('click', ()=> setTheme(!(document.documentElement.classList.contains('light'))));

  // settings quick save
  const s = db.settings;
  $('#clinicName').value = s.clinic || '';
  $('#upiPa').value = s.upiPa || '';
  $('#upiPn').value = s.upiPn || '';
  $('#saveSettings').addEventListener('click', ()=>{
    db.settings = { ...db.settings, clinic: $('#clinicName').value.trim(), upiPa: $('#upiPa').value.trim(), upiPn: $('#upiPn').value.trim() };
  });

  // invoices table
  const tb = $('#invoicesTbl tbody'); tb.innerHTML='';
  db.invoices.slice(0,10).forEach(inv=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${new Date(inv.date).toLocaleDateString()}</td><td>${inv.number}</td><td>${inv.patient?.name||''}</td><td>${money(inv.grandTotal)}</td><td>${money(inv.paidNow||0)}</td><td>${money(inv.due||0)}</td>`;
    tb.appendChild(tr);
  });

  // KPIs (simple aggregates)
  const today = new Date().toISOString().slice(0,10);
  const invToday = db.invoices.filter(i=> (i.date||'').startsWith(today));
  const rev = invToday.reduce((a,b)=>a+(b.grandTotal||0),0);
  $('#kpiRevenue').textContent = money(rev);
  const dues = db.invoices.reduce((a,b)=>a+(b.due||0),0);
  $('#kpiDue').textContent = money(dues);

  // Sparklines / Charts
  const R = Chart.getChart('sparkRevenue') || new Chart($('#sparkRevenue'), {
    type:'line',
    data:{labels:[1,2,3,4,5,6,7], datasets:[{data:[2,3,2,4,5,3,6], tension:.4}]},
    options:{responsive:true, plugins:{legend:{display:false}}, scales:{x:{display:false},y:{display:false}}}
  });
  const D = Chart.getChart('sparkDue') || new Chart($('#sparkDue'), {
    type:'line',
    data:{labels:[1,2,3,4,5,6,7], datasets:[{data:[3,2,3,2,4,5,4], tension:.4}]},
    options:{responsive:true, plugins:{legend:{display:false}}, scales:{x:{display:false},y:{display:false}}}
  });
  const top = {};
  db.invoices.forEach(i=> (i.lines||[]).forEach(l=> top[l.name]=(top[l.name]||0)+l.qty));
  const topArr = Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const CT = Chart.getChart('chartTop') || new Chart($('#chartTop'), {
    type:'bar',
    data:{labels:topArr.map(x=>x[0]), datasets:[{data:topArr.map(x=>x[1])}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}
  });

  // Export all JSON
  $('#export').addEventListener('click', ()=>{
    const data = { settings: db.settings, patients: db.patients, inventory: db.inventory, invoices: db.invoices };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ndc-billing-backup.json'; a.click();
  });

  // reveal
  $$('.reveal').forEach((el,i)=> setTimeout(()=> el.classList.add('show'), 80*i));
});
