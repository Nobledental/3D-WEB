// ============================================================
// core.js — data layer, utils, theming
// ============================================================

export const $ = (s, r=document)=>r.querySelector(s);
export const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
export const money = (n)=>'₹'+Number(n||0).toFixed(2);
export const uid = ()=> Math.random().toString(36).slice(2,9).toUpperCase();
export const bus = new EventTarget();

const store = {
  read(k, d){ try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  write(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};

const ns = 'ndc_suite';
export const db = {
  get settings(){ return store.read(ns+'_settings', { clinic:'Noble Dental Care', address:'', gstin:'', upiPa:'', upiPn:'Noble Dental Care' }); },
  set settings(v){ store.write(ns+'_settings', v); },

  get patients(){ return store.read(ns+'_patients', []); },
  set patients(v){ store.write(ns+'_patients', v); },

  get inventory(){ return store.read(ns+'_inventory', []); },
  set inventory(v){ store.write(ns+'_inventory', v); },

  get invoices(){ return store.read(ns+'_invoices', []); },
  set invoices(v){ store.write(ns+'_invoices', v); },
};

export function ensureSeed(){
  if (db.inventory.length || db.patients.length || db.invoices.length) return;
  db.patients = [
    {id:uid(), name:'Akash Rao', phone:'919812345678', email:'akash@example.com'},
    {id:uid(), name:'Neha Singh', phone:'919911223344', email:''}
  ];
  db.inventory = [
    {id:uid(), name:'Consultation', code:'CONS', price:300, stock:9999, gst:0, group:'General'},
    {id:uid(), name:'Scaling & Polishing', code:'SCALE', price:1200, stock:80, gst:18, group:'Preventive'},
    {id:uid(), name:'Root Canal (Molar)', code:'RC-M', price:3500, stock:25, gst:18, group:'Restorative'},
    {id:uid(), name:'Crown (Zirconia)', code:'CROWN-Z', price:8000, stock:15, gst:18, group:'Prosthodontics'}
  ];
  db.invoices = [];
}

export function setTheme(light=false){
  document.documentElement.classList.toggle('light', !!light);
  localStorage.setItem(ns+'_theme', light?'light':'dark');
}
export function initTheme(){
  const saved = localStorage.getItem(ns+'_theme') || 'dark';
  setTheme(saved==='light'?true:false);
}

// Ripple positions
export function attachRipples(){
  document.addEventListener('pointerdown', (e)=>{
    const t = e.target.closest('.ripple, button, .chip, .navlink');
    if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--rx', ((e.clientX - r.left)/r.width*100)+'%');
    t.style.setProperty('--ry', ((e.clientY - r.top)/r.height*100)+'%');
  });
}

// Header scroll effect
export function headerScroll(){
  const bar = $('.appbar'); if (!bar) return;
  const onScroll = ()=>{ if (scrollY>6) bar.classList.add('scrolled'); else bar.classList.remove('scrolled'); };
  onScroll(); addEventListener('scroll', onScroll, {passive:true});
}
