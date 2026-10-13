import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { menuItems as defaultMenuItems } from '../data/products';

const STORAGE_KEY_PRODUCTS = 'latte_products_catalog_v1';
const STORAGE_KEY_HERO = 'latte_hero_config_v1';
const STORAGE_KEY_CATEGORIES = 'latte_categories_v1';
const STORAGE_KEY_CUSTOMIZER = 'latte_customizer_options_v2';

export const defaultInitialCategories = [
  { id: 'latte', label: 'Lattes Signatures', desc: 'Nos recettes signatures onctueuses et créatives' },
  { id: 'espresso', label: 'Espresso Bar', desc: 'Cafés de terroir pur arabica et extractions de précision' },
  { id: 'cold', label: 'Iced & Cold Brew', desc: 'Fraîcheur intense, cold brew infusé 18h et thés glacés' },
  { id: 'pastry', label: 'Pâtisseries & Brunch', desc: 'Boulangerie artisanale pur beurre et assiettes gourmandes' }
];

export const defaultInitialSizes = [
  { id: 'petit', key: 'petit', label: 'Petit', extra: 0, active: true },
  { id: 'moyen', key: 'moyen', label: 'Moyen', extra: 0, active: true },
  { id: 'grand', key: 'grand', label: 'Grand', extra: 4, active: true }
];

export const defaultInitialMilks = [
  { id: 'whole', name: 'Lait', extra: 0, active: true },
  { id: 'oat', name: 'Avoine', extra: 5, active: true },
  { id: 'almond', name: 'Amande', extra: 5, active: true }
];

export const defaultInitialTemps = [
  { id: 'hot', title: 'Chaud', shortLabel: 'Chaud', active: true },
  { id: 'cold', title: 'Froid', shortLabel: 'Froid', active: true }
];

export const STUDIO_IMAGES = [
  { id: 'moment', label: 'Produit du Moment (Berry/Unicorn)', url: '/assets/images/produit_du_moment.jpg' },
  { id: 'swan', label: 'Swan Latte Studio', url: '/assets/images/swan_latte_studio.jpg' },
  { id: 'pistachio', label: 'Latte Pistache Studio', url: '/assets/images/pistachio_latte_studio.jpg' },
  { id: 'caramel', label: 'Caramel & Sel de Guérande Studio', url: '/assets/images/caramel_latte_studio.jpg' },
  { id: 'hero_latte', label: 'Hero Espresso & Latte Classic', url: '/assets/images/hero_latte.jpg' },
  { id: 'iced', label: 'Iced Drinks & Cold Brew', url: '/assets/images/iced_drinks.jpg' },
  { id: 'pastries', label: 'Pâtisseries & Brunch Artisanal', url: '/assets/images/pastries.jpg' },
  { id: 'ambiance', label: 'Ambiance Coffee Shop', url: '/assets/images/ambiance.jpg' },
];

const defaultInitialProducts = defaultMenuItems.map((item, idx) => ({
  ...item,
  inStock: true,
  // By default, swan, pistache, caramel are featured on homepage
  isFeaturedOnHome: ['latte-swan', 'latte-pistache', 'latte-vanilla-bourbon'].includes(item.id),
  order: idx
}));

const defaultHeroConfig = {
  productId: 'latte-unicorn',
  badgeText: 'Du 15 au 30 août',
  title: 'La légende est de retour',
  ctaText: 'En savoir plus'
};

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load categories from localStorage, using defaults', e);
    }
    return defaultInitialCategories;
  });

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load products from localStorage, using defaults', e);
    }
    return defaultInitialProducts;
  });

  const [heroConfig, setHeroConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HERO);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load hero config from localStorage, using defaults', e);
    }
    return defaultHeroConfig;
  });

  // Customizer options (Sizes, Milks, Temps)
  const [customizerOptions, setCustomizerOptions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOMIZER);
      if (saved) {
        const parsed = JSON.parse(saved);
        let milks = parsed.milks || defaultInitialMilks;
        if (Array.isArray(milks) && milks.length === 6 && (milks[0]?.name === 'Lait Entier' || milks[0]?.id === 'whole')) {
          milks = defaultInitialMilks;
        }
        return {
          sizes: parsed.sizes || defaultInitialSizes,
          milks: milks,
          temps: parsed.temps || defaultInitialTemps
        };
      }
    } catch (e) {
      console.warn('Failed to load customizer options, using defaults', e);
    }
    return {
      sizes: defaultInitialSizes,
      milks: defaultInitialMilks,
      temps: defaultInitialTemps
    };
  });

  // Save categories to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories to localStorage', e);
    }
  }, [categories]);

  // Save products to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage', e);
    }
  }, [products]);

  // Save heroConfig to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HERO, JSON.stringify(heroConfig));
    } catch (e) {
      console.error('Error saving hero config to localStorage', e);
    }
  }, [heroConfig]);

  // Save customizerOptions to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOMIZER, JSON.stringify(customizerOptions));
    } catch (e) {
      console.error('Error saving customizer options to localStorage', e);
    }
  }, [customizerOptions]);

  // Get active hero product object
  const heroProduct = useMemo(() => {
    const found = products.find((p) => p.id === heroConfig.productId);
    return found || products[0] || defaultMenuItems[0];
  }, [products, heroConfig.productId]);

  // Get products featured on homepage
  const featuredHomeProducts = useMemo(() => {
    const featured = products.filter((p) => p.isFeaturedOnHome && p.id !== heroConfig.productId);
    if (featured.length === 0) {
      // Fallback to first 3 products not hero
      return products.filter((p) => p.id !== heroConfig.productId).slice(0, 3);
    }
    return featured;
  }, [products, heroConfig.productId]);

  // Add a new product
  const addProduct = (newProduct) => {
    const id = newProduct.id || `product-${Date.now()}`;
    const productToAdd = {
      ...newProduct,
      id,
      inStock: newProduct.inStock ?? true,
      isFeaturedOnHome: newProduct.isFeaturedOnHome ?? false,
      price: Number(newProduct.price) || 0,
      notes: Array.isArray(newProduct.notes) ? newProduct.notes : (newProduct.notes ? newProduct.notes.split(',').map(s => s.trim()).filter(Boolean) : []),
      order: products.length
    };
    setProducts((prev) => [productToAdd, ...prev]);
    return productToAdd;
  };

  // Update existing product
  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const formatted = {
            ...item,
            ...updatedFields,
            price: updatedFields.price !== undefined ? Number(updatedFields.price) : item.price,
            notes: updatedFields.notes !== undefined
              ? (Array.isArray(updatedFields.notes) ? updatedFields.notes : (typeof updatedFields.notes === 'string' ? updatedFields.notes.split(',').map(s => s.trim()).filter(Boolean) : item.notes))
              : item.notes
          };
          return formatted;
        }
        return item;
      })
    );
  };

  // Delete product
  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    // If deleted product was hero, fallback to first available
    if (heroConfig.productId === id) {
      const remaining = products.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setHeroConfig((prev) => ({ ...prev, productId: remaining[0].id }));
      }
    }
  };

  // Toggle inStock
  const toggleStock = (id) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, inStock: !item.inStock } : item
      )
    );
  };

  // Toggle isFeaturedOnHome
  const toggleFeaturedHome = (id) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFeaturedOnHome: !item.isFeaturedOnHome } : item
      )
    );
  };

  // Set Hero Product
  const setHeroProduct = (productId) => {
    setHeroConfig((prev) => ({ ...prev, productId }));
  };

  // Update entire Hero Config
  const updateHeroConfig = (newConfig) => {
    setHeroConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Category CRUD
  const addCategory = (newCat) => {
    const id = newCat.id || newCat.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
    const categoryToAdd = {
      id,
      label: newCat.label || 'Nouvelle Catégorie',
      desc: newCat.desc || ''
    };
    setCategories((prev) => [...prev, categoryToAdd]);
    return categoryToAdd;
  };

  const updateCategory = (id, updatedFields) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Customizer Milk Options CRUD
  const addCustomizerMilk = (newMilk) => {
    const id = newMilk.id || `milk-${Date.now()}`;
    const milkToAdd = {
      id,
      name: newMilk.name || 'Nouveau Lait',
      extra: Number(newMilk.extra) || 0,
      active: newMilk.active ?? true
    };
    setCustomizerOptions((prev) => ({
      ...prev,
      milks: [...prev.milks, milkToAdd]
    }));
    return milkToAdd;
  };

  const updateCustomizerMilk = (id, updatedFields) => {
    setCustomizerOptions((prev) => ({
      ...prev,
      milks: prev.milks.map((m) =>
        m.id === id ? { ...m, ...updatedFields, extra: updatedFields.extra !== undefined ? Number(updatedFields.extra) : m.extra } : m
      )
    }));
  };

  const deleteCustomizerMilk = (id) => {
    setCustomizerOptions((prev) => ({
      ...prev,
      milks: prev.milks.filter((m) => m.id !== id)
    }));
  };

  const toggleCustomizerMilk = (id) => {
    setCustomizerOptions((prev) => ({
      ...prev,
      milks: prev.milks.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    }));
  };

  // Customizer Size Options CRUD
  const updateCustomizerSize = (key, updatedFields) => {
    setCustomizerOptions((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) =>
        s.key === key ? { ...s, ...updatedFields, extra: updatedFields.extra !== undefined ? Number(updatedFields.extra) : s.extra } : s
      )
    }));
  };

  // Reset to original default data
  const resetToDefaults = () => {
    setProducts(defaultInitialProducts);
    setHeroConfig(defaultHeroConfig);
    setCategories(defaultInitialCategories);
    setCustomizerOptions({
      sizes: defaultInitialSizes,
      milks: defaultInitialMilks,
      temps: defaultInitialTemps
    });
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_HERO);
    localStorage.removeItem(STORAGE_KEY_CATEGORIES);
    localStorage.removeItem(STORAGE_KEY_CUSTOMIZER);
  };

  return (
    <ProductContext.Provider
      value={{
        categories,
        products,
        heroConfig,
        heroProduct,
        featuredHomeProducts,
        studioImages: STUDIO_IMAGES,
        customizerSizes: customizerOptions.sizes,
        customizerMilks: customizerOptions.milks,
        customizerTemps: customizerOptions.temps,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStock,
        toggleFeaturedHome,
        setHeroProduct,
        updateHeroConfig,
        addCustomizerMilk,
        updateCustomizerMilk,
        deleteCustomizerMilk,
        toggleCustomizerMilk,
        updateCustomizerSize,
        resetToDefaults
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
