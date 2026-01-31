import type Stripe from "stripe";
import { getStripeClient, getStripeConfig } from "./stripe-config.js";
import type { createSubsystemLogger } from "../logging/subsystem.js";

type SubsystemLogger = ReturnType<typeof createSubsystemLogger>;

export type StripeEventType =
  | "checkout.session.completed"
  | "checkout.session.expired"
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "customer.subscription.trial_will_end"
  | "invoice.payment_succeeded"
  | "invoice.payment_failed"
  | "payment_method.attached"
  | "payment_method.detached";

export interface WebhookEventHandler {
  (event: Stripe.Event, log?: SubsystemLogger): Promise<void>;
}

const webhookHandlers = new Map<StripeEventType, WebhookEventHandler[]>();

export function registerWebhookHandler(
  eventType: StripeEventType,
  handler: WebhookEventHandler,
): void {
  const handlers = webhookHandlers.get(eventType) || [];
  handlers.push(handler);
  webhookHandlers.set(eventType, handlers);
}

export function unregisterWebhookHandler(
  eventType: StripeEventType,
  handler: WebhookEventHandler,
): void {
  const handlers = webhookHandlers.get(eventType);
  if (handlers) {
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  log?: SubsystemLogger,
): Promise<Stripe.Event | null> {
  const stripe = getStripeClient(log);
  const config = getStripeConfig();

  if (!stripe || !config) {
    log?.error("Stripe not configured for webhook processing");
    return null;
  }

  if (!config.webhookSecret) {
    log?.error("Stripe webhook secret not configured");
    return null;
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, config.webhookSecret);
    log?.info("Webhook event constructed", { type: event.type, id: event.id });
    return event;
  } catch (error) {
    log?.error("Failed to construct webhook event", { error });
    throw error;
  }
}

export async function handleWebhookEvent(
  event: Stripe.Event,
  log?: SubsystemLogger,
): Promise<void> {
  log?.info("Processing webhook event", {
    type: event.type,
    id: event.id,
  });

  const handlers = webhookHandlers.get(event.type as StripeEventType);

  if (!handlers || handlers.length === 0) {
    log?.warn("No handlers registered for webhook event", { type: event.type });
    return;
  }

  try {
    await Promise.all(handlers.map((handler) => handler(event, log)));
    log?.info("Webhook event processed successfully", { type: event.type });
  } catch (error) {
    log?.error("Failed to process webhook event", {
      type: event.type,
      id: event.id,
      error,
    });
    throw error;
  }
}

// Default webhook handlers for common events
registerWebhookHandler("checkout.session.completed", async (event, log) => {
  const session = event.data.object as Stripe.Checkout.Session;
  log?.info("Checkout session completed", {
    sessionId: session.id,
    customerId: session.customer,
    mode: session.mode,
    paymentStatus: session.payment_status,
  });
});

registerWebhookHandler("checkout.session.expired", async (event, log) => {
  const session = event.data.object as Stripe.Checkout.Session;
  log?.info("Checkout session expired", {
    sessionId: session.id,
  });
});

registerWebhookHandler("payment_intent.succeeded", async (event, log) => {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  log?.info("Payment succeeded", {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  });
});

registerWebhookHandler("payment_intent.payment_failed", async (event, log) => {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  log?.error("Payment failed", {
    paymentIntentId: paymentIntent.id,
    lastError: paymentIntent.last_payment_error?.message,
  });
});

registerWebhookHandler("customer.subscription.created", async (event, log) => {
  const subscription = event.data.object as Stripe.Subscription;
  log?.info("Subscription created", {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
  });
});

registerWebhookHandler("customer.subscription.updated", async (event, log) => {
  const subscription = event.data.object as Stripe.Subscription;
  log?.info("Subscription updated", {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
  });
});

registerWebhookHandler("customer.subscription.deleted", async (event, log) => {
  const subscription = event.data.object as Stripe.Subscription;
  log?.info("Subscription deleted", {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
  });
});

registerWebhookHandler("customer.subscription.trial_will_end", async (event, log) => {
  const subscription = event.data.object as Stripe.Subscription;
  log?.info("Subscription trial ending soon", {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    trialEnd: subscription.trial_end,
  });
});

registerWebhookHandler("invoice.payment_succeeded", async (event, log) => {
  const invoice = event.data.object as Stripe.Invoice;
  log?.info("Invoice payment succeeded", {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
    amountPaid: invoice.amount_paid,
  });
});

registerWebhookHandler("invoice.payment_failed", async (event, log) => {
  const invoice = event.data.object as Stripe.Invoice;
  log?.error("Invoice payment failed", {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
    attemptCount: invoice.attempt_count,
  });
});
