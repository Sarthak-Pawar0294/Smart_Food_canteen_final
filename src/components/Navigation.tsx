import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Home, ShoppingCart, History, LogOut, Settings, LucideIcon } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOwner?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export default function Navigation({ currentPage, onNavigate, isOwner }: NavigationProps) {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const getDisplayName = () => {
    if (isOwner) return 'Canteen Owner';
    if (user?.full_name) return user.full_name;
    return 'Student';
  };

  const baseNavItems: NavItem[] = [
    { id: 'menu', label: 'Menu', icon: Home },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: getTotalItems() },
    { id: 'orders', label: 'Orders', icon: History },
  ];

  const ownerOnlyItems: NavItem[] = [
    { id: 'owner', label: 'Dashboard', icon: Settings },
  ];

  const navItems: NavItem[] = isOwner ? [...baseNavItems, ...ownerOnlyItems] : baseNavItems;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-slate-900">Smart Food Canteen</h1>
            <div className="hidden md:flex gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition relative ${
                    currentPage === item.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-900">
                {getDisplayName()}
              </p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        <div className="md:hidden flex gap-2 pb-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition relative ${
                currentPage === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
