import { $, $$, db, ensureSeed, money, initTheme, setTheme, attachRipples, headerScroll } from './core.js';

window.addEventListener('DOMContentLoaded', ()=>{
  initTheme(); attachRipples(); headerScroll(); ensureSeed();
  $('#year').textContent = new Date().getFullYear();
  $('#theme').addEventListener('click', ()=> setTheme(!(document.documentElement.classList.contains('light'))));

  const render = (q='', group='')=>{
    const tb = $('#iTable tbody'); tb.innerHTML='';
    db.inventory
      .filter(i => (i.name+' '+(i.code||'')).toLowerCase().includes(q.toLowerCase()))
      .filter(i => group? i.group===group : true)
      .forEach(i=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i.name}</td><td>${i.code||''}</td><td>${i.group||''}</td><td>${money(i.price)}</td><td>${i.gst||0}</td><td>${i.stock||0}</td>
        <td style="text-align:right"><button data-del="${i.id}" class="danger">Delete</button></td>`;
        tb.appendChild(tr);
      });
  };

  $('#addItem').addEventListener('click', ()=>{
    const name = $('#iName').value.trim(); if (!name) return;
    const item = {
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      name,
      code: $('#iCode').value.trim(),
      group: $('#iGroup').value,
      price: Number($('#iPrice').value||0),
      stock: Number($('#iStock').value||0),
      gst: Number($('#iGST').value||0)
    };
    db.inventory = [...db.inventory, item];
    $('#iName').value=$('#iCode').value=$('#iPrice').value=''; $('#iStock').value='1'; $('#iGST').value='';
    render($('#iSearch').value, $('#groupFilter').value);
  });

  $('#iTable').addEventListener('click', (e)=>{
    const id = e.target.dataset.del; if (!id) return;
    db.inventory = db.inventory.filter(it=>it.id!==id);
    render($('#iSearch').value, $('#groupFilter').value);
  });

  // export/import
  $('#exportInv').addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(db.inventory,null,2)], {type:'application/json'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ndc-inventory.json'; a.click();
  });
  $('#importFile').addEventListener('change', async (e)=>{
    const f = e.target.files?.[0]; if(!f) return;
    const txt = await f.text();
    try{ const arr = JSON.parse(txt); if(Array.isArray(arr)){ db.inventory = arr; render($('#iSearch').value, $('#groupFilter').value); } }catch{}
  });

  $('#iSearch').addEventListener('input', (e)=> render(e.target.value, $('#groupFilter').value));
  $('#groupFilter').addEventListener('change', (e)=> render($('#iSearch').value, e.target.value));
  render('','');
});
