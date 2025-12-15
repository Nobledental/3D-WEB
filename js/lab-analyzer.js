/**
 * HealthFlo Lab Analyzer Engine
 * Simulates OCR, Analyses Data against ranges, and Cross-checks Medications.
 */
import { LabRanges, DrugInteractions } from './lab-ranges.js';

export const LabAnalyzer = {

    // 1. Simulate OCR Process
    async scanDocument(file) {
        return new Promise((resolve, reject) => {
            // Quality Check
            if (file.size < 50000) { // < 50KB
                return reject("Image Quality Too Low. Please upload a clear JPG/PDF > 50KB.");
            }

            // Simulate Processing Delay
            setTimeout(() => {
                // Return Simulated Data based on "Demo Scenario"
                // For this demo, we assume the user uploaded an "Anemia Case"

                const simulatedData = {
                    date: new Date().toISOString(),
                    patient: "Dhivakaran",
                    tests: {
                        hemoglobin: 10.2, // LOW
                        rbc: 3.8, // LOW
                        mcv: 72, // LOW (Microcytic)
                        platelets: 250000,
                        wbc: 6500,
                        creatinine: 0.9,
                        vit_b12: 180, // LOW
                        glucose_fasting: 92
                    }
                };
                resolve(simulatedData);
            }, 3000); // 3 sec scanning
        });
    },

    // 2. Deep Medical Analysis
    analyze(parsedData, currentMeds = []) {
        const results = [];
        const alerts = [];
        const followUps = new Set();
        let abnormalCount = 0;

        // A. Value Check
        Object.entries(parsedData.tests).forEach(([key, value]) => {
            const range = LabRanges[key];
            if (!range) return; // Skip unknown

            let status = 'normal';
            let message = 'Normal';
            let color = 'green';

            if (value < range.min) {
                status = 'low';
                message = range.low_msg || 'Low';
                color = 'red';
                abnormalCount++;
                if (range.follow_up) range.follow_up.forEach(f => followUps.add(f));
            } else if (value > range.max) {
                status = 'high';
                message = range.high_msg || 'High';
                color = 'red';
                abnormalCount++;
                if (range.follow_up) range.follow_up.forEach(f => followUps.add(f));
            }

            results.push({
                key,
                label: range.label,
                value,
                unit: range.unit,
                range: `${range.min}-${range.max}`,
                status,
                message,
                color,
                layman: range.layman
            });
        });

        // B. Drug Interaction Check
        currentMeds.forEach(med => {
            // Simple string matching
            Object.keys(DrugInteractions).forEach(drugKey => {
                if (med.toLowerCase().includes(drugKey.toLowerCase())) {
                    const interaction = DrugInteractions[drugKey];
                    // Check if the relevant test is abnormal
                    const testResult = parsedData.tests[interaction.test];
                    if (testResult) {
                        const range = LabRanges[interaction.test];
                        if ((interaction.effect === 'low' && testResult < range.min) ||
                            (interaction.effect === 'high' && testResult > range.max)) {
                            alerts.push({
                                type: 'drug_interaction',
                                msg: `Based on your meds, <b>${drugKey}</b> might be contributing to your ${interaction.effect} ${LabRanges[interaction.test].label}.`,
                                severity: 'high'
                            });
                        }
                    }
                }
            });
        });

        // C. Synthesis (Layman Summary)
        let summary = "";
        if (abnormalCount === 0) {
            summary = "Great news! All analyzed parameters are within normal limits. Maintain your current healthy lifestyle.";
        } else {
            // Generate contextual summary
            const anemia = results.find(r => r.key === 'hemoglobin' && r.status === 'low');
            const b12 = results.find(r => r.key === 'vit_b12' && r.status === 'low');

            if (anemia) {
                summary += `Your Hemoglobin is low (${anemia.value}), indicating <b>Anemia</b>. This means your blood carries less oxygen, which can cause fatigue. `;
                if (results.find(r => r.key === 'mcv' && r.status === 'low')) {
                    summary += `The cells are smaller than normal (Microcytic), commonly caused by <b>Iron Deficiency</b>. `;
                }
            }
            if (b12) {
                summary += `Vitamin B12 is also low, which is crucial for nerve health. `;
            }
        }

        return {
            results,
            summary,
            alerts,
            followUps: Array.from(followUps)
        };
    }
};
