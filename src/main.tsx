import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx'; // Import

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ThemeProvider> {/* Add Provider */}
          <App />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);
