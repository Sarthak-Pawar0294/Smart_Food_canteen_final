import { User, Order, CartItem, PaymentMethod, PaymentStatus, Receipt } from '../types';

const API_URL = '/api';

// Helper to handle responses
async function handleResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return await response.json();
  }
  // If not JSON (e.g., 500 HTML error), throw text
  const text = await response.text();
  throw new Error(`Server Error (${response.status}): ${text.slice(0, 100)}`);
}

export const api = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      return await handleResponse(response);
    } catch (error: any) {
      console.error("Login Error:", error);
      return { success: false, error: error.message || 'Connection failed' };
    }
  },

  async createOrder(
    userId: string,
    items: CartItem[],
    total: number,
    paymentMethod?: PaymentMethod,
    paymentStatus?: PaymentStatus
  ): Promise<{ success: boolean; order?: Order; receipt?: Receipt; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, items, total,
          paymentMethod: paymentMethod || 'CASH',
          paymentStatus: paymentStatus || 'CASH'
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to create order.' };
    }
  },

  async getOrders(userId: string): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/orders/${userId}`);
      return await handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch orders.' };
    }
  },

  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_URL}/healthz`);
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'API unreachable' };
    }
  },

  async getAllOrders(ownerEmail: string): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/orders/all`, {
        headers: { 'x-owner-email': ownerEmail },
      });
      return await handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch orders.' };
    }
  },

  async updateOrderStatus(orderId: string, status: string, ownerEmail: string): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-email': ownerEmail,
        },
        body: JSON.stringify({ status }),
      });
      return await handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to update order.' };
    }
  },

  async cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
      });
      return await handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to cancel order.' };
    }
  },
};
