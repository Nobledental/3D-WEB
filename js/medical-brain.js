import { findMatches } from './medical-kb.js';

export class MedicalBrain {
    constructor() {
        this.conditions = [];
        this.alerts = [];
        this.advice = [];
    }

    analyze(userProfile, vitals, labs) {
        this.clear();

        // 1. KNOWLEDGE BASE MATCHING
        // Pulls from the 200+ Protocol KB based on vitals/labs/condition strings
        const matches = findMatches(userProfile, vitals, labs);

        matches.forEach(match => {
            this.conditions.push(match.diagnosis);

            // Determine Alert Level based on keywords
            let level = 'medium';
            if (/Acute|Critical|Shock|Emergency|Triple|Sepsis/.test(match.diagnosis) ||
                /Immediate|Hospital|Ambulance/.test(match.advice)) {
                level = 'critical';
            } else if (/Severe|High|Risk/.test(match.diagnosis)) {
                level = 'high';
            }

            this.addAlert(level, `${match.diagnosis}: ${match.treatment}`);
            this.addAdvice(`Treatment: ${match.treatment}`);
            this.addAdvice(`Reason: ${match.reason}`);
            this.addAdvice(`Rx: ${match.medication}`);
            this.addAdvice(`Consult: ${match.specialist}`);
        });

        // 2. CONTEXT ENGINE (History & Meds)
        this.checkContext(userProfile);

        // 3. FALLBACK SAFETY
        if (this.alerts.length === 0 && (vitals.heartRate > 120 || vitals.heartRate < 45)) {
            this.addAlert('high', 'Abnormal Heart Rate Detected');
            this.addAdvice('Check EKG. R/o Arrhythmia.');
        }

        // Global Disclaimer
        if (this.alerts.length > 0) {
            this.addAdvice("⚠️ Disclaimer: AI Simulation. Consult a Doctor.");
        }

        return {
            conditions: this.conditions,
            alerts: this.alerts,
            advice: this.advice,
            isCritical: this.alerts.some(a => a.level === 'critical')
        };
    }

    clear() {
        this.conditions = [];
        this.alerts = [];
        this.advice = [];
    }

    checkContext(profile) {
        // Drug Interactions / History Warnings
        if (profile.history) {
            // Heart Valve + Dental Risk
            if (profile.history.some(h => h.includes('Valve')) && profile.condition.toLowerCase().includes('dental')) {
                this.addAlert('high', 'IE Prophylaxis Alert');
                this.addAdvice('Patient has Prosthetic Valve history. Antibiotic Cover (Amoxicillin 2g) required before Dental Procedure to prevent Infective Endocarditis.');
            }

            // Allergy Checks
            if (profile.history.some(h => h.includes('Allergy: Penicillin'))) {
                // Check if we recommended Amoxicillin
                if (JSON.stringify(this.advice).includes('Amoxicillin')) {
                    this.addAlert('critical', 'DRUG ALLERGY WARNING: PENICILLIN');
                    this.addAdvice('STOP! Patient is allergic to Penicillin. Use Clindamycin or Azithromycin instead.');
                }
            }
        }
    }

    addAlert(level, message) {
        this.alerts.push({ level, message, timestamp: Date.now() });
    }

    addAdvice(text) {
        this.advice.push(text);
    }
}
