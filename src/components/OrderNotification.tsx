import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, ChefHat, Bell } from 'lucide-react';

export default function OrderNotification() {
  const { user } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [message, setMessage] = useState('');
  
  // We use a ref to track the previous status without triggering re-renders
  const lastStatusRef = useRef<string>('');

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') return;

    const checkStatus = async () => {
      try {
        // 1. Fetch the latest orders for this student
        // Note: Using the relative path /api so it works on deployment too
        const response = await fetch(`/api/orders/${user.id}`);
        const data = await response.json();

        if (data.success && data.orders.length > 0) {
          // Get the most recent order (assuming ID sorts chronologically or latest is first)
          // If your backend sorts desc, take index 0. If asc, take last.
          // Let's sort by ID to be safe
          const latestOrder = data.orders.sort((a: any, b: any) => b.id - a.id)[0];
          
          const currentStatus = latestOrder.status;

          // 2. Compare with the last known status
          if (lastStatusRef.current && lastStatusRef.current !== currentStatus) {
            // STATUS CHANGED! Trigger Notification
            triggerNotification(currentStatus);
          }

          // Update ref for next check
          lastStatusRef.current = currentStatus;
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    };

    // 3. Set up the Polling Loop (Every 3 seconds)
    const intervalId = setInterval(checkStatus, 3000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [user]);

  const triggerNotification = (newStatus: string) => {
    let msg = '';
    switch (newStatus) {
      case 'ACCEPTED':
        msg = 'Your order has been ACCEPTED by the kitchen!';
        break;
      case 'READY':
        msg = 'Your order is READY! Please pick it up.';
        break;
      case 'COMPLETED':
        msg = 'Order Completed. Thank you for dining with us!';
        break;
      default:
        return; // Don't notify for other statuses
    }

    setStatus(newStatus);
    setMessage(msg);
    setShowToast(true);

    // Hide after 5 seconds
    setTimeout(() => setShowToast(false), 5000);
  };

  if (!showToast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce-in">
      <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-slate-700">
        <div className="bg-green-500 p-2 rounded-full">
            {status === 'READY' ? <Bell className="w-6 h-6 text-white" /> : <ChefHat className="w-6 h-6 text-white" />}
        </div>
        <div>
          <h4 className="font-bold text-lg">Status Update</h4>
          <p className="text-slate-300 text-sm">{message}</p>
        </div>
        <button 
          onClick={() => setShowToast(false)}
          className="ml-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
