import { useState } from 'react';
import { menuItems } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { Plus, ShoppingCart } from 'lucide-react';

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart, getTotalItems } = useCart();
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(menuItems.map((item) => item.category)))];

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddToCart = (item: typeof menuItems[0]) => {
    addToCart(item);
    setAddedItem(item.id);
    setTimeout(() => setAddedItem(null), 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Menu</h1>
            <p className="text-slate-600 mt-1">Choose your favorite dishes</p>
          </div>
          {getTotalItems() > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">{getTotalItems()} items</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.category}</p>
                  </div>
                  <span className="text-lg font-bold text-slate-900">₹{item.price}</span>
                </div>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                <button
                  onClick={() => handleAddToCart(item)}
                  className={`w-full py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    addedItem === item.id
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {addedItem === item.id ? 'Added!' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
