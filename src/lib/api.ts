import { supabase } from "@/integrations/supabase/client";

// SUPABASE_URL removed

export interface ShippingRate {
  provider: string;
  service: string;
  price: number;
  estimatedDays: string;
  description: string;
}

export interface PudoLocker {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  availableSlots: number;
}

export interface CurrencyRates {
  ZAR_TO_USD: number;
  USD_TO_ZAR: number;
}

// Get shipping rates
export async function getShippingRates(
  originPostalCode: string,
  destinationPostalCode: string,
  weight: number,
  dimensions?: { length: number; width: number; height: number }
): Promise<ShippingRate[]> {
  try {
    const response = await fetch(`/api/shipping-rates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originPostalCode,
        destinationPostalCode,
        weight,
        dimensions,
        provider: "all",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch shipping rates");
    }

    const data = await response.json();
    return data.rates || [];
  } catch (error) {
    console.error("Shipping rates error:", error);
    return [];
  }
}

// Get PUDO locker locations
export async function getPudoLockers(postalCode: string): Promise<PudoLocker[]> {
  try {
    const response = await fetch(
      `/api/shipping-rates?action=lockers&postalCode=${postalCode}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch PUDO lockers");
    }

    const data = await response.json();
    return data.lockers || [];
  } catch (error) {
    console.error("PUDO lockers error:", error);
    return [];
  }
}

// Get currency exchange rates
export async function getCurrencyRates(): Promise<CurrencyRates> {
  try {
    const response = await fetch(
      `/api/currency-convert?action=rates`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch currency rates");
    }

    const data = await response.json();
    return data.rates || { ZAR_TO_USD: 0.055, USD_TO_ZAR: 18.18 };
  } catch (error) {
    console.error("Currency rates error:", error);
    return { ZAR_TO_USD: 0.055, USD_TO_ZAR: 18.18 };
  }
}

// Convert currency
export async function convertCurrency(
  amount: number,
  from: "ZAR" | "USD",
  to: "ZAR" | "USD"
): Promise<number> {
  try {
    const response = await fetch(
      `/api/currency-convert?action=convert&amount=${amount}&from=${from}&to=${to}`
    );

    if (!response.ok) {
      throw new Error("Failed to convert currency");
    }

    const data = await response.json();
    return data.converted?.amount || amount;
  } catch (error) {
    console.error("Currency conversion error:", error);
    return amount;
  }
}

// PayFast payment response type
export interface PayFastPaymentResult {
  success: boolean;
  actionUrl?: string;
  formFields?: Record<string, string>;
  paymentId?: string;
  error?: string;
}

// Initiate PayFast payment - returns form data for POST submission
export async function initiatePayFastPayment(
  orderId: string,
  amount: number,
  itemName: string,
  customerEmail: string,
  customerName: string,
  returnUrl: string,
  cancelUrl: string,
  accessToken?: string
): Promise<PayFastPaymentResult> {
  try {
    const { data, error } = await supabase.functions.invoke("payfast-payment", {
      body: { orderId, itemName, customerEmail, customerName, returnUrl, cancelUrl, accessToken },
    });
    if (error) throw new Error(error.message || "Payment initiation failed");
    return data;
  } catch (error: any) {
    console.error("PayFast payment error:", error);
    return { success: false, error: error.message };
  }
}

// Initiate Yoco payment
export async function initiateYocoPayment(
  orderId: string,
  amount: number,
  currency: string,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string,
  accessToken?: string
): Promise<{ success: boolean; redirectUrl?: string; checkoutId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("yoco-payment", {
      body: { orderId, currency, successUrl, cancelUrl, customerEmail, accessToken },
    });
    if (error) throw new Error(error.message || "Payment initiation failed");
    return data;
  } catch (error: any) {
    console.error("Yoco payment error:", error);
    return { success: false, error: error.message };
  }
}

export async function initiatePayPalPayment(
  orderId: string,
  amount: number,
  currency: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  try {
    const response = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        amount,
        currency,
        returnUrl,
        cancelUrl
      })
    });
    
    if (!response.ok) {
      throw new Error("PayPal payment initiation failed");
    }
    
    return await response.json();
  } catch (error: any) {
    console.error("PayPal payment error:", error);
    return { success: false, error: error.message };
  }
}

// Create order in database
export async function createOrder(
  items: Array<{
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    includeRooting?: boolean;
  }>,
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  },
  shippingMethod: string,
  shippingCost: number,
  rootingCost: number = 0,
  customerId?: string,
  promoCode?: string,
  promoDiscountZar: number = 0
): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  try {
    // Route through secure edge function that recomputes prices server-side
    // to prevent client-side price tampering.
    const { data, error } = await supabase.functions.invoke("create-order", {
      body: {
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          includeRooting: i.includeRooting,
        })),
        shippingAddress,
        shippingMethod,
        shippingCost,
        rootingCost,
        promoCode,
      },
    });

    if (error) throw new Error(error.message || "Order creation failed");
    if (!data?.success) throw new Error(data?.error || "Order creation failed");

    return { success: true, orderId: data.orderId, orderNumber: data.orderNumber };
  } catch (error: any) {
    console.error("Create order error:", error);
    return { success: false, error: error.message };
  }
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(
  orderId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "order_confirmation",
        orderId,
        email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send confirmation email");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
}

// Send rooting ready notification email
export async function sendRootingReadyEmail(
  orderId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "rooting_ready",
        orderId,
        email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send rooting ready email");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Rooting ready email error:", error);
    return { success: false, error: error.message };
  }
}
