import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Sparkles,
  LayoutGrid,
  List,
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Check,
  X,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertCircle,
  Flame,
  Snowflake,
  Coffee,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Image as ImageIcon,
  Sliders,
  DollarSign,
  FolderTree,
  Upload
} from 'lucide-react';
import { useProducts, STUDIO_IMAGES } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';
import { CalendarRangePicker, isPeriodExpired } from '../components/CalendarRangePicker';
import '../styles/admin.css';

const EMPTY_PRODUCT_FORM = {
  name: '',
  category: 'latte',
  tag: 'Signature',
  price: 45,
  calories: '200 kcal',
  description: '',
  notes: ['Signature', 'Fait Maison'],
  image: '/assets/images/produit_du_moment.jpg',
  allowHot: true,
  allowCold: true,
  allowSize: true,
  allowMilk: true,
  inStock: true,
  isFeaturedOnHome: false
};

const SizePriceInput = ({ size, onUpdate, addToast }) => {
  const [val, setVal] = useState(size.extra ?? 0);
  const isDirty = Number(val) !== Number(size.extra ?? 0);

  useEffect(() => {
    setVal(size.extra ?? 0);
  }, [size.extra]);

  const handleInputChange = (e) => {
    let raw = e.target.value;
    // Strip leading zeros if followed by digits (e.g. '05' -> '5', '050' -> '50')
    if (raw.length > 1 && raw.startsWith('0')) {
      raw = raw.replace(/^0+(?=\d)/, '');
    }
    setVal(raw);
  };

  const handleCommit = () => {
    const num = Math.max(0, Number(val) || 0);
    if (num !== (size.extra ?? 0)) {
      onUpdate(size.key, { extra: num });
      addToast(`Supplément taille "${size.label}" mis à jour (${num} DH)`, 'success');
    }
    setVal(num);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="number"
          min="0"
          className="admin-input"
          style={{ maxWidth: '105px' }}
          value={val}
          onChange={handleInputChange}
          onFocus={(e) => e.target.select()}
          onClick={(e) => {
            if (e.target.value === '0') e.target.select();
          }}
          onBlur={handleCommit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.target.blur();
            }
          }}
        />
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>DH</span>
      </div>
      {isDirty && (
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          style={{
            marginLeft: 'auto',
            padding: '0.4rem 0.8rem',
            fontSize: '0.82rem',
            height: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 2px 6px rgba(107, 30, 43, 0.25)'
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommit();
          }}
        >
          <Check size={14} /> Valider
        </button>
      )}
    </div>
  );
};

const AdminModalOverlay = ({ onClose, children }) => {
  const isBackdropMouseDown = useRef(false);

  return (
    <div
      className="admin-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          isBackdropMouseDown.current = true;
        } else {
          isBackdropMouseDown.current = false;
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && isBackdropMouseDown.current) {
          onClose();
        }
        isBackdropMouseDown.current = false;
      }}
    >
      {children}
    </div>
  );
};

export const AdminDashboard = () => {
  const {
    categories,
    products,
    heroConfig,
    heroProduct,
    featuredHomeProducts,
    studioImages,
    customizerSizes,
    customizerMilks,
    customizerTemps,
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
  } = useProducts();

  const { addToast } = useToast();

  // Navigation tab: 'overview' | 'landing' | 'products' | 'categories'
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'overview';
  const activeTab = rawTab === 'customizer' ? 'categories' : rawTab;
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Filters & Search for products tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  const TAB_ORDER = ['overview', 'landing', 'products', 'categories'];

  // Direct page slide transition state
  const [displayState, setDisplayState] = useState({
    current: activeTab,
    outgoing: null,
    direction: 'slide-left',
    isAnimating: false
  });

  const prevActiveTabRef = useRef(activeTab);
  const stageRef = useRef(null);

  useEffect(() => {
    if (activeTab === prevActiveTabRef.current) return;

    // Scroll page back to top when switching tabs
    window.scrollTo({ top: 0, behavior: 'instant' });

    const prevIdx = TAB_ORDER.indexOf(prevActiveTabRef.current);
    const currIdx = TAB_ORDER.indexOf(activeTab);
    const direction = currIdx >= prevIdx ? 'slide-left' : 'slide-right';
    const outgoingTab = prevActiveTabRef.current;

    prevActiveTabRef.current = activeTab;

    setDisplayState({
      current: activeTab,
      outgoing: outgoingTab,
      direction,
      isAnimating: true
    });

    const timer = setTimeout(() => {
      setDisplayState((prev) => ({
        ...prev,
        outgoing: null,
        isAnimating: false
      }));
    }, 380);

    return () => clearTimeout(timer);
  }, [activeTab]);

  // Dynamically animate stage height during tab transitions to prevent abrupt layout jumps
  useEffect(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current;

    if (displayState.isAnimating) {
      const incomingEl = stage.querySelector('.admin-tab-direct-panel.incoming');
      if (incomingEl && incomingEl.offsetHeight > 0) {
        stage.style.height = `${incomingEl.offsetHeight}px`;
      }
    } else {
      stage.style.height = 'auto';
    }
  }, [displayState, products.length, categories.length, viewMode, searchQuery]);

  // Modals state: Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PRODUCT_FORM);
  const [newTagInput, setNewTagInput] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);
  const fileInputRef = useRef(null);

  // Modals state: Category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ id: '', label: '', desc: '' });
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Modals state: Milk Option
  const [isMilkModalOpen, setIsMilkModalOpen] = useState(false);
  const [editingMilk, setEditingMilk] = useState(null);
  const [milkFormData, setMilkFormData] = useState({ name: '', extra: 0, active: true });
  const [milkToDelete, setMilkToDelete] = useState(null);

  // Reset confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const isAnyModalOpen =
    isModalOpen || !!productToDelete || isResetConfirmOpen || isCategoryModalOpen || !!categoryToDelete || isMilkModalOpen || !!milkToDelete;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
    } else {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
    };
  }, [isAnyModalOpen]);

  // Hero config edit local state
  const [heroForm, setHeroForm] = useState({
    badgeText: heroConfig.badgeText,
    startDate: heroConfig.startDate,
    endDate: heroConfig.endDate,
    title: heroConfig.title,
    ctaText: heroConfig.ctaText || 'En savoir plus'
  });
  const [heroSaved, setHeroSaved] = useState(false);

  useEffect(() => {
    setHeroForm({
      badgeText: heroConfig.badgeText,
      startDate: heroConfig.startDate,
      endDate: heroConfig.endDate,
      title: heroConfig.title,
      ctaText: heroConfig.ctaText || 'En savoir plus'
    });
  }, [heroConfig]);

  const allCategoriesFilter = useMemo(() => {
    return [{ id: 'all', label: 'Toutes les catégories' }, ...categories];
  }, [categories]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = products.length;
    const inStockCount = products.filter((p) => p.inStock).length;
    const outOfStockCount = total - inStockCount;
    const featuredCount = products.filter((p) => p.isFeaturedOnHome).length;
    const categoriesCount = {};
    categories.forEach((cat) => {
      categoriesCount[cat.id] = products.filter((p) => p.category === cat.id).length;
    });
    return {
      total,
      inStockCount,
      outOfStockCount,
      featuredCount,
      categoriesCount
    };
  }, [products, categories]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tag?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;

      let matchesStock = true;
      if (selectedStockFilter === 'instock') matchesStock = p.inStock;
      if (selectedStockFilter === 'outofstock') matchesStock = !p.inStock;
      if (selectedStockFilter === 'featured') matchesStock = p.isFeaturedOnHome || p.id === heroConfig.productId;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, selectedStockFilter, heroConfig.productId]);

  // Handlers for Add / Edit Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData(EMPTY_PRODUCT_FORM);
    setNewTagInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    const isPastry = (product.category || 'latte') === 'pastry';
    const isCold = (product.category || 'latte') === 'cold';
    const isEspresso = (product.category || 'latte') === 'espresso';

    let initAllowHot = product.allowHot;
    let initAllowCold = product.allowCold;
    if (initAllowHot === undefined && initAllowCold === undefined) {
      if (product.temperatureOption === 'hot' || isEspresso) {
        initAllowHot = true;
        initAllowCold = false;
      } else if (product.temperatureOption === 'cold' || isCold) {
        initAllowHot = false;
        initAllowCold = true;
      } else if (product.temperatureOption === 'none' || isPastry) {
        initAllowHot = false;
        initAllowCold = false;
      } else {
        initAllowHot = true;
        initAllowCold = true;
      }
    }

    setFormData({
      name: product.name,
      category: product.category || 'latte',
      tag: product.tag || 'Signature',
      price: product.price,
      calories: product.calories || '180 kcal',
      description: product.description || '',
      notes: Array.isArray(product.notes) ? [...product.notes] : [],
      image: product.image || studioImages[0].url,
      allowHot: initAllowHot ?? true,
      allowCold: initAllowCold ?? true,
      allowSize: product.allowSize ?? (!isPastry),
      allowMilk: product.allowMilk ?? (!isPastry),
      inStock: product.inStock ?? true,
      isFeaturedOnHome: product.isFeaturedOnHome ?? false
    });
    setNewTagInput('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Veuillez entrer un nom pour le produit.', 'error');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      addToast(`Produit "${formData.name}" mis à jour avec succès !`, 'success');
    } else {
      addProduct(formData);
      addToast(`Nouveau produit "${formData.name}" créé avec succès !`, 'success');
    }
    handleCloseModal();
  };

  const handleDuplicateProduct = (product) => {
    const duplicated = {
      ...product,
      name: `${product.name} (Copie)`,
      id: `copy-${Date.now()}`
    };
    addProduct(duplicated);
    addToast(`Produit "${product.name}" dupliqué !`, 'success');
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      addToast(`Produit "${productToDelete.name}" supprimé.`, 'info');
      setProductToDelete(null);
    }
  };

  const handleAddNote = () => {
    if (newTagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        notes: [...prev.notes, newTagInput.trim()]
      }));
      setNewTagInput('');
    }
  };

  const handleRemoveNote = (idxToRemove) => {
    setFormData((prev) => ({
      ...prev,
      notes: prev.notes.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Veuillez sélectionner un fichier image valide (PNG, JPEG, WebP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = file.type === 'image/png'
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', 0.88);

        setFormData((prev) => ({ ...prev, image: dataUrl }));
        addToast(`Photo "${file.name}" importée avec succès !`, 'success');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveHeroForm = (e) => {
    e.preventDefault();
    updateHeroConfig(heroForm);
    setHeroSaved(true);
    addToast("Modifications de la page d'accueil enregistrées !", 'success');
    setTimeout(() => {
      setHeroSaved(false);
    }, 4000);
  };

  // Category Handlers
  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        id: category.id,
        label: category.label,
        desc: category.desc || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        id: '',
        label: '',
        desc: ''
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategoryFormSubmit = (e) => {
    e.preventDefault();
    if (!categoryFormData.label.trim()) {
      addToast('Veuillez entrer un nom pour la catégorie.', 'error');
      return;
    }
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryFormData);
      addToast(`Catégorie "${categoryFormData.label}" mise à jour avec succès !`, 'success');
    } else {
      addCategory(categoryFormData);
      addToast(`Nouvelle catégorie "${categoryFormData.label}" créée avec succès !`, 'success');
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      addToast(`Catégorie "${categoryToDelete.label}" supprimée.`, 'info');
      setCategoryToDelete(null);
    }
  };

  // Milk Handlers
  const handleOpenMilkModal = (milk = null) => {
    if (milk) {
      setEditingMilk(milk);
      setMilkFormData({ name: milk.name, extra: milk.extra || 0, active: milk.active !== false });
    } else {
      setEditingMilk(null);
      setMilkFormData({ name: '', extra: 0, active: true });
    }
    setIsMilkModalOpen(true);
  };

  const handleMilkFormSubmit = (e) => {
    e.preventDefault();
    if (!milkFormData.name.trim()) {
      addToast('Veuillez entrer un nom pour le lait.', 'error');
      return;
    }
    if (editingMilk) {
      updateCustomizerMilk(editingMilk.id, milkFormData);
      addToast(`Option de lait "${milkFormData.name}" mise à jour avec succès !`, 'success');
    } else {
      addCustomizerMilk(milkFormData);
      addToast(`Option de lait "${milkFormData.name}" créée avec succès !`, 'success');
    }
    setIsMilkModalOpen(false);
    setEditingMilk(null);
  };

  const handleConfirmDeleteMilk = () => {
    if (milkToDelete) {
      deleteCustomizerMilk(milkToDelete.id);
      addToast(`Option de lait "${milkToDelete.name}" supprimée.`, 'info');
      setMilkToDelete(null);
    }
  };

  const handleConfirmReset = () => {
    resetToDefaults();
    setIsResetConfirmOpen(false);
    addToast('Catalogue, catégories et configuration réinitialisés.', 'info');
  };

  const renderTabContent = (tabKey) => {
    if (tabKey === 'overview') {
      return (
        <div>
          {/* KPI Cards */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="admin-kpi-icon">
                  <Package size={24} />
                </div>
                <div>
                  <div className="admin-kpi-label">Total Produits</div>
                  <div className="admin-kpi-value">{stats.total}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon green">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="admin-kpi-label">En Stock</div>
                  <div className="admin-kpi-value">{stats.inStockCount}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon red">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div className="admin-kpi-label">En Rupture</div>
                  <div className="admin-kpi-value">{stats.outOfStockCount}</div>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-icon gold">
                  <Star size={24} />
                </div>
                <div>
                  <div className="admin-kpi-label">Sur la Landing Page</div>
                  <div className="admin-kpi-value">{featuredHomeProducts.length + 1}</div>
                </div>
              </div>
            </div>

            {/* Quick Hero Banner Focus & Quick Actions */}
            <div className="hero-config-grid">
              <div className="admin-card" style={{ marginBottom: 0 }}>
                <div className="admin-card-header">
                  <div>
                    <h2>Produit du Moment (Hero Banner)</h2>
                    <p>Ce produit est affiché en tête d'affiche sur la page d'accueil.</p>
                  </div>
                  <button
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => setActiveTab('landing')}
                  >
                    <span>Modifier</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>

                <div className="hero-live-preview">
                  <span className="hero-preview-badge-label">Aperçu Accueil</span>
                  <div className="hero-preview-content">
                    <img
                      src={heroProduct.image}
                      alt={heroProduct.name}
                      className="hero-preview-image"
                    />
                    <div className="hero-preview-info">
                      <div className="hero-preview-date">
                        {heroConfig.badgeText}
                        {isPeriodExpired(heroConfig.badgeText, heroConfig.endDate) && (
                          <span style={{ marginLeft: '6px', fontSize: '0.72rem', opacity: 0.85, color: '#ffcdd2', fontWeight: 600 }}>
                            (Expirée • Masquée sur l'accueil)
                          </span>
                        )}
                      </div>
                      <div className="hero-preview-title">{heroConfig.title}</div>
                      <div className="hero-preview-prodname">
                        {heroProduct.name} — {heroProduct.price} DH
                      </div>
                      <div className="hero-preview-btn">{heroConfig.ctaText || 'En savoir plus'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown & Quick Actions */}
              <div className="admin-card" style={{ marginBottom: 0 }}>
                <div className="admin-card-header">
                  <h2>Répartition & Raccourcis</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.65rem 0.85rem',
                        background: 'var(--brand-cream)',
                        borderRadius: '10px'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        {cat.label}
                      </span>
                      <span className="admin-badge">
                        {stats.categoriesCount[cat.id] || 0} {(stats.categoriesCount[cat.id] || 0) > 1 ? 'produits' : 'produit'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="admin-quick-links-grid" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    className="admin-btn admin-btn-primary"
                    style={{ flex: 1 }}
                    onClick={handleOpenAddModal}
                  >
                    <Plus size={16} />
                    <span>Créer un Produit</span>
                  </button>
                  <button
                    className="admin-btn admin-btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setActiveTab('categories')}
                  >
                    <FolderTree size={16} />
                    <span>Gérer Catégories</span>
                  </button>
                </div>
              </div>
            </div>
        </div>
      );
    }
    if (tabKey === 'landing') {
      return (
        <div>
            {/* Section 1: Hero Banner Configurator */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Configuration de la Bannière Hero (Produit du Moment)</h2>
                  <p>
                    Personnalisez le produit vedette au sommet de la page d'accueil ainsi que ses textes d'accroche.
                  </p>
                </div>
              </div>

              <div className="hero-config-grid">
                {/* Form Controls for Hero */}
                <form onSubmit={handleSaveHeroForm}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Sélectionner le Produit du Moment</label>
                    <select
                      className="admin-select"
                      value={heroConfig.productId}
                      onChange={(e) => {
                        setHeroProduct(e.target.value);
                        addToast('Produit du moment mis à jour !', 'success');
                      }}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.price} DH)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span>
                        Période de Disponibilité / Date Hero <span style={{ fontWeight: 400, opacity: 0.7 }}>(Sélectionnez la période sur le calendrier)</span>
                      </span>
                      {isPeriodExpired(heroForm.badgeText, heroForm.endDate) && (
                        <span
                          style={{
                            padding: '0.2rem 0.65rem',
                            borderRadius: '999px',
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          Période expirée (bannière masquée sur le site)
                        </span>
                      )}
                    </label>
                    <CalendarRangePicker
                      value={heroForm.badgeText}
                      onChange={(newDateString, dates) =>
                        setHeroForm({
                          ...heroForm,
                          badgeText: newDateString,
                          startDate: dates?.startDate,
                          endDate: dates?.endDate
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Grand Titre d'accroche <span>(ex: "La légende est de retour")</span>
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={heroForm.title}
                      onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                      placeholder="La légende est de retour"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Texte du Bouton</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={heroForm.ctaText}
                      onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                      placeholder="En savoir plus"
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <button type="submit" className="admin-btn admin-btn-primary">
                      <Check size={16} />
                      <span>Sauvegarder</span>
                    </button>

                    {heroSaved && (
                      <div
                        className="admin-badge success"
                        style={{
                          padding: '0.5rem 0.9rem',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          borderRadius: '8px',
                          border: '1px solid #c8e6c9',
                          backgroundColor: '#e8f5e9',
                          color: '#2e7d32',
                          fontWeight: 700
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Enregistré avec succès !</span>
                      </div>
                    )}
                  </div>
                </form>

                {/* Live Preview */}
                <div>
                  <div className="admin-form-label" style={{ marginBottom: '0.5rem' }}>
                    Aperçu en Direct sur la Page d'Accueil :
                  </div>
                  <div className="hero-live-preview">
                    <span className="hero-preview-badge-label">
                      {isPeriodExpired(heroForm.badgeText, heroForm.endDate)
                        ? "Bannière masquée sur l'accueil"
                        : "Live Preview"}
                    </span>
                    <div className="hero-preview-content">
                      <img
                        src={heroProduct.image}
                        alt={heroProduct.name}
                        className="hero-preview-image"
                      />
                      <div className="hero-preview-info">
                        <div className="hero-preview-date">
                          {heroForm.badgeText}
                          {isPeriodExpired(heroForm.badgeText, heroForm.endDate) && (
                            <span style={{ marginLeft: '6px', fontSize: '0.7rem', opacity: 0.85, color: '#ffcdd2', fontWeight: 600 }}>
                              (Expirée • Bannière masquée sur l'accueil)
                            </span>
                          )}
                        </div>
                        <div className="hero-preview-title">{heroForm.title}</div>
                        <div className="hero-preview-prodname">
                          {heroProduct.name} • {heroProduct.price} DH
                        </div>
                        <p
                          style={{
                            fontSize: '0.8rem',
                            color: '#ffd8de',
                            marginBottom: '0.8rem',
                            lineHeight: 1.4
                          }}
                        >
                          {heroProduct.description}
                        </p>
                        <div className="hero-preview-btn">{heroForm.ctaText}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: "Incontournables de Saison" Selector */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Les Incontournables de Saison (Grille Landing Page)</h2>
                  <p>
                    Sélectionnez les boissons et douceurs mises en avant dans la grille principale de la page d'accueil (3 à 6 recommandés).
                  </p>
                </div>
                <div className="admin-badge">
                  {featuredHomeProducts.length} produit{featuredHomeProducts.length > 1 ? 's' : ''} sélectionné{featuredHomeProducts.length > 1 ? 's' : ''}
                </div>
              </div>

              <div className="featured-selector-grid">
                {products.map((item) => {
                  const isHero = item.id === heroConfig.productId;
                  const isFeatured = item.isFeaturedOnHome && !isHero;

                  return (
                    <div
                      key={item.id}
                      className={`featured-selector-card ${isFeatured ? 'active' : ''} ${isHero ? 'is-hero' : ''}`}
                    >
                      <img src={item.image} alt={item.name} className="featured-card-thumb" />
                      <div className="featured-card-details">
                        <div className="featured-card-title" title={item.name}>
                          {item.name}
                        </div>
                        <div className="featured-card-meta">
                          <span>{item.price} DH</span>
                          <span>•</span>
                          <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
                        </div>
                        {isHero ? (
                          <span className="admin-badge hero-tag" style={{ marginTop: '0.4rem', display: 'inline-flex' }}>
                            Produit du Moment (Hero)
                          </span>
                        ) : (
                          <div style={{ marginTop: '0.5rem' }}>
                            <label className="switch-label-wrapper">
                              <label className="admin-switch">
                                <input
                                  type="checkbox"
                                  checked={item.isFeaturedOnHome || false}
                                  onChange={() => {
                                    toggleFeaturedHome(item.id);
                                    addToast(
                                      item.isFeaturedOnHome
                                        ? `"${item.name}" retiré des Incontournables.`
                                        : `"${item.name}" ajouté aux Incontournables de l'Accueil !`,
                                      'info'
                                    );
                                  }}
                                />
                                <span className="admin-slider"></span>
                              </label>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                                {item.isFeaturedOnHome ? 'En vedette' : 'Non affiché'}
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
        </div>
      );
    }
    if (tabKey === 'products') {
      return (
        <div>
            {/* Toolbar / Search & Filters */}
            <div className="admin-toolbar">
              <div className="admin-search-wrap">
                <Search size={16} className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Rechercher un produit, ingrédient, tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-search-input"
                />
              </div>

              <div className="admin-filter-group">
                {/* Category filters */}
                {allCategoriesFilter.map((cat) => (
                  <button
                    key={cat.id}
                    className={`admin-filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}

                {/* Stock filter */}
                <select
                  className="admin-select"
                  style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: '50px' }}
                  value={selectedStockFilter}
                  onChange={(e) => setSelectedStockFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="instock">En stock uniquement</option>
                  <option value="outofstock">En rupture uniquement</option>
                  <option value="featured">Sur l'Accueil uniquement</option>
                </select>

                {/* View toggle */}
                <div className="admin-view-toggle">
                  <button
                    className={`admin-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Vue Tableau"
                  >
                    <List size={16} />
                  </button>
                  <button
                    className={`admin-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Vue Cartes"
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count & Actions */}
            <div
              className="admin-products-count-bar"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}
            >
              <span>
                Affichage de <strong>{filteredProducts.length}</strong> sur {products.length} produits
              </span>
              <button
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={handleOpenAddModal}
              >
                <Plus size={14} />
                <span>Ajouter un Produit</span>
              </button>
            </div>

            {/* TABLE VIEW */}
            {viewMode === 'table' ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Catégorie</th>
                      <th>Prix</th>
                      <th>Disponibilité</th>
                      <th>Sur l'Accueil</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          Aucun produit ne correspond à vos filtres.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isHero = p.id === heroConfig.productId;

                        return (
                          <tr
                            key={p.id}
                            className="admin-clickable-row"
                            onClick={() => handleOpenEditModal(p)}
                            style={{ cursor: 'pointer' }}
                            title="Cliquer pour modifier ce produit"
                          >
                            <td className="admin-td-product">
                              <div className="table-product-cell">
                                <img src={p.image} alt={p.name} className="table-product-img" />
                                <div>
                                  <div className="table-product-title">{p.name}</div>
                                  <div className="table-product-tag">
                                    {p.tag && <span className="admin-badge" style={{ padding: '0.1rem 0.4rem', fontSize: '0.68rem' }}>{p.tag}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="admin-td-category">
                              <span style={{ textTransform: 'capitalize' }}>{p.category}</span>
                            </td>
                            <td className="admin-td-price">
                              <strong>{p.price} DH</strong>
                            </td>
                            <td className="admin-td-stock">
                              <label className="switch-label-wrapper" onClick={(e) => e.stopPropagation()}>
                                <label className="admin-switch">
                                  <input
                                    type="checkbox"
                                    checked={p.inStock ?? true}
                                    onChange={() => {
                                      toggleStock(p.id);
                                      addToast(
                                        p.inStock
                                          ? `"${p.name}" marqué en rupture.`
                                          : `"${p.name}" marqué en stock !`,
                                        'info'
                                      );
                                    }}
                                  />
                                  <span className="admin-slider"></span>
                                </label>
                                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                                  {p.inStock ? (
                                    <span style={{ color: '#2e7d32' }}>En stock</span>
                                  ) : (
                                    <span style={{ color: '#c62828' }}>Rupture</span>
                                  )}
                                </span>
                              </label>
                            </td>
                            <td className="admin-td-featured">
                              {isHero ? (
                                <span className="admin-badge hero-tag">Hero (Moment)</span>
                              ) : (
                                <label className="switch-label-wrapper" onClick={(e) => e.stopPropagation()}>
                                  <label className="admin-switch">
                                    <input
                                      type="checkbox"
                                      checked={p.isFeaturedOnHome || false}
                                      onChange={() => {
                                        toggleFeaturedHome(p.id);
                                        addToast(
                                          p.isFeaturedOnHome
                                            ? `"${p.name}" retiré de l'accueil.`
                                            : `"${p.name}" mis en avant sur l'accueil !`,
                                          'info'
                                        );
                                      }}
                                    />
                                    <span className="admin-slider"></span>
                                  </label>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                                    {p.isFeaturedOnHome ? (
                                      <span style={{ color: 'var(--brand-burgundy)' }}>Sur l'Accueil</span>
                                    ) : (
                                      <span style={{ color: 'var(--text-muted)' }}>Non affiché</span>
                                    )}
                                  </span>
                                </label>
                              )}
                            </td>
                            <td className="admin-td-actions" style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  className="admin-btn-icon"
                                  onClick={() => handleOpenEditModal(p)}
                                  title="Modifier"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  className="admin-btn-icon delete"
                                  onClick={() => setProductToDelete(p)}
                                  title="Supprimer"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* GRID CARDS VIEW */
              <div className="admin-cards-grid">
                {filteredProducts.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Aucun produit ne correspond à vos filtres.
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const isHero = p.id === heroConfig.productId;

                    return (
                      <div
                        className="admin-prod-card"
                        key={p.id}
                        onClick={() => handleOpenEditModal(p)}
                        style={{ cursor: 'pointer' }}
                        title="Cliquer pour modifier ce produit"
                      >
                        <div className="admin-prod-card-media">
                          <img src={p.image} alt={p.name} className="admin-prod-card-img" />
                          <div className="admin-prod-card-badges">
                            {isHero && <span className="admin-badge hero-tag">Hero</span>}
                            {p.isFeaturedOnHome && !isHero && (
                              <span className="admin-badge warning">Vedette</span>
                            )}
                            {!p.inStock && <span className="admin-badge danger">Rupture</span>}
                          </div>
                          <div className="admin-prod-card-price">{p.price} DH</div>
                        </div>

                        <div className="admin-prod-card-body">
                          <div className="admin-prod-card-title">{p.name}</div>
                          <div className="admin-prod-card-desc">{p.description}</div>

                          <div className="admin-prod-card-meta">
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                              {p.category}
                            </span>
                            <label className="switch-label-wrapper" onClick={(e) => e.stopPropagation()}>
                              <label className="admin-switch">
                                <input
                                  type="checkbox"
                                  checked={p.inStock ?? true}
                                  onChange={() => {
                                    toggleStock(p.id);
                                    addToast(
                                      p.inStock
                                        ? `"${p.name}" marqué en rupture.`
                                        : `"${p.name}" marqué en stock !`,
                                      'info'
                                    );
                                  }}
                                />
                                <span className="admin-slider"></span>
                              </label>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                {p.inStock ? 'Stock' : 'Rupture'}
                              </span>
                            </label>
                          </div>

                          <div className="admin-prod-card-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              style={{ flex: 1 }}
                              onClick={() => handleOpenEditModal(p)}
                            >
                              <Edit2 size={13} />
                              <span>Modifier</span>
                            </button>
                            <button
                              className="admin-btn-icon delete"
                              onClick={() => setProductToDelete(p)}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
        </div>
      );
    }
    if (tabKey === 'categories') {
      return (
        <div>
            <div className="admin-card">
              <div
                className="admin-card-header"
                style={{
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <h2>Gestion des Catégories du Menu</h2>
                  <p>Personnalisez les noms, icônes/emojis et descriptions des catégories affichées sur le site.</p>
                </div>
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={() => handleOpenCategoryModal()}
                >
                  <Plus size={16} />
                  <span>Nouvelle Catégorie</span>
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table admin-categories-table">
                  <thead>
                    <tr>
                      <th>Nom de la Catégorie</th>
                      <th>Identifiant (Slug)</th>
                      <th>Description</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Produits Liés</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => {
                      const prodCount = products.filter((p) => p.category === cat.id).length;
                      return (
                        <tr key={cat.id} className="admin-category-row">
                          <td className="admin-td-cat-name">
                            <strong style={{ color: 'var(--brand-burgundy-dark)', fontSize: '0.98rem' }}>
                              {cat.label}
                            </strong>
                          </td>
                          <td className="admin-td-cat-slug">
                            <code
                              style={{
                                fontSize: '0.8rem',
                                background: 'var(--brand-cream)',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                color: 'var(--brand-burgundy)'
                              }}
                            >
                              {cat.id}
                            </code>
                          </td>
                          <td className="admin-td-cat-desc">
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              {cat.desc || '—'}
                            </span>
                          </td>
                          <td className="admin-td-cat-count" style={{ textAlign: 'center' }}>
                            <span className="admin-badge">
                              {prodCount} {prodCount > 1 ? 'produits' : 'produit'}
                            </span>
                          </td>
                          <td className="admin-td-cat-actions">
                            <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                              <button
                                className="admin-btn-icon"
                                onClick={() => handleOpenCategoryModal(cat)}
                                title="Modifier la catégorie"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                className="admin-btn-icon delete"
                                onClick={() => setCategoryToDelete(cat)}
                                title="Supprimer la catégorie"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Options de Lait & Suppléments Tarifaires */}
            <div className="admin-card" style={{ marginTop: '1.75rem' }}>
              <div className="admin-card-header">
                <div>
                  <h2>Options de Lait & Suppléments de Prix</h2>
                  <p>Configurez les laits disponibles dans la pop-up produit, leurs suppléments tarifaires et leur disponibilité.</p>
                </div>
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={() => handleOpenMilkModal()}
                >
                  <Plus size={16} />
                  <span>Ajouter un Lait</span>
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table admin-milks-table">
                  <thead>
                    <tr>
                      <th>Option de Lait</th>
                      <th>Supplément Tarifaire (DH)</th>
                      <th>Disponibilité</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(customizerMilks || []).map((milk) => (
                      <tr key={milk.id} className="admin-milk-row">
                        <td className="admin-td-milk-name">
                          <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{milk.name}</span>
                        </td>
                        <td className="admin-td-milk-price">
                          <span className="admin-badge" style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                            {milk.extra > 0 ? `+${milk.extra} DH` : 'Inclus (0 DH)'}
                          </span>
                        </td>
                        <td className="admin-td-milk-status">
                          <label className="switch-label-wrapper">
                            <label className="admin-switch">
                              <input
                                type="checkbox"
                                checked={milk.active !== false}
                                onChange={() => {
                                  toggleCustomizerMilk(milk.id);
                                  addToast(`Lait "${milk.name}" ${milk.active !== false ? 'désactivé' : 'activé'}`, 'info');
                                }}
                              />
                              <span className="admin-slider"></span>
                            </label>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: milk.active !== false ? '#2e7d32' : '#999' }}>
                              {milk.active !== false ? 'Actif' : 'Désactivé'}
                            </span>
                          </label>
                        </td>
                        <td className="admin-td-milk-actions">
                          <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="admin-btn-icon"
                              onClick={() => handleOpenMilkModal(milk)}
                              title="Modifier le prix ou le nom"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="admin-btn-icon delete"
                              onClick={() => setMilkToDelete(milk)}
                              title="Supprimer cette option"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Configuration des Tailles de Boisson */}
            <div className="admin-card" style={{ marginTop: '1.75rem' }}>
              <div className="admin-card-header">
                <div>
                  <h2>Tailles de Boisson</h2>
                  <p>Définissez les suppléments tarifaires pour chaque format de tasse.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {(customizerSizes || []).map((size) => (
                  <div
                    key={size.key}
                    style={{
                      backgroundColor: 'var(--brand-cream)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '14px',
                      padding: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-burgundy)' }}>
                        {size.label}
                      </span>
                      <span className="admin-badge" style={{ fontWeight: 700 }}>
                        {size.extra > 0 ? `+${size.extra} DH` : 'Inclus (0 DH)'}
                      </span>
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="admin-form-label" style={{ fontSize: '0.8rem' }}>Supplément Tarifaire (DH)</label>
                      <SizePriceInput size={size} onUpdate={updateCustomizerSize} addToast={addToast} />
                    </div>

                    <label className="switch-label-wrapper" style={{ marginTop: '0.5rem' }}>
                      <label className="admin-switch">
                        <input
                          type="checkbox"
                          checked={size.active !== false}
                          onChange={(e) => {
                            updateCustomizerSize(size.key, { active: e.target.checked });
                            addToast(`Taille "${size.label}" ${e.target.checked ? 'activée' : 'désactivée'}`, 'info');
                          }}
                        />
                        <span className="admin-slider"></span>
                      </label>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {size.active !== false ? 'Taille activée' : 'Taille masquée'}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="admin-layout">
      <div className="container">
        {/* ================= TOP HEADER ================= */}
        <header className="admin-header">
          <div className="admin-header-title">
            <h1>Gestion du Coffee Shop</h1>
          </div>

          <div className="admin-actions-bar">
            <button className="admin-btn admin-btn-primary" onClick={handleOpenAddModal}>
              <Plus size={18} />
              <span>Nouveau Produit</span>
            </button>
          </div>
        </header>

        <div ref={stageRef} className="admin-tab-direct-stage">
          {displayState.outgoing && (
            <div className={`admin-tab-direct-panel outgoing ${displayState.direction}`}>
              {renderTabContent(displayState.outgoing)}
            </div>
          )}
          <div
            className={`admin-tab-direct-panel incoming ${
              displayState.isAnimating ? displayState.direction : ''
            }`}
          >
            {renderTabContent(displayState.current)}
          </div>
        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {isModalOpen &&
        createPortal(
          <AdminModalOverlay onClose={handleCloseModal}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>{editingProduct ? 'Modifier le Produit' : 'Créer un Nouveau Produit'}</h2>
                <button
                  className="admin-btn-icon"
                  onClick={handleCloseModal}
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="admin-modal-body">
                  {/* Product Name & Badge side-by-side */}
                  <div className="admin-modal-name-badge-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Nom du Produit *</label>
                      <input
                        type="text"
                        className="admin-input"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="ex: Pistachio Cream Latte"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Badge</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.tag}
                        onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                        placeholder="ex: Signature"
                      />
                    </div>
                  </div>

                  {/* Category, Price, Calories */}
                  <div className="admin-modal-grid-3">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Catégorie</label>
                      <select
                        className="admin-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Prix (DH) *</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        className="admin-input"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Calories</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                        placeholder="ex: 220 kcal"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Description Détaillée</label>
                    <textarea
                      className="admin-textarea"
                      rows="5"
                      style={{ minHeight: '125px', lineHeight: 1.55 }}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description gourmande des ingrédients, profil de dégustation, torréfaction..."
                    />
                  </div>

                  {/* Notes & Aromas Tag Manager */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Notes Aromatiques / Mots-clés</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Ajouter une note (ex: Caramel au beurre salé, Bio, 100% Arabica)..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNote();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={handleAddNote}
                      >
                        <Plus size={16} /> Ajouter
                      </button>
                    </div>

                    <div className="chips-container">
                      {formData.notes.map((note, idx) => (
                        <span className="chip-item" key={idx}>
                          {note}
                          <button
                            type="button"
                            className="chip-remove-btn"
                            onClick={() => handleRemoveNote(idx)}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Options de Personnalisation (Chaud, Froid, Tailles, Laits) */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Options & Personnalisations du Produit
                    </label>
                    <div className="admin-options-toggle-grid">
                      {/* Toggle Option Chaud */}
                      <div className="admin-option-toggle-card">
                        <div className="admin-option-toggle-info">
                          <div className="admin-option-toggle-icon">
                            <Flame size={18} />
                          </div>
                          <div className="admin-option-toggle-labels">
                            <strong>Option Chaud</strong>
                            <span>Boisson servie chaude</span>
                          </div>
                        </div>
                        <label className="admin-switch">
                          <input
                            type="checkbox"
                            checked={formData.allowHot}
                            onChange={(e) => setFormData({ ...formData, allowHot: e.target.checked })}
                          />
                          <span className="admin-slider"></span>
                        </label>
                      </div>

                      {/* Toggle Option Froid / Glacé */}
                      <div className="admin-option-toggle-card">
                        <div className="admin-option-toggle-info">
                          <div className="admin-option-toggle-icon">
                            <Snowflake size={18} />
                          </div>
                          <div className="admin-option-toggle-labels">
                            <strong>Option Froid / Glacé</strong>
                            <span>Boisson servie glacée</span>
                          </div>
                        </div>
                        <label className="admin-switch">
                          <input
                            type="checkbox"
                            checked={formData.allowCold}
                            onChange={(e) => setFormData({ ...formData, allowCold: e.target.checked })}
                          />
                          <span className="admin-slider"></span>
                        </label>
                      </div>

                      {/* Toggle Choix des Tailles */}
                      <div className="admin-option-toggle-card">
                        <div className="admin-option-toggle-info">
                          <div className="admin-option-toggle-icon">
                            <Layers size={18} />
                          </div>
                          <div className="admin-option-toggle-labels">
                            <strong>Choix des Tailles</strong>
                            <span>Formats Petit, Moyen, Grand</span>
                          </div>
                        </div>
                        <label className="admin-switch">
                          <input
                            type="checkbox"
                            checked={formData.allowSize}
                            onChange={(e) => setFormData({ ...formData, allowSize: e.target.checked })}
                          />
                          <span className="admin-slider"></span>
                        </label>
                      </div>

                      {/* Toggle Choix des Laits */}
                      <div className="admin-option-toggle-card">
                        <div className="admin-option-toggle-info">
                          <div className="admin-option-toggle-icon">
                            <Coffee size={18} />
                          </div>
                          <div className="admin-option-toggle-labels">
                            <strong>Choix du Lait</strong>
                            <span>Avoine, Amande, Entier...</span>
                          </div>
                        </div>
                        <label className="admin-switch">
                          <input
                            type="checkbox"
                            checked={formData.allowMilk}
                            onChange={(e) => setFormData({ ...formData, allowMilk: e.target.checked })}
                          />
                          <span className="admin-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Photo du Produit */}
                  <div className="admin-form-group">
                    <div className="admin-modal-uploader-header">
                      <label className="admin-form-label" style={{ marginBottom: 0 }}>Photo du Produit (PNG / JPEG)</label>
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', gap: '0.35rem' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={14} />
                        <span>Importer une photo</span>
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      style={{ display: 'none' }}
                      onChange={handleImageFileUpload}
                    />

                    <div
                      style={{
                        display: 'flex',
                        gap: '0.85rem',
                        alignItems: 'center',
                        backgroundColor: 'var(--brand-cream)',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div
                        style={{ position: 'relative', cursor: 'pointer' }}
                        onClick={() => fileInputRef.current?.click()}
                        title="Cliquer pour importer une photo PNG/JPEG"
                      >
                        <img
                          src={formData.image || '/assets/images/pastries.jpg'}
                          alt={formData.name || 'Produit'}
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            border: '1px solid var(--border-color)',
                            backgroundColor: '#fff',
                            flexShrink: 0,
                            display: 'block'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/images/hero_latte.jpg';
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.35)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            color: '#fff'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                        >
                          <Upload size={18} />
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="Chemin, URL ou fichier importé..."
                          value={formData.image?.startsWith('data:') ? 'Photo personnalisée importée (PNG/JPEG)' : formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem' }}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Toggles: In Stock & Featured on Home */}
                  <div className="admin-modal-toggles-row">
                    <label className="switch-label-wrapper">
                      <label className="admin-switch">
                        <input
                          type="checkbox"
                          checked={formData.inStock}
                          onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        />
                        <span className="admin-slider"></span>
                      </label>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                        En Stock (Disponible à la commande)
                      </span>
                    </label>

                    <label className="switch-label-wrapper">
                      <label className="admin-switch">
                        <input
                          type="checkbox"
                          checked={formData.isFeaturedOnHome}
                          onChange={(e) => setFormData({ ...formData, isFeaturedOnHome: e.target.checked })}
                        />
                        <span className="admin-slider"></span>
                      </label>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                        Afficher dans "Incontournables de Saison" (Accueil)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    <Check size={16} />
                    <span>Sauvegarder</span>
                  </button>
                </div>
              </form>
            </div>
          </AdminModalOverlay>,
          document.body
        )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {productToDelete &&
        createPortal(
          <AdminModalOverlay onClose={() => setProductToDelete(null)}>
            <div className="admin-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Confirmer la Suppression</h2>
                <button className="admin-btn-icon" onClick={() => setProductToDelete(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="admin-modal-body">
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Êtes-vous sûr de vouloir supprimer définitivement le produit <strong>"{productToDelete.name}"</strong> du catalogue ?
                </p>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setProductToDelete(null)}>
                  Annuler
                </button>
                <button className="admin-btn admin-btn-outline-danger" onClick={handleConfirmDelete}>
                  <Trash2 size={16} />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </AdminModalOverlay>,
          document.body
        )}

      {/* ================= MODAL: RESET CONFIRMATION ================= */}
      {isResetConfirmOpen &&
        createPortal(
          <AdminModalOverlay onClose={() => setIsResetConfirmOpen(false)}>
            <div className="admin-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Réinitialiser le Catalogue</h2>
                <button className="admin-btn-icon" onClick={() => setIsResetConfirmOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="admin-modal-body">
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Cette action va réinitialiser l'ensemble des produits, catégories et la configuration de la Landing Page aux valeurs initiales.
                </p>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setIsResetConfirmOpen(false)}>
                  Annuler
                </button>
                <button className="admin-btn admin-btn-primary" onClick={handleConfirmReset}>
                  <RefreshCw size={16} />
                  <span>Confirmer la Réinitialisation</span>
                </button>
              </div>
            </div>
          </AdminModalOverlay>,
          document.body
        )}

      {/* ================= MODAL: ADD / EDIT CATEGORY ================= */}
      {isCategoryModalOpen &&
        createPortal(
          <AdminModalOverlay onClose={() => setIsCategoryModalOpen(false)}>
            <div className="admin-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>{editingCategory ? 'Modifier la Catégorie' : 'Créer une Nouvelle Catégorie'}</h2>
                <button
                  className="admin-btn-icon"
                  onClick={() => setIsCategoryModalOpen(false)}
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCategoryFormSubmit}>
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Nom de la Catégorie *</label>
                    <input
                      type="text"
                      className="admin-input"
                      required
                      value={categoryFormData.label}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, label: e.target.value })}
                      placeholder="ex: Thés & Infusions Précieuses"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Description (affichée sur la Carte)</label>
                    <textarea
                      className="admin-textarea"
                      rows="3"
                      value={categoryFormData.desc}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, desc: e.target.value })}
                      placeholder="Description gourmande du type de créations..."
                    />
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setIsCategoryModalOpen(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    <Check size={16} />
                    <span>Sauvegarder</span>
                  </button>
                </div>
              </form>
            </div>
          </AdminModalOverlay>,
          document.body
        )}

      {/* ================= MODAL: DELETE CATEGORY CONFIRMATION ================= */}
      {categoryToDelete &&
        createPortal(
          <AdminModalOverlay onClose={() => setCategoryToDelete(null)}>
            <div className="admin-modal" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Supprimer la Catégorie</h2>
                <button className="admin-btn-icon" onClick={() => setCategoryToDelete(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="admin-modal-body">
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Êtes-vous sûr de vouloir supprimer la catégorie <strong>"{categoryToDelete.label}"</strong> ?
                </p>
                {products.some((p) => p.category === categoryToDelete.id) && (
                  <p style={{ color: '#c62828', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 600 }}>
                    ⚠️ Note : Des produits sont actuellement liés à cette catégorie.
                  </p>
                )}
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setCategoryToDelete(null)}>
                  Annuler
                </button>
                <button className="admin-btn admin-btn-outline-danger" onClick={handleConfirmDeleteCategory}>
                  <Trash2 size={16} />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </AdminModalOverlay>,
          document.body
        )}

      {/* ================= MODAL: ADD / EDIT MILK OPTION ================= */}
      {isMilkModalOpen &&
        createPortal(
          <AdminModalOverlay onClose={() => setIsMilkModalOpen(false)}>
            <div className="admin-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>{editingMilk ? "Modifier l'Option de Lait" : 'Ajouter une Option de Lait'}</h2>
                <button
                  className="admin-btn-icon"
                  onClick={() => setIsMilkModalOpen(false)}
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleMilkFormSubmit}>
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Nom du Lait *</label>
                    <input
                      type="text"
                      className="admin-input"
                      required
                      value={milkFormData.name}
                      onChange={(e) => setMilkFormData({ ...milkFormData, name: e.target.value })}
                      placeholder="ex: Lait de Coco, Lait de Noisette..."
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Supplément Tarifaire (DH)</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        style={{ maxWidth: '140px' }}
                        value={milkFormData.extra}
                        onChange={(e) => setMilkFormData({ ...milkFormData, extra: Number(e.target.value) || 0 })}
                        placeholder="0"
                      />
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>DH</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.35rem', display: 'block' }}>
                      Mettez 0 si l'option est sans supplément tarifaire.
                    </span>
                  </div>

                  <label className="switch-label-wrapper" style={{ marginTop: '0.75rem' }}>
                    <label className="admin-switch">
                      <input
                        type="checkbox"
                        checked={milkFormData.active !== false}
                        onChange={(e) => setMilkFormData({ ...milkFormData, active: e.target.checked })}
                      />
                      <span className="admin-slider"></span>
                    </label>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      Option active (visible pour les clients)
                    </span>
                  </label>
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setIsMilkModalOpen(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    <Check size={16} />
                    <span>Sauvegarder</span>
                  </button>
                </div>
              </form>
            </div>
          </AdminModalOverlay>,
          document.body
        )}

      {/* ================= MODAL: DELETE MILK OPTION CONFIRMATION ================= */}
      {milkToDelete &&
        createPortal(
          <AdminModalOverlay onClose={() => setMilkToDelete(null)}>
            <div className="admin-modal" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Supprimer l'Option de Lait</h2>
                <button className="admin-btn-icon" onClick={() => setMilkToDelete(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="admin-modal-body">
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Êtes-vous sûr de vouloir supprimer définitivement l'option de lait <strong>"{milkToDelete.name}"</strong> ?
                </p>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setMilkToDelete(null)}>
                  Annuler
                </button>
                <button className="admin-btn admin-btn-outline-danger" onClick={handleConfirmDeleteMilk}>
                  <Trash2 size={16} />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </AdminModalOverlay>,
          document.body
        )}
    </div>
  );
};
