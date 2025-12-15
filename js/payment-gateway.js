/**
 * HealthFlo Universal Payment Gateway
 * Simulates UPI, Card, and Netbanking flows.
 */

export const PaymentGateway = {

    // Create the Modal DOM if not exists
    _ensureModal() {
        if (document.getElementById('hf-payment-modal')) return;

        const modalHTML = `
        <div id="hf-payment-modal" style="display:none; position:fixed; inset:0; z-index:9999; backdrop-filter:blur(10px); background:rgba(0,0,0,0.6); align-items:center; justify-content:center;">
            <div style="background:var(--card-bg, #1e293b); border:1px solid var(--glass-border, rgba(255,255,255,0.1)); width:90%; max-width:400px; border-radius:24px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.5);">
                
                <!-- HEADER -->
                <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:700;">Secure Payment</div>
                    <div style="font-family:monospace; font-size:16px; color:var(--color-green, #10b981);" id="pay-amount">₹0</div>
                </div>

                <!-- BODY -->
                <div style="padding:20px;" id="pay-body">
                    <p style="font-size:13px; opacity:0.7; margin-bottom:20px;" id="pay-desc">Completing transaction...</p>
                    
                    <div style="display:grid; gap:10px;">
                        <!-- UPI -->
                        <button class="pay-method" data-method="gpay" style="display:flex; align-items:center; gap:15px; padding:15px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; cursor:pointer; color:inherit;">
                            <div style="width:32px; height:32px; background:white; border-radius:50%; padding:2px;"><img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" style="width:100%;"></div>
                            <div style="text-align:left;">
                                <div style="font-weight:600;">Google Pay</div>
                                <div style="font-size:10px; opacity:0.6;">dhiva@oksbi</div>
                            </div>
                            <i class="ph-bold ph-caret-right" style="margin-left:auto;"></i>
                        </button>

                        <button class="pay-method" data-method="phonepe" style="display:flex; align-items:center; gap:15px; padding:15px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; cursor:pointer; color:inherit;">
                            <div style="width:32px; height:32px; background:#5f259f; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:8px;">Pe</div>
                            <div style="text-align:left;">
                                <div style="font-weight:600;">PhonePe</div>
                                <div style="font-size:10px; opacity:0.6;">9999000000@ybl</div>
                            </div>
                            <i class="ph-bold ph-caret-right" style="margin-left:auto;"></i>
                        </button>

                        <!-- CARD -->
                        <button class="pay-method" data-method="card" style="display:flex; align-items:center; gap:15px; padding:15px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; cursor:pointer; color:inherit;">
                            <i class="ph-fill ph-credit-card" style="font-size:32px;"></i>
                            <div style="text-align:left;">
                                <div style="font-weight:600;">HDFC Regalia</div>
                                <div style="font-size:10px; opacity:0.6;">**** 8821</div>
                            </div>
                            <i class="ph-bold ph-caret-right" style="margin-left:auto;"></i>
                        </button>
                    </div>
                </div>

                <!-- PROCESSING STATE -->
                <div id="pay-processing" style="display:none; padding:40px; text-align:center;">
                    <i class="ph-bold ph-spinner" style="font-size:40px; color:var(--color-blue, #3b82f6); animation:spin 1s infinite linear;"></i>
                    <h3 style="margin-top:20px;">Processing...</h3>
                    <p style="font-size:12px; opacity:0.6;">Connecting to bank secure server</p>
                </div>

                <!-- SUCCESS STATE -->
                <div id="pay-success" style="display:none; padding:40px; text-align:center;">
                    <div style="width:60px; height:60px; background:#10b981; border-radius:50%; margin:0 auto; display:flex; align-items:center; justify-content:center; color:white; font-size:32px;">
                        <i class="ph-bold ph-check"></i>
                    </div>
                    <h3 style="margin-top:20px; color:#10b981;">Payment Successful</h3>
                    <p style="font-size:12px; opacity:0.6;">Redirecting back to app...</p>
                </div>

            </div>
        </div>
        <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    open(amount, description = "Service Payment") {
        this._ensureModal();

        return new Promise((resolve, reject) => {
            const modal = document.getElementById('hf-payment-modal');
            const amountEl = document.getElementById('pay-amount');
            const descEl = document.getElementById('pay-desc');
            const body = document.getElementById('pay-body');
            const processing = document.getElementById('pay-processing');
            const success = document.getElementById('pay-success');

            // Reset UI
            body.style.display = 'block';
            processing.style.display = 'none';
            success.style.display = 'none';
            amountEl.innerText = `₹${amount}`;
            descEl.innerText = description;

            modal.style.display = 'flex';

            // Handlers
            const methods = modal.querySelectorAll('.pay-method');
            methods.forEach(btn => {
                btn.onclick = () => {
                    // Start Flow
                    body.style.display = 'none';
                    processing.style.display = 'block';

                    setTimeout(() => {
                        processing.style.display = 'none';
                        success.style.display = 'block';

                        // Play sound effect if possible
                        // const audio = new Audio('assets/pay_success.mp3'); audio.play().catch(e=>{});

                        setTimeout(() => {
                            modal.style.display = 'none';
                            resolve({ status: 'success', method: btn.dataset.method, amount: amount });
                        }, 1500);

                    }, 2000);
                };
            });

            // Cancel on outside click (optional, strictly enforcing payment for demo effect usually better)
            // modal.onclick = (e) => { if(e.target === modal) { modal.style.display = 'none'; reject('cancelled'); } };
        });
    }
};
