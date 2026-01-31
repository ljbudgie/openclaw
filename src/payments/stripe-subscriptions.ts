import type Stripe from "stripe";
import { getStripeClient } from "./stripe-config.js";
import type { createSubsystemLogger } from "../logging/subsystem.js";

type SubsystemLogger = ReturnType<typeof createSubsystemLogger>;

export interface CreateSubscriptionParams {
  customerId: string;
  items: Array<{
    price: string;
    quantity?: number;
  }>;
  paymentMethod?: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
  defaultPaymentMethod?: string;
}

export async function createSubscription(
  params: CreateSubscriptionParams,
  log?: SubsystemLogger,
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: params.customerId,
      items: params.items.map((item) => ({
        price: item.price,
        quantity: item.quantity ?? 1,
      })),
      metadata: params.metadata,
      trial_period_days: params.trialPeriodDays,
      payment_behavior: "default_incomplete",
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    };

    if (params.defaultPaymentMethod) {
      subscriptionParams.default_payment_method = params.defaultPaymentMethod;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);

    log?.info("Subscription created", {
      subscriptionId: subscription.id,
      customerId: params.customerId,
    });

    return subscription;
  } catch (error) {
    log?.error("Failed to create subscription", {
      customerId: params.customerId,
      error,
    });
    throw error;
  }
}

export async function getSubscription(
  subscriptionId: string,
  log?: SubsystemLogger,
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    log?.info("Retrieved subscription", { subscriptionId });
    return subscription;
  } catch (error) {
    log?.error("Failed to retrieve subscription", { subscriptionId, error });
    throw error;
  }
}

export async function updateSubscription(
  subscriptionId: string,
  params: {
    items?: Array<{ id?: string; price: string; quantity?: number }>;
    metadata?: Record<string, string>;
    cancelAtPeriodEnd?: boolean;
    defaultPaymentMethod?: string;
  },
  log?: SubsystemLogger,
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const updateParams: Stripe.SubscriptionUpdateParams = {
      metadata: params.metadata,
      cancel_at_period_end: params.cancelAtPeriodEnd,
      default_payment_method: params.defaultPaymentMethod,
    };

    if (params.items) {
      updateParams.items = params.items.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity ?? 1,
      }));
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, updateParams);

    log?.info("Subscription updated", { subscriptionId });
    return subscription;
  } catch (error) {
    log?.error("Failed to update subscription", { subscriptionId, error });
    throw error;
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  immediate: boolean = false,
  log?: SubsystemLogger,
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    let subscription: Stripe.Subscription;

    if (immediate) {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    log?.info("Subscription cancelled", {
      subscriptionId,
      immediate,
    });

    return subscription;
  } catch (error) {
    log?.error("Failed to cancel subscription", { subscriptionId, error });
    throw error;
  }
}

export async function resumeSubscription(
  subscriptionId: string,
  log?: SubsystemLogger,
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    log?.info("Subscription resumed", { subscriptionId });
    return subscription;
  } catch (error) {
    log?.error("Failed to resume subscription", { subscriptionId, error });
    throw error;
  }
}

export async function listCustomerSubscriptions(
  customerId: string,
  status?: Stripe.Subscription.Status,
  log?: SubsystemLogger,
): Promise<Stripe.Subscription[]> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status,
    });

    log?.info("Retrieved customer subscriptions", {
      customerId,
      count: subscriptions.data.length,
    });

    return subscriptions.data;
  } catch (error) {
    log?.error("Failed to list customer subscriptions", { customerId, error });
    throw error;
  }
}
