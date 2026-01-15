import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Order } from "../types";
import {
  Check, Clock, Package, Loader, AlertCircle, CreditCard,
  Banknote, Copy, XCircle, TrendingUp, Calendar, Download
} from "lucide-react";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      .filter(o => o.status !== 'CANCELLED' && o.status !== 'pending')
      .reduce((acc, curr) => acc + (parseFloat(String(curr.total)) || 0), 0);
    const pending = data.filter(o => o.status === 'pending').length;
    const today = data.filter(o => {
      if (!o.created_at) return false;
      return o.created_at.startsWith(todayStr);
    }).length;
    setStats({ totalRevenue: revenue, pendingCount: pending, todayCount: today });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: any) => {
    if (!user) return;
    setUpdatingId(orderId);
    const result = await api.updateOrderStatus(orderId, newStatus, user.email);
    if (result.success && result.order) {
      const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      setOrders(updatedOrders);
      calculateStats(updatedOrders);
    }
    setUpdatingId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const downloadCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Order ID", "Student Name", "Items", "Total", "Status", "Date"];
    const rows = orders.map(order => [
      order.id,
      order.payment_data?.studentName || "Unknown",
      Array.isArray(order.items) ? order.items.map((i: any) => `${i.name} (${i.quantity})`).join(" | ") : "",
      order.total,
      order.status,
      new Date(order.created_at).toLocaleDateString()
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "canteen_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "READY": return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "ACCEPTED": return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "CANCELLED": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader className="animate-spin dark:text-white" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header with Export Button */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold mb-1 dark:text-white">Owner Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400">Manage all student orders</p>
            </div>
            <button 
                onClick={downloadCSV}
                className="flex items-center gap-2 bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
            >
                <Download className="w-4 h-4" />
                Export CSV
            </button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium">Total Revenue</h3>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400"><TrendingUp className="w-6 h-6" /></div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">₹{stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium">Pending Orders</h3>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400"><Clock className="w-6 h-6" /></div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.pendingCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium">Today's Orders</h3>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400"><Calendar className="w-6 h-6" /></div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.todayCount}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 shadow rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-800 border-b dark:border-slate-700">
                <tr>
                  {["Order ID", "Student", "Items", "Total", "Status", "Time", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-4">
                       <div className="flex items-center gap-1 group cursor-pointer" onClick={() => copyToClipboard(order.id)}>
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 dark:text-slate-300">{order.id.slice(0, 8)}...</span>
                        <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{order.payment_data?.studentName}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {Array.isArray(order.items) && order.items.map((it: any, idx: number) => (
                        <div key={idx}>{it.name} x{it.quantity}</div>
                      ))}
                    </td>
                    <td className="px-4 py-4 font-semibold dark:text-white">₹{parseFloat(String(order.total)).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit text-sm ${getStatusColor(order.status)}`}>
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {order.status === "pending" && <button onClick={() => handleStatusUpdate(order.id, "ACCEPTED")} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">Accept</button>}
                        {order.status === "ACCEPTED" && <button onClick={() => handleStatusUpdate(order.id, "READY")} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">Ready</button>}
                        {order.status === "READY" && <button onClick={() => handleStatusUpdate(order.id, "COMPLETED")} className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">Complete</button>}
                        {order.status === "CANCELLED" && <span className="text-red-500 text-sm flex items-center gap-1"><XCircle className="w-4 h-4" /> Cancelled</span>}
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
