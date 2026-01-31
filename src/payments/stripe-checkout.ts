import type Stripe from "stripe";
import { getStripeClient } from "./stripe-config.js";
import type { createSubsystemLogger } from "../logging/subsystem.js";

type SubsystemLogger = ReturnType<typeof createSubsystemLogger>;

export interface CreateCheckoutSessionParams {
  mode: "payment" | "subscription";
  lineItems: Array<{
    price?: string;
    priceData?: {
      currency: string;
      productData: {
        name: string;
        description?: string;
      };
      unitAmount: number;
      recurring?: {
        interval: "day" | "week" | "month" | "year";
        intervalCount?: number;
      };
    };
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  allowPromotionCodes?: boolean;
  paymentMethodTypes?: string[];
}

export interface CheckoutSession {
  id: string;
  url: string | null;
  status: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
  log?: SubsystemLogger,
): Promise<CheckoutSession> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: params.mode,
      line_items: params.lineItems.map((item) => ({
        price: item.price,
        price_data: item.priceData
          ? {
              currency: item.priceData.currency,
              product_data: {
                name: item.priceData.productData.name,
                description: item.priceData.productData.description,
              },
              unit_amount: item.priceData.unitAmount,
              recurring: item.priceData.recurring
                ? {
                    interval: item.priceData.recurring.interval,
                    interval_count: item.priceData.recurring.intervalCount,
                  }
                : undefined,
            }
          : undefined,
        quantity: item.quantity,
      })),
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      customer: params.customerId,
      metadata: params.metadata,
      allow_promotion_codes: params.allowPromotionCodes ?? false,
      payment_method_types: params.paymentMethodTypes as Stripe.Checkout.SessionCreateParams.PaymentMethodType[] | undefined ?? ["card"],
    };

    // Enable automatic tax calculation if available
    sessionParams.automatic_tax = { enabled: true };

    // Save payment method for future use if subscription mode
    if (params.mode === "subscription") {
      sessionParams.payment_method_collection = "if_required";
      sessionParams.payment_method_options = {
        card: {
          setup_future_usage: "off_session",
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    log?.info("Checkout session created", {
      sessionId: session.id,
      mode: params.mode,
    });

    return {
      id: session.id,
      url: session.url,
      status: session.status ?? "open",
    };
  } catch (error) {
    log?.error("Failed to create checkout session", { error });
    throw error;
  }
}

export async function getCheckoutSession(
  sessionId: string,
  log?: SubsystemLogger,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    log?.info("Retrieved checkout session", { sessionId });
    return session;
  } catch (error) {
    log?.error("Failed to retrieve checkout session", { sessionId, error });
    throw error;
  }
}

export async function expireCheckoutSession(
  sessionId: string,
  log?: SubsystemLogger,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const session = await stripe.checkout.sessions.expire(sessionId);
    log?.info("Expired checkout session", { sessionId });
    return session;
  } catch (error) {
    log?.error("Failed to expire checkout session", { sessionId, error });
    throw error;
  }
}
