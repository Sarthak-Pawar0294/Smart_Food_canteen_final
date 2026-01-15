import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { menuItems } from '../data/menuData';
import { Plus, Search, Filter } from 'lucide-react';

export default function Menu() {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get unique categories from menu items
  const categories = useMemo(() => {
    const cats = ["All", ...new Set(menuItems.map(item => item.category))];
    return cats;
  }, []);

  // Filter Logic
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Search & Filter Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search for food (e.g. Samosa, Burger)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {selectedCategory === "All" ? "Full Menu" : selectedCategory}
          <span className="text-sm font-normal text-slate-500 ml-2">({filteredItems.length} items)</span>
        </h1>
        
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No items found</h3>
            <p className="text-slate-500">Try changing your search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-slate-100">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-slate-900 shadow-sm">
                    {item.category}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <span className="text-lg font-bold text-slate-900">₹{item.price}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 font-medium active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
