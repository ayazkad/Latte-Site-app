import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Menu, X, Clock, TrendingUp, Sparkles, Package, FolderTree, Eye, Sliders } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

export const Navbar = () => {
  const { totalCount, setIsCartOpen, activeOrder } = useCart();
  const { products, categories, featuredHomeProducts, customizerMilks } = useProducts();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = location.pathname === '/admin';
  const currentTab = searchParams.get('tab') || 'overview';

  // Automatically close mobile menu on route or tab change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const adminNavRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled((prev) => {
            const next = window.scrollY > 30;
            return prev !== next ? next : prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate sliding pill position for admin top navigation tabs
  useEffect(() => {
    if (!isAdmin || !adminNavRef.current) return;

    const updateSlider = () => {
      const activeTabEl = adminNavRef.current?.querySelector('.admin-nav-tab-link.active');
      if (activeTabEl && adminNavRef.current) {
        const navRect = adminNavRef.current.getBoundingClientRect();
        const activeRect = activeTabEl.getBoundingClientRect();

        const isMobile = window.innerWidth <= 992;
        if (isMobile) {
          setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
          return;
        }

        setSliderStyle({
          left: activeRect.left - navRect.left,
          top: activeRect.top - navRect.top,
          width: activeRect.width,
          height: activeRect.height,
          opacity: 1
        });
      } else {
        setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateSlider();
    const timer = setTimeout(updateSlider, 40);

    window.addEventListener('resize', updateSlider);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSlider);
    };
  }, [isAdmin, currentTab, products.length, categories.length, featuredHomeProducts.length, customizerMilks?.length]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.documentElement.classList.add('menu-open');
      document.body.classList.add('menu-open');
    } else {
      document.documentElement.classList.remove('menu-open');
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.documentElement.classList.remove('menu-open');
      document.body.classList.remove('menu-open');
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className={`mobile-menu-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="container nav-container">
          {/* Mobile menu toggle on the left (mobile only) */}
          <button
            className="mobile-menu-btn"
            id="mobileMenuBtn"
            aria-label="Menu Mobile"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo (centered on mobile, left on desktop) */}
          <Link to={isAdmin ? "/admin" : "/"} className="nav-logo" onClick={() => setMobileOpen(false)}>
            <img src="/assets/images/logo.png" alt="Latte" className="nav-logo-img" />
          </Link>

          {/* Navigation links */}
          {isAdmin ? (
            <ul ref={adminNavRef} className={`nav-links admin-nav-links ${mobileOpen ? 'mobile-active' : ''}`} id="navLinks">
              <span
                className="admin-nav-slider-pill"
                style={{
                  transform: `translate3d(${sliderStyle.left}px, ${sliderStyle.top}px, 0)`,
                  width: `${sliderStyle.width}px`,
                  height: `${sliderStyle.height}px`,
                  opacity: sliderStyle.opacity
                }}
              />
              <li>
                <Link
                  to="/admin?tab=overview"
                  className={`nav-link admin-nav-tab-link ${currentTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <TrendingUp size={16} />
                  <span>Vue d'ensemble</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin?tab=landing"
                  className={`nav-link admin-nav-tab-link ${currentTab === 'landing' ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Sparkles size={16} />
                  <span>Landing Page & Hero</span>
                  <span className="admin-nav-pill-badge">{featuredHomeProducts.length + 1}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin?tab=products"
                  className={`nav-link admin-nav-tab-link ${currentTab === 'products' ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Package size={16} />
                  <span>Catalogue Produits</span>
                  <span className="admin-nav-pill-badge">{products.length}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin?tab=categories"
                  className={`nav-link admin-nav-tab-link ${currentTab === 'categories' || currentTab === 'customizer' ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <FolderTree size={16} />
                  <span>Catégories, Tailles & Laits</span>
                  <span className="admin-nav-pill-badge">{categories.length}</span>
                </Link>
              </li>
              <li className="admin-drawer-only-item">
                <Link
                  to="/"
                  className="nav-link admin-nav-tab-link"
                  onClick={() => setMobileOpen(false)}
                  style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}
                >
                  <Eye size={16} />
                  <span>Voir le Site Client</span>
                </Link>
              </li>
            </ul>
          ) : (
            <ul className={`nav-links ${mobileOpen ? 'mobile-active' : ''}`} id="navLinks">
              <li>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  Accueil
                </NavLink>
              </li>
              <li>
                <NavLink to="/story" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  Notre Histoire
                </NavLink>
              </li>
              <li>
                <NavLink to="/menu" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  La Carte
                </NavLink>
              </li>
              <li>
                <NavLink to="/reservation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  Réservation & Horaires
                </NavLink>
              </li>
            </ul>
          )}

          {/* Actions on the right */}
          {isAdmin ? (
            <div className="nav-actions">
              <Link
                to="/"
                className="admin-btn admin-btn-secondary admin-nav-exit-btn"
                style={{
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.8rem',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <Eye size={14} />
                <span>Voir le Site Client</span>
              </Link>
            </div>
          ) : (
            <div className="nav-actions">
              {activeOrder && (
                <Link to="/order-tracking" className="active-order-badge" title="Suivre ma commande en cours">
                  <Clock size={15} />
                  <span>Suivi</span>
                </Link>
              )}

              <button
                className="cart-toggle-btn"
                id="cartToggleBtn"
                aria-label="Ouvrir le panier"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={22} />
                {totalCount > 0 && <span className="cart-count">{totalCount}</span>}
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
