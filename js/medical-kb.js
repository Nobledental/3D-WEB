export const KnowledgeBase = [
    // --- DENTAL CONDITIONS ---
    {
        id: "dental_caries",
        category: "Dental",
        match: (p, v, l) => p.condition?.includes("Tooth Pain") || p.symptoms?.includes("Cavity"),
        diagnosis: "Dental Caries (Tooth Decay)",
        treatment: "Restoration (Filling)",
        medication: "None usually. NSAIDs for pain.",
        reason: "Removal of decayed tooth structure and filling to restore function.",
        specialist: "Dentist"
    },
    {
        id: "dental_pulpitis",
        category: "Dental",
        match: (p, v, l) => p.condition?.includes("Sensitivity") && p.condition?.includes("Severe Pain"),
        diagnosis: "Irreversible Pulpitis",
        treatment: "Root Canal Treatment (RCT)",
        medication: "Ketorolac 10mg (SOS), Amoxicillin 500mg (if abscess).",
        reason: "Infection has reached the pulp. RCT is required to save the tooth.",
        specialist: "Endodontist"
    },
    {
        id: "dental_gingivitis",
        category: "Dental",
        match: (p, v, l) => p.condition?.includes("Bleeding Gums"),
        diagnosis: "Gingivitis",
        treatment: "Professional Scaling & Polishing",
        medication: "Chlorhexidine Mouthwash.",
        reason: "Removal of plaque/calculus is necessary to reverse gum inflammation.",
        specialist: "Periodontist"
    },
    {
        id: "dental_impacted",
        category: "Dental",
        match: (p, v, l) => p.condition?.includes("Wisdom Tooth"),
        diagnosis: "Impacted Third Molar",
        treatment: "Surgical Extraction (Odontectomy)",
        medication: "Antibiotics + Analgesics post-op.",
        reason: "Impaction causes pain and can damage adjacent teeth.",
        specialist: "Oral Surgeon"
    },

    // --- EYE CONDITIONS ---
    {
        id: "eye_cataract",
        category: "Eye",
        match: (p, v, l) => p.age > 60 && p.condition?.includes("Blurry Vision"),
        diagnosis: "Senile Cataract",
        treatment: "Phacoemulsification with IOL Implantation",
        medication: "Post-op Steroid/Antibiotic drops.",
        reason: "Surgical replacement of the clouded lens is the only cure.",
        specialist: "Ophthalmologist"
    },
    {
        id: "eye_conjunctivitis",
        category: "Eye",
        match: (p, v, l) => p.condition?.includes("Red Eye") || p.condition?.includes("Discharge"),
        diagnosis: "Conjunctivitis (Pink Eye)",
        treatment: "Topical Antibiotics (Moxifloxacin)",
        medication: "Lubricating drops.",
        reason: "Bacterial infection requires topical antibiotics to clear.",
        specialist: "Ophthalmologist"
    },
    {
        id: "eye_dr",
        category: "Eye",
        match: (p, v, l) => p.history?.includes("Diabetes") && p.condition?.includes("Vision Loss"),
        diagnosis: "Diabetic Retinopathy",
        treatment: "Laser Photocoagulation / Anti-VEGF Injections",
        medication: "Control Blood Sugar strict.",
        reason: "Prevent further retinal damage and neovascularization.",
        specialist: "Retina Specialist"
    },

    // --- CARDIOLOGY ---
    {
        id: "cardio_mi",
        category: "Cardiology",
        match: (p, v, l) => l.troponin > 0.04,
        diagnosis: "Acute Myocardial Infarction (STEMI/NSTEMI)",
        treatment: "Primary Angioplasty (PCI)",
        medication: "Dual Antiplatelets (Aspirin+Clopidogrel), Statins, Heparin.",
        reason: "Immediate revascularization is critical to save heart muscle.",
        specialist: "Interventional Cardiologist"
    },
    {
        id: "cardio_htn",
        category: "Cardiology",
        match: (p, v, l) => v.bpSys > 140 || v.bpDia > 90,
        diagnosis: "Hypertension (Stage 2)",
        treatment: "Antihypertensive Therapy",
        medication: "Amlodipine 5mg / Telmisartan 40mg.",
        reason: "BP control reduces risk of Stroke and Kidney Failure.",
        specialist: "Cardiologist / Physician"
    },
    {
        id: "cardio_cad_tv",
        category: "Cardiology",
        match: (p, v, l) => l.angio_result?.includes("Triple Vessel"),
        diagnosis: "Coronary Artery Disease (Triple Vessel)",
        treatment: "Coronary Artery Bypass Graft (CABG)",
        medication: "Beta-blockers, Statins, Aspirin.",
        reason: "Multiple blockages are best bypassing surgically for long-term patency.",
        specialist: "CT Surgeon"
    },

    // --- RENAL & UROLOGY ---
    {
        id: "renal_stone_small",
        category: "Renal",
        match: (p, v, l) => parseFloat(l.stone_size) < 5,
        diagnosis: "Small Renal Calculus (<5mm)",
        treatment: "Medical Expulsion Therapy (MET)",
        medication: "Tamsulosin 0.4mg + Hydration.",
        reason: "Small stones often pass spontaneously with ureteral relaxation.",
        specialist: "Urologist"
    },
    {
        id: "renal_stone_rirs",
        category: "Renal",
        match: (p, v, l) => parseFloat(l.stone_size) >= 5 && parseFloat(l.stone_size) < 20,
        diagnosis: "Moderate Renal Calculus",
        treatment: "RIRS (Retrograde Intrarenal Surgery) or ESWL",
        medication: "Post-op Antibiotics.",
        reason: "Stone is too large to pass but amenable to laser fragmentation.",
        specialist: "Urologist"
    },
    {
        id: "renal_stone_pcnl",
        category: "Renal",
        match: (p, v, l) => parseFloat(l.stone_size) >= 20,
        diagnosis: "Large Staghorn Calculus",
        treatment: "PCNL (Percutaneous Nephrolithotomy)",
        medication: "IV Antibiotics.",
        reason: "Large stone burden requires keyhole surgery for clearance.",
        specialist: "Urologist"
    },

    // --- INFECTIOUS DISEASES ---
    {
        id: "inf_dengue",
        category: "Infectious",
        match: (p, v, l) => parseInt(l.platelets?.replace(/,/g, '') || 999999) < 100000,
        diagnosis: "Dengue Fever / Thrombocytopenia",
        treatment: "Fluid Resuscitation & Monitoring",
        medication: "Paracetamol (No NSAIDs!), Papaya Leaf Extract.",
        reason: "Fluid management is key to prevent shock. NSAIDs increase bleed risk.",
        specialist: "General Physician"
    },
    {
        id: "inf_malaria",
        category: "Infectious",
        match: (p, v, l) => l.malaria_ag === "Positive",
        diagnosis: "Malaria (P. falciparum/vivax)",
        treatment: "Artemisinin-based Combination Therapy (ACT)",
        medication: "Artemether + Lumefantrine.",
        reason: "ACT is the gold standard for clearing parasitemia.",
        specialist: "Infectious Disease Specialist"
    },
    {
        id: "inf_uti",
        category: "Infectious",
        match: (p, v, l) => l.urine_pus_cells > 5 || p.condition?.includes("Burning Micturition"),
        diagnosis: "Urinary Tract Infection (UTI)",
        treatment: "Antibiotic Therapy",
        medication: "Nitrofurantoin or Cephalosporins (based on culture).",
        reason: "Bacterial clearance prevents ascending infection to kidneys (Pyelonephritis).",
        specialist: "Urologist / Physician"
    },

    // --- GYNAECOLOGY ---
    {
        id: "gyn_pcod",
        category: "Gynaecology",
        match: (p, v, l) => p.condition?.includes("PCOD") || p.condition?.includes("PCOS"),
        diagnosis: "Polycystic Ovarian Syndrome (PCOS)",
        treatment: "Lifestyle Modification",
        medication: "Metformin (Insulin resistance), OCPs (Cycle reg), Myo-inositol.",
        reason: "Weight loss and hormonal balance are first-line treatments.",
        specialist: "Gynaecologist"
    },
    {
        id: "gyn_pregnancy_htn",
        category: "Obstetrics",
        match: (p, v, l) => p.condition?.includes("Pregnancy") && v.bpSys > 140,
        diagnosis: "Gestational Hypertension / Pre-eclampsia Risk",
        treatment: "BP Monitoring & Fetal Surveillance",
        medication: "Labetalol / Methyldopa.",
        reason: "Prevent seizures (Eclampsia) and protect fetal blood flow.",
        specialist: "Obstetrician"
    },

    // --- PAEDIATRICS ---
    {
        id: "peds_jaundice",
        category: "Pediatrics",
        match: (p, v, l) => p.age < 0.1 && l.bilirubin > 15,
        diagnosis: "Neonatal Hyperbilirubinemia",
        treatment: "Phototherapy",
        medication: "Frequent feeds.",
        reason: "Prevent neurotoxicity (Kernicterus). Blue light breaks down bilirubin.",
        specialist: "Pediatrician / Neonatologist"
    },
    {
        id: "peds_lbw",
        category: "Pediatrics",
        match: (p, v, l) => p.age < 1 && v.weight < 2.5,
        diagnosis: "Low Birth Weight",
        treatment: "Kangaroo Mother Care (KMC)",
        medication: "Multi-vitamin drops.",
        reason: "Skin-to-skin contact improves thermoregulation and weight gain.",
        specialist: "Neonatologist"
    },

    // --- ORTHOPEDICS ---
    {
        id: "ortho_fracture",
        category: "Orthopedics",
        match: (p, v, l) => l.fracture,
        diagnosis: "Bone Fracture",
        treatment: l.fracture?.includes("Open") ? "ORIF (Surgery)" : "Immobilization (Cast)",
        medication: "Calcium + Vit D3, Analgesics.",
        reason: "Stability required for callus formation and union.",
        specialist: "Orthopedic Surgeon"
    },

    // --- GENERAL MED & ENDOCRINE ---
    {
        id: "endo_diabetes",
        category: "Endocrinology",
        match: (p, v, l) => l.glucose_fasting > 126 || l.hba1c > 6.5,
        diagnosis: "Diabetes Mellitus Type 2",
        treatment: "Glycemic Control",
        medication: "Metformin, SGLT2 Inhibitors, Insulin (if severe).",
        reason: "Prevent micro/macrovascular complications.",
        specialist: "Endocrinologist"
    },
    {
        id: "endo_hypothyroid",
        category: "Endocrinology",
        match: (p, v, l) => l.tsh > 5.0,
        diagnosis: "Hypothyroidism",
        treatment: "Hormone Replacement",
        medication: "Levothyroxine (Thyronorm).",
        reason: "Restore metabolic rate.",
        specialist: "Endocrinologist"
    }
];

export function findMatches(profile, vitals, labs) {
    return KnowledgeBase.filter(item => {
        try {
            return item.match(profile, vitals || {}, labs || {});
        } catch (e) {
            return false;
        }
    });
}
