# Stripe Payment Integration

This directory contains the Stripe payment integration modules for OpenClaw.

## Modules

- **stripe-config.ts** - Configuration and Stripe client initialization
- **stripe-checkout.ts** - Checkout session management (one-time payments & subscriptions)
- **stripe-customers.ts** - Customer and payment method management
- **stripe-subscriptions.ts** - Subscription lifecycle management
- **stripe-webhooks.ts** - Webhook event handling and registration

## Quick Start

1. Set up environment variables in `.env`:
```bash
STRIPE_ENABLED=true
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

2. Configure in `openclaw.config.yaml`:
```yaml
env:
  stripe:
    enabled: true
    secretKey: "${STRIPE_SECRET_KEY}"
    publishableKey: "${STRIPE_PUBLISHABLE_KEY}"
    webhookSecret: "${STRIPE_WEBHOOK_SECRET}"
```

3. Start the gateway - Stripe endpoints will be available at `/api/stripe/`

## API Endpoints

All endpoints are available at `http://your-gateway:18789/api/stripe/`:

- `GET /config` - Get publishable key
- `POST /checkout/sessions` - Create checkout session
- `POST /customers` - Create customer
- `POST /subscriptions` - Create subscription
- `POST /webhooks` - Webhook endpoint
- ...and more (see full documentation)

## Documentation

See [docs/stripe-integration.md](../docs/stripe-integration.md) for complete documentation.

## Examples

See [examples/](../examples/) directory for:
- TypeScript API examples
- Client-side HTML/JS examples
- Stripe Checkout demo
- Stripe Elements demo

## Testing

Run tests:
```bash
npm test src/payments/
```

## Security

- Never handle raw card data - use Stripe.js tokenization
- Verify webhook signatures
- Store API keys in environment variables
- Use HTTPS in production
- 3D Secure supported automatically
