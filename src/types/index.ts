export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'STUDENT' | 'OWNER';
  // Points removed
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[] | string;
  total: number;
  status: 'pending' | 'ACCEPTED' | 'READY' | 'COMPLETED' | 'CANCELLED';
  payment_method: string;
  payment_status: string;
  payment_time: string;
  valid_till_time: string;
  payment_data: any;
  created_at: string;
}

export type PaymentMethod = 'UPI' | 'CASH' | 'GPAY' | 'PHONEPE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Receipt {
  studentName: string;
  studentEmail: string;
  orderId: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTime: string;
  validTillTime: string;
  orderStatus: string;
}
