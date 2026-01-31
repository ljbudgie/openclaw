import type { IncomingMessage, ServerResponse } from "node:http";
import { getStripeConfig } from "../payments/stripe-config.js";
import {
  createCheckoutSession,
  getCheckoutSession,
  expireCheckoutSession,
} from "../payments/stripe-checkout.js";
import {
  createCustomer,
  getCustomer,
  updateCustomer,
  listCustomerPaymentMethods,
  attachPaymentMethod,
  detachPaymentMethod,
} from "../payments/stripe-customers.js";
import {
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  resumeSubscription,
  listCustomerSubscriptions,
} from "../payments/stripe-subscriptions.js";
import { constructWebhookEvent, handleWebhookEvent } from "../payments/stripe-webhooks.js";
import type { createSubsystemLogger } from "../logging/subsystem.js";

type SubsystemLogger = ReturnType<typeof createSubsystemLogger>;

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export async function handleStripeHttpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  opts: {
    basePath: string;
    bindHost: string;
    port: number;
    log: SubsystemLogger;
  },
): Promise<boolean> {
  const { basePath, bindHost, port, log } = opts;
  const config = getStripeConfig();

  if (!config?.enabled) {
    return false;
  }

  const url = new URL(req.url ?? "/", `http://${bindHost}:${port}`);
  if (!url.pathname.startsWith(basePath)) {
    return false;
  }

  const subPath = url.pathname.slice(basePath.length).replace(/^\/+/, "");

  try {
    // Webhook endpoint - must preserve raw body for signature verification
    if (subPath === "webhooks" && req.method === "POST") {
      const signature = req.headers["stripe-signature"];
      if (!signature || typeof signature !== "string") {
        sendJson(res, 400, { error: "Missing stripe-signature header" });
        return true;
      }

      const rawBody = await readRawBody(req);
      const event = await constructWebhookEvent(rawBody, signature, log);

      if (!event) {
        sendJson(res, 400, { error: "Invalid webhook signature" });
        return true;
      }

      await handleWebhookEvent(event, log);
      sendJson(res, 200, { received: true });
      return true;
    }

    // All other endpoints require JSON body
    const bodyStr = await readBody(req);
    const body = bodyStr ? JSON.parse(bodyStr) : {};

    // Checkout session endpoints
    if (subPath === "checkout/sessions" && req.method === "POST") {
      const session = await createCheckoutSession(body, log);
      sendJson(res, 200, session);
      return true;
    }

    if (subPath.startsWith("checkout/sessions/") && req.method === "GET") {
      const sessionId = subPath.split("/")[2];
      const session = await getCheckoutSession(sessionId, log);
      sendJson(res, 200, session);
      return true;
    }

    if (subPath.startsWith("checkout/sessions/") && subPath.endsWith("/expire")) {
      const sessionId = subPath.split("/")[2];
      const session = await expireCheckoutSession(sessionId, log);
      sendJson(res, 200, session);
      return true;
    }

    // Customer endpoints
    if (subPath === "customers" && req.method === "POST") {
      const customer = await createCustomer(body, log);
      sendJson(res, 200, customer);
      return true;
    }

    if (subPath.startsWith("customers/") && req.method === "GET") {
      const customerId = subPath.split("/")[1];
      const customer = await getCustomer(customerId, log);
      sendJson(res, 200, customer);
      return true;
    }

    if (subPath.startsWith("customers/") && req.method === "PUT") {
      const customerId = subPath.split("/")[1];
      const customer = await updateCustomer(customerId, body, log);
      sendJson(res, 200, customer);
      return true;
    }

    if (subPath.startsWith("customers/") && subPath.endsWith("/payment-methods")) {
      const customerId = subPath.split("/")[1];
      const paymentMethods = await listCustomerPaymentMethods(customerId, body.type, log);
      sendJson(res, 200, { data: paymentMethods });
      return true;
    }

    // Payment method endpoints
    if (subPath === "payment-methods/attach" && req.method === "POST") {
      const { paymentMethodId, customerId } = body;
      const paymentMethod = await attachPaymentMethod(paymentMethodId, customerId, log);
      sendJson(res, 200, paymentMethod);
      return true;
    }

    if (subPath === "payment-methods/detach" && req.method === "POST") {
      const { paymentMethodId } = body;
      const paymentMethod = await detachPaymentMethod(paymentMethodId, log);
      sendJson(res, 200, paymentMethod);
      return true;
    }

    // Subscription endpoints
    if (subPath === "subscriptions" && req.method === "POST") {
      const subscription = await createSubscription(body, log);
      sendJson(res, 200, subscription);
      return true;
    }

    if (subPath.startsWith("subscriptions/") && req.method === "GET") {
      const parts = subPath.split("/");
      if (parts[1] === "customer") {
        const customerId = parts[2];
        const subscriptions = await listCustomerSubscriptions(customerId, body.status, log);
        sendJson(res, 200, { data: subscriptions });
      } else {
        const subscriptionId = parts[1];
        const subscription = await getSubscription(subscriptionId, log);
        sendJson(res, 200, subscription);
      }
      return true;
    }

    if (subPath.startsWith("subscriptions/") && req.method === "PUT") {
      const subscriptionId = subPath.split("/")[1];
      const subscription = await updateSubscription(subscriptionId, body, log);
      sendJson(res, 200, subscription);
      return true;
    }

    if (subPath.startsWith("subscriptions/") && subPath.endsWith("/cancel")) {
      const subscriptionId = subPath.split("/")[1];
      const subscription = await cancelSubscription(subscriptionId, body.immediate, log);
      sendJson(res, 200, subscription);
      return true;
    }

    if (subPath.startsWith("subscriptions/") && subPath.endsWith("/resume")) {
      const subscriptionId = subPath.split("/")[1];
      const subscription = await resumeSubscription(subscriptionId, log);
      sendJson(res, 200, subscription);
      return true;
    }

    // Config endpoint to get publishable key
    if (subPath === "config" && req.method === "GET") {
      sendJson(res, 200, {
        publishableKey: config.publishableKey,
      });
      return true;
    }

    return false;
  } catch (error) {
    log.error("Stripe API error", { error, path: subPath });
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Internal server error",
    });
    return true;
  }
}
