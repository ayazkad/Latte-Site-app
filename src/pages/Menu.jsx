import React, { useState } from 'react';
import { Search, X, Plus, Check } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { ProductCard } from '../components/ProductCard';

export const Menu = () => {
  const { addToCart } = useCart();
  const { products, categories } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemModal, setActiveItemModal] = useState(null);

  const categoryTabs = [
    { id: 'all', label: 'Tout' },
    ...categories
  ];

  const getFilteredItemsForCategory = (catId) => {
    return products.filter((item) => {
      if (item.category !== catId) return false;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(item.notes) && item.notes.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesSearch;
    });
  };

  const activeCategories = categories.filter((cat) => {
    if (selectedCategory !== 'all' && selectedCategory !== cat.id) return false;
    return true;
  });

  const totalMatchingItems = activeCategories.reduce((acc, cat) => {
    return acc + getFilteredItemsForCategory(cat.id).length;
  }, 0);

  return (
    <div className="menu-page">
      {/* Header */}
      <header className="page-header">
        <div className="container">
          <h1 className="page-title">Nos Créations & Spécialités</h1>
          <p className="page-desc">
            Chaque recette est élaborée avec nos cafés de terroir et ingrédients d'exception soigneusement choisis.
          </p>
        </div>
      </header>

      {/* Menu Section */}
      <section className="menu-section">
        <div className="container">
          {/* Centered Modern Search Bar */}
          <div className="menu-search-wrapper">
            <div className="menu-search-bar">
              <Search size={18} className="menu-search-icon" />
              <input
                type="text"
                placeholder="Rechercher un café, une création..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="menu-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="menu-search-clear"
                  aria-label="Effacer la recherche"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Categories Tabs */}
          <div className="menu-categories">
            {categoryTabs.map((cat) => (
              <button
                key={cat.id}
                className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Categorized Sections */}
          {totalMatchingItems === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <h3>Aucun produit ne correspond à votre recherche</h3>
              <p style={{ marginTop: '0.5rem' }}>Essayez un autre mot-clé ou réinitialisez les filtres.</p>
            </div>
          ) : (
            activeCategories.map((cat) => {
              const catItems = getFilteredItemsForCategory(cat.id);
              if (catItems.length === 0) return null;

              return (
                <div className="menu-category-section" key={cat.id} id={`cat-${cat.id}`}>
                  <div className="menu-category-header">
                    <div className="menu-category-title-group">
                      <h2 className="menu-category-title">
                        <span>{cat.label}</span>
                      </h2>
                      <span className="menu-category-count">
                        {catItems.length} {catItems.length > 1 ? 'créations' : 'création'}
                      </span>
                    </div>
                    <span className="menu-category-desc">{cat.desc}</span>
                  </div>

                  <div className="menu-grid">
                    {catItems.map((item) => (
                      <ProductCard
                        key={item.id}
                        product={item}
                        layoutPrefix="menu"
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

