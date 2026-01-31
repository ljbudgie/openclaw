// Checkout page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutForm = document.getElementById('checkout-form');
    const stripeButton = document.getElementById('stripe-checkout');
    const paypalButton = document.getElementById('paypal-checkout');

    function renderCheckoutItems() {
        const items = cart.getItems();

        if (items.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        // Render items in order summary
        checkoutItemsContainer.innerHTML = items.map(item => `
            <div class="checkout-item">
                <div>
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-details">Quantity: ${item.quantity} × $${item.price.toFixed(2)}</div>
                </div>
                <div class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');

        // Update totals
        const subtotal = cart.getSubtotal();
        const shipping = cart.getShipping();
        const total = cart.getTotal();

        document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('checkout-shipping').textContent = `$${shipping.toFixed(2)}`;
        document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
    }

    // Handle Stripe checkout
    stripeButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            alert('Please fill in all required fields before proceeding to payment.');
            return;
        }

        // In a real implementation, this would redirect to Stripe Checkout
        // For this demo, we'll show instructions
        const total = cart.getTotal();
        const message = `
Ready to process payment of $${total.toFixed(2)} via Stripe!

In a production environment, this would:
1. Create a Stripe Checkout session
2. Redirect to Stripe's secure payment page
3. Handle the payment confirmation

To integrate Stripe:
- Sign up at https://stripe.com
- Get your API keys
- Use Stripe Checkout or Stripe Elements
- Process the payment securely on your server

For now, this is a demo checkout page.
        `;
        
        alert(message);
        showSuccessMessage('stripe');
    });

    // Handle PayPal checkout
    paypalButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            alert('Please fill in all required fields before proceeding to payment.');
            return;
        }

        // In a real implementation, this would redirect to PayPal
        const total = cart.getTotal();
        const message = `
Ready to process payment of $${total.toFixed(2)} via PayPal!

In a production environment, this would:
1. Create a PayPal order
2. Redirect to PayPal's secure payment page
3. Handle the payment confirmation

To integrate PayPal:
- Sign up at https://paypal.com
- Get your Client ID and Secret
- Use PayPal Checkout SDK
- Process the payment securely

For now, this is a demo checkout page.
        `;
        
        alert(message);
        showSuccessMessage('paypal');
    });

    // Validate form
    function validateForm() {
        const requiredFields = checkoutForm.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#ef4444';
            } else {
                field.style.borderColor = '';
            }
        });

        return isValid;
    }

    // Show success message
    function showSuccessMessage(provider) {
        const providerName = provider === 'stripe' ? 'Stripe' : 'PayPal';
        
        // Create success overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const message = document.createElement('div');
        message.style.cssText = `
            background-color: white;
            padding: 3rem;
            border-radius: 12px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        `;

        message.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
            <h2 style="margin-bottom: 1rem; color: #10b981;">Order Submitted!</h2>
            <p style="color: #6b7280; margin-bottom: 2rem;">
                In a real store, you would now be redirected to ${providerName} to complete your payment.
            </p>
            <button id="continue-shopping" style="
                background-color: #8b5cf6;
                color: white;
                padding: 0.75rem 2rem;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
            ">Continue Shopping</button>
        `;

        overlay.appendChild(message);
        document.body.appendChild(overlay);

        document.getElementById('continue-shopping').addEventListener('click', () => {
            cart.clear();
            window.location.href = 'index.html';
        });
    }

    // Clear validation errors on input
    checkoutForm.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            input.style.borderColor = '';
        });
    });

    // Initial render
    renderCheckoutItems();
});
