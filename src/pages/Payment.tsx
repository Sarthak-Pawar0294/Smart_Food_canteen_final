import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
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
    if (onPaymentComplete) {
      onPaymentComplete();
    } else {
      // Navigate to order history after successful payment
      navigate('/orders');
    }
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

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Select Payment Method</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition text-left ${
                  selectedMethod === method.id
                    ? 'border-slate-900 bg-slate-50 dark:border-blue-500 dark:bg-slate-700'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div className={`p-3 rounded-full shrink-0 ${
                  selectedMethod === method.id 
                    ? 'bg-slate-900 text-white dark:bg-blue-600' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${selectedMethod === method.id ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                    {method.name}
                  </p>
                  <p className={`text-sm ${selectedMethod === method.id ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {method.description}
                  </p>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleConfirmPayment}
          disabled={!selectedMethod}
          className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg"
        >
          {selectedMethod === 'CASH' ? 'Place Order' : 'Pay & Order'}
        </button>

        <p className="text-center text-slate-500 dark:text-slate-500 text-sm mt-4">
          {selectedMethod === 'CASH'
            ? 'You will pay at the canteen counter when collecting your order'
            : 'Secure encrypted payment processing'}
        </p>
      </div>
    </div>
  );
}
