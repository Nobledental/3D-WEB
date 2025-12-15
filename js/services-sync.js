/**
 * HealthFlo Services Sync Engine
 * Manages persistent state for Bookings, Orders, and Timeline Events.
 * Uses localStorage to simulate a backend database.
 */

const DB_KEY = 'hf_services_db';

// Initial State if empty
const DEFAULT_DB = {
    appointments: [], // { id, doctor, hospital, date, time, status: 'confirmed'|'completed' }
    labOrders: [],    // { id, test, lab, date, status: 'scheduled'|'processing'|'ready' }
    medOrders: [],    // { id, items, pharmacy, total, date, status: 'placed'|'shipped'|'delivered' }
};

export const ServiceSync = {
    // --- CORE ---
    init() {
        if (!localStorage.getItem(DB_KEY)) {
            localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB));
        }
    },

    getDB() {
        this.init();
        return JSON.parse(localStorage.getItem(DB_KEY));
    },

    saveDB(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
        // Dispatch event for live updates across tabs/components
        window.dispatchEvent(new CustomEvent('hf_sync_update', { detail: data }));
    },

    // --- ACTIONS ---

    /**
     * Book a Doctor Appointment
     */
    bookAppointment(doctorName, hospitalName, dateStr, type = 'OPD') {
        const db = this.getDB();
        const booking = {
            id: 'APT-' + Date.now().toString().slice(-6),
            type: 'doctor',
            title: `Dr. ${doctorName}`,
            subtitle: hospitalName,
            meta: type,
            date: dateStr || new Date().toISOString(), // ISO String
            status: 'confirmed',
            icon: 'ph-stethoscope'
        };
        db.appointments.push(booking);
        this.saveDB(db);
        return booking;
    },

    /**
     * Book a Lab Test
     */
    bookLabTest(testName, labName, dateStr) {
        const db = this.getDB();
        const order = {
            id: 'LAB-' + Date.now().toString().slice(-6),
            type: 'lab',
            title: testName,
            subtitle: labName,
            meta: 'Home Collection',
            date: dateStr || new Date().toISOString(),
            status: 'scheduled',
            icon: 'ph-flask'
        };
        db.labOrders.push(order);
        this.saveDB(db);
        return order;
    },

    /**
     * Order Medicines
     */
    orderMeds(itemCount, pharmacyName, totalCost) {
        const db = this.getDB();
        const order = {
            id: 'MED-' + Date.now().toString().slice(-6),
            type: 'pharmacy',
            title: `${itemCount} Medicines`,
            subtitle: pharmacyName,
            meta: `₹${totalCost}`,
            date: new Date().toISOString(),
            status: 'placed',
            icon: 'ph-pill'
        };
        db.medOrders.push(order);
        this.saveDB(db);
        return order;
    },

    /**
     * Clear all data (Debug)
     */
    reset() {
        localStorage.removeItem(DB_KEY);
        this.init();
        window.location.reload();
    },

    // --- READERS ---

    /**
     * Get a combined, sorted timeline of active events
     */
    getTimeline() {
        const db = this.getDB();
        const all = [
            ...db.appointments,
            ...db.labOrders,
            ...db.medOrders
        ]; // Flatten

        // Sort by date (newest first for creation, or nearest future for timeline? Let's do nearest future first)
        // For simplicity in this demo: Sort by Created Date (Reverse Chronological) to show "Just Booked" at top
        // In a real app, we'd filter > Now and sort ASC.

        return all.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
};

// Auto-init on load
ServiceSync.init();
