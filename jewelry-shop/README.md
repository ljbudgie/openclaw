# Elegant Jewelry E-Commerce Website

A simple, responsive e-commerce website for selling jewelry and accessories including necklaces, bracelets, and earrings.

## Features

- **Product Listings**: Browse through a curated collection of jewelry items
- **Category Filtering**: Filter products by type (Necklaces, Bracelets, Earrings)
- **Shopping Cart**: Add items to cart with quantity management
- **Responsive Design**: Mobile-friendly design that works on all devices
- **Checkout Process**: Simple checkout form with payment processor integration
- **Payment Options**: Integration-ready for Stripe and PayPal

## File Structure

```
jewelry-shop/
├── index.html          # Homepage with product listings
├── cart.html           # Shopping cart page
├── checkout.html       # Checkout page
├── css/
│   └── style.css       # Responsive stylesheet
├── js/
│   ├── products.js     # Product catalog data
│   ├── cart.js         # Shopping cart management
│   ├── main.js         # Homepage functionality
│   ├── cart-page.js    # Cart page functionality
│   └── checkout.js     # Checkout functionality
└── images/             # Product images (placeholder)
```

## How to Use

1. **View Products**: Open `index.html` in a web browser to see the product catalog
2. **Filter Products**: Click category buttons to filter by jewelry type
3. **Add to Cart**: Click "Add to Cart" buttons to add items to your shopping cart
4. **Manage Cart**: View cart page to adjust quantities or remove items
5. **Checkout**: Proceed to checkout and fill in billing/shipping information
6. **Payment**: Choose between Stripe or PayPal for payment processing

## Features Overview

### Homepage (index.html)
- Hero section with brand introduction
- Product grid with filtering capabilities
- Category-based navigation
- "Add to Cart" functionality

### Shopping Cart (cart.html)
- View all cart items with images and details
- Adjust quantities with +/- buttons
- Remove items from cart
- See subtotal, shipping, and total costs
- Proceed to checkout button

### Checkout (checkout.html)
- Billing information form
- Shipping address form
- Order summary with itemized costs
- Payment processor selection (Stripe/PayPal)
- Form validation

## Payment Integration

This is a demo implementation. To enable real payments:

### Stripe Integration
1. Sign up at [https://stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Install Stripe SDK: `npm install @stripe/stripe-js`
4. Implement server-side payment processing
5. Update `checkout.js` to create real Stripe Checkout sessions

### PayPal Integration
1. Sign up at [https://paypal.com](https://paypal.com)
2. Get your Client ID and Secret from PayPal Developer
3. Install PayPal SDK: `npm install @paypal/checkout-server-sdk`
4. Implement server-side order creation
5. Update `checkout.js` to create real PayPal orders

## Customization

### Adding Products
Edit `js/products.js` to add or modify products:

```javascript
{
    id: 13,
    name: "Your Product Name",
    category: "necklaces", // or "bracelets" or "earrings"
    price: 99.99,
    description: "Product description",
    emoji: "💍"
}
```

### Styling
Edit `css/style.css` to customize colors, fonts, and layout:
- Primary color: `--primary-color`
- Secondary color: `--secondary-color`
- Text colors: `--text-color`, `--text-light`

### Shipping Costs
Modify shipping cost in `js/cart.js`:
```javascript
this.shippingCost = 10.00; // Change to your preferred amount
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Responsive design with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Dynamic functionality
- **LocalStorage**: Persistent shopping cart

## Monetization Options

1. **Direct Sales**: Integrate real payment processing
2. **Affiliate Links**: Replace payment buttons with affiliate links
3. **Dropshipping**: Connect to dropshipping suppliers
4. **Print on Demand**: Integrate with POD services

## Security Notes

⚠️ **Important**: This is a demo frontend implementation. For production use:
- Never process payments client-side only
- Always validate and process payments on a secure server
- Use HTTPS for all transactions
- Implement proper authentication and authorization
- Follow PCI DSS compliance requirements
- Sanitize user inputs to prevent XSS attacks
- Use environment variables for API keys (never commit them)

## License

This is a demo e-commerce website template. Feel free to modify and use for your own projects.

## Support

For payment integration support:
- Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- PayPal Developer: [https://developer.paypal.com](https://developer.paypal.com)
