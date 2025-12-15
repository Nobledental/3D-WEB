/* HealthFlo Pharmacy OS — dual dashboards with deep catalog */
document.addEventListener('DOMContentLoaded', () => {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmtRs = (n) => `₹${Number(n || 0).toFixed(2)}`;
  const toast = (msg) => {
    const t = qs('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1800);
  };

  const state = {
    categories: [],
    meds: [],
    activeOrders: [],
    activeStore: null,
  };

  const pharmacies = [
    { id: 'healthflo', name: 'HealthFlo Buffer Pharmacy', city: 'Virtual', area: 'Network', fulfilment: ['delivery', 'pickup'], distance: 0.4, eta: '18-25 min', delivery: true, buffer: true, live: true, offer: 'Routes every order safely', lat: 0, lng: 0 },
    { id: 'apollo', name: 'Apollo Hospitals Pharmacy', city: 'Delhi', area: 'Saket', fulfilment: ['delivery', 'pickup'], distance: 2.1, eta: '30-40 min', delivery: true, buffer: false, live: true, offer: 'Cold-chain ready', lat: 28.528, lng: 77.219 },
    { id: 'fortis', name: 'Fortis Hospital Pharmacy', city: 'Noida', area: 'Sector 62', fulfilment: ['delivery', 'pickup'], distance: 6.2, eta: '45-55 min', delivery: true, buffer: false, live: false, offer: 'Tele-consult on Rx', lat: 28.62, lng: 77.363 },
    { id: 'max', name: 'Max Hospital Pharmacy', city: 'Delhi', area: 'Vaishali', fulfilment: ['pickup'], distance: 10.4, eta: 'Ready in 15', delivery: false, buffer: false, live: false, offer: 'Pick-up express', lat: 28.648, lng: 77.339 },
    { id: 'kokilaben', name: 'Kokilaben Hospital Pharmacy', city: 'Mumbai', area: 'Andheri', fulfilment: ['delivery', 'pickup'], distance: 1.8, eta: '35-45 min', delivery: true, buffer: false, live: true, offer: 'Pack tracking', lat: 19.134, lng: 72.833 },
  ];

  const elMeds = qs('#medsGrid');
  const elStores = qs('#storeGrid');
  const statSubs = qs('#statSubs');
  const statOrders = qs('#statOrders');
  const statBuffer = qs('#statBuffer');
  const kMeds = qs('#kMeds');
  const kPharm = qs('#kPharm');
  const kLive = qs('#kLive');
  const liveStatus = qs('#liveStatus');
  const liveEta = qs('#liveEta');
  const trackProgress = qs('#trackProgress');

  const searchMeds = qs('#searchMeds');
  const therapeuticFilter = qs('#therapeuticFilter');
  const priceRange = qs('#priceRange');
  const priceValue = qs('#priceValue');
  const discountFilter = qs('#discountFilter');
  const autoLoadFromStores = qs('#autoLoadFromStores');

  const searchLocation = qs('#searchLocation');
  const fulfilmentFilter = qs('#fulfilmentFilter');
  const includeBuffer = qs('#includeBuffer');
  const sortNearest = qs('#sortNearest');
  const filterDelivery = qs('#filterDelivery');

  const storeModal = qs('#storeModal');
  const storeTitle = qs('#storeTitle');
  const storeMeta = qs('#storeMeta');
  const storeCategory = qs('#storeCategory');
  const storeSearch = qs('#storeSearch');
  const storeMedGrid = qs('#storeMedGrid');
  const storeClose = qs('#storeClose');

  const medDetail = qs('#medDetail');
  const medCategory = qs('#medCategory');
  const medTitle = qs('#medTitle');
  const medGeneric = qs('#medGeneric');
  const medPrice = qs('#medPrice');
  const medMrp = qs('#medMrp');
  const medDiscount = qs('#medDiscount');
  const medRx = qs('#medRx');
  const medNotes = qs('#medNotes');
  const medTags = qs('#medTags');
  const subGrid = qs('#subGrid');
  const btnMedClose = qs('#btnMedClose');

  const themeToggle = qs('#themeToggle');
  const mappedOrderName = qs('#mappedOrderName');
  const mappingBadge = qs('#mappingBadge');

  themeToggle?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
  });

  async function loadCatalog() {
    try {
      const res = await fetch('medicines.json');
      const data = await res.json();
      state.categories = data.categories || [];
      state.meds = state.categories.flatMap((cat) => (cat.medicines || []).map((m) => ({ ...m, category: cat.name })));
      populateCategoryFilters();
      rebuildStoreInventories();
      kMeds.textContent = state.meds.length.toString();
      applyMedsFilter();
      filterStores();
    } catch (err) {
      console.error(err);
      toast('Unable to load catalog');
    }
  }

  function populateCategoryFilters() {
    const opts = state.categories.map((c) => `<option value="${c.name}">${c.name}</option>`).join('');
    if (therapeuticFilter) therapeuticFilter.innerHTML = `<option value="">All</option>${opts}`;
    if (storeCategory) storeCategory.innerHTML = `<option value="">All</option>${opts}`;
  }

  function rebuildStoreInventories() {
    pharmacies.forEach((store) => {
      store.inventory = state.meds.filter((m) => (m.stores || []).includes(store.id));
      store.categoryCounts = store.inventory.reduce((acc, med) => {
        acc[med.category] = (acc[med.category] || 0) + 1;
        return acc;
      }, {});
    });
    kPharm.textContent = pharmacies.length.toString();
    kLive.textContent = pharmacies.filter((p) => p.live).length.toString();
  }

  function applyMedsFilter() {
    const q = (searchMeds?.value || '').toLowerCase();
    const category = therapeuticFilter?.value || '';
    const priceCap = Number(priceRange?.value || 1200);
    const disc = discountFilter?.value ? Number(discountFilter.value) : 0;

    const allowedStores = autoLoadFromStores?.checked ? new Set(filterStores(true).flatMap((s) => s.inventory.map((m) => m.id))) : null;

    let list = state.meds.filter((m) => {
      const hay = `${m.brand} ${m.generic} ${m.category}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (category && m.category !== category) return false;
      if (m.price > priceCap) return false;
      if (disc && m.discount < disc) return false;
      if (allowedStores && !allowedStores.has(m.id)) return false;
      return true;
    });

    const rowCap = 15; // 3 rows of 5-ish cards
    const cap = category ? Math.max(10, rowCap) : rowCap;
    renderMeds(list.slice(0, cap));
    if (priceValue) priceValue.textContent = `Up to ₹${priceCap}`;
  }

  function renderMeds(list) {
    elMeds.innerHTML = '';
    list.forEach((m) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="badges">${m.rx ? '<span class="badge">Rx</span>' : '<span class="badge">OTC</span>'}<span class="badge">${m.category}</span></div>
        <h3 class="title">${m.brand}</h3>
        <p class="sub">${m.generic} • ${m.form} • ${m.strength}</p>
        <div class="price-line"><strong>${fmtRs(m.price)}</strong><span class="muted"><s>${fmtRs(m.mrp)}</s></span><span class="badge">${m.discount}% OFF</span></div>
        <p class="muted">Available at: ${(m.stores || []).map((id) => pharmacyName(id)).join(', ')}</p>
        <div class="badges">
          <button class="pill outline" data-med="${m.id}">Details</button>
          <button class="pill solid" data-cart="${m.id}">Add & track</button>
        </div>
      `;
      card.querySelector('[data-med]')?.addEventListener('click', () => openMedDetail(m));
      card.querySelector('[data-cart]')?.addEventListener('click', () => placeOrder(m));
      elMeds.appendChild(card);
    });
    if (statSubs) statSubs.textContent = '0';
  }

  function pharmacyName(id) {
    return pharmacies.find((p) => p.id === id)?.name || id;
  }

  function filterStores(skipRender = false) {
    const needle = (searchLocation?.value || '').toLowerCase();
    const fulfil = fulfilmentFilter?.value || '';
    const deliveryOnly = filterDelivery?.classList.contains('active');
    let list = pharmacies.filter((p) => {
      const hay = `${p.name} ${p.city} ${p.area}`.toLowerCase();
      if (needle && !hay.includes(needle)) return false;
      if (fulfil && !p.fulfilment.includes(fulfil)) return false;
      if (deliveryOnly && !p.delivery) return false;
      if (!includeBuffer?.checked && p.buffer) return false;
      return true;
    });
    if (sortNearest?.classList.contains('active')) {
      list = list.slice().sort((a, b) => a.distance - b.distance);
    }
    if (!skipRender) renderStores(list);
    return list;
  }

  function renderStores(list) {
    elStores.innerHTML = '';
    list.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'card';
      const catCount = Object.keys(p.categoryCounts || {}).length;
      card.innerHTML = `
        <div class="badges">${p.buffer ? '<span class="badge">HealthFlo buffer</span>' : ''}${p.delivery ? '<span class="badge">Delivery</span>' : '<span class="badge">Pick-up</span>'}</div>
        <h3 class="title">${p.name}</h3>
        <p class="sub">${p.area}, ${p.city}</p>
        <p class="muted">Fulfilment: ${p.fulfilment.join(' / ')} • ETA ${p.eta}</p>
        <div class="price-line"><strong>${p.distance} km</strong><span class="muted">away</span><span class="badge">${catCount} categories</span></div>
        <p class="muted">${p.offer}</p>
        <div class="badges">
          <button class="pill outline" data-open="${p.id}">Inventory</button>
          <button class="pill solid" data-route="${p.id}">Route via ${p.buffer ? 'Buffer' : 'Store'}</button>
        </div>
      `;
      card.querySelector('[data-open]')?.addEventListener('click', () => openStoreModal(p));
      card.querySelector('[data-route]')?.addEventListener('click', () => startLive(p));
      elStores.appendChild(card);
    });
  }

  function openStoreModal(store) {
    state.activeStore = store;
    storeTitle.textContent = store.name;
    storeMeta.textContent = `${store.area}, ${store.city} • ${store.fulfilment.join(' / ')} • ETA ${store.eta}`;
    storeCategory.value = '';
    storeSearch.value = '';
    renderStoreMeds();
    openModal(storeModal);
  }

  function renderStoreMeds() {
    if (!state.activeStore) return;
    const q = (storeSearch.value || '').toLowerCase();
    const cat = storeCategory.value;
    let list = (state.activeStore.inventory || []).filter((m) => {
      const hay = `${m.brand} ${m.generic} ${m.category}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (cat && m.category !== cat) return false;
      return true;
    });
    const cap = cat ? Math.max(10, list.length) : Math.min(list.length, 18);
    list = list.slice(0, cap);
    storeMedGrid.innerHTML = '';
    list.forEach((m) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="badges">${m.rx ? '<span class="badge">Rx</span>' : '<span class="badge">OTC</span>'}<span class="badge">${m.category}</span></div>
        <h3 class="title">${m.brand}</h3>
        <p class="sub">${m.generic} • ${m.form} • ${m.strength}</p>
        <div class="price-line"><strong>${fmtRs(m.price)}</strong><span class="muted"><s>${fmtRs(m.mrp)}</s></span><span class="badge">${m.discount}% OFF</span></div>
        <p class="muted">Pack: ${m.pack}</p>
        <div class="badges">
          <button class="pill outline" data-med="${m.id}">Details</button>
          <button class="pill solid" data-cart="${m.id}">Add & track</button>
        </div>
      `;
      card.querySelector('[data-med]')?.addEventListener('click', () => openMedDetail(m));
      card.querySelector('[data-cart]')?.addEventListener('click', () => placeOrder(m));
      storeMedGrid.appendChild(card);
    });
  }

  function openMedDetail(med) {
    medCategory.textContent = med.category;
    medTitle.textContent = med.brand;
    medGeneric.textContent = `${med.generic} • ${med.form} • ${med.strength}`;
    medPrice.textContent = fmtRs(med.price);
    medMrp.textContent = fmtRs(med.mrp);
    medDiscount.textContent = `${med.discount}% OFF`;
    medRx.textContent = med.rx ? 'Prescription (Rx)' : 'OTC';
    medNotes.textContent = med.notes || 'Mapped from the new catalog. Includes HealthFlo buffer eligibility and substitute hints.';
    medTags.innerHTML = '';
    (med.tags || []).forEach((t) => {
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = t;
      medTags.appendChild(span);
    });

    subGrid.innerHTML = '';
    const subs = state.meds.filter((m) => m.substituteKey === med.substituteKey && m.id !== med.id).slice(0, 6);
    if (statSubs) statSubs.textContent = subs.length.toString();
    subs.forEach((s) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <h4 class="title">${s.brand}</h4>
        <p class="sub">${s.generic}</p>
        <div class="price-line"><strong>${fmtRs(s.price)}</strong><span class="muted"><s>${fmtRs(s.mrp)}</s></span></div>
        <button class="pill outline" data-med="${s.id}">View</button>
      `;
      card.querySelector('[data-med]')?.addEventListener('click', () => openMedDetail(s));
      subGrid.appendChild(card);
    });

    openModal(medDetail);
  }

  function placeOrder(med) {
    const order = { id: `HF-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, med, status: 'Preparing', eta: 18 };
    state.activeOrders.unshift(order);
    if (statOrders) statOrders.textContent = state.activeOrders.length.toString();
    if (statBuffer) statBuffer.textContent = '100%';
    mapOrderToPages(med);
    const store = pharmacies.find((p) => (med.stores || []).includes(p.id)) || pharmacies[0];
    startLive(store);
    toast(`${med.brand} added — tracking live`);
  }

  function startLive(store) {
    liveStatus.textContent = `${store.name} — rider assigned`;
    liveEta.textContent = `ETA ${store.eta}`;
    trackProgress.style.width = '18%';
    let progress = 18;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + Math.random() * 18);
      trackProgress.style.width = `${progress}%`;
      if (progress >= 100) {
        liveStatus.textContent = `${store.name} — Delivered`;
        liveEta.textContent = 'Arrived';
        clearInterval(timer);
      }
    }, 1200);
  }

  function openModal(el) {
    if (!el) return;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
  }
  function closeModal(el) {
    if (!el) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
  }

  function initHandlers() {
    [searchMeds, therapeuticFilter, discountFilter].forEach((el) => el?.addEventListener('input', applyMedsFilter));
    priceRange?.addEventListener('input', applyMedsFilter);
    autoLoadFromStores?.addEventListener('change', applyMedsFilter);
    [searchLocation, fulfilmentFilter].forEach((el) => el?.addEventListener('input', () => filterStores()));
    includeBuffer?.addEventListener('change', () => filterStores());
    sortNearest?.addEventListener('click', () => { sortNearest.classList.toggle('active'); filterStores(); });
    filterDelivery?.addEventListener('click', () => { filterDelivery.classList.toggle('active'); filterStores(); });

    qs('#ctaOrder')?.addEventListener('click', () => toast('Opening quick order…'));
    qs('#ctaLocate')?.addEventListener('click', () => { sortNearest?.classList.add('active'); filterStores(); toast('Sorted by nearest'); });
    qs('#ctaWhatsApp')?.addEventListener('click', () => toast('WhatsApp concierge ready'));
    qs('#syncHealth')?.addEventListener('click', () => toast('Synced to patient-health.html'));
    qs('#openTracker')?.addEventListener('click', () => toast('Live tracker opened'));

    storeClose?.addEventListener('click', () => closeModal(storeModal));
    btnMedClose?.addEventListener('click', () => closeModal(medDetail));
    storeCategory?.addEventListener('change', renderStoreMeds);
    storeSearch?.addEventListener('input', renderStoreMeds);

    [storeModal, medDetail].forEach((m) => m?.addEventListener('click', (e) => { if (e.target === m) closeModal(m); }));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        [storeModal, medDetail].forEach((m) => closeModal(m));
      }
    });
  }

  function initStats() {
    if (statSubs) statSubs.textContent = '0';
    if (statOrders) statOrders.textContent = state.activeOrders.length.toString();
    if (statBuffer) statBuffer.textContent = '100%';
    hydrateMapping();
  }

  function mapOrderToPages(med) {
    const payload = { id: med.id, brand: med.brand, generic: med.generic, ts: Date.now() };
    localStorage.setItem('hf-latest-order', JSON.stringify(payload));
    renderOrderMapping(payload);
  }

  function renderOrderMapping(order) {
    if (!order || !mappedOrderName || !mappingBadge) return;
    mappedOrderName.textContent = `${order.brand} • synced to Dashboard, Health, Labs`;
    mappingBadge.textContent = 'Synced across pages';
    mappingBadge.classList.add('synced');
  }

  function hydrateMapping() {
    try {
      const saved = localStorage.getItem('hf-latest-order');
      if (saved) {
        const parsed = JSON.parse(saved);
        renderOrderMapping(parsed);
      }
    } catch (err) {
      console.warn('Unable to restore mapping', err);
    }
  }

  initHandlers();
  initStats();
  loadCatalog();
});
