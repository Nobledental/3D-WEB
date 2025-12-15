/* HealthFlo — Hospitals OS card stack
   Minimal front cards + rich modal mapped to other pages
*/

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const imageFor = (h) => h.image || `https://picsum.photos/seed/${encodeURIComponent(h.id || h.name)}-hosp/900/600`;

const PROC_MAP = {
  Cardiology: [
    ['Coronary Angiography', [12000, 24000]],
    ['Angioplasty (DES)', [120000, 210000]],
    ['Bypass Surgery (CABG)', [250000, 420000]],
  ],
  Neurology: [
    ['Stroke Package (72h)', [80000, 140000]],
    ['Brain MRI + Neuro consult', [8000, 14000]],
    ['Spine Decompression', [140000, 240000]],
  ],
  Orthopaedics: [
    ['ACL Reconstruction', [80000, 140000]],
    ['Total Knee Replacement', [180000, 260000]],
    ['Hip Replacement', [220000, 340000]],
  ],
  Oncology: [
    ['Chemotherapy Cycle', [18000, 42000]],
    ['Radiation (IMRT) 15 Fr', [120000, 220000]],
    ['Breast Conservation Surgery', [180000, 320000]],
  ],
  Gastroenterology: [
    ['Lap Cholecystectomy', [65000, 110000]],
    ['Endoscopy + Biopsy', [4500, 12000]],
    ['ERCP', [55000, 90000]],
  ],
  ENT: [
    ['Septoplasty', [45000, 90000]],
    ['Tonsillectomy', [35000, 70000]],
    ['FESS', [70000, 120000]],
  ],
  Urology: [
    ['TURP', [70000, 120000]],
    ['PCNL', [90000, 160000]],
    ['URS + Lithotripsy', [65000, 110000]],
  ],
  'General Surgery': [
    ['Hernia Repair (Lap)', [80000, 140000]],
    ['Appendectomy (Lap)', [65000, 110000]],
    ['Haemorrhoids (Stapler)', [70000, 120000]],
  ],
  Paediatrics: [
    ['Well Baby Package', [10000, 24000]],
    ['Paediatric Surgery Day Care', [60000, 120000]],
  ],
};

const LAB_HISTORY = [
  { date: '2024-07-05', title: 'CBC + Hydration check', lab: 'Apollo Diagnostics', status: 'Hydrate & recheck' },
  { date: '2024-06-26', title: 'LFT + KFT follow-up', lab: 'Fortis Lab', status: 'Stable' },
  { date: '2024-06-14', title: 'Cardiac markers', lab: 'Max Lab', status: 'Calm' },
];

const DOC_NAMES = ['Aarav', 'Vivaan', 'Anaya', 'Rohan', 'Ira', 'Kabir', 'Myra', 'Advait', 'Kiara', 'Navya'];
const LANG_SETS = [
  ['English', 'Hindi'],
  ['English', 'Hindi', 'Marathi'],
  ['English', 'Hindi', 'Telugu'],
  ['English', 'Hindi', 'Tamil'],
  ['English', 'Kannada', 'Hindi'],
];

function toast(msg, ms = 2200) {
  const t = qs('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed to load ' + path);
  return res.json();
}

function pick(arr, n = 1) {
  const copy = [...arr];
  const out = [];
  while (out.length < Math.min(n, copy.length)) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function buildProcedures(specs = [], count = 20) {
  const collected = [];
  specs.forEach((sp) => {
    if (PROC_MAP[sp]) collected.push(...PROC_MAP[sp]);
  });
  if (!collected.length) collected.push(['Day care package', [12000, 22000]]);
  while (collected.length < count) {
    collected.push(['Comprehensive care bundle', [14000, 32000]]);
  }
  return pick(collected, count).map(([name, [lo, hi]], idx) => ({
    id: `proc-${idx}-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    price: fmtINR(Math.round(lo + Math.random() * (hi - lo))),
    meta: 'Pre-op • Procedure • Stay • Basic meds',
  }));
}

function buildDoctors(specs = [], count = 6) {
  const slots = ['09:30 AM', '10:15 AM', '11:45 AM', '02:30 PM', '04:15 PM', '06:00 PM'];
  return pick(specs.length ? specs : ['General Medicine'], count).map((sp, idx) => {
    const exp = 3 + Math.floor(Math.random() * 22);
    const fee = 300 + Math.floor(Math.random() * 700);
    return {
      id: `doc-${idx}-${sp}`,
      name: `Dr. ${DOC_NAMES[idx % DOC_NAMES.length]} ${String.fromCharCode(65 + idx)}`,
      spec: sp,
      exp,
      fee: fmtINR(fee),
      slot: slots[idx % slots.length],
      bio: `${sp} specialist with ${exp}+ yrs of experience. Expertise in minimally invasive care and patient education.`,
      langs: LANG_SETS[idx % LANG_SETS.length].join(', '),
      avatar: `https://picsum.photos/seed/doc-${idx}-${sp}/96/96`,
      allSlots: pick(slots, 6),
    };
  });
}

function buildPharmacy(medsFlat, count = 6) {
  return pick(medsFlat, count).map((m, idx) => ({
    id: `med-${idx}-${m.brand}`,
    name: m.brand,
    form: `${m.form} • ${m.strength || m.pack}`,
    price: fmtINR(m.price || m.mrp || 0),
  }));
}

function distanceFor(h) {
  if (typeof h.distance_km === 'number' && !isNaN(h.distance_km)) return Number(h.distance_km.toFixed(1));
  return Number((0.6 + Math.random() * 12).toFixed(1));
}

function decorateHospital(h) {
  const distance = distanceFor(h);
  const wait = Math.round(5 + Math.random() * 25);
  const occupancy = 64 + Math.round(Math.random() * 22);
  const baseRating = typeof h.rating === 'number' ? h.rating : Number(h.rating) || 4 + Math.random() * 0.8;
  const rating = Number(baseRating.toFixed(1));
  return { ...h, distance, wait, occupancy, rating };
}

function renderMetrics(hospitals) {
  const states = new Set(hospitals.map((h) => h.state));
  const cashless = hospitals.filter((h) => h.isCashless).length;
  const avgRating = (hospitals.reduce((n, h) => n + (h.rating || 0), 0) / hospitals.length).toFixed(1);
  qs('#metricStates').textContent = states.size;
  qs('#metricHospitals').textContent = hospitals.length;
  qs('#metricCashless').textContent = cashless;
  qs('#metricRating').textContent = isNaN(avgRating) ? '—' : avgRating;
}

function coreServices(h) {
  const distance = h.distance ?? distanceFor(h);
  return [
    { icon: '🩺', title: 'OPD', meta: 'Mon–Sat • 9 AM – 7 PM', action: 'Book OPD', on: () => toast('OPD booking started') },
    { icon: '🛏️', title: 'IPD', meta: `${h.beds || 120}+ beds • Private & Shared`, action: 'Plan admission', on: () => toast('IPD admission team alerted') },
    { icon: '📱', title: 'Teleconsult', meta: 'Video / Audio', action: 'Start call', on: () => toast('Teleconsult link shared') },
    { icon: '🚑', title: 'Emergency', meta: `${distance} km • 24×7 desk`, action: 'Call ER', on: () => window.open('tel:108', '_self') },
  ];
}

function createCard(h, medsFlat) {
  const card = document.createElement('article');
  card.className = 'hospital-card';
  const distance = h.distance;
  const rating = h.rating?.toFixed ? h.rating.toFixed(1) : Number(h.rating || 4.2).toFixed(1);
  const wait = h.wait ?? Math.round(5 + Math.random() * 25);
  const occupancy = h.occupancy ?? 64 + Math.round(Math.random() * 22);
  const specialities = (h.specialties || []).slice(0, 2).join(', ') || 'Tertiary care';
  card.innerHTML = `
    <figure class="card-visual">
      <img src="${imageFor(h)}" alt="${h.name} image" loading="lazy">
      <div class="card-visual-glow"></div>
      <div class="card-visual-badges">
        <div class="row">
          <span class="pill badge">⭐ ${rating}</span>
          <span class="pill badge">${h.isCashless ? 'Cashless desk' : 'Self-pay'}</span>
        </div>
        <div class="row">
          <span class="pill badge">${distance} km live</span>
          <span class="pill badge">${wait} min wait</span>
        </div>
      </div>
    </figure>
    <div class="card-top">
      <h3 class="card-title"><span>${h.name}</span></h3>
      <p class="card-sub">${h.type || 'Multi-speciality'} • ${specialities}</p>
      <div class="card-info-grid">
        <div class="card-info"><strong>${h.beds || 140}+ beds</strong><span>Live bedboard</span></div>
        <div class="card-info"><strong>${wait} min</strong><span>OPD wait now</span></div>
        <div class="card-info"><strong>${occupancy}%</strong><span>Occupancy pulse</span></div>
      </div>
    <div class="card-inline">
      <span class="chip-flat">${distance} km • Smart ETA</span>
      <span class="chip-flat">${(h.specialties || []).length || 3} specialties</span>
      <span class="chip-flat">${h.isCashless ? 'Cashless' : 'Self-pay / EMI'}</span>
      <span class="chip-flat">AI concierge</span>
    </div>
  </div>
    <div class="card-explorer">
      <div class="card-tabs" role="tablist">
        <button class="card-tab active" data-pane="services" type="button">Services</button>
        <button class="card-tab" data-pane="packages" type="button">Packages</button>
        <button class="card-tab" data-pane="doctors" type="button">Doctors</button>
        <button class="card-tab" data-pane="pharmacy" type="button">Pharmacy</button>
        <button class="card-tab" data-pane="labs" type="button">Labs</button>
      </div>
      <div class="card-pane services-pane active" data-pane="services">
        <div class="mini-services"></div>
      </div>
      <div class="card-pane packages-pane" data-pane="packages">
        <div class="mini-list"></div>
      </div>
      <div class="card-pane doctors-pane" data-pane="doctors">
        <div class="mini-list"></div>
      </div>
      <div class="card-pane pharmacy-pane" data-pane="pharmacy">
        <div class="mini-list"></div>
      </div>
      <div class="card-pane labs-pane" data-pane="labs">
        <div class="mini-list"></div>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn ghost" type="button">Route</button>
      <button class="btn primary" type="button">View</button>
      <button class="btn emergency" type="button">Emergency</button>
    </div>
  `;

  card.addEventListener('click', () => openHospital(h, medsFlat));
  const btns = card.querySelectorAll('button');
  btns[0]?.addEventListener('click', (e) => {
    e.stopPropagation();
    toast(`Routing to ${h.name} • ${distance} km`);
  });
  btns[1]?.addEventListener('click', (e) => { e.stopPropagation(); openHospital(h, medsFlat); });
  btns[2]?.addEventListener('click', (e) => {
    e.stopPropagation();
    toast('Connecting you to emergency desk…');
    setTimeout(() => window.open('tel:108', '_self'), 150);
  });

  // tab interactions
  const paneTabs = card.querySelectorAll('.card-tab');
  paneTabs.forEach((t) => {
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      paneTabs.forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      const key = t.dataset.pane;
      card.querySelectorAll('.card-pane').forEach((p) => p.classList.toggle('active', p.dataset.pane === key));
    });
  });

  // services pane
  const miniServices = card.querySelector('.mini-services');
  coreServices(h).forEach((svc) => {
    const n = document.createElement('div');
    n.className = 'mini-service';
    n.innerHTML = `<h5>${svc.icon} ${svc.title}</h5><p>${svc.meta}</p><button class="mini-btn primary" type="button">${svc.action}</button>`;
    n.querySelector('button')?.addEventListener('click', (ev) => { ev.stopPropagation(); svc.on(); });
    miniServices.appendChild(n);
  });

  // packages pane (20 procedures)
  const pkgList = card.querySelector('.packages-pane .mini-list');
  (h.procedures || []).slice(0, 20).forEach((p) => {
    const li = document.createElement('div');
    li.className = 'mini-item';
    li.innerHTML = `<div><strong>${p.name}</strong><br><span>${p.meta}</span></div><div class="mini-actions"><span class="chip-pill">${p.price}</span><button class="mini-btn primary" type="button">Enquire</button></div>`;
    li.querySelector('button')?.addEventListener('click', (ev) => { ev.stopPropagation(); toast(`Enquiry sent for ${p.name}`); });
    pkgList.appendChild(li);
  });

  // doctor pane
  const docList = card.querySelector('.doctors-pane .mini-list');
  (h.doctorsList || []).forEach((d) => {
    const row = document.createElement('div');
    row.className = 'mini-doctor';
    row.innerHTML = `<div class="mini-doc-avatar"><img src="${d.avatar}" alt="${d.name}"></div><div class="mini-doc-meta"><strong>${d.name}</strong><span>${d.spec} • ${d.exp} yrs</span></div><div class="mini-doc-cta"><button class="mini-btn" type="button">Chat</button><button class="mini-btn primary" type="button">Book</button><button class="mini-btn" type="button">Profile</button></div>`;
    const [chatBtn, bookBtn, profBtn] = row.querySelectorAll('button');
    chatBtn.addEventListener('click', (ev) => { ev.stopPropagation(); toast(`Chat request sent to ${d.name}`); });
    bookBtn.addEventListener('click', (ev) => { ev.stopPropagation(); toast(`Appointment held with ${d.name}`); });
    profBtn.addEventListener('click', (ev) => { ev.stopPropagation(); openDoctorProfile(d, h); });
    docList.appendChild(row);
  });

  // pharmacy pane
  const medsList = card.querySelector('.pharmacy-pane .mini-list');
  (h.meds || buildPharmacy(medsFlat)).forEach((m) => {
    const li = document.createElement('div');
    li.className = 'mini-item';
    li.innerHTML = `<div><strong>${m.name}</strong><br><span>${m.form}</span></div><div class="mini-actions"><span class="chip-pill">${m.price}</span><button class="mini-btn" type="button">Add</button></div>`;
    li.querySelector('button')?.addEventListener('click', (ev) => { ev.stopPropagation(); toast(`${m.name} mapped to pharmacy cart`); });
    medsList.appendChild(li);
  });

  // labs pane
  const labList = card.querySelector('.labs-pane .mini-list');
  LAB_HISTORY.forEach((l) => {
    const li = document.createElement('div');
    li.className = 'mini-item';
    li.innerHTML = `<div><strong>${l.title}</strong><br><span>${l.date} • ${l.lab}</span></div><div class="mini-actions"><span class="chip-pill">${l.status}</span><button class="mini-btn" type="button">View</button></div>`;
    li.querySelector('button')?.addEventListener('click', (ev) => { ev.stopPropagation(); toast('Opening lab report history'); });
    labList.appendChild(li);
  });

  return card;
}

function renderGrid(hospitals, medsFlat) {
  const grid = qs('#hospitalGrid');
  grid.innerHTML = '';
  if (!hospitals.length) {
    grid.innerHTML = '<div class="stat">No hospitals match your filters.</div>';
    return;
  }
  hospitals.forEach((h) => grid.appendChild(createCard(h, medsFlat)));
}

function activeQuickFilters() {
  return qsa('.chip-toggle.active').map((c) => c.dataset.filter);
}

function applyFilters(allHospitals, medsFlat) {
  const q = qs('#searchInput').value.trim().toLowerCase();
  const state = qs('#stateFilter').value;
  const specialty = qs('#specialtyFilter').value;
  const cashless = qs('#cashlessFilter').value;
  const quick = activeQuickFilters();

  let list = allHospitals;
  if (state) list = list.filter((h) => h.state === state);
  if (specialty) list = list.filter((h) => (h.specialties || []).includes(specialty));
  if (cashless) list = list.filter((h) => String(!!h.isCashless) === cashless);
  if (q) {
    list = list.filter((h) => {
      const hay = [h.name, h.address, h.type, ...(h.specialties || [])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  quick.forEach((qf) => {
    if (qf === 'nearby') list = list.filter((h) => h.distance <= 10);
    if (qf === 'cashless') list = list.filter((h) => h.isCashless);
    if (qf === 'rating') list = list.filter((h) => (h.rating || 0) >= 4.5);
    if (qf === 'beds') list = list.filter((h) => (h.beds || 0) >= 150);
  });

  renderGrid(list, medsFlat);
}

function populateStateFilter(hospitals) {
  const sel = qs('#stateFilter');
  const states = Array.from(new Set(hospitals.map((h) => h.state))).sort();
  sel.innerHTML = '<option value="">All states</option>' + states.map((s) => `<option value="${s}">${s}</option>`).join('');
}

function populateSpecialtyFilter(hospitals) {
  const sel = qs('#specialtyFilter');
  const specs = Array.from(new Set(hospitals.flatMap((h) => h.specialties || []))).sort();
  sel.innerHTML = '<option value="">All specialties</option>' + specs.map((s) => `<option value="${s}">${s}</option>`).join('');
}

function bindQuickFilters(allHospitals, medsFlat) {
  qsa('.chip-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      applyFilters(allHospitals, medsFlat);
    });
  });
}

function bindTheme() {
  const toggle = qs('#themeToggle');
  const html = document.documentElement;
  const saved = localStorage.getItem('hf_theme');
  if (saved) html.setAttribute('data-theme', saved);
  toggle?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'vision' ? 'matte' : 'vision';
    html.setAttribute('data-theme', next);
    localStorage.setItem('hf_theme', next);
  });
}

function serviceRail(h, medsFlat, distance) {
  const rail = qs('#serviceRail');
  rail.innerHTML = '';
  (h.servicesList || coreServices(h)).forEach((c) => {
    const n = document.createElement('div');
    n.className = 'rail-card';
    n.innerHTML = `<h4>${c.icon} ${c.title}</h4><p>${c.meta}</p><button class="btn ghost" type="button">${c.action}</button>`;
    n.querySelector('button')?.addEventListener('click', c.on);
    rail.appendChild(n);
  });
}

function renderDoctors(h) {
  const wrap = qs('#doctorList');
  wrap.innerHTML = '';
  (h.doctorsList || buildDoctors(h.specialties)).forEach((d) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `<div><strong>${d.name}</strong><br><span>${d.spec} • ${d.exp} yrs • ${d.langs || ''}</span></div><div class="mini-actions"><button class="mini-btn" type="button">Chat</button><button class="mini-btn primary" type="button">Book</button><button class="mini-btn" type="button">View profile</button></div>`;
    const [chatBtn, bookBtn, profileBtn] = row.querySelectorAll('button');
    chatBtn.addEventListener('click', () => toast(`Chat request sent to ${d.name}`));
    bookBtn.addEventListener('click', () => toast(`Appointment held with ${d.name}`));
    profileBtn.addEventListener('click', () => openDoctorProfile(d, h));
    wrap.appendChild(row);
  });
}

function renderProcedures(h) {
  const wrap = qs('#procedureList');
  wrap.innerHTML = '';
  (h.procedures || buildProcedures(h.specialties)).slice(0, 20).forEach((p) => {
    const li = document.createElement('div');
    li.className = 'list-item';
    li.innerHTML = `<div><strong>${p.name}</strong><br><span>${p.meta}</span></div><div class="mini-actions"><span class="chip-pill">${p.price}</span><button class="mini-btn primary" type="button">Enquire</button></div>`;
    li.querySelector('button')?.addEventListener('click', () => toast(`Enquiry sent for ${p.name}`));
    wrap.appendChild(li);
  });
}

function renderMeds(medsFlat, h) {
  const wrap = qs('#medList');
  wrap.innerHTML = '';
  (h?.meds || buildPharmacy(medsFlat)).forEach((m) => {
    const li = document.createElement('div');
    li.className = 'list-item';
    li.innerHTML = `<div><strong>${m.name}</strong><br><span>${m.form}</span></div><div class="mini-actions"><span class="chip-pill">${m.price}</span><button class="mini-btn" type="button">Add</button></div>`;
    li.querySelector('button')?.addEventListener('click', () => toast(`${m.name} mapped to hospital pharmacy`));
    wrap.appendChild(li);
  });
}

function renderLabs() {
  const wrap = qs('#labList');
  wrap.innerHTML = '';
  LAB_HISTORY.forEach((l) => {
    const li = document.createElement('div');
    li.className = 'list-item';
    li.innerHTML = `<div><strong>${l.title}</strong><br><span>${l.date} • ${l.lab}</span></div><div class="mini-actions"><span class="chip-pill">${l.status}</span><button class="mini-btn" type="button">View</button></div>`;
    li.querySelector('button')?.addEventListener('click', () => toast('Opening lab history…'));
    wrap.appendChild(li);
  });
}

function gatherContext() {
  const ctx = [];
  const profile = (() => { try { return JSON.parse(localStorage.getItem('hf_profile') || 'null'); } catch { return null; } })();
  if (profile?.name) ctx.push({ title: 'Profile shared', detail: `${profile.name} • ${profile.city || 'City unknown'}` });

  const lastOrder = (() => { try { return JSON.parse(localStorage.getItem('hf-latest-order') || 'null'); } catch { return null; } })();
  if (lastOrder?.item) ctx.push({ title: 'Latest pharmacy order', detail: `${lastOrder.item} • ${lastOrder.total || ''}` });

  const labSync = (() => { try { return JSON.parse(localStorage.getItem('lab-dashboard-latest') || 'null'); } catch { return null; } })();
  if (labSync?.reports?.length) ctx.push({ title: 'Recent lab report', detail: labSync.reports[0].title || 'Report shared' });

  if (!ctx.length) ctx.push({ title: 'No synced context yet', detail: 'Bookings and records from other pages will appear here.' });
  return ctx;
}

function renderContext() {
  const wrap = qs('#contextGrid');
  wrap.innerHTML = '';
  gatherContext().forEach((c) => {
    const card = document.createElement('div');
    card.className = 'context-card';
    card.innerHTML = `<strong>${c.title}</strong><span>${c.detail}</span>`;
    wrap.appendChild(card);
  });
}

function renderGlance(h, distance) {
  const wrap = qs('#glanceGrid');
  wrap.innerHTML = '';
  const rating = (h.rating || 4.2).toFixed(1);
  const wait = h.wait ?? Math.round(5 + Math.random() * 25);
  const crowd = h.occupancy ?? 68 + Math.round(Math.random() * 20);
  const cards = [
    { title: 'Experience', value: `⭐ ${rating}`, meta: 'Patient-rated comfort & care' },
    { title: 'Beds live', value: `${h.beds || 140}+`, meta: 'Including ICU & daycare' },
    { title: 'Cashless', value: h.isCashless ? 'Available' : 'Self-pay / EMI', meta: 'Insurance & pre-auth desk' },
    { title: 'Distance', value: `${distance} km`, meta: 'Live ETA with traffic' },
    { title: 'OPD load', value: `${wait} min`, meta: 'Triage wait right now' },
    { title: 'Signals', value: `${crowd}% occupancy`, meta: 'Smart bedboard feed' },
    { title: 'Specialities', value: (h.specialties || []).slice(0, 3).join(', ') || 'Multi-speciality', meta: 'Mapped to your profile' },
  ];

  cards.forEach((c) => {
    const node = document.createElement('div');
    node.className = 'glance-card';
    node.innerHTML = `<small>${c.title}</small><strong>${c.value}</strong><small>${c.meta}</small>`;
    wrap.appendChild(node);
  });
}

function renderOverlayBadges(h, distance) {
  const wrap = qs('#modalOverlayBadges');
  if (!wrap) return;
  wrap.innerHTML = '';
  const rowTop = document.createElement('div');
  rowTop.className = 'row';
  ['24×7 Command', h.isCashless ? 'Cashless ready' : 'Self-pay'].forEach((t) => {
    const chip = document.createElement('span');
    chip.className = 'overlay-chip';
    chip.textContent = t;
    rowTop.appendChild(chip);
  });

  const rowBottom = document.createElement('div');
  rowBottom.className = 'row';
  const spec = (h.specialties || []).slice(0, 2).join(', ') || 'Multi-speciality';
  [
    `${distance} km live`,
    `${h.beds || 140}+ beds`,
    spec,
  ].forEach((t) => {
    const chip = document.createElement('span');
    chip.className = 'overlay-chip';
    chip.textContent = t;
    rowBottom.appendChild(chip);
  });

  wrap.appendChild(rowTop);
  wrap.appendChild(rowBottom);
}

function openHospital(h, medsFlat) {
  const modal = qs('#hospitalModal');
  const distance = h.distance ?? distanceFor(h);
  qs('#modalTitle').textContent = h.name;
  qs('#modalCity').textContent = `${h.state || 'City'}`;
  qs('#modalDistance').textContent = `${distance} km away`;
  qs('#modalCashless').textContent = h.isCashless ? 'Cashless ready' : 'Self-pay';
  qs('#modalCashless').classList.toggle('pill', true);
  qs('#modalAddress').textContent = `${h.address || ''} • ${h.type || 'Multi-speciality'}`;

  qs('#modalImage').src = imageFor(h);
  qs('#modalImage').alt = `${h.name} preview`;
  renderOverlayBadges(h, distance);
  renderGlance(h, distance);

  const tagWrap = qs('#modalTags');
  tagWrap.innerHTML = '';
  (h.specialties || []).slice(0, 4).forEach((sp) => {
    const s = document.createElement('span');
    s.className = 'pill soft';
    s.textContent = sp;
    tagWrap.appendChild(s);
  });

  serviceRail(h, medsFlat, distance);
  renderDoctors(h);
  renderProcedures(h);
  renderMeds(medsFlat, h);
  renderLabs();
  renderContext();

  qs('#bookDoctor').onclick = () => toast('Doctor booking mapped to appointment flow');
  qs('#bookProcedure').onclick = () => toast('Admission request sent with shared profile');
  qs('#orderMeds').onclick = () => toast('Pharmacy mapped to hospital desk');
  qs('#bookLab').onclick = () => toast('Lab / home visit shared with hospital');
  qs('#refreshContext').onclick = renderContext;
  qs('#modalCall').onclick = () => window.open(`tel:${(h.contact || '').replace(/[^\d+]/g, '') || '108'}`, '_self');
  qs('#modalShare').onclick = async () => {
    const url = location.href.split('#')[0] + `#${h.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Share link copied');
    } catch {
      toast('Copy failed. Use Ctrl/Cmd+C');
    }
  };
  qs('#modalClose').onclick = closeHospital;

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeHospital() {
  const modal = qs('#hospitalModal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function openDoctorProfile(doc, hospital) {
  const modal = qs('#doctorProfile');
  if (!modal) return;
  qs('#docAvatar').src = doc.avatar;
  qs('#docAvatar').alt = doc.name;
  qs('#docName').textContent = doc.name;
  qs('#docMeta').textContent = `${doc.spec} • ${doc.exp} yrs`;
  const tags = qs('#docTags');
  tags.innerHTML = '';
  [
    `Languages: ${doc.langs}`,
    `Consultation Fee: ${doc.fee}`,
    `Hospital: ${hospital.name}`,
  ].forEach((t) => {
    const chip = document.createElement('span');
    chip.className = 'chip-pill';
    chip.textContent = t;
    tags.appendChild(chip);
  });
  qs('#docBio').textContent = doc.bio;
  const slots = qs('#docSlots');
  slots.innerHTML = '';
  doc.allSlots.forEach((s, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot-chip';
    btn.textContent = s;
    btn.addEventListener('click', () => {
      qs('#docSlots').querySelectorAll('.slot-chip').forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
    });
    if (idx === 0) btn.classList.add('active');
    slots.appendChild(btn);
  });

  qs('#docChat').onclick = () => toast(`Chat request sent to ${doc.name}`);
  qs('#docCall').onclick = () => toast('Hospital desk will connect you');
  qs('#docBook').onclick = () => {
    const chosen = qs('#docSlots .slot-chip.active');
    toast(chosen ? `Booked ${doc.name} • ${chosen.textContent}` : 'Select a slot');
  };
  qs('#docClose').onclick = closeDoctorProfile;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeDoctorProfile() {
  const modal = qs('#doctorProfile');
  modal?.classList.remove('show');
  modal?.setAttribute('aria-hidden', 'true');
}

(async function init() {
  bindTheme();
  try {
    const [providerData, medsJson] = await Promise.all([
      loadJSON('providers.json'),
      loadJSON('medicines.json'),
    ]);

    const medsFlat = (medsJson.categories || []).flatMap((c) => c.medicines || []);
    const hospitals = providerData.flatMap((p) =>
      (p.hospitals || []).map((h) => {
        const base = decorateHospital({ ...h, state: p.state });
        return {
          ...base,
          procedures: buildProcedures(base.specialties, 20),
          doctorsList: buildDoctors(base.specialties, 7),
          meds: buildPharmacy(medsFlat, 6),
          servicesList: coreServices(base),
        };
      }),
    );

    renderMetrics(hospitals);
    populateStateFilter(hospitals);
    populateSpecialtyFilter(hospitals);
    renderGrid(hospitals, medsFlat);

    ['searchInput', 'stateFilter', 'cashlessFilter', 'specialtyFilter'].forEach((id) => {
      qs(`#${id}`)?.addEventListener('input', () => applyFilters(hospitals, medsFlat));
      qs(`#${id}`)?.addEventListener('change', () => applyFilters(hospitals, medsFlat));
    });
    bindQuickFilters(hospitals, medsFlat);

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeHospital(); });
    qs('#hospitalModal')?.addEventListener('click', (e) => { if (e.target.id === 'hospitalModal') closeHospital(); });
    qs('#doctorProfile')?.addEventListener('click', (e) => { if (e.target.id === 'doctorProfile') closeDoctorProfile(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDoctorProfile(); });
  } catch (err) {
    console.error(err);
    toast('Unable to load hospitals right now.');
  }
})();
