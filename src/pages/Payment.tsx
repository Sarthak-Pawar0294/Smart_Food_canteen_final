import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PaymentMethod, Receipt as ReceiptType, CartItem } from '../types';
import { CheckCircle, CreditCard, Smartphone, Wallet, Banknote, ShoppingCart } from 'lucide-react';
import Receipt from '../components/Receipt';

interface PaymentProps {
  onPaymentComplete: () => void;
  onBack: () => void;
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
      setError('Your cart is empty. Please add items before placing an order.');
      return;
    }

    if (total <= 0) {
      setError('Invalid order total. Please check your cart.');
      return;
    }

    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setProcessing(true);
    setError('');
    setOrderItems([...cart]);

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
      clearCart();
      setReceipt(result.receipt);
    } else if (result.success && result.order) {
      clearCart();
      const paymentTime = new Date().toISOString();
      const validTillTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      
      const fallbackReceipt: ReceiptType = {
        studentName: user.full_name || 'Student',
        studentEmail: user.email,
        orderId: result.order.id,
        items: orderItems,
        totalAmount: parseFloat(total.toFixed(2)),
        paymentMethod: selectedMethod,
        paymentStatus: paymentStatus === 'PAID' ? 'SUCCESS' : 'PENDING',
        paymentTime: paymentTime,
        validTillTime: validTillTime,
      };
      setReceipt(fallbackReceipt);
    } else {
      setError(result.error || 'Failed to place order');
    }

    setProcessing(false);
  };

  const handleReceiptClose = () => {
    setReceipt(null);
    onPaymentComplete();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Please Login</h2>
          <p className="text-slate-600">You need to be logged in to make a payment</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !receipt && !processing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-slate-600 mb-4">Add items to your cart before making a payment</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (receipt) {
    return <Receipt receipt={receipt} onClose={handleReceiptClose} />;
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full mx-auto"></div>
            <div className="w-20 h-20 border-4 border-slate-900 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-2">
            {selectedMethod === 'CASH' ? 'Placing Order...' : 'Processing Payment...'}
          </h2>
          <p className="text-slate-600">Please wait while we confirm your order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Payment</h1>
          <button
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 transition"
          >
            Back to Checkout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-slate-700">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-900 pt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Select Payment Method</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                  selectedMethod === method.id
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-3 rounded-full ${
                  selectedMethod === method.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {method.icon}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-slate-900">{method.name}</p>
                  <p className="text-sm text-slate-500">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleConfirmPayment}
          disabled={!selectedMethod}
          className="w-full bg-slate-900 text-white py-4 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {selectedMethod === 'CASH' ? 'Confirm Order' : 'Confirm Payment'}
        </button>

        <p className="text-center text-slate-500 text-sm mt-4">
          {selectedMethod === 'CASH'
            ? 'You will pay at the canteen when collecting your order'
            : 'This is a demo payment. No actual payment will be processed.'}
        </p>
      </div>
    </div>
  );
}
