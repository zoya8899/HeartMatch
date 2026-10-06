import { ProductItem } from '../types';

export interface CheckoutOptions {
  userId: string;
  userEmail: string;
  productId: string;
  planTitle?: string;
  price?: number;
  type?: 'subscription' | 'consumable';
  promoCode?: string;
}

export interface CheckoutResult {
  sessionId: string;
  invoiceId: string;
  url: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  currency: string;
  status: string;
  productId: string;
  planTitle: string;
  simulatedSuccess: boolean;
}

export interface StripePaymentHistoryItem {
  id: string;
  sessionId: string;
  invoiceId: string;
  userId: string;
  userEmail: string;
  productId: string;
  productTitle: string;
  amount: number;
  discountAmount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'refunded' | 'refund_requested';
  paymentMethod: {
    brand: string;
    last4: string;
  };
  type: 'subscription' | 'consumable';
  createdAt: string;
}

export interface StripeInvoiceData {
  invoiceNumber: string;
  date: string;
  status: string;
  currency: string;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    description: string;
    unitPrice: number;
    quantity: number;
    discount: number;
    total: number;
  }>;
  summary: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
  paymentMethod: {
    brand: string;
    last4: string;
  };
  issuer: {
    company: string;
    address: string;
    taxId: string;
    supportEmail: string;
  };
}

export const stripeService = {
  async fetchProducts(): Promise<ProductItem[]> {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return data.products;
    } catch (e) {
      console.warn('Fallback fetching products from seed:', e);
      return [];
    }
  },

  async updateProduct(id: string, updates: Partial<ProductItem>): Promise<ProductItem> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': 'zoyakhokhar001@gmail.com',
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update product price in backend');
    const data = await res.json();
    return data.product;
  },

  async createCheckoutSession(options: CheckoutOptions): Promise<CheckoutResult> {
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    if (!res.ok) throw new Error('Failed to create payment checkout session');
    return await res.json();
  },

  async verifyPayment(params: {
    sessionId: string;
    userId: string;
    userEmail?: string;
    productId: string;
    cardBrand?: string;
    cardLast4?: string;
    promoCode?: string;
    simulateFailure?: boolean;
  }) {
    const res = await fetch('/api/stripe/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Payment declined' }));
      throw new Error(err.error || 'Payment failed');
    }
    return await res.json();
  },

  async cancelSubscription(userId: string, reason?: string) {
    const res = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason }),
    });
    if (!res.ok) throw new Error('Failed to cancel subscription');
    return await res.json();
  },

  async requestRefund(paymentId: string, reason: string) {
    const res = await fetch('/api/stripe/request-refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, reason }),
    });
    if (!res.ok) throw new Error('Failed to submit refund request');
    return await res.json();
  },

  async fetchPaymentHistory(userId: string): Promise<StripePaymentHistoryItem[]> {
    const res = await fetch(`/api/stripe/payment-history/${userId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.history || [];
  },

  async fetchInvoice(invoiceId: string): Promise<StripeInvoiceData> {
    const res = await fetch(`/api/stripe/invoice/${invoiceId}`);
    if (!res.ok) throw new Error('Invoice not found');
    return await res.json();
  },

  async triggerWebhook(eventType: string, data: any) {
    const res = await fetch('/api/stripe/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventType, data }),
    });
    return await res.json();
  },
};

