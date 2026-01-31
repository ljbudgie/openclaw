export type StripeConfig = {
  /** Enable Stripe payment processing. Default: false. */
  enabled?: boolean;
  /** Stripe secret key (from dashboard). */
  secretKey?: string;
  /** Stripe publishable key (for client-side). */
  publishableKey?: string;
  /** Stripe webhook secret (for webhook signature verification). */
  webhookSecret?: string;
  /** Stripe API version. Default: "2024-12-18.acacia". */
  apiVersion?: string;
};
