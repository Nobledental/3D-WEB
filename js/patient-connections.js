const deviceRows = document.querySelectorAll('#device_status_rows tr');
const statusStates = [
  { status: 'Connected', signal: 'Strong', eta: 'Just now' },
  { status: 'Ready', signal: 'Moderate', eta: '2 min ago' },
  { status: 'Standby', signal: 'Idle', eta: '—' },
  { status: 'Syncing', signal: 'Strong', eta: 'Syncing' },
];

function randomState() {
  return statusStates[Math.floor(Math.random() * statusStates.length)];
}

function refreshDeviceStatuses() {
  deviceRows.forEach(row => {
    const state = randomState();
    const [statusCell, signalCell, etaCell] = [
      row.children[1],
      row.children[2],
      row.children[3],
    ];
    if (!statusCell || !signalCell || !etaCell) return;

    const statusBadge = statusCell.querySelector('.chip');
    const signalBadge = signalCell.querySelector('.chip');

    if (statusBadge) statusBadge.textContent = state.status;
    if (signalBadge) signalBadge.textContent = state.signal;
    etaCell.textContent = state.eta;
  });
}

if (deviceRows.length) {
  refreshDeviceStatuses();
  setInterval(refreshDeviceStatuses, 8000);
}

const FAMILY_KEY = 'family-profiles';
const defaultFamily = [
  { name: 'Riya (Sister)', role: 'Viewer', canShare: true },
  { name: 'Anand (Dad)', role: 'Guardian', canShare: true },
  { name: 'Priya (Partner)', role: 'Admin', canShare: true }
];
const loadFamily = () => {
  try {
    const data = JSON.parse(localStorage.getItem(FAMILY_KEY) || '[]');
    return data.length ? data : [...defaultFamily];
  } catch {
    return [...defaultFamily];
  }
};
const saveFamily = (list) => localStorage.setItem(FAMILY_KEY, JSON.stringify(list));

const renderFamily = () => {
  const list = loadFamily();
  const wrap = document.getElementById('familyList');
  const tiles = document.getElementById('family_tiles');
  if (wrap) {
    wrap.innerHTML = '';
    if (!list.length) wrap.textContent = 'No family linked yet.';
    list.forEach(member => {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = `${member.name} • ${member.role} ${member.canShare ? '• Mirroring' : ''}`;
      wrap.appendChild(pill);
    });
  }
  if (tiles) {
    tiles.innerHTML = '';
    list.forEach(member => {
      const card = document.createElement('div');
      card.className = 'stat';
      card.innerHTML = `<small>${member.name}</small><strong>${member.role}</strong><span class="hint">${member.canShare ? 'Live alerts mirrored' : 'Sharing paused'}</span>`;
      card.addEventListener('click', () => {
        card.classList.toggle('pulse');
        member.canShare = !member.canShare;
        saveFamily(list);
        renderFamily();
      });
      tiles.appendChild(card);
    });
  }
};

const familyForm = document.getElementById('familyForm');
if (familyForm) {
  familyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const list = loadFamily();
    const name = document.getElementById('familyName').value.trim();
    const role = document.getElementById('familyRole').value.trim();
    const phone = document.getElementById('familyPhone').value.trim();
    const canShare = document.getElementById('familyShare').checked;
    if (!name || !role) return;
    list.push({ name, role, phone, canShare });
    saveFamily(list);
    renderFamily();
    familyForm.reset();
    document.getElementById('familyShare').checked = true;
  });
}

renderFamily();
