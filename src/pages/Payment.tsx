import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PaymentMethod, Receipt as ReceiptType, CartItem } from '../types';
import { CheckCircle, CreditCard, Smartphone, Wallet, Banknote, ShoppingCart, Loader2 } from 'lucide-react';
import Receipt from '../components/Receipt';

interface PaymentProps {
  onPaymentComplete?: () => void;
  onBack?: () => void;
}

const paymentMethods: { id: PaymentMethod; name: string; icon: React.ReactNode; description: string }[] = [
  { id: 'PHONEPE', name: 'PhonePe', icon: <Smartphone className="w-6 h-6" />, description: 'Pay using PhonePe (Demo)' },
  { id: 'GPAY', name: 'Google Pay', icon: <Wallet className="w-6 h-6" />, description: 'Pay using Google Pay (Demo)' },
  { id: 'UPI', name: 'UPI', icon: <CreditCard className="w-6 h-6" />, description: 'Pay using any UPI app (Demo)' },
  { id: 'CASH', name: 'Cash at Canteen', icon: <Banknote className="w-6 h-6" />, description: 'Pay when you collect your order' },
];

export default function Payment({ onPaymentComplete, onBack }: PaymentProps) {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<ReceiptType | null>(null);
  
  // Snapshot of items for the receipt
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleConfirmPayment = async () => {
    if (!user) {
      setError('Please login to place an order');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setProcessing(true);
    setError('');
    
    // Save items for receipt display
    const currentItems = [...cart];
    setOrderItems(currentItems);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000));

    const paymentStatus = selectedMethod === 'CASH' ? 'CASH' : 'PAID';

    const result = await api.createOrder(
      user.id,
      cart,
      parseFloat(total.toFixed(2)),
      selectedMethod,
      paymentStatus
    );

    if (result.success && result.receipt) {
      setReceipt(result.receipt);
    } else if (result.success && result.order) {
      // Fallback receipt generation if backend doesn't send one
      const paymentTime = new Date().toISOString();
      const validTillTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      
      const fallbackReceipt: ReceiptType = {
        studentName: user.full_name || 'Student',
        studentEmail: user.email,
        orderId: result.order.id,
        items: currentItems,
        totalAmount: parseFloat(total.toFixed(2)),
        paymentMethod: selectedMethod,
        paymentStatus: paymentStatus === 'PAID' ? 'SUCCESS' : 'PENDING',
        paymentTime: paymentTime,
        validTillTime: validTillTime,
        orderStatus: result.order.status
      };
      setReceipt(fallbackReceipt);
    } else {
      setError(result.error || 'Failed to place order');
    }

    setProcessing(false);
  };

  const handleReceiptClose = () => {
    clearCart();
    setReceipt(null);
    if (onPaymentComplete) onPaymentComplete();
    // Redirect to menu if needed, or handle in parent
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Please Login</h2>
          <p className="text-slate-600 dark:text-slate-400">You need to be logged in to make a payment</p>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (cart.length === 0 && !receipt && !processing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Cart is Empty</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Add items before making a payment</p>
          <a
            href="/menu"
            className="px-6 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition"
          >
            Go to Menu
          </a>
        </div>
      </div>
    );
  }

  // Receipt View
  if (receipt) {
    return <Receipt receipt={receipt} onClose={handleReceiptClose} />;
  }

  // Processing View
  if (processing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
             <div className="flex justify-center mb-4">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-2">
            {selectedMethod === 'CASH' ? 'Confirming Order...' : 'Processing Payment...'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">Please wait while we secure your order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Checkout</h1>
          {onBack && (
            <button
              onClick={onBack}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              Back
            </button>
          )}
        </div>

        <div className="bg-white dark:
