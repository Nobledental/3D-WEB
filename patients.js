import { $, $$, db, ensureSeed, initTheme, setTheme, attachRipples, headerScroll } from './core.js';

window.addEventListener('DOMContentLoaded', ()=>{
  initTheme(); attachRipples(); headerScroll(); ensureSeed();
  $('#year').textContent = new Date().getFullYear();
  $('#theme').addEventListener('click', ()=> setTheme(!(document.documentElement.classList.contains('light'))));

  const render = (q='')=>{
    const tb = $('#pTable tbody'); tb.innerHTML='';
    db.patients.filter(p => (p.name+' '+(p.phone||'')+' '+(p.email||'')).toLowerCase().includes(q.toLowerCase()))
      .forEach(p=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${p.name}</td><td>${p.phone||''}</td><td>${p.email||''}</td>
        <td style="text-align:right"><button data-del="${p.id}" class="danger">Delete</button></td>`;
        tb.appendChild(tr);
      });
  };

  $('#addPatient').addEventListener('click', ()=>{
    const name = $('#pName').value.trim(); if (!name) return;
    db.patients = [...db.patients, { id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), name, phone: $('#pPhone').value.trim(), email: $('#pEmail').value.trim() }];
    $('#pName').value = $('#pPhone').value = $('#pEmail').value = '';
    render($('#pSearch').value);
  });

  $('#pTable').addEventListener('click', (e)=>{
    const id = e.target.dataset.del; if (!id) return;
    db.patients = db.patients.filter(p=>p.id!==id);
    render($('#pSearch').value);
  });

  $('#pSearch').addEventListener('input', (e)=> render(e.target.value));
  render('');
});
