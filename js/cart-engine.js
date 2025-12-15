/**
 * HealthFlo Universal Cart Engine
 * Manages items from Hospitals, Labs, and Pharmacy.
 */
import { PaymentGateway } from './payment-gateway.js';
import { ServiceSync } from './services-sync.js';

export const CartEngine = {
    items: [],

    // Initialize Cart UI
    init() {
        this._injectCartUI();
        this._updateBadge();
    },

    addItem(item) {
        // item: { id, type, title, subtitle, price, meta }
        this.items.push(item);
        this._updateBadge();
        this._showToast(`Added to Cart: ${item.title}`);
        this._renderCartItems();
    },

    removeItem(index) {
        this.items.splice(index, 1);
        this._updateBadge();
        this._renderCartItems();
    },

    clear() {
        this.items = [];
        this._updateBadge();
        this._renderCartItems();
    },

    getTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + item.price, 0);
        const tax = Math.round(subtotal * 0.18); // 18% GST
        const discount = subtotal > 2000 ? Math.round(subtotal * 0.1) : 0; // 10% off for >2k
        return { subtotal, tax, discount, total: subtotal + tax - discount };
    },

    open() {
        const modal = document.getElementById('hf-cart-modal');
        if (modal) {
            modal.style.display = 'flex';
            this._renderCartItems();
        }
    },

    close() {
        const modal = document.getElementById('hf-cart-modal');
        if (modal) modal.style.display = 'none';
    },

    async checkout() {
        if (this.items.length === 0) return;

        const totals = this.getTotals();

        // 1. Trigger Payment
        try {
            await PaymentGateway.open(totals.total, `Checkout (${this.items.length} items)`);
        } catch (e) {
            return; // Cancelled
        }

        // 2. Process Items
        this.items.forEach(item => {
            if (item.type === 'hospital') {
                ServiceSync.bookAppointment(item.title.replace('Dr. ', ''), item.subtitle, new Date().toISOString(), 'Consultation');
            } else if (item.type === 'lab') {
                ServiceSync.bookLabTest(item.title, item.subtitle, new Date().toISOString());
            } else if (item.type === 'pharmacy') {
                ServiceSync.orderMeds(1, item.subtitle, item.price);
            }
        });

        // 3. Clear & Success
        this.clear();
        this.close();

        // 4. Trigger Success Animation on Page
        // const event = new CustomEvent('cart-checkout-success');
        // document.dispatchEvent(event);
        alert("All Services Booked Successfully!");
    },

    _injectCartUI() {
        if (document.getElementById('hf-cart-modal')) return;

        const html = `
        <!-- Floating FAB -->
        <div id="hf-cart-fab" onclick="window.CartEngine_Open()" style="position:fixed; bottom:30px; right:30px; width:60px; height:60px; background:var(--color-blue); border-radius:50%; box-shadow:0 10px 30px rgba(59,130,246,0.4); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:900; transition:0.3s;">
            <i class="ph-fill ph-shopping-cart" style="font-size:24px; color:white;"></i>
            <div id="hf-cart-badge" style="position:absolute; top:-5px; right:-5px; background:var(--color-red); color:white; font-size:10px; font-weight:700; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #1e293b; display:none;">0</div>
        </div>

        <!-- Cart Modal -->
        <div id="hf-cart-modal" style="display:none; position:fixed; inset:0; z-index:1000; backdrop-filter:blur(10px); background:rgba(0,0,0,0.6); align-items:flex-end; justify-content:flex-end;">
            <div style="width:100%; max-width:400px; height:100vh; background:var(--card-bg, #1e293b); border-left:1px solid var(--glass-border); display:flex; flex-direction:column; animation:slideLeft 0.3s ease;">
                
                <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                    <h2>Your Cart</h2>
                    <button onclick="window.CartEngine_Close()" style="background:transparent; border:none; color:var(--text-muted); font-size:24px; cursor:pointer;">&times;</button>
                </div>

                <div id="hf-cart-items" style="flex:1; overflow-y:auto; padding:20px;">
                    <!-- Items go here -->
                </div>

                <div style="padding:20px; background:var(--glass-bg); border-top:1px solid var(--glass-border);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:13px; color:var(--text-muted);">
                        <span>Subtotal</span> <span id="cart-sub">₹0</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:13px; color:var(--text-muted);">
                        <span>Tax (18% GST)</span> <span id="cart-tax">₹0</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px; color:#10b981;">
                        <span>Discount</span> <span id="cart-disc">-₹0</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:20px; font-size:18px; font-weight:700;">
                        <span>Total</span> <span id="cart-total">₹0</span>
                    </div>
                    <button onclick="window.CartEngine_Checkout()" style="width:100%; padding:15px; background:var(--color-blue); color:white; border:none; border-radius:12px; font-weight:700; font-size:16px; cursor:pointer;">Checkout Now</button>
                </div>

            </div>
        </div>
        <style>@keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }</style>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        // Expose globals for onclick
        window.CartEngine_Open = () => this.open();
        window.CartEngine_Close = () => this.close();
        window.CartEngine_Checkout = () => this.checkout();
        window.CartEngine_Remove = (idx) => this.removeItem(idx);
    },

    _renderCartItems() {
        const container = document.getElementById('hf-cart-items');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `<div style="text-align:center; opacity:0.5; margin-top:50px;">Cart is empty</div>`;
        } else {
            let html = '';
            this.items.forEach((item, idx) => {
                html += `
                <div style="margin-bottom:15px; padding:12px; background:rgba(255,255,255,0.03); border-radius:12px; border:1px solid rgba(255,255,255,0.05); display:flex; gap:10px; align-items:center;">
                    <div style="flex:1;">
                        <div style="font-weight:600; font-size:14px;">${item.title}</div>
                        <div style="font-size:11px; opacity:0.6;">${item.subtitle}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:700;">₹${item.price}</div>
                        <button onclick="window.CartEngine_Remove(${idx})" style="color:#ef4444; background:none; border:none; font-size:10px; cursor:pointer; margin-top:4px;">Remove</button>
                    </div>
                </div>
                `;
            });
            container.innerHTML = html;
        }

        // Update Totals
        const totals = this.getTotals();
        document.getElementById('cart-sub').innerText = `₹${totals.subtotal}`;
        document.getElementById('cart-tax').innerText = `₹${totals.tax}`;
        document.getElementById('cart-disc').innerText = `-₹${totals.discount}`;
        document.getElementById('cart-total').innerText = `₹${totals.total}`;
    },

    _updateBadge() {
        const badge = document.getElementById('hf-cart-badge');
        if (badge) {
            badge.innerText = this.items.length;
            badge.style.display = this.items.length > 0 ? 'flex' : 'none';
        }
    },

    _showToast(msg) {
        // Simple Toast
        const toast = document.createElement('div');
        toast.innerText = msg;
        toast.style.cssText = `position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:white; padding:10px 20px; border-radius:20px; font-size:12px; z-index:2000; animation:fadeIn 0.3s;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
};
