export interface User {
  id: string;
  email: string;
  role: 'OWNER' | 'STUDENT';
  full_name?: string | null;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type PaymentMethod = 'PHONEPE' | 'GPAY' | 'UPI' | 'CASH';
export type PaymentStatus = 'PAID' | 'CASH' | 'PENDING';

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: string;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  created_at: string;
  payment_time?: string;
  valid_till_time?: string;
  payment_data?: any;
}

export interface Receipt {
  studentName: string;
  studentEmail: string;
  orderId: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'SUCCESS' | 'PENDING';
  paymentTime: string;
  validTillTime: string;
  isExpired?: boolean;
  orderStatus?: string;
}
