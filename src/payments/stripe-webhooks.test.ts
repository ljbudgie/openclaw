import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import {
  registerWebhookHandler,
  unregisterWebhookHandler,
  handleWebhookEvent,
} from "./stripe-webhooks.js";

describe("stripe-webhooks", () => {
  it("registers webhook handler", () => {
    const handler = vi.fn();
    registerWebhookHandler("payment_intent.succeeded", handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it("handles registered webhook event", async () => {
    const handler = vi.fn();
    registerWebhookHandler("checkout.session.completed", handler);

    const event: Stripe.Event = {
      id: "evt_test_123",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          mode: "payment",
          payment_status: "paid",
        } as Stripe.Checkout.Session,
      },
    } as Stripe.Event;

    await handleWebhookEvent(event);
    expect(handler).toHaveBeenCalledWith(event, undefined);
  });

  it("logs warning for unregistered event", async () => {
    const mockLog = {
      warn: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    };

    const event: Stripe.Event = {
      id: "evt_test_456",
      type: "unknown.event.type" as Stripe.Event.Type,
      data: {
        object: {} as never,
      },
    } as Stripe.Event;

    await handleWebhookEvent(event, mockLog as never);
    expect(mockLog.warn).toHaveBeenCalledWith(
      "No handlers registered for webhook event",
      expect.objectContaining({ type: "unknown.event.type" }),
    );
  });

  it("unregisters webhook handler", async () => {
    const handler = vi.fn();
    registerWebhookHandler("payment_intent.payment_failed", handler);
    unregisterWebhookHandler("payment_intent.payment_failed", handler);

    const event: Stripe.Event = {
      id: "evt_test_789",
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: "pi_test_123",
        } as Stripe.PaymentIntent,
      },
    } as Stripe.Event;

    const mockLog = {
      warn: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    };

    await handleWebhookEvent(event, mockLog as never);
    expect(handler).not.toHaveBeenCalled();
  });

  it("handles multiple handlers for same event", async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    registerWebhookHandler("invoice.payment_succeeded", handler1);
    registerWebhookHandler("invoice.payment_succeeded", handler2);

    const event: Stripe.Event = {
      id: "evt_test_abc",
      type: "invoice.payment_succeeded",
      data: {
        object: {
          id: "in_test_123",
        } as Stripe.Invoice,
      },
    } as Stripe.Event;

    await handleWebhookEvent(event);

    expect(handler1).toHaveBeenCalledWith(event, undefined);
    expect(handler2).toHaveBeenCalledWith(event, undefined);
  });

  it("throws error when handler fails", async () => {
    const errorHandler = vi.fn().mockRejectedValue(new Error("Handler error"));
    registerWebhookHandler("customer.subscription.created", errorHandler);

    const event: Stripe.Event = {
      id: "evt_test_def",
      type: "customer.subscription.created",
      data: {
        object: {
          id: "sub_test_123",
        } as Stripe.Subscription,
      },
    } as Stripe.Event;

    await expect(handleWebhookEvent(event)).rejects.toThrow("Handler error");
  });
});
