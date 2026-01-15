import { Receipt as ReceiptType, CartItem } from '../types';
import { CheckCircle, Clock, CreditCard, Smartphone, Wallet, Banknote, ArrowLeft } from 'lucide-react';
import vitLogo from '../assets/vit-logo.png';

interface ReceiptProps {
  receipt: ReceiptType;
  onClose: () => void;
}

export default function Receipt({ receipt, onClose }: ReceiptProps) {
  
  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const checkIfExpired = () => {
    if (receipt.orderStatus?.toLowerCase() === 'completed') {
      return true;
    }
    const validTillTime = new Date(receipt.validTillTime);
    const currentTime = new Date();
    return currentTime > validTillTime;
  };

  const isExpired =
    receipt.isExpired !== undefined ? receipt.isExpired : checkIfExpired();

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'PHONEPE': return 'PhonePe';
      case 'GPAY': return 'Google Pay';
      case 'UPI': return 'UPI';
      case 'CASH': return 'Cash at Canteen';
      default: return method || 'N/A';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'PHONEPE': return <Smartphone className="w-5 h-5" />;
      case 'GPAY': return <Wallet className="w-5 h-5" />;
      case 'UPI': return <CreditCard className="w-5 h-5" />;
      case 'CASH': return <Banknote className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">

        {/* Back Button calls onClose */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 flex items-center gap-1 text-slate-600 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <div
          className={`relative pt-12 pb-6 px-6 rounded-t-2xl text-white text-center relative overflow-hidden ${
            isExpired
              ? 'bg-gradient-to-br from-red-600 to-red-800'
              : 'bg-gradient-to-br from-blue-600 to-blue-800'
          }`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_0%,transparent_50%)]"></div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <div className="animate-pulse-logo">
                <img
                  src={vitLogo}
                  alt="Vishwakarma Institutes"
                  className="w-24 h-24 object-contain rounded-lg drop-shadow-lg"
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-1">Payment Receipt</h2>
            <p className={`text-sm ${isExpired ? 'text-red-100' : 'text-blue-100'}`}>
              Vishwakarma Institutes Canteen
            </p>

            {isExpired && (
              <p className="text-red-200 text-xs font-semibold mt-2">
                ⚠️ RECEIPT EXPIRED
              </p>
            )}
          </div>
        </div>

        <div className={`p-6 space-y-6 ${isExpired ? 'relative z-10' : ''}`}>
          <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-3 rounded-lg">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">
              {receipt.paymentStatus === 'SUCCESS'
                ? 'Payment Successful'
                : 'Order Placed'}
            </span>
          </div>

          {/* Student details */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-sm">Student Name</span>
              <span className="font-medium text-slate-900 text-right">
                {receipt.studentName}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-sm">Email</span>
              <span className="font-medium text-slate-900 text-right text-sm">
                {receipt.studentEmail}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-sm">Order ID</span>
              <span className="font-mono text-sm text-slate-900 bg-slate-100 px-2 py-1 rounded break-all">
                {receipt.orderId}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-b border-slate-200 py-4 space-y-3">
            <h3 className="font-semibold text-slate-900">Order Items</h3>
            {receipt.items.map((item: CartItem, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {item.name} x {item.quantity}
                </span>
                <span className="font-medium text-slate-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-dashed border-slate-200">
              <span className="font-semibold text-slate-900">Total Amount</span>
              <span className="font-bold text-lg text-slate-900">
                ₹{receipt.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Payment Method</span>
              <div className="flex items-center gap-2 text-slate-900">
                {getPaymentMethodIcon(receipt.paymentMethod)}
                <span className="font-medium">
                  {getPaymentMethodLabel(receipt.paymentMethod)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Payment Time</span>
              <span className="font-medium text-slate-900 text-sm">
                {formatDateTime(receipt.paymentTime)}
              </span>
            </div>

            {!isExpired && (
              <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Valid Till</span>
                </div>
                <span className="font-semibold text-amber-700 text-sm">
                  {formatDateTime(receipt.validTillTime)}
                </span>
              </div>
            )}
          </div>

          {/* Done Button calls onClose */}
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition"
          >
            Done
          </button>

          <p className="text-center text-slate-400 text-xs">
            Thank you for ordering from Vishwakarma Institutes Canteen!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse-logo {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        .animate-pulse-logo {
          animation: pulse-logo 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
