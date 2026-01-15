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

  // ------------------------------
  // FETCH ALL ORDERS
  // ------------------------------
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const result = await api.getAllOrders(user.email);

      if (result.success && result.orders) {
        // FIX: Ensure items & payment_data get parsed
        const cleaned = result.orders.map((o) => ({
          ...o,
          items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
          payment_data:
            typeof o.payment_data === "string"
              ? JSON.parse(o.payment_data)
              : o.payment_data,
        }));

        setOrders(cleaned);
      } else {
        setError(result.error || "Failed to load orders");
      }

      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  // ------------------------------
  // UPDATE ORDER STATUS
  // ------------------------------
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

  // ------------------------------
  // COLORS & ICONS
  // ------------------------------
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700 border border-green-300";
      case "READY":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "ACCEPTED":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "pending":
        return "bg-gray-100 text-gray-700 border border-gray-300";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Check className="w-5 h-5" />;
      case "READY":
        return <Package className="w-5 h-5" />;
      case "ACCEPTED":
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";
      case "CASH":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case "PHONEPE":
        return "PhonePe";
      case "GPAY":
        return "Google Pay";
      case "UPI":
        return "UPI";
      case "CASH":
        return "Cash";
      default:
        return method || "N/A";
    }
  };

  // ------------------------------
  // TIME FIX (IST)
  // ------------------------------
  const formatLocalTime = (timestamp: string) => {
    if (!timestamp) return "N/A";

    const dt = new Date(timestamp.replace(" ", "T"));
    return dt.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ------------------------------
  // COUNTERS
  // ------------------------------
  const getPendingCount = () => orders.filter((o) => o.status === "pending").length;
  const getAcceptedCount = () => orders.filter((o) => o.status === "ACCEPTED").length;
  const getReadyCount = () => orders.filter((o) => o.status === "READY").length;
  const getCompletedCount = () => orders.filter((o) => o.status === "COMPLETED").length;

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

        {/* Stats Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-slate-600 font-medium">Pending</p>
            <p className="text-3xl font-bold">{getPendingCount()}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-slate-600 font-medium">Accepted</p>
            <p className="text-3xl font-bold text-yellow-600">{getAcceptedCount()}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-slate-600 font-medium">Ready</p>
            <p className="text-3xl font-bold text-blue-600">{getReadyCount()}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-slate-600 font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600">{getCompletedCount()}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-4">{order.id}</td>
                    <td className="px-4 py-4">{order.payment_data?.studentName}</td>
                    <td className="px-4 py-4">{order.payment_data?.studentEmail}</td>

                    <td className="px-4 py-4 text-sm">
                      {order.items?.map((it, idx) => (
                        <div key={idx}>
                          {it.name} x {it.quantity}
                        </div>
                      ))}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      ₹{parseFloat(String(order.total)).toFixed(2)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col text-xs">
                        <div className="flex items-center gap-1">
                          {order.payment_method === "CASH" ? (
                            <Banknote className="w-3 h-3" />
                          ) : (
                            <CreditCard className="w-3 h-3" />
                          )}
                          {getPaymentMethodLabel(order.payment_method)}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded mt-1 w-fit ${getPaymentStatusColor(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status === "PAID"
                            ? "Paid"
                            : order.payment_status}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getStatusColor(
                          order.status
                        )}`}
                      >
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
                            className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                          >
                            {updatingId === order.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              "Accept"
                            )}
                          </button>
                        )}

                        {order.status === "ACCEPTED" && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, "READY")}
                            disabled={updatingId === order.id}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            {updatingId === order.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              "Ready"
                            )}
                          </button>
                        )}

                        {order.status === "READY" && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                            disabled={updatingId === order.id}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            {updatingId === order.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              "Done"
                            )}
                          </button>
                        )}

                        {order.status === "COMPLETED" && (
                          <span className="text-slate-500 text-sm">Done</span>
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