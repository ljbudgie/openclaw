# Stripe Payment Integration

This document describes how to integrate and use Stripe payment processing in OpenClaw.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Webhook Events](#webhook-events)
- [Security Best Practices](#security-best-practices)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

OpenClaw now supports Stripe payment processing, enabling you to accept payments and manage subscriptions directly through the platform. The integration follows PCI compliance guidelines and uses tokenization to handle payment data securely.

## Features

- **One-time payments**: Accept single payments via Stripe Checkout
- **Recurring subscriptions**: Create and manage subscription-based billing
- **Saved payment methods**: Store customer payment details securely for future use
- **Multiple payment options**: Support for cards, Apple Pay, and Google Pay
- **Responsive checkout**: Mobile-friendly Stripe Checkout experience
- **Webhook support**: Real-time notifications for payment events
- **Customer management**: Create and update customer profiles
- **3D Secure**: Automatic Strong Customer Authentication (SCA) support

## Prerequisites

Before setting up Stripe integration, you'll need:

1. A Stripe account (sign up at https://dashboard.stripe.com/register)
2. Stripe API keys (available in your Stripe Dashboard)
3. A webhook endpoint URL (your OpenClaw gateway URL + `/api/stripe/webhooks`)

## Installation

The Stripe SDK is already included as a dependency. No additional installation is required.

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Enable Stripe payment processing
STRIPE_ENABLED=true

# Stripe API keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe webhook secret (get from https://dashboard.stripe.com/test/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional: Stripe API version (defaults to latest)
STRIPE_API_VERSION=2024-12-18.acacia
```

### OpenClaw Config

Add Stripe configuration to your `openclaw.config.yaml`:

```yaml
env:
  stripe:
    enabled: true
    secretKey: "${STRIPE_SECRET_KEY}"
    publishableKey: "${STRIPE_PUBLISHABLE_KEY}"
    webhookSecret: "${STRIPE_WEBHOOK_SECRET}"
    apiVersion: "2024-12-18.acacia"
```

### Webhook Setup

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-gateway-url/api/stripe/webhooks`
4. Select the events you want to receive (see [Webhook Events](#webhook-events))
5. Copy the signing secret and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## API Endpoints

All Stripe endpoints are available at `/api/stripe/` on your OpenClaw gateway.

### Configuration

**GET /api/stripe/config**

Get the publishable key for client-side integration.

Response:
```json
{
  "publishableKey": "pk_test_..."
}
```

### Checkout Sessions

**POST /api/stripe/checkout/sessions**

Create a new checkout session for one-time payment or subscription.

Request body:
```json
{
  "mode": "payment",
  "lineItems": [
    {
      "priceData": {
        "currency": "usd",
        "productData": {
          "name": "Premium Plan",
          "description": "Monthly subscription"
        },
        "unitAmount": 2999,
        "recurring": {
          "interval": "month"
        }
      },
      "quantity": 1
    }
  ],
  "successUrl": "https://your-app.com/success",
  "cancelUrl": "https://your-app.com/cancel",
  "customerEmail": "customer@example.com"
}
```

Response:
```json
{
  "id": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/...",
  "status": "open"
}
```

**GET /api/stripe/checkout/sessions/{sessionId}**

Retrieve a checkout session.

**POST /api/stripe/checkout/sessions/{sessionId}/expire**

Expire a checkout session.

### Customers

**POST /api/stripe/customers**

Create a new customer.

Request body:
```json
{
  "email": "customer@example.com",
  "name": "John Doe",
  "description": "Premium customer",
  "metadata": {
    "userId": "12345"
  }
}
```

**GET /api/stripe/customers/{customerId}**

Retrieve a customer.

**PUT /api/stripe/customers/{customerId}**

Update a customer.

Request body:
```json
{
  "email": "newemail@example.com",
  "name": "Jane Doe"
}
```

**GET /api/stripe/customers/{customerId}/payment-methods**

List customer's payment methods.

### Payment Methods

**POST /api/stripe/payment-methods/attach**

Attach a payment method to a customer.

Request body:
```json
{
  "paymentMethodId": "pm_...",
  "customerId": "cus_..."
}
```

**POST /api/stripe/payment-methods/detach**

Detach a payment method from a customer.

Request body:
```json
{
  "paymentMethodId": "pm_..."
}
```

### Subscriptions

**POST /api/stripe/subscriptions**

Create a subscription.

Request body:
```json
{
  "customerId": "cus_...",
  "items": [
    {
      "price": "price_...",
      "quantity": 1
    }
  ],
  "trialPeriodDays": 14,
  "metadata": {
    "plan": "premium"
  }
}
```

**GET /api/stripe/subscriptions/{subscriptionId}**

Retrieve a subscription.

**PUT /api/stripe/subscriptions/{subscriptionId}**

Update a subscription.

**POST /api/stripe/subscriptions/{subscriptionId}/cancel**

Cancel a subscription.

Request body:
```json
{
  "immediate": false
}
```

**POST /api/stripe/subscriptions/{subscriptionId}/resume**

Resume a cancelled subscription.

**GET /api/stripe/subscriptions/customer/{customerId}**

List customer subscriptions.

### Webhooks

**POST /api/stripe/webhooks**

Receive webhook events from Stripe.

Headers:
- `stripe-signature`: Webhook signature for verification

## Webhook Events

The integration listens for the following webhook events:

### Payment Events
- `payment_intent.succeeded`: Payment completed successfully
- `payment_intent.payment_failed`: Payment failed

### Checkout Events
- `checkout.session.completed`: Checkout session completed
- `checkout.session.expired`: Checkout session expired

### Subscription Events
- `customer.subscription.created`: Subscription created
- `customer.subscription.updated`: Subscription updated
- `customer.subscription.deleted`: Subscription cancelled
- `customer.subscription.trial_will_end`: Trial ending soon

### Invoice Events
- `invoice.payment_succeeded`: Invoice paid
- `invoice.payment_failed`: Invoice payment failed

### Payment Method Events
- `payment_method.attached`: Payment method attached to customer
- `payment_method.detached`: Payment method detached from customer

## Security Best Practices

### PCI Compliance

1. **Never handle raw card data**: Use Stripe.js or Stripe Elements to collect payment information
2. **Use HTTPS**: Always use TLS/SSL for all payment-related requests
3. **Validate webhooks**: All webhooks are verified using the webhook secret
4. **Tokenization**: Card data is tokenized by Stripe before reaching your server

### 3D Secure

The integration automatically supports 3D Secure (SCA) when required. Stripe handles the authentication flow transparently.

### API Keys

- Store API keys in environment variables, never in code
- Use test keys for development (`sk_test_...`, `pk_test_...`)
- Use live keys only in production (`sk_live_...`, `pk_live_...`)
- Rotate keys if compromised

### Webhook Security

- Verify webhook signatures using the webhook secret
- Use HTTPS for webhook endpoints
- Implement idempotency for webhook handlers

## Testing

### Test Mode

Use Stripe's test mode for development:

1. Use test API keys (`sk_test_...`, `pk_test_...`)
2. Use test card numbers (see https://stripe.com/docs/testing)
3. Trigger webhooks from the Stripe Dashboard

### Test Cards

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0025 0000 3155 | 3D Secure required |
| 4000 0000 0000 9995 | Payment declined |

Use any future expiration date and any 3-digit CVC.

### Manual Testing

1. Create a checkout session:
```bash
curl -X POST http://localhost:18789/api/stripe/checkout/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "payment",
    "lineItems": [{
      "priceData": {
        "currency": "usd",
        "productData": {
          "name": "Test Product"
        },
        "unitAmount": 1000
      },
      "quantity": 1
    }],
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

2. Use the returned URL to complete the checkout

3. Verify the webhook event is received

## Troubleshooting

### Webhooks Not Received

1. Check that `STRIPE_WEBHOOK_SECRET` is set correctly
2. Verify the webhook endpoint URL is accessible from the internet
3. Check the webhook logs in the Stripe Dashboard
4. Ensure the gateway is running and the `/api/stripe/webhooks` endpoint is accessible

### Payment Declined

1. Check the error message in the Stripe Dashboard
2. Verify the test card number is correct
3. Ensure sufficient balance (for test cards)
4. Check if 3D Secure authentication is required

### Configuration Errors

1. Verify all required environment variables are set
2. Check that `STRIPE_ENABLED=true` in your `.env` file
3. Ensure the Stripe SDK is installed (`stripe` package)
4. Check the gateway logs for initialization errors

### API Errors

1. Check the gateway logs for detailed error messages
2. Verify API keys are valid and not expired
3. Ensure you're using the correct API version
4. Check Stripe API status at https://status.stripe.com

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [PCI Compliance Guide](https://stripe.com/docs/security/guide)

## Support

For issues specific to OpenClaw's Stripe integration, please open an issue on the GitHub repository.

For Stripe-specific issues, contact [Stripe Support](https://support.stripe.com).
