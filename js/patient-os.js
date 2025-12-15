(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('hf-theme');

  if (savedTheme) {
    root.dataset.theme = savedTheme;
  }

  function setTheme(next) {
    root.dataset.theme = next;
    localStorage.setItem('hf-theme', next);
    if (themeToggle) {
      themeToggle.textContent = next === 'vision' ? '🌞' : '🌓';
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = root.dataset.theme === 'vision' ? 'matte' : 'vision';
      setTheme(nextTheme);
    });
  }

  function initOrganPage() {
    const viewer = document.getElementById('organ_model_viewer');
    if (!viewer) return;

    const organLegend = document.getElementById('organ_studio_summary');
    const organLab = document.getElementById('organ_studio_lab');
    const organStatus = document.getElementById('organ_studio_status');
    const organTitle = document.getElementById('organ_studio_title');
    const organNext = document.getElementById('organ_studio_next');
    const organVitals = document.getElementById('organ_studio_vitals');
    const organSync = document.getElementById('organ_studio_sync');
    const heartModel = document.querySelector('.atlas-card[data-organ="heart"] model-viewer');
    const liveIndicator = document.getElementById('organ_live_indicator');

    const fallbackSrc = viewer.dataset.fallback;

    const organModels = {
      heart: {
        label: 'Heart studio',
        src: '3d_models/heart.glb',
        lab: 'ECG · Troponin · Echo',
        next: 'Keep cardio diary and sync ECG to Dashboard',
      },
      liver: {
        label: 'Liver studio',
        src: '3d_models/liver.glb',
        lab: 'LFT trend from Labs page',
        next: 'Hydration reminder synced to Health',
      },
      cirrhotic_liver: {
        label: 'Cirrhotic liver',
        src: '3d_models/cirrhotic_liver.glb',
        lab: 'Fibrosis panel mirrored to Labs',
        next: 'Flag hepatology consult in Dashboard',
      },
      lungs: {
        label: 'Lung studio',
        src: '3d_models/lungs.glb',
        lab: 'Spirometry & SpO₂ stream',
        next: 'Breathing exercise in Health plan',
      },
      kidneys: {
        label: 'Kidney studio',
        src: '3d_models/kidneys.glb',
        lab: 'Creatinine & hydration cues',
        next: 'Hydration alerts mirrored to Devices',
      },
      eyes: {
        label: 'Eye studio',
        src: '3d_models/eyes.glb',
        lab: 'Vision strain + tear film sync',
        next: 'Book optometry follow-up in Hospitals',
      },
      brain: {
        label: 'Brain studio',
        src: '3d_models/brain.glb',
        lab: 'Sleep + stress biometrics',
        next: 'Push focus routine to Dashboard',
      },
      pancreas: {
        label: 'Pancreas (fallback model)',
        src: '',
        lab: 'Metabolic stream mirrored from Labs',
        next: 'Request pancreas mesh upload in Settings',
      },
    };

    const vitals = {
      heartRate: 76,
      bpSys: 118,
      bpDia: 74,
      spo2: 98,
      resp: 16,
      temp: 98.4,
    };

    const organStatusMap = {
      heart: document.getElementById('heart_status'),
      lungs: document.getElementById('lung_status'),
      liver: document.getElementById('liver_status'),
      kidney: document.getElementById('kidney_status'),
      brain: document.getElementById('brain_status'),
      dental: document.getElementById('dental_status'),
      vascular: document.getElementById('vascular_status'),
      endocrine: document.getElementById('endocrine_status'),
      immune: document.getElementById('immune_status'),
      musculoskeletal: document.getElementById('musculoskeletal_status'),
      gi: document.getElementById('gi_status'),
      pancreas: document.getElementById('pancreas_status'),
      spleen: document.getElementById('spleen_status'),
      reproductive: document.getElementById('reproductive_status'),
      skin: document.getElementById('skin_status'),
      eye: document.getElementById('eye_status'),
      ear: document.getElementById('ear_status'),
      bladder: document.getElementById('bladder_status'),
    };

    const organValueMap = {
      heart: document.getElementById('heart_vitals'),
      lungs: document.getElementById('lung_vitals'),
      liver: document.getElementById('liver_markers'),
      kidney: document.getElementById('kidney_markers'),
      brain: document.getElementById('brain_state'),
      dental: document.getElementById('dental_state'),
      vascular: document.getElementById('vascular_state'),
      endocrine: document.getElementById('endocrine_state'),
      immune: document.getElementById('immune_state'),
      musculoskeletal: document.getElementById('msk_state'),
      gi: document.getElementById('gi_state'),
      pancreas: document.getElementById('pancreas_state'),
      spleen: document.getElementById('spleen_state'),
      reproductive: document.getElementById('reproductive_state'),
      skin: document.getElementById('skin_state'),
      eye: document.getElementById('eye_state'),
      ear: document.getElementById('ear_state'),
      bladder: document.getElementById('bladder_state'),
    };

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function band(value, { low, normalLow, normalHigh, high }) {
      if (value < low || value > high) return 'low';
      if (value < normalLow || value > normalHigh) return 'borderline';
      return 'normal';
    }

    function setCardState(card, state, text) {
      if (!card) return;
      card.classList.remove('state-low', 'state-borderline', 'state-normal');
      card.classList.add(`state-${state}`);
      const pill = card.querySelector('.pill');
      if (pill) {
        pill.classList.remove('low', 'borderline', 'normal', 'warn', 'success');
        const label = state === 'low' ? 'Low' : state === 'borderline' ? 'Borderline' : 'Normal';
        pill.textContent = label;
        pill.classList.add(state === 'low' ? 'warn' : state === 'borderline' ? '' : 'success');
      }
      const stat = card.querySelector('.stat-line strong');
      if (stat && text) stat.textContent = text;
    }

    function updatePumpAnimation() {
      const speed = Math.max(0.4, 60 / Math.max(vitals.heartRate, 1));
      const strength = 1 + Math.max(0, (vitals.bpSys - 110) / 420);
      viewer.style.setProperty('--pulse-speed', `${speed.toFixed(2)}s`);
      viewer.style.setProperty('--pulse-scale', strength.toFixed(3));
      heartModel?.classList.add('pumping');
      viewer.classList.add('pumping');
    }

    function applyLiveVitals() {
      const hrState = band(vitals.heartRate, { low: 58, normalLow: 65, normalHigh: 99, high: 112 });
      const bpState = band(vitals.bpSys, { low: 92, normalLow: 100, normalHigh: 130, high: 142 });
      const spo2State = band(vitals.spo2, { low: 93, normalLow: 95, normalHigh: 99, high: 100 });
      const overall = [hrState, bpState, spo2State].includes('low')
        ? 'low'
        : [hrState, bpState, spo2State].includes('borderline')
          ? 'borderline'
          : 'normal';

      document.getElementById('organ_vitals_hr').textContent = `${vitals.heartRate} bpm`;
      document.getElementById('organ_vitals_bp').textContent = `${vitals.bpSys}/${vitals.bpDia} mmHg`;
      document.getElementById('organ_vitals_spo2').textContent = `${vitals.spo2}%`;
      document.getElementById('organ_vitals_resp').textContent = `${vitals.resp} rpm`;
      document.getElementById('organ_vitals_temp').textContent = `${vitals.temp.toFixed(1)} °F`;

      if (organVitals) {
        organVitals.textContent = `${vitals.heartRate} bpm · ${vitals.bpSys}/${vitals.bpDia} mmHg · ${vitals.spo2}% SpO₂`;
      }

      if (organNext) {
        organNext.textContent = overall === 'low'
          ? 'Auto-escalate to dashboard and hospitals'
          : overall === 'borderline'
            ? 'Keep syncing vitals; labs are mirroring'
            : 'Vitals steady; synced to dashboard + labs';
      }

      const heartCard = document.querySelector('.organ-card[data-organ="heart"]');
      setCardState(heartCard, overall, `${vitals.heartRate} bpm · ${vitals.bpSys}/${vitals.bpDia}`);

      const notice = document.getElementById('organ_alert');
      const badge = document.getElementById('organ_alert_badge');
      if (notice && badge) {
        notice.classList.remove('warn', 'success');
        if (overall === 'low') {
          notice.textContent = 'Vitals dropped — alert mirrored to dashboard';
          notice.classList.add('warn');
          badge.textContent = '1 urgent alert';
        } else if (overall === 'borderline') {
          notice.textContent = 'Vitals borderline — keeping you under watch';
          notice.classList.add('warn');
          badge.textContent = '1 watch alert';
        } else {
          notice.textContent = 'All clear';
          notice.classList.add('success');
          badge.textContent = '0 alerts';
        }
      }

      if (liveIndicator) {
        liveIndicator.textContent = 'Live';
        liveIndicator.classList.add('success');
      }

      updatePumpAnimation();
    }

    function driftVitals() {
      vitals.heartRate = clamp(vitals.heartRate + (Math.random() * 6 - 3), 55, 118).toFixed(0) * 1;
      vitals.bpSys = clamp(vitals.bpSys + (Math.random() * 6 - 3), 98, 140).toFixed(0) * 1;
      vitals.bpDia = clamp(vitals.bpDia + (Math.random() * 3 - 1.5), 62, 92).toFixed(0) * 1;
      vitals.spo2 = clamp(vitals.spo2 + (Math.random() * 1.5 - 0.7), 93, 100).toFixed(0) * 1;
      vitals.resp = clamp(vitals.resp + (Math.random() * 2 - 1), 12, 22).toFixed(0) * 1;
      vitals.temp = clamp(vitals.temp + (Math.random() * 0.25 - 0.12), 97.4, 99.8);
      applyLiveVitals();
    }

    function loadOrgan(key) {
      const data = organModels[key] || organModels.heart;
      const src = data.src || fallbackSrc;
      viewer.setAttribute('src', src);
      viewer.setAttribute('camera-controls', '');
      viewer.setAttribute('auto-rotate', '');
      viewer.setAttribute('reveal', 'interaction');
      viewer.classList.toggle('pumping', key === 'heart');
      if (organLegend) organLegend.textContent = `${data.label} synced across dashboard, labs, and vitals.`;
      if (organLab) organLab.textContent = data.lab;
      if (organStatus) organStatus.textContent = data.src ? 'Ready' : 'Fallback';
      if (organTitle) organTitle.textContent = data.label;
      if (organSync) organSync.textContent = 'Dashboard · Health · Labs · Vitals · Pharmacy · Hospitals';
      const cards = document.querySelectorAll('.atlas-card, .organ-card');
      cards.forEach(card => card.classList.remove('active'));
      document.querySelectorAll(`[data-organ="${key}"]`).forEach(card => card.classList.add('active'));
      if (!data.src) {
        viewer.classList.add('fallback-globe');
      } else {
        viewer.classList.remove('fallback-globe');
      }
      if (key === 'heart') updatePumpAnimation();
    }

    document.querySelectorAll('.atlas-card').forEach(card => {
      card.addEventListener('click', () => loadOrgan(card.dataset.organ));
    });

    document.querySelectorAll('.organ-card').forEach(card => {
      card.addEventListener('click', () => loadOrgan(card.dataset.organ));
    });

    loadOrgan('heart');
    applyLiveVitals();
    setInterval(driftVitals, 2600);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initOrganPage();
  });
})();
