/**
 * Example: Using Stripe Payment Integration in OpenClaw
 * 
 * This file demonstrates how to use the Stripe payment features
 * through the OpenClaw gateway API.
 */

// Example 1: Create a one-time payment checkout session
async function createOneTimePayment() {
  const response = await fetch("http://localhost:18789/api/stripe/checkout/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: "payment",
      lineItems: [
        {
          priceData: {
            currency: "usd",
            productData: {
              name: "Premium Feature Access",
              description: "One-time payment for premium features",
            },
            unitAmount: 4999, // $49.99 in cents
          },
          quantity: 1,
        },
      ],
      successUrl: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "http://localhost:3000/cancel",
      customerEmail: "customer@example.com",
      metadata: {
        feature: "premium",
        userId: "user123",
      },
    }),
  });

  const session = await response.json();
  console.log("Checkout URL:", session.url);
  // Redirect user to session.url to complete payment
  return session;
}

// Example 2: Create a subscription checkout session
async function createSubscription() {
  const response = await fetch("http://localhost:18789/api/stripe/checkout/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: "subscription",
      lineItems: [
        {
          priceData: {
            currency: "usd",
            productData: {
              name: "Pro Plan",
              description: "Monthly subscription to Pro features",
            },
            unitAmount: 2999, // $29.99 per month
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      successUrl: "http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "http://localhost:3000/pricing",
      allowPromotionCodes: true,
    }),
  });

  const session = await response.json();
  return session;
}

// Example 3: Create a customer and attach payment method
async function createCustomerWithPaymentMethod(email: string, name: string, paymentMethodId: string) {
  // Create customer
  const customerResponse = await fetch("http://localhost:18789/api/stripe/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      name,
      description: "Premium customer",
      metadata: {
        source: "webapp",
      },
    }),
  });

  const customer = await customerResponse.json();

  // Attach payment method to customer
  const attachResponse = await fetch("http://localhost:18789/api/stripe/payment-methods/attach", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentMethodId,
      customerId: customer.id,
    }),
  });

  const paymentMethod = await attachResponse.json();
  return { customer, paymentMethod };
}

// Example 4: Create a subscription directly (requires customer with payment method)
async function createDirectSubscription(customerId: string, priceId: string) {
  const response = await fetch("http://localhost:18789/api/stripe/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId,
      items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      trialPeriodDays: 14,
      metadata: {
        plan: "pro",
      },
    }),
  });

  const subscription = await response.json();
  return subscription;
}

// Example 5: Cancel a subscription
async function cancelSubscription(subscriptionId: string, immediate = false) {
  const response = await fetch(
    `http://localhost:18789/api/stripe/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        immediate, // true = cancel immediately, false = cancel at period end
      }),
    }
  );

  const subscription = await response.json();
  return subscription;
}

// Example 6: List customer's subscriptions
async function getCustomerSubscriptions(customerId: string) {
  const response = await fetch(
    `http://localhost:18789/api/stripe/subscriptions/customer/${customerId}`,
    {
      method: "GET",
    }
  );

  const result = await response.json();
  return result.data; // Array of subscriptions
}

// Example 7: Get customer's saved payment methods
async function getCustomerPaymentMethods(customerId: string) {
  const response = await fetch(
    `http://localhost:18789/api/stripe/customers/${customerId}/payment-methods`,
    {
      method: "GET",
    }
  );

  const result = await response.json();
  return result.data; // Array of payment methods
}

// Example 8: Update subscription
async function updateSubscription(subscriptionId: string, newPriceId: string) {
  const response = await fetch(
    `http://localhost:18789/api/stripe/subscriptions/${subscriptionId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            price: newPriceId,
            quantity: 1,
          },
        ],
      }),
    }
  );

  const subscription = await response.json();
  return subscription;
}

// Example 9: Retrieve checkout session (to check status)
async function checkCheckoutSession(sessionId: string) {
  const response = await fetch(
    `http://localhost:18789/api/stripe/checkout/sessions/${sessionId}`,
    {
      method: "GET",
    }
  );

  const session = await response.json();
  console.log("Payment status:", session.payment_status);
  return session;
}

// Example 10: Get Stripe publishable key (for client-side Stripe.js)
async function getStripePublishableKey() {
  const response = await fetch("http://localhost:18789/api/stripe/config", {
    method: "GET",
  });

  const config = await response.json();
  return config.publishableKey;
}

// Client-side example using Stripe.js
async function handleClientSidePayment() {
  // 1. Get publishable key
  const publishableKey = await getStripePublishableKey();
  
  // 2. Initialize Stripe.js (in browser)
  // const stripe = Stripe(publishableKey);
  
  // 3. Create checkout session on server
  const session = await createOneTimePayment();
  
  // 4. Redirect to Stripe Checkout
  // await stripe.redirectToCheckout({ sessionId: session.id });
}

export {
  createOneTimePayment,
  createSubscription,
  createCustomerWithPaymentMethod,
  createDirectSubscription,
  cancelSubscription,
  getCustomerSubscriptions,
  getCustomerPaymentMethods,
  updateSubscription,
  checkCheckoutSession,
  getStripePublishableKey,
  handleClientSidePayment,
};
