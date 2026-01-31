import Stripe from "stripe";
import { loadConfig } from "../config/config.js";
import type { createSubsystemLogger } from "../logging/subsystem.js";

type SubsystemLogger = ReturnType<typeof createSubsystemLogger>;

export interface StripeConfig {
  enabled: boolean;
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  apiVersion: string;
}

let stripeClient: Stripe | null = null;

export function getStripeConfig(): StripeConfig | null {
  const config = loadConfig();
  const stripeEnv = config.env?.stripe;

  if (!stripeEnv?.enabled) {
    return null;
  }

  if (!stripeEnv.secretKey) {
    throw new Error("Stripe secret key is required when Stripe is enabled");
  }

  return {
    enabled: stripeEnv.enabled,
    secretKey: stripeEnv.secretKey,
    publishableKey: stripeEnv.publishableKey ?? "",
    webhookSecret: stripeEnv.webhookSecret ?? "",
    apiVersion: stripeEnv.apiVersion ?? "2024-12-18.acacia",
  };
}

export function getStripeClient(log?: SubsystemLogger): Stripe | null {
  if (stripeClient) {
    return stripeClient;
  }

  const config = getStripeConfig();
  if (!config) {
    return null;
  }

  try {
    stripeClient = new Stripe(config.secretKey, {
      apiVersion: config.apiVersion as Stripe.LatestApiVersion,
      typescript: true,
    });

    log?.info("Stripe client initialized successfully");
    return stripeClient;
  } catch (error) {
    log?.error("Failed to initialize Stripe client", { error });
    throw error;
  }
}

export function resetStripeClient(): void {
  stripeClient = null;
}
