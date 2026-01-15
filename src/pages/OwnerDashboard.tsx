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
  Copy,
  XCircle,
  TrendingUp,
  ShoppingBag,
  Calendar
} from "lucide-react";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Stats State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingCount: 0,
    todayCount: 0
  });

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
        calculateStats(cleaned);
      } else {
        setError(result.error || "Failed to load orders");
      }

      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  const calculateStats = (data: Order[]) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const revenue = data
      .filter(o => o.status !== 'CANCELLED' && o.status !== 'pending') // Only count accepted/completed money
      .reduce((acc, curr) => acc + (parseFloat(String(curr.total)) || 0), 0);

    const pending = data.filter(o => o.status === 'pending').length;

    const today = data.filter(o => {
      if (!o.created_at) return false;
      return o.created_at.startsWith(todayStr);
    }).length;

    setStats({
      totalRevenue: revenue,
      pendingCount: pending,
      todayCount: today
    });
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: "ACCEPTED" | "READY" | "COMPLETED"
  ) => {
    if (!user) return;
    setUpdatingId(orderId);
    const result = await api.updateOrderStatus(orderId, newStatus, user.email);

    if (result.success && result.order) {
      const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      setOrders(updatedOrders);
      calculateStats(updatedOrders);
    } else {
      setError(result.error || "Failed to update order");
    }
    setUpdatingId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Order ID copied: " + text);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700 border border-green-300";
      case "READY": return "bg-blue-100 text-blue-700 border border-blue-300";
      case "ACCEPTED": return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "pending": return "bg-gray-100 text-gray-700 border border-gray-300";
      case "CANCELLED": return "bg-red-100 text-red-700 border border-red-300";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <Check className="w-5 h-5" />;
      case "READY": return <Package className="w-5 h-5" />;
      case "ACCEPTED": return <Clock className="w-5 h-5" />;
      case "CANCELLED": return <XCircle className="w-5 h-5" />;
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
        <p className="text-slate-600 mb-8">Manage all student orders</p>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-medium">Total Revenue</h3>
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">₹{stats.totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-slate-400 mt-1">Processed orders only</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-medium">Pending Orders</h3>
              <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.pendingCount}</p>
            <p className="text-sm text-slate-400 mt-1">Needs attention</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-medium
