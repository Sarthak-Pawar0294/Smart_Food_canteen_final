import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart } from 'lucide-react';

interface CheckoutProps {
  onProceedToPayment: () => void;
}

export default function Checkout({ onProceedToPayment }: CheckoutProps) {
  const { cart, getTotalPrice } = useCart();
  const { user } = useAuth();

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Please Login</h2>
          <p className="text-slate-600">You need to be logged in to checkout</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-slate-600">Add items to your cart before checkout</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

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
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Pickup Information</h2>
          <div className="space-y-3 text-slate-600">
            <p>
              <span className="font-medium">Name:</span> {user?.full_name || user?.email.split('@')[0]}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p>
              <span className="font-medium">Pickup Location:</span> College Canteen
            </p>
            <p>
              <span className="font-medium">Estimated Time:</span> 15-20 minutes
            </p>
          </div>
        </div>

        <button
          onClick={onProceedToPayment}
          className="w-full bg-slate-900 text-white py-4 rounded-lg font-medium hover:bg-slate-800 transition"
        >
          Proceed to Payment
        </button>

        <p className="text-center text-slate-500 text-sm mt-4">
          You will select a payment method in the next step
        </p>
      </div>
    </div>
  );
}
