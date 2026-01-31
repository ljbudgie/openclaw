import type Stripe from "stripe";
import { getStripeClient } from "./stripe-config.js";
import type { createSubsystemLogger } from "../logging/subsystem.js";

type SubsystemLogger = ReturnType<typeof createSubsystemLogger>;

export interface CreateCustomerParams {
  email: string;
  name?: string;
  phone?: string;
  description?: string;
  metadata?: Record<string, string>;
  paymentMethod?: string;
}

export interface UpdateCustomerParams {
  email?: string;
  name?: string;
  phone?: string;
  description?: string;
  metadata?: Record<string, string>;
  defaultPaymentMethod?: string;
}

export async function createCustomer(
  params: CreateCustomerParams,
  log?: SubsystemLogger,
): Promise<Stripe.Customer> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      phone: params.phone,
      description: params.description,
      metadata: params.metadata,
      payment_method: params.paymentMethod,
    });

    log?.info("Customer created", { customerId: customer.id, email: params.email });
    return customer;
  } catch (error) {
    log?.error("Failed to create customer", { email: params.email, error });
    throw error;
  }
}

export async function getCustomer(
  customerId: string,
  log?: SubsystemLogger,
): Promise<Stripe.Customer> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      throw new Error("Customer has been deleted");
    }
    log?.info("Retrieved customer", { customerId });
    return customer as Stripe.Customer;
  } catch (error) {
    log?.error("Failed to retrieve customer", { customerId, error });
    throw error;
  }
}

export async function updateCustomer(
  customerId: string,
  params: UpdateCustomerParams,
  log?: SubsystemLogger,
): Promise<Stripe.Customer> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const customer = await stripe.customers.update(customerId, {
      email: params.email,
      name: params.name,
      phone: params.phone,
      description: params.description,
      metadata: params.metadata,
      invoice_settings: params.defaultPaymentMethod
        ? {
            default_payment_method: params.defaultPaymentMethod,
          }
        : undefined,
    });

    log?.info("Customer updated", { customerId });
    return customer;
  } catch (error) {
    log?.error("Failed to update customer", { customerId, error });
    throw error;
  }
}

export async function deleteCustomer(
  customerId: string,
  log?: SubsystemLogger,
): Promise<void> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    await stripe.customers.del(customerId);
    log?.info("Customer deleted", { customerId });
  } catch (error) {
    log?.error("Failed to delete customer", { customerId, error });
    throw error;
  }
}

export async function listCustomerPaymentMethods(
  customerId: string,
  type: "card" | "us_bank_account" = "card",
  log?: SubsystemLogger,
): Promise<Stripe.PaymentMethod[]> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type,
    });

    log?.info("Retrieved customer payment methods", {
      customerId,
      count: paymentMethods.data.length,
    });

    return paymentMethods.data;
  } catch (error) {
    log?.error("Failed to list customer payment methods", { customerId, error });
    throw error;
  }
}

export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string,
  log?: SubsystemLogger,
): Promise<Stripe.PaymentMethod> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    log?.info("Payment method attached to customer", {
      paymentMethodId,
      customerId,
    });

    return paymentMethod;
  } catch (error) {
    log?.error("Failed to attach payment method", {
      paymentMethodId,
      customerId,
      error,
    });
    throw error;
  }
}

export async function detachPaymentMethod(
  paymentMethodId: string,
  log?: SubsystemLogger,
): Promise<Stripe.PaymentMethod> {
  const stripe = getStripeClient(log);
  if (!stripe) {
    throw new Error("Stripe client not initialized");
  }

  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);

    log?.info("Payment method detached", { paymentMethodId });

    return paymentMethod;
  } catch (error) {
    log?.error("Failed to detach payment method", { paymentMethodId, error });
    throw error;
  }
}
