const DemoUsers = {
    dhivakaran: {
        name: "Dhivakaran",
        id: "HF-2048-NEO",
        age: 29,
        blood: "O+",
        condition: "Healthy",
        wallet: "HDFC • 1234",
        risks: "Low",
        avatar: "https://i.pravatar.cc/150?u=dhiva",
        vitals: { heartRate: 72, bpSys: 118, bpDia: 78, spo2: 98, temp: 98.4, resp: 16, hrv: 65, stress: 12, sleep: 7.5 },
        labs: { platelets: "250,000", wbc: "6.5", troponin: 0.01, trend: "stable", egfr: 98, creatinine: 0.9, alt: 22, ast: 18, gut_motility: "Normal" },
        history: ["Tonsillectomy (2010)", "Drug Allergy: Penicillin"],
        medications: []
    },
    rahul: {
        name: "Rahul Verma",
        id: "HF-3321-dengue",
        age: 24,
        blood: "B+",
        condition: "Febrile Illness / Dengue",
        wallet: "UPI • 8822",
        risks: "Critical",
        avatar: "https://i.pravatar.cc/150?u=rahul",
        vitals: { heartRate: 105, bpSys: 100, bpDia: 65, spo2: 97, temp: 103.5, resp: 22, hrv: 25, stress: 88, sleep: 4.0 },
        labs: { platelets: "45,000", wbc: "2.8", troponin: 0.00, trend: "decreasing", malaria_ag: "Negative", egfr: 92, creatinine: 1.0, alt: 110, ast: 95, gut_motility: "Slow" },
        history: ["None"],
        medications: [{ name: "Paracetamol", dose: "650mg TDS" }]
    },
    leo: {
        name: "Baby Leo",
        id: "HF-NEO-009",
        age: 0.1, // Newborn (days)
        blood: "O+",
        condition: "Neonatal Jaundice / Preterm",
        wallet: "Parent • 9988",
        risks: "High",
        avatar: "https://i.pravatar.cc/150?u=leo",
        vitals: { heartRate: 150, bpSys: 60, bpDia: 40, spo2: 94, temp: 98.6, resp: 50, weight: 2.1 },
        labs: { bilirubin: 18.5, wbc: "15.0", crp: 1.2, blood_group: "O+ (Mother A+)" },
        history: ["Preterm Delivery (34 Weeks)"],
        medications: [{ name: "Vit K Inj", dose: "Stat" }]
    },
    priya: {
        name: "Priya Sharma",
        id: "HF-OBS-202",
        age: 28,
        blood: "B-",
        condition: "Pregnancy (34 Weeks) / PCOD Hx",
        wallet: "HDFC • 5544",
        risks: "Moderate",
        avatar: "https://i.pravatar.cc/150?u=priya",
        vitals: { heartRate: 88, bpSys: 135, bpDia: 88, spo2: 98, temp: 98.4, resp: 18 },
        labs: { hemoglobin: 10.2, glucose_fasting: 110, urine_protein: "Trace", fetal_hr: 140 },
        history: ["PCOD diagnosed 2018", "Laparoscopic Cystectomy 2019"],
        medications: [{ name: "Iron + Folic Acid", dose: "OD" }, { name: "Calcium", dose: "BD" }]
    },
    vikram: {
        name: "Vikram Singh",
        id: "HF-URO-771",
        age: 45,
        blood: "A+",
        condition: "Renal Colic / Stones",
        wallet: "ICICI • 1122",
        risks: "Moderate",
        avatar: "https://i.pravatar.cc/150?u=vikram",
        vitals: { heartRate: 95, bpSys: 140, bpDia: 90, spo2: 99, temp: 98.6, resp: 20, hrv: 40, stress: 60, sleep: 6.0 },
        labs: { creatinine: 1.4, urea: 45, urine_rbc: "Present", stone_size: "12mm", stone_loc: "Lower Pole Kidney", egfr: 55, alt: 25, ast: 20, gut_motility: "Normal" },
        history: ["Recurrent UTI"],
        medications: [{ name: "Tamsulosin", dose: "0.4mg HS" }]
    },
    anita: {
        name: "Anita Desai",
        id: "HF-CARD-882",
        age: 62,
        blood: "O+",
        condition: "Coronary Artery Disease / Dental Pain",
        wallet: "CITI • 4433",
        risks: "Critical",
        avatar: "https://i.pravatar.cc/150?u=anita",
        vitals: { heartRate: 78, bpSys: 150, bpDia: 95, spo2: 95, temp: 98.0, resp: 18, hrv: 30, stress: 45, sleep: 5.5 },
        labs: { troponin: 0.02, ldl: 160, angio_result: "Triple Vessel Disease (LAD 90%)", egfr: 60, creatinine: 1.2, alt: 30, ast: 28, gut_motility: "Sluggish" },
        history: ["Hypertension (10 years)", "Valve Replacement (2015)"],
        medications: [{ name: "Aspirin", dose: "75mg" }, { name: "Atorvastatin", dose: "40mg" }, { name: "Warfarin", dose: "2mg" }]
    },
    sam: {
        name: "Sam Wilson",
        id: "HF-ER-911",
        age: 30,
        blood: "AB-",
        condition: "Trauma / Road Traffic Accident",
        wallet: "Insurance • 9900",
        risks: "Emergency",
        avatar: "https://i.pravatar.cc/150?u=sam",
        vitals: { heartRate: 120, bpSys: 90, bpDia: 60, spo2: 92, temp: 97.5, resp: 28 },
        labs: { hemoglobin: 8.5, fast_scan: "Positive (Free Fluid)", fracture: "Femur Shaft (Open)" },
        history: ["None"],
        medications: []
    }
};

export { DemoUsers };

export function injectDemoData() {
    // 1. Check for saved user or default
    const currentUserId = localStorage.getItem('hf_demo_user') || 'dhivakaran';
    const user = DemoUsers[currentUserId];

    // 2. Update common DOM elements if they exist
    const elName = document.querySelector('.page-title h1, .stat strong, #user-name-display');
    if (elName && elName.innerText.includes('Dhivakaran')) {
        // Simple replacement attempt for demo purposes
        document.body.innerHTML = document.body.innerHTML.replace(/Dhivakaran/g, user.name);
    }

    // 3. Inject Switcher UI into Header (if not exists)
    const header = document.querySelector('.branding-right');
    if (header && !document.getElementById('user-switcher')) {
        const select = document.createElement('select');
        select.id = 'user-switcher';
        select.style.cssText = "background:var(--glass-bg); color:var(--text-main); border:1px solid var(--glass-border); padding:4px 8px; border-radius:8px; font-size:11px; margin-right:10px; cursor:pointer;";

        Object.keys(DemoUsers).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.innerText = DemoUsers[key].name;
            if (key === currentUserId) opt.selected = true;
            select.appendChild(opt);
        });

        select.addEventListener('change', (e) => {
            localStorage.setItem('hf_demo_user', e.target.value);
            location.reload();
        });

        header.prepend(select);
    }
}
