import { User, Order, CartItem, PaymentMethod, PaymentStatus, Receipt } from '../types';

// FIX: Use relative path so it works on both Localhost (via Vite proxy) AND Production (Railway)
const API_URL = '/api';

export const api = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Login API Error:", error);
      return { success: false, error: 'Network error. Please try again.' };
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          items,
          total,
          paymentMethod: paymentMethod || 'CASH',
          paymentStatus: paymentStatus || 'CASH'
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Failed to create order. Please try again.' };
    }
  },

  async getOrders(userId: string): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/orders/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch orders. Please try again.' };
    }
  },

  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_URL}/healthz`);
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'API is not reachable' };
    }
  },

  async getAllOrders(ownerEmail: string): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/orders/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-email': ownerEmail,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Failed to fetch orders. Please try again.' };
    }
  },

  async updateOrderStatus(orderId: string, status: 'ACCEPTED' | 'READY' | 'COMPLETED', ownerEmail: string): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-email': ownerEmail,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Failed to update order status. Please try again.' };
    }
  },

  async cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },
};
