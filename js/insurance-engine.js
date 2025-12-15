/**
 * HealthFlo Insurance Engine
 * Handles Policy Management, Bill Evaluation, and Claims Processing.
 */

import { ServiceSync } from './services-sync.js';

export const InsuranceEngine = {

    // --- POLICY MANAGER ---

    getPolicies(userProfile) {
        // In a real app, this would fetch from backend based on Adhaar
        // For simulation, we return hardcoded rich data based on the user
        return [
            {
                id: 'POL-RET-8821',
                type: 'Retail',
                insurer: 'Star Health',
                plan: 'Comprehensive Optima',
                tpa: 'MediAssist',
                sumInsured: 500000,
                balance: 420000,
                status: 'Active',
                members: ['Self', 'Spouse'],
                features: ['No Capping', 'Restoration Benefit'],
                logo: 'https://ui-avatars.com/api/?name=Star+Health&background=0D8ABC&color=fff',
                adhaarLink: 'XXXX-XXXX-1234'
            },
            {
                id: 'POL-CORP-9900',
                type: 'Corporate',
                insurer: 'ICICI Lombard',
                plan: 'Employer Group Health',
                tpa: 'FHPL',
                sumInsured: 300000,
                balance: 300000,
                status: 'Active',
                members: ['Self'],
                features: ['Maternity', 'OPD Cover'],
                logo: 'https://ui-avatars.com/api/?name=ICICI&background=A50034&color=fff',
                adhaarLink: 'XXXX-XXXX-1234'
            }
        ];
    },

    // --- BILL EVALUATOR ---

    /**
     * Simulates evaluating a hospital bill against policy limits.
     * Returns breakdown of Payables vs Non-Payables.
     */
    evaluateBill(billAmount, policy) {
        // logic: 
        // 1. Non-payables (approx 10% of bill usually: Gloves, Reg charges, etc)
        // 2. Co-pay (if corporate, maybe 10%)
        // 3. Room Rent Capping (if Retail basic)

        const nonPayableItems = Math.floor(billAmount * 0.08); // 8% consumables
        let coPay = 0;

        if (policy.type === 'Corporate') {
            coPay = Math.floor((billAmount - nonPayableItems) * 0.10); // 10% Co-pay
        }

        const approvedAmount = billAmount - nonPayableItems - coPay;
        const outOfPocket = billAmount - approvedAmount;

        return {
            total: billAmount,
            approved: approvedAmount,
            deductions: {
                consumables: nonPayableItems,
                coPay: coPay
            },
            outOfPocket: outOfPocket,
            status: approvedAmount > policy.balance ? 'Insufficient Funds' : 'Eligible'
        };
    },

    // --- LOAN ENGINE ---

    checkLoanEligibility(amount) {
        // Simulation based on "Credit Score"
        const creditScore = 750; // hardcoded good score
        const maxLoan = 500000;

        if (amount > maxLoan) return { eligible: false, reason: 'Limit Exceeded' };

        return {
            eligible: true,
            provider: 'HealthFlo FinServe',
            interest: 0, // 0% Interest for medical
            tenure: '12 Months',
            processingFee: 0,
            emi: Math.ceil(amount / 12)
        };
    },

    // --- CLAIMS TRACKER ---

    submitClaim(claimData) {
        // Sync to global timeline
        ServiceSync.bookAppointment(
            'Claim Intimated',
            claimData.hospital,
            new Date().toISOString(),
            `₹${claimData.amount}`
        );

        return {
            claimId: 'CLM-' + Date.now().toString().slice(-6),
            status: 'Processing',
            stage: 1, // 1: Intimated, 2: Docs Verified, 3: Approval, 4: Settled
            eta: '4 Hours'
        };
    }
};

window.InsuranceEngine = InsuranceEngine;
