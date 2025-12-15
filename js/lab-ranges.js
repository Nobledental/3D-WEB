/**
 * HealthFlo Lab Ranges Database
 * Comprehensive dictionary of medical tests, normal ranges, and interpretations.
 */

export const LabRanges = {
    // --- 1. HEMATOLOGY ---
    hemoglobin: {
        label: "Hemoglobin (Hb)",
        unit: "g/dL",
        min: 13.0,
        max: 17.0,
        low_msg: "Anemia (Low Oxygen Capacity)",
        high_msg: "Polycythemia (Thick Blood)",
        layman: "The protein in red blood cells that carries oxygen.",
        follow_up: ["Iron Studies", "Vitamin B12", "Folic Acid"]
    },
    wbc: {
        label: "Total WBC Count",
        unit: "/cumm",
        min: 4000,
        max: 11000,
        low_msg: "Leukopenia (Weak Immunity)",
        high_msg: "Leukocytosis (Infection/Inflammation)",
        layman: "Your body's army against infection.",
        follow_up: ["Peripheral Smear", "CRP"]
    },
    rbc: {
        label: "RBC Count",
        unit: "mil/cumm",
        min: 4.5,
        max: 5.5,
        low_msg: "Low Red Blood Cells",
        high_msg: "High Red Blood Cells",
        layman: "Count of oxygen-carrying cells.",
    },
    hct: {
        label: "Hematocrit (PCV)",
        unit: "%",
        min: 40,
        max: 50,
        low_msg: "Low Blood Volume",
        high_msg: "High Blood Volume",
        layman: "Percentage of your blood that is red cells."
    },
    platelets: {
        label: "Platelet Count",
        unit: "/cumm",
        min: 150000,
        max: 450000,
        low_msg: "Thrombocytopenia (Bleeding Risk)",
        high_msg: "Thrombocytosis (Clotting Risk)",
        layman: "Cells that help blood clot to stop bleeding.",
        follow_up: ["Dengue Profile", "Liver Function Test"]
    },
    mcv: {
        label: "MCV (Mean Corpuscular Volume)",
        unit: "fL",
        min: 80,
        max: 100,
        low_msg: "Microcytic (Small Cells - Iron Def?)",
        high_msg: "Macrocytic (Large Cells - B12 Def?)",
        layman: "Average size of your red blood cells."
    },
    esr: {
        label: "ESR",
        unit: "mm/hr",
        min: 0,
        max: 20,
        high_msg: "High Inflammation",
        layman: "General marker for inflammation or infection in the body."
    },
    hba1c: {
        label: "HbA1c",
        unit: "%",
        min: 4.0,
        max: 5.6,
        high_msg: "Pre-Diabetes / Diabetes",
        layman: "Average blood sugar over the last 3 months."
    },

    // --- 2. BIOCHEMISTRY (KIDNEY/LIVER/LIPID) ---
    creatinine: {
        label: "Serum Creatinine",
        unit: "mg/dL",
        min: 0.6,
        max: 1.2,
        high_msg: "Kidney Strain / Dysfunction",
        layman: "Waste product removed by kidneys. Best marker for kidney health.",
        follow_up: ["KFT", "Urine Routine", "Nephrologist Consult"]
    },
    bun: {
        label: "Blood Urea Nitrogen",
        unit: "mg/dL",
        min: 7,
        max: 20,
        high_msg: "High Urea (Kidney/Dehydration)",
        layman: "Waste product indicating kidney function and hydration."
    },
    uric_acid: {
        label: "Uric Acid",
        unit: "mg/dL",
        min: 3.5,
        max: 7.2,
        high_msg: "Hyperuricemia (Gout Risk)",
        layman: "High levels can cause Gout or kidney stones."
    },
    bilirubin_total: {
        label: "Total Bilirubin",
        unit: "mg/dL",
        min: 0.1,
        max: 1.2,
        high_msg: "Jaundice / Liver Stress",
        layman: "Yellow pigment cleared by the liver."
    },
    sgot: {
        label: "SGOT (AST)",
        unit: "U/L",
        min: 5,
        max: 40,
        high_msg: "Liver Cell Damage",
        layman: "Enzyme released when liver cells are damaged."
    },
    sgpt: {
        label: "SGPT (ALT)",
        unit: "U/L",
        min: 7,
        max: 56,
        high_msg: "Liver Inflammation",
        layman: "Specific enzyme for liver health."
    },
    cholesterol: {
        label: "Total Cholesterol",
        unit: "mg/dL",
        min: 0,
        max: 200,
        high_msg: "High Cholesterol",
        layman: "Overall amount of fat in blood."
    },
    triglycerides: {
        label: "Triglycerides",
        unit: "mg/dL",
        min: 0,
        max: 150,
        high_msg: "High Triglycerides",
        layman: "Fat linked to diet and heart disease risk."
    },
    glucose_fasting: {
        label: "Fasting Blood Sugar",
        unit: "mg/dL",
        min: 70,
        max: 100,
        high_msg: "Hyperglycemia",
        layman: "Sugar level after 8+ hours fasting."
    },

    // --- 3. ENDOCRINOLOGY (THYROID/VITAMINS) ---
    tsh: {
        label: "TSH",
        unit: "mIU/L",
        min: 0.4,
        max: 4.5,
        low_msg: "Hyperthyroidism",
        high_msg: "Hypothyroidism",
        layman: "Thyroid Stimulating Hormone. Controls metabolism.",
        follow_up: ["T3", "T4", "Thyroid Scan"]
    },
    vit_d: {
        label: "Vitamin D",
        unit: "ng/mL",
        min: 30,
        max: 100,
        low_msg: "Vitamin D Deficiency",
        layman: "Critical for bone health and immunity.",
        follow_up: ["Calcium"]
    },
    vit_b12: {
        label: "Vitamin B12",
        unit: "pg/mL",
        min: 200,
        max: 900,
        low_msg: "B12 Deficiency (Nerve Risk)",
        layman: "Essential for nerves and red blood cells."
    },

    // --- 4. URINE ---
    urine_pus: {
        label: "Urine Pus Cells",
        unit: "/hpf",
        min: 0,
        max: 5,
        high_msg: "Urinary Tract Infection (UTI)",
        layman: "Sign of infection in the urinary tract.",
        follow_up: ["Urine Culture"]
    }
};

export const DrugInteractions = {
    // Basic mapping: Drug -> Potential Side Effect impacting Lab
    "Metformin": { test: "vit_b12", effect: "low", msg: "Long-term Metformin use can lower Vitamin B12 levels." },
    "Atorvastatin": { test: "sgpt", effect: "high", msg: "Statins can sometimes elevate liver enzymes." },
    "Aspirin": { test: "platelets", effect: "neutral", msg: "Aspirin affects function, not count, but watch for bleeding." },
    "Ramipril": { test: "creatinine", effect: "high", msg: "ACE Inhibitors can transiently raise creatinine." }
};
