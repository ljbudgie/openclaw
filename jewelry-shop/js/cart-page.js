// Cart page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');

    function renderCart() {
        const items = cart.getItems();

        if (items.length === 0) {
            cartItemsContainer.style.display = 'none';
            emptyCartMessage.style.display = 'block';
            cartSummary.style.display = 'none';
            return;
        }

        cartItemsContainer.style.display = 'block';
        emptyCartMessage.style.display = 'none';
        cartSummary.style.display = 'block';

        // Render cart items
        cartItemsContainer.innerHTML = items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">${item.emoji}</div>
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <div class="cart-item-category">${item.category}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-btn" data-id="${item.id}">−</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-btn" data-id="${item.id}">Remove</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
            </div>
        `).join('');

        // Update summary
        const subtotal = cart.getSubtotal();
        const shipping = cart.getShipping();
        const total = cart.getTotal();

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;

        // Add event listeners
        addCartEventListeners();
    }

    function addCartEventListeners() {
        // Decrease quantity
        document.querySelectorAll('.decrease-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const item = cart.getItems().find(item => item.id === id);
                if (item) {
                    cart.updateQuantity(id, item.quantity - 1);
                    renderCart();
                }
            });
        });

        // Increase quantity
        document.querySelectorAll('.increase-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const item = cart.getItems().find(item => item.id === id);
                if (item) {
                    cart.updateQuantity(id, item.quantity + 1);
                    renderCart();
                }
            });
        });

        // Remove item
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                cart.removeItem(id);
                renderCart();
            });
        });
    }

    // Initial render
    renderCart();
});
