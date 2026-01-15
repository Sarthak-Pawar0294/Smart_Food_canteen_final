import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderHistory from './pages/OrderHistory';
import OwnerDashboard from './pages/OwnerDashboard';
import Navigation from './components/Navigation';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('menu');

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setCurrentPage('menu')} />;
  }

  if (currentPage === 'owner' && user?.role !== 'OWNER') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">Only the canteen owner can access this page</p>
          <button
            onClick={() => setCurrentPage('menu')}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            Go to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} isOwner={user?.role === 'OWNER'} />
      {currentPage === 'menu' && <Menu />}
      {currentPage === 'cart' && <Cart onCheckout={() => setCurrentPage('checkout')} />}
      {currentPage === 'checkout' && <Checkout onProceedToPayment={() => setCurrentPage('payment')} />}
      {currentPage === 'payment' && (
        <Payment
          onPaymentComplete={() => setCurrentPage('orders')}
          onBack={() => setCurrentPage('checkout')}
        />
      )}
      {currentPage === 'orders' && <OrderHistory />}
      {currentPage === 'owner' && <OwnerDashboard />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
