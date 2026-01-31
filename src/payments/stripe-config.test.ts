import { describe, expect, it, beforeEach, vi } from "vitest";
import { getStripeConfig, getStripeClient, resetStripeClient } from "./stripe-config.js";

// Mock loadConfig
vi.mock("../config/config.js", () => ({
  loadConfig: vi.fn(() => ({
    env: {
      stripe: {
        enabled: true,
        secretKey: "sk_test_mock_secret_key",
        publishableKey: "pk_test_mock_publishable_key",
        webhookSecret: "whsec_mock_webhook_secret",
        apiVersion: "2024-12-18.acacia",
      },
    },
  })),
}));

describe("stripe-config", () => {
  beforeEach(() => {
    resetStripeClient();
  });

  it("returns null when stripe is not enabled", () => {
    const { loadConfig } = vi.mocked(await import("../config/config.js"));
    loadConfig.mockReturnValueOnce({
      env: {
        stripe: {
          enabled: false,
        },
      },
    } as never);

    const config = getStripeConfig();
    expect(config).toBeNull();
  });

  it("returns null when stripe config is missing", () => {
    const { loadConfig } = vi.mocked(await import("../config/config.js"));
    loadConfig.mockReturnValueOnce({
      env: {},
    } as never);

    const config = getStripeConfig();
    expect(config).toBeNull();
  });

  it("throws error when secret key is missing but enabled", () => {
    const { loadConfig } = vi.mocked(await import("../config/config.js"));
    loadConfig.mockReturnValueOnce({
      env: {
        stripe: {
          enabled: true,
          secretKey: "",
        },
      },
    } as never);

    expect(() => getStripeConfig()).toThrow("Stripe secret key is required");
  });

  it("returns stripe config when properly configured", () => {
    const config = getStripeConfig();

    expect(config).toEqual({
      enabled: true,
      secretKey: "sk_test_mock_secret_key",
      publishableKey: "pk_test_mock_publishable_key",
      webhookSecret: "whsec_mock_webhook_secret",
      apiVersion: "2024-12-18.acacia",
    });
  });

  it("uses default API version when not specified", () => {
    const { loadConfig } = vi.mocked(await import("../config/config.js"));
    loadConfig.mockReturnValueOnce({
      env: {
        stripe: {
          enabled: true,
          secretKey: "sk_test_key",
        },
      },
    } as never);

    const config = getStripeConfig();
    expect(config?.apiVersion).toBe("2024-12-18.acacia");
  });

  it("returns null for client when stripe is not configured", () => {
    const { loadConfig } = vi.mocked(await import("../config/config.js"));
    loadConfig.mockReturnValueOnce({
      env: {},
    } as never);

    const client = getStripeClient();
    expect(client).toBeNull();
  });

  it("initializes stripe client with config", () => {
    const client = getStripeClient();
    expect(client).toBeDefined();
    expect(client).not.toBeNull();
  });

  it("reuses stripe client on subsequent calls", () => {
    const client1 = getStripeClient();
    const client2 = getStripeClient();
    expect(client1).toBe(client2);
  });

  it("resets stripe client", () => {
    const client1 = getStripeClient();
    expect(client1).not.toBeNull();

    resetStripeClient();
    const client2 = getStripeClient();

    expect(client2).not.toBeNull();
    expect(client1).not.toBe(client2);
  });
});
