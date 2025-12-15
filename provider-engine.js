const ProviderEngine = (() => {
  const FALLBACK_LOCATION = { lat: 28.6139, lon: 77.2090, label: 'New Delhi (fallback)' };
  let providerData = [];
  let lastLocation = null;

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async function loadProviders() {
    if (providerData.length) return providerData;
    const res = await fetch('providers.json');
    providerData = await res.json();
    return providerData;
  }

  function annotateDistances(data, user) {
    return data.map(state => {
      const applyDistance = (item) => {
        return {
          ...item,
          distance_km: Number(calculateDistance(user.lat, user.lon, item.latitude, item.longitude).toFixed(1))
        };
      };
      return {
        ...state,
        hospitals: state.hospitals.map(applyDistance),
        clinics: state.clinics.map(applyDistance),
        doctors: state.doctors.map(applyDistance),
        pharmacies: state.pharmacies.map(applyDistance),
        labs: state.labs.map(applyDistance),
        ambulances: state.ambulances.map(applyDistance)
      };
    });
  }

  function flattenCategory(data, key) {
    return data.flatMap(state => state[key].map(item => ({ ...item, state: state.state })));
  }

  function getTopByDistance(data, key, count = 5) {
    return flattenCategory(data, key)
      .filter(item => item.distance_km !== null && !Number.isNaN(item.distance_km))
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, count);
  }

  function renderList(containerId, items, formatter) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = items.map(formatter).join('');
  }

  function hospitalCard(item) {
    return `<article class="hf-card">
      <div class="hf-card__title">${item.name}</div>
      <div class="hf-card__meta">${item.type} • ${item.beds} beds • Rating ${item.rating}</div>
      <div class="hf-card__meta">${item.specialties.join(', ')}</div>
      <div class="hf-card__meta">${item.address}</div>
      <div class="hf-card__meta">${item.isCashless ? 'Cashless enabled' : 'Billing supported'} • ${item.state}</div>
      <div class="hf-card__actions">${item.distance_km != null ? `${item.distance_km} km` : ''} • ${item.contact}</div>
    </article>`;
  }

  function doctorCard(item) {
    return `<article class="hf-card">
      <div class="hf-card__title">${item.name} — ${item.specialty}</div>
      <div class="hf-card__meta">${item.experience}+ yrs • Rating ${item.rating} • Fees ₹${item.fees}</div>
      <div class="hf-card__meta">${item.hospital} • ${item.isOnline ? 'Online consult' : 'In-clinic only'}</div>
      <div class="hf-card__meta">${item.state}</div>
      <div class="hf-card__actions">${item.distance_km != null ? `${item.distance_km} km` : ''} • ${item.contact || ''}</div>
    </article>`;
  }

  function labCard(item) {
    return `<article class="hf-card">
      <div class="hf-card__title">${item.name}</div>
      <div class="hf-card__meta">${item.services.slice(0,4).join(', ')}</div>
      <div class="hf-card__meta">${item.homeCollection ? 'Home collection' : 'Walk-in'} • Rating ${item.rating}</div>
      <div class="hf-card__meta">${item.address} • ${item.state}</div>
      <div class="hf-card__actions">${item.distance_km != null ? `${item.distance_km} km` : ''} • ${item.contact}</div>
    </article>`;
  }

  function pharmacyCard(item) {
    return `<article class="hf-card">
      <div class="hf-card__title">${item.name}</div>
      <div class="hf-card__meta">${item.is24x7 ? '24x7' : 'Daytime'} • ${item.hasDelivery ? 'Delivery' : 'Pickup only'}</div>
      <div class="hf-card__meta">${item.address} • ${item.state}</div>
      <div class="hf-card__actions">${item.distance_km != null ? `${item.distance_km} km` : ''} • ${item.contact}</div>
    </article>`;
  }

  function ambulanceCard(item) {
    return `<article class="hf-card">
      <div class="hf-card__title">${item.provider}</div>
      <div class="hf-card__meta">${item.type} • ${item.availability}</div>
      <div class="hf-card__meta">${item.state}</div>
      <div class="hf-card__actions">${item.distance_km != null ? `${item.distance_km} km` : ''} • ${item.contact}</div>
    </article>`;
  }

  async function getUserLocation() {
    if (!('geolocation' in navigator)) return { ...FALLBACK_LOCATION, source: 'fallback' };
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'gps' }),
        () => resolve({ ...FALLBACK_LOCATION, source: 'fallback-denied' }),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  async function init() {
    const [data, location] = await Promise.all([loadProviders(), getUserLocation()]);
    lastLocation = location;
    const enriched = annotateDistances(data, { lat: location.lat, lon: location.lon });
    render(enriched);
    return { data: enriched, location };
  }

  function render(data) {
    const hospitals = getTopByDistance(data, 'hospitals');
    const doctors = getTopByDistance(data, 'doctors');
    const labs = getTopByDistance(data, 'labs');
    const pharmacies = getTopByDistance(data, 'pharmacies');
    const ambulances = getTopByDistance(data, 'ambulances');

    renderList('hospitalList', hospitals, hospitalCard);
    renderList('doctorList', doctors, doctorCard);
    renderList('labList', labs, labCard);
    renderList('pharmacyList', pharmacies, pharmacyCard);
    renderList('ambulanceList', ambulances, ambulanceCard);
  }

  return {
    init,
    calculateDistance,
    getTopByDistance,
    annotateDistances,
    loadProviders,
    render,
    get lastLocation() {
      return lastLocation;
    }
  };
})();

window.ProviderEngine = ProviderEngine;

document.addEventListener('DOMContentLoaded', () => {
  ProviderEngine.init();
});
