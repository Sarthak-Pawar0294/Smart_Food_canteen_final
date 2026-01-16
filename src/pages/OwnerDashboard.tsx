import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { Clock, CheckCircle, Package, Utensils, RefreshCw, AlertCircle } from 'lucide-react';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ revenue: 0, pending: 0, total: 0 });

  const fetchOrders = async () => {
    try {
      const result = await api.getAllOrders();
      if (result.success && result.orders) {
        setOrders(result.orders);
        calculateStats(result.orders);
        setError('');
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderList: Order[]) => {
    const today = new Date().toDateString();
    const todaysOrders = orderList.filter(o => new Date(o.created_at).toDateString() === today);
    
    setStats({
      revenue: todaysOrders.reduce((sum, order) => sum + order.total, 0),
      pending: orderList.filter(o => o.status === 'pending').length,
      total: todaysOrders.length
    });
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const result = await api.updateOrderStatus(orderId, newStatus);
    if (result.success) {
      fetchOrders(); // Refresh list
    }
  };

  // Poll for new orders every 5 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!user || user.role !== 'OWNER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p>This page is restricted to Canteen Owners.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kitchen Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage orders and track live status</p>
          </div>
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue (Today)</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{stats.revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending Orders</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Today's Orders</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
          </div>

          {loading && orders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">No active orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                          {order.id.slice(0, 8)}...
                        </span>
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {/* Parse JSON if needed, assuming API returns parsed JSON now or we parse it here */}
                          {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item: any, i: number) => (
                            <div key={i} className="text-sm text-slate-700 dark:text-slate-300">
                              <span className="font-medium text-slate-900 dark:text-white">{item.quantity}x</span> {item.name}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        ₹{order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${order.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : ''}
                          ${order.status === 'accepted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : ''}
                          ${order.status === 'ready' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : ''}
                          ${order.status === 'completed' ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' : ''}
                        `}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(order.id, 'accepted')}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
                            >
                              Accept
                            </button>
                          )}
                          {order.status === 'accepted' && (
                            <button
                              onClick={() => updateStatus(order.id, 'ready')}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition"
                            >
                              Ready
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => updateStatus(order.id, 'completed')}
                              className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition"
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
          )}
        </div>
      </div>
    </div>
  );
}
