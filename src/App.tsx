import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/Navigation';

// Pages
import Login from './pages/Login';
import Menu from './pages/Menu';
import Payment from './pages/Payment';
import OwnerDashboard from './pages/OwnerDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <Router>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
              
              {/* Top Navigation Bar */}
              <Navigation />
              
              {/* Page Content */}
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  {/* Default Route: Redirect to Menu */}
                  <Route path="/" element={<Navigate to="/menu" replace />} />
                  
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Student Routes */}
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/payment" element={<Payment />} />
                  
                  {/* Owner Routes */}
                  <Route path="/dashboard" element={<OwnerDashboard />} />
                  
                  {/* Fallback Route: Redirect unknown URLs to Menu */}
                  <Route path="*" element={<Navigate to="/menu" replace />} />
                </Routes>
              </main>
              
            </div>
          </Router>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
