import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Order } from "../types";
import {
  Check,
  Clock,
  Package,
  Loader,
  AlertCircle,
  CreditCard,
  Banknote,
} from "lucide-react";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fix: Safe JSON parser to prevent dashboard crashes
  const safeJSON = (data: any) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const result = await api.getAllOrders(user.email);

      if (result.success && result.orders) {
        const cleaned = result.orders.map((o) => ({
          ...o,
          items: safeJSON(o.items) || [],
          payment_data: safeJSON(o.payment_data) || {},
        }));

        setOrders(cleaned);
      } else {
        setError(result.error || "Failed to load orders");
      }

      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: "ACCEPTED" | "READY" | "COMPLETED"
  ) => {
    if (!user) return;
    setUpdatingId(orderId);
    const result = await api.updateOrderStatus(orderId, newStatus, user.email);

    if (result.success && result.order) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } else {
      setError(result.error || "Failed to update order");
    }
    setUpdatingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700 border border-green-300";
      case "READY": return "bg-blue-100 text-blue-700 border border-blue-300";
      case "ACCEPTED": return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "pending": return "bg-gray-100 text-gray-700 border border-gray-300";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <Check className="w-5 h-5" />;
      case "READY": return <Package className="w-5 h-5" />;
      case "ACCEPTED": return <Clock className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatLocalTime = (timestamp: string) => {
    if (!timestamp) return "N/A";
    const dt = new Date(timestamp);
    return dt.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case "PHONEPE": return "PhonePe";
      case "GPAY": return "Google Pay";
      case "UPI": return "UPI";
      case "CASH": return "Cash";
      default: return method || "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-1">Owner Dashboard</h1>
        <p className="text-slate-600 mb-6">Manage all student orders</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-4">{order.id}</td>
                    <td className="px-4 py-4">
                      <div>{order.payment_data?.studentName}</div>
                      <div className="text-xs text-slate-500">{order.payment_data?.studentEmail}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {Array.isArray(order.items) && order.items.map((it: any, idx: number) => (
                        <div key={idx}>{it.name} x {it.quantity}</div>
                      ))}
                    </td>
                    <td className="px-4 py-4 font-semibold">
                      ₹{parseFloat(String(order.total)).toFixed(2)}
                      <div className="text-xs font-normal text-slate-500 mt-1">
                        {getPaymentMethodLabel(order.payment_method)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </td>
                    <td className="px-4 py-4">{formatLocalTime(order.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, "ACCEPTED")}
                            disabled={updatingId === order.id}
                            className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium"
                          >
                            Accept
                          </button>
                        )}
                        {order.status === "ACCEPTED" && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, "READY")}
                            disabled={updatingId === order.id}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                          >
                            Ready
                          </button>
                        )}
                        {order.status === "READY" && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                            disabled={updatingId === order.id}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
