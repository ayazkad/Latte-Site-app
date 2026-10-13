import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { ProductCard } from '../components/ProductCard';
import { isPeriodExpired } from '../components/CalendarRangePicker';

export const Home = () => {
  const { addToCart } = useCart();
  const { heroProduct, heroConfig, featuredHomeProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalPrefix, setModalPrefix] = useState('home');
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 768 : true));

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const featuredMomentProduct = heroProduct;
  const isHeroExpired = isPeriodExpired(heroConfig?.badgeText, heroConfig?.endDate);
  const showHero = Boolean(featuredMomentProduct && !isHeroExpired);
  const featuredDrinks = featuredHomeProducts;
  const hasMultipleProducts = featuredDrinks.length > 3;
  const maxIndex = Math.max(0, featuredDrinks.length - 3);
  const [slideIndex, setSlideIndex] = useState(0);

  // Reset slide index if product count changes
  useEffect(() => {
    if (slideIndex > maxIndex) {
      setSlideIndex(maxIndex);
    }
  }, [featuredDrinks.length, maxIndex, slideIndex]);

  const scrollPrev = () => {
    setSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const scrollNext = () => {
    setSlideIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleOpenModal = (item, prefix = 'home') => {
    setModalPrefix(prefix);
    setSelectedProduct(item);
  };

  const sharedTransition = {
    duration: 0.38,
    ease: [0.22, 1, 0.36, 1]
  };

  return (
    <div className="home-page">
      {/* ==================== HERO SECTION (ALIGNED WITH CONTAINER) ==================== */}
      {showHero && (
        <section className="hero-section" id="home">
          <div className="container">
            <div className="hero-split-grid">
              <motion.div
                layoutId={`expandable-card-hero-${featuredMomentProduct.id}`}
                transition={sharedTransition}
                className="hero-split-media"
                onClick={() => handleOpenModal(featuredMomentProduct, 'hero')}
                title="Cliquer pour découvrir le produit du moment"
                whileHover="hover"
                style={{ cursor: 'pointer', overflow: 'hidden' }}
              >
                <div
                  style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 'inherit' }}
                >
                  {heroConfig?.badgeText && (
                    <span className="hero-split-date">{heroConfig.badgeText}</span>
                  )}
                  <motion.img
                    layoutId={`image-expandable-card-hero-${featuredMomentProduct.id}`}
                    src={featuredMomentProduct.image}
                    alt={featuredMomentProduct.name}
                    className="hero-split-img"
                    loading="eager"
                    variants={{
                      hover: { scale: 1.05 }
                    }}
                    transition={sharedTransition}
                  />
                </div>
              </motion.div>

              <div className="hero-split-content">
                <h1 className="hero-split-title">{heroConfig.title || 'La légende est de retour'}</h1>
                <button
                  type="button"
                  className="hero-split-btn"
                  onClick={() => handleOpenModal(featuredMomentProduct, 'hero')}
                >
                  {heroConfig.ctaText || 'En savoir plus'}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== FEATURED SPECIALS ==================== */}
      <section style={{ padding: showHero ? '5rem 0' : '7.5rem 0 5rem', backgroundColor: 'var(--sb-cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
            <h2 className="section-title">Les Incontournables de Saison</h2>
            <p style={{ color: 'var(--text-muted)' }}>Découvrez les créations les plus plébiscitées par nos habitués.</p>
          </div>

          <div className="featured-slider-wrapper">
            {hasMultipleProducts && slideIndex > 0 && (
              <button
                type="button"
                className="featured-slider-arrow prev"
                onClick={scrollPrev}
                aria-label="Produits précédents"
                title="Précédent"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {hasMultipleProducts && slideIndex < maxIndex && (
              <button
                type="button"
                className="featured-slider-arrow next"
                onClick={scrollNext}
                aria-label="Produits suivants"
                title="Suivant"
              >
                <ChevronRight size={24} />
              </button>
            )}

            <div className={hasMultipleProducts ? 'featured-slider-viewport' : ''}>
              <div
                className={hasMultipleProducts ? 'featured-slider-track' : 'studio-products-grid'}
                style={
                  hasMultipleProducts
                    ? {
                        transform: `translateX(calc(-${slideIndex} * ((100% - 4rem) / 3 + 2rem)))`
                      }
                    : {}
                }
              >
                {featuredDrinks.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    layoutPrefix="home"
                  />
                ))}

              </div>
            </div>

            {/* Pagination Dots when > 3 items */}
            {hasMultipleProducts && (
              <div className="featured-slider-dots">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`featured-slider-dot ${slideIndex === idx ? 'active' : ''}`}
                    onClick={() => setSlideIndex(idx)}
                    aria-label={`Aller au slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link to="/menu" className="btn btn-primary">
              <span>Voir Toute la Carte</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== EDITORIAL PRODUCT DETAIL MODAL ==================== */}
      <ProductDetailModal
        product={selectedProduct}
        layoutPrefix={modalPrefix}
        onClose={() => setSelectedProduct(null)}
      />

      {/* ==================== MODULAR TEASERS ==================== */}
      <section className="home-teasers-section">
        <div className="container">
          <div className="teasers-grid">
            {/* Block 1: Story */}
            <div className="teaser-card">
              <div className="teaser-image">
                <img src="/assets/images/ambiance.jpg" alt="Notre histoire" />
              </div>
              <div className="teaser-body">
                <h3>Notre Vision & Terroirs</h3>
                <p>De la sélection minutieuse des meilleurs grains jusqu'à la préparation soignée en tasse, explorez notre quête du goût parfait.</p>
                <Link to="/story" className="btn btn-secondary">
                  En savoir plus
                </Link>
              </div>
            </div>

            {/* Block 2: Ambiance & Reservation */}
            <div className="teaser-card reverse">
              <div className="teaser-image">
                <img src="/assets/images/pastries.jpg" alt="Ambiance" />
              </div>
              <div className="teaser-body">
                <h3>Un Cadre Épuré & Chaleureux</h3>
                <p>Un lieu pensé pour savourer le temps, travailler au calme avec Wi-Fi haut débit ou partager un brunch gourmand entre amis.</p>
                <Link to="/reservation" className="btn btn-secondary">
                  Réserver une Table
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
