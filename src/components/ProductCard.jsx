import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

export const ProductCard = ({
  product,
  layoutPrefix = ''
}) => {
  const { addToCart } = useCart();
  const { customizerSizes, customizerMilks, customizerTemps } = useProducts();

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));
  const [isMobileActive, setIsMobileActive] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const title = product?.name || 'Latte Signature';
  const categoryNames = {
    latte: 'Latte Signature',
    espresso: 'Espresso Bar',
    cold: 'Iced & Cold Brew',
    pastry: 'Pâtisserie & Brunch'
  };
  const subtitle = product?.subtitle || categoryNames[product?.category] || 'Café de Spécialité';
  const defaultImg = '/assets/images/hero_latte.jpg';
  const imageSrc = product?.image || defaultImg;

  const prefix = layoutPrefix ? `${layoutPrefix}-` : '';
  const layoutId = `expandable-profile-card-${prefix}${product?.id || title.replace(/\s+/g, '-').toLowerCase()}`;

  // Customization options
  const isPastry = product?.category === 'pastry';
  const isDrink = !isPastry;
  const isCold = product?.category === 'cold';
  const isEspresso = product?.category === 'espresso';
  const allowHot = product?.allowHot ?? (product?.temperatureOption === 'cold' || isCold ? false : !isPastry);
  const allowCold = product?.allowCold ?? (product?.temperatureOption === 'hot' || isEspresso ? false : !isPastry);
  const hasTemp = Boolean(allowHot || allowCold);
  const allowSize = Boolean(product?.allowSize ?? (!isPastry));
  const allowMilk = Boolean(product?.allowMilk ?? (!isPastry));
  const isCustomizable = hasTemp || allowSize || allowMilk;

  const SIZES = (customizerSizes || []).filter((s) => s.active !== false);
  const MILK_OPTIONS = (customizerMilks || []).filter((m) => m.active !== false);
  const TEMP_OPTIONS = (customizerTemps || []).filter((t) => t.active !== false);

  // Customizer Step State (0: Details, 1: Temp & Size, 2: Milk, 3: Recap)
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedSize, setSelectedSize] = useState('moyen');
  const [selectedTemp, setSelectedTemp] = useState('hot');
  const [selectedMilk, setSelectedMilk] = useState('whole');
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleOpenModal = () => {
    setStep(0);
    setDirection(1);
    setSelectedSize(SIZES[1]?.key || SIZES[0]?.key || 'moyen');
    const initAllowHot = product?.allowHot ?? (product?.temperatureOption === 'cold' || isCold ? false : !isPastry);
    const initAllowCold = product?.allowCold ?? (product?.temperatureOption === 'hot' || isEspresso ? false : !isPastry);
    let defaultTemp = 'hot';
    if (!initAllowHot && initAllowCold) {
      defaultTemp = 'cold';
    }
    setSelectedTemp(defaultTemp);
    setSelectedMilk(MILK_OPTIONS[0]?.id || 'whole');
    setActiveAccordion(null);

    if (isMobile) {
      setIsOpen(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsMobileActive(true);
        });
      });
    } else {
      setIsOpen(true);
    }
  };

  const handleCloseModal = () => {
    if (isMobile) {
      setIsMobileActive(false);
      setTimeout(() => {
        setIsOpen(false);
        setStep(0);
      }, 620);
    } else {
      setIsOpen(false);
      setStep(0);
    }
  };

  useEffect(() => {
    if (isOpen || isMobileActive) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') handleCloseModal();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isMobileActive]);

  const currentMilkObj = MILK_OPTIONS.find((m) => m.id === selectedMilk) || MILK_OPTIONS[0] || { name: 'Lait Entier', extra: 0 };
  const currentTempObj = TEMP_OPTIONS.find((t) => t.id === selectedTemp) || TEMP_OPTIONS[0] || { title: 'Chaud', shortLabel: 'Chaud' };
  const currentSizeObj = SIZES.find((s) => s.key === selectedSize) || SIZES[0] || { label: 'Moyen', extra: 0 };
  const currentExtraPrice = (allowMilk ? (currentMilkObj.extra || 0) : 0) + (allowSize ? (currentSizeObj.extra || 0) : 0);
  const currentFinalPrice = (Number(product?.price) || 0) + (isCustomizable ? currentExtraPrice : 0);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const totalSteps = isMobile ? 2 : (allowMilk ? 3 : 2);

  const handlePrimaryClick = () => {
    if (product && product.inStock !== false) {
      if (!isCustomizable) {
        addToCart({
          ...product,
          qty: 1
        });
        handleCloseModal();
      } else {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setDirection(1);
        const nextStep = (hasTemp || allowSize || (isMobile && allowMilk)) ? 1 : 2;
        setStep(nextStep);
        setTimeout(() => setIsTransitioning(false), 220);
      }
    }
  };

  const handleNextStep = (next) => {
    if (isTransitioning) return;
    let target = next;
    if (!isMobile && step === 1 && !allowMilk) {
      target = 3;
    }
    setIsTransitioning(true);
    setDirection(1);
    setStep(target);
    setTimeout(() => setIsTransitioning(false), 220);
  };

  const handlePrevStep = () => {
    if (isTransitioning) return;
    let target = step - 1;
    if (!isMobile) {
      if (step === 3 && !allowMilk) {
        target = (hasTemp || allowSize) ? 1 : 0;
      } else if (step === 2 && !(hasTemp || allowSize)) {
        target = 0;
      }
    }
    setIsTransitioning(true);
    setDirection(-1);
    setStep(target);
    setTimeout(() => setIsTransitioning(false), 220);
  };

  const handleFinalAddToCart = () => {
    if (product && product.inStock !== false) {
      const customKey = `${allowSize ? selectedSize : 'std'}-${hasTemp ? selectedTemp : 'na'}-${allowMilk ? selectedMilk : 'none'}`;
      const detailParts = [];
      if (hasTemp && currentTempObj) detailParts.push(currentTempObj.shortLabel);
      if (allowMilk && currentMilkObj) detailParts.push(currentMilkObj.name);
      if (allowSize && currentSizeObj) detailParts.push(currentSizeObj.label);
      const customDetails = detailParts.join(' • ');

      addToCart({
        ...product,
        size: allowSize ? currentSizeObj.label : null,
        temperature: hasTemp ? selectedTemp : null,
        milk: allowMilk ? currentMilkObj.name : null,
        customKey,
        customDetails,
        price: currentFinalPrice,
        qty: 1
      });
      handleCloseModal();
    }
  };

  // Render Synchronized Header & Multi-Pane Horizontal Slider from ProductDetailModal
  const renderUnifiedBody = () => {
    const bodyTranslateX = -step * 100;
    const stepControlsTranslateX = step === 0 ? 100 : 0;

    return (
      <div className="customizer-step-container">
        {/* STEP HEADER: Slides in from right on Step 0 -> 1, stays fixed across steps 1, 2, 3 */}
        <div
          className={`customizer-floating-step-header ${step > 0 ? 'visible' : ''}`}
          style={{ transform: `translate3d(${stepControlsTranslateX}%, 0, 0)` }}
        >
          <div className="customizer-top-nav">
            <span className="customizer-step-badge">Étape {Math.max(1, step)} / {totalSteps}</span>
          </div>
          <div className="customizer-progress-bar">
            <div className="customizer-progress-segment">
              <div className={`customizer-progress-fill ${step >= 1 ? 'active' : ''}`} />
            </div>
            <div className="customizer-progress-segment">
              <div className={`customizer-progress-fill ${step >= 2 ? 'active' : ''}`} />
            </div>
            {!isMobile && totalSteps === 3 && (
              <div className="customizer-progress-segment">
                <div className={`customizer-progress-fill ${step >= 3 ? 'active' : ''}`} />
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE VIEWPORT: 4-PANE CONTINUOUS CSS HORIZONTAL SLIDER */}
        <div className="customizer-step-viewport">
          <div
            className="customizer-slider-track"
            style={{ transform: `translate3d(${bodyTranslateX}%, 0, 0)` }}
          >
            {/* PANE 0: Product Overview & Accordions + Primary Action */}
            <div className="customizer-step-pane pane-overview">
              <p className="editorial-desc">{product?.description || "Création artisanale préparée avec nos cafés de terroir et ingrédients soigneusement sélectionnés."}</p>

              {/* Accordion Tabs */}
              <div className="editorial-accordions">
                <div className={`editorial-accordion-item ${activeAccordion === 1 ? 'open' : ''}`}>
                  <button
                    type="button"
                    className={`editorial-accordion-header ${activeAccordion === 1 ? 'active' : ''}`}
                    onClick={() => toggleAccordion(1)}
                  >
                    <span>Notes aromatiques & Saveurs</span>
                    <ChevronDown
                      size={16}
                      className={`accordion-chevron ${activeAccordion === 1 ? 'rotated' : ''}`}
                    />
                  </button>
                  <div className={`editorial-accordion-wrapper ${activeAccordion === 1 ? 'open' : ''}`}>
                    <div className="editorial-accordion-inner">
                      <div className="editorial-accordion-content">
                        {Array.isArray(product?.notes) && product.notes.length > 0
                          ? product.notes.join(' • ')
                          : "Profil d'exception, sélection équilibrée et saveurs raffinées en bouche."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`editorial-accordion-item ${activeAccordion === 2 ? 'open' : ''}`}>
                  <button
                    type="button"
                    className={`editorial-accordion-header ${activeAccordion === 2 ? 'active' : ''}`}
                    onClick={() => toggleAccordion(2)}
                  >
                    <span>{isDrink ? 'Origine des Grains (100% Arabica)' : 'Ingrédients & Terroir'}</span>
                    <ChevronDown
                      size={16}
                      className={`accordion-chevron ${activeAccordion === 2 ? 'rotated' : ''}`}
                    />
                  </button>
                  <div className={`editorial-accordion-wrapper ${activeAccordion === 2 ? 'open' : ''}`}>
                    <div className="editorial-accordion-inner">
                      <div className="editorial-accordion-content">
                        {isDrink
                          ? "Café de spécialité rigoureusement sélectionné parmi les terroirs d'altitude d'Éthiopie et de Colombie."
                          : "Ingrédients frais et nobles rigoureusement sélectionnés auprès d'artisans passionnés."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`editorial-accordion-item ${activeAccordion === 3 ? 'open' : ''}`}>
                  <button
                    type="button"
                    className={`editorial-accordion-header ${activeAccordion === 3 ? 'active' : ''}`}
                    onClick={() => toggleAccordion(3)}
                  >
                    <span>{isDrink ? 'Préparation & Service Barista' : 'Nutrition & Calories'}</span>
                    <ChevronDown
                      size={16}
                      className={`accordion-chevron ${activeAccordion === 3 ? 'rotated' : ''}`}
                    />
                  </button>
                  <div className={`editorial-accordion-wrapper ${activeAccordion === 3 ? 'open' : ''}`}>
                    <div className="editorial-accordion-inner">
                      <div className="editorial-accordion-content">
                        {isDrink
                          ? "Double extraction espresso de précision avec micro-mousse soyeuse chauffée à 65°C pour une texture veloutée parfaite."
                          : `Apport calorique estimé : ${product?.calories || 'Fait maison avec des produits frais'}.`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANE 1: Temp & Size */}
            <div className="customizer-step-pane pane-step">
              {hasTemp && (
                <>
                  <div className="customizer-step-header-compact">
                    <h3 className="customizer-step-title">Température</h3>
                  </div>

                  {allowHot && allowCold ? (
                    <div className="customizer-temp-segmented">
                      <span
                        className="customizer-temp-slider-pill"
                        style={{
                          transform: `translate3d(${selectedTemp === 'hot' ? '0%' : '100%'}, 0, 0)`
                        }}
                      />
                      {TEMP_OPTIONS.map((t) => {
                        const isActive = selectedTemp === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            className={`customizer-temp-tab ${isActive ? 'active' : ''}`}
                            onClick={() => setSelectedTemp(t.id)}
                          >
                            <span>{t.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="customizer-single-temp-badge">
                      <span>{selectedTemp === 'cold' ? 'Froid' : 'Chaud'}</span>
                    </div>
                  )}
                </>
              )}

              {/* Size Selection */}
              {allowSize && (
                <>
                  <div className={`customizer-step-header-compact ${hasTemp ? 'customizer-section-gap' : ''}`}>
                    <h3 className="customizer-step-title">Taille</h3>
                  </div>
                  <div className="editorial-size-row">
                    {SIZES.map((s) => {
                      const isActive = selectedSize === s.key;
                      return (
                        <button
                          key={s.key}
                          type="button"
                          className={`editorial-size-pill ${isActive ? 'active' : ''}`}
                          onClick={() => setSelectedSize(s.key)}
                        >
                          <span className="pill-text-content">{s.label}</span>
                          {Number(s?.extra) > 0 && (
                            <span className={`customizer-corner-badge ${isActive ? 'active' : ''}`}>
                              +{s.extra} DH
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Mobile-only: Choix du Lait on Step 1 directly under Taille */}
              {isMobile && allowMilk && (
                <>
                  <div className="customizer-step-header-compact customizer-section-gap">
                    <h3 className="customizer-step-title">Choix du Lait</h3>
                  </div>

                  <div className="editorial-size-row">
                    {MILK_OPTIONS.map((m) => {
                      const isActive = selectedMilk === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          className={`editorial-size-pill ${isActive ? 'active' : ''}`}
                          onClick={() => setSelectedMilk(m.id)}
                        >
                          <span className="pill-text-content">{m.name}</span>
                          {Number(m?.extra) > 0 && (
                            <span className={`customizer-corner-badge ${isActive ? 'active' : ''}`}>
                              +{m.extra} DH
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Desktop-only PANE 2: Choix du Lait */}
            {!isMobile && (
              <div className="customizer-step-pane pane-step">
                {allowMilk && (
                  <>
                    <div className="customizer-step-header-compact">
                      <h3 className="customizer-step-title">Choix du Lait</h3>
                    </div>

                    <div className="editorial-size-row">
                      {MILK_OPTIONS.map((m) => {
                        const isActive = selectedMilk === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            className={`editorial-size-pill ${isActive ? 'active' : ''}`}
                            onClick={() => setSelectedMilk(m.id)}
                          >
                            <span className="pill-text-content">{m.name}</span>
                            {Number(m?.extra) > 0 && (
                              <span className={`customizer-corner-badge ${isActive ? 'active' : ''}`}>
                                +{m.extra} DH
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PANE: Récapitulatif Complet (Step 2 on mobile, Step 3 on desktop) */}
            <div className="customizer-step-pane pane-step">
              <div className="customizer-step-header-compact">
                <h3 className="customizer-step-title">Récapitulatif</h3>
              </div>

              <div className="customizer-recap-card">
                {hasTemp && (
                  <div className="customizer-recap-item">
                    <span className="customizer-recap-key">Température</span>
                    <span className="customizer-recap-val">{currentTempObj?.title}</span>
                  </div>
                )}
                {allowSize && (
                  <div className="customizer-recap-item">
                    <span className="customizer-recap-key">Taille</span>
                    <span className="customizer-recap-val">
                      {currentSizeObj.label} {currentSizeObj.extra > 0 ? `(+${currentSizeObj.extra} DH)` : ''}
                    </span>
                  </div>
                )}
                {allowMilk && (
                  <div className="customizer-recap-item">
                    <span className="customizer-recap-key">Choix du lait</span>
                    <span className="customizer-recap-val">
                      {currentMilkObj.name} {currentMilkObj.extra > 0 ? `(+${currentMilkObj.extra} DH)` : ''}
                    </span>
                  </div>
                )}

                <div className="customizer-recap-divider" />

                <div className="customizer-recap-total-row">
                  <span className="customizer-recap-total-label">Total</span>
                  <span className="customizer-recap-total-price">{currentFinalPrice} DH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STICKY BOTTOM ACTIONS: ALWAYS VISIBLE WITHOUT SCROLLING */}
        <div className="customizer-floating-actions visible">
          <button
            type="button"
            className={`customizer-split-btn-back ${step > 0 ? 'visible' : ''}`}
            onClick={handlePrevStep}
            tabIndex={step > 0 ? 0 : -1}
            aria-hidden={step === 0}
          >
            Retour
          </button>

          <button
            type="button"
            className="customizer-btn-main-action"
            disabled={product?.inStock === false}
            style={{
              opacity: product?.inStock === false ? 0.5 : 1,
              cursor: product?.inStock === false ? 'not-allowed' : 'pointer'
            }}
            onClick={
              step === 0
                ? handlePrimaryClick
                : ((isMobile ? step < 2 : step < 3)
                    ? () => handleNextStep(step + 1)
                    : handleFinalAddToCart)
            }
          >
            <div className="customizer-action-label-wrap">
              <span className={`customizer-action-label ${step === 0 ? 'active' : ''}`}>
                <Plus size={18} />{' '}
                {product?.inStock === false ? 'Temporairement indisponible' : (isCustomizable ? 'Personnaliser la recette' : 'Ajouter au panier')}
              </span>
              <span className={`customizer-action-label ${(isMobile ? step === 1 : (step === 1 || step === 2)) ? 'active' : ''}`}>
                Suivant <ArrowRight size={16} />
              </span>
              <span className={`customizer-action-label ${(isMobile ? step === 2 : step === 3) ? 'active' : ''}`}>
                <Plus size={18} /> Ajouter au panier
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  };

  const sharedTransition = {
    duration: 0.38,
    ease: [0.22, 1, 0.36, 1]
  };

  // ==================== MOBILE RENDERING ====================
  if (isMobile) {
    return (
      <>
        <div
          id={`product-card-${product?.id || title.replace(/\s+/g, '-').toLowerCase()}`}
          role="button"
          tabIndex={0}
          onClick={handleOpenModal}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenModal();
            }
          }}
          className="cursor-pointer relative studio-product-card w-full overflow-hidden rounded-2xl shadow-sm"
        >
          <img
            src={imageSrc}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultImg;
            }}
          />
          {product?.inStock === false && (
            <>
              <div className="absolute inset-0 z-[2] bg-black/30" style={{ backdropFilter: 'grayscale(80%) brightness(0.85)' }} />
              <span className="absolute z-10" style={{ top: '14px', left: '14px', padding: '6px 16px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', border: '2px solid rgba(255,255,255,0.9)', borderRadius: '9999px', backdropFilter: 'blur(6px)', background: 'rgba(255,255,255,0.18)' }}>
                EN RUPTURE
              </span>
            </>
          )}


          <div className="absolute bottom-0 left-0 p-4 w-full">
            <h3 className="studio-card-title text-lg font-bold tracking-tight text-white">{title}</h3>
          </div>
        </div>

        {typeof document !== 'undefined' &&
          (isOpen || isMobileActive) &&
          createPortal(
            <div className={`mobile-css-product-overlay ${isMobileActive ? 'active' : ''}`}>
              <div className="mobile-css-product-backdrop" onClick={handleCloseModal} />
              <div className="mobile-css-product-screen">
                <button
                  className="card-open-close-btn"
                  onClick={handleCloseModal}
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>

                <div className="card-open-media-wrap">
                  <img
                    src={imageSrc}
                    alt={title}
                    className="card-open-img"
                    onError={(e) => {
                      e.currentTarget.src = defaultImg;
                    }}
                  />

                </div>

                <div className="card-open-body">
                  <div style={{ flexShrink: 0, marginBottom: '0.35rem' }}>
                    <h2 className="card-open-title" style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--brand-burgundy-dark, #2b0509)', lineHeight: 1.2, margin: 0 }}>
                      {title}
                    </h2>
                  </div>

                  {renderUnifiedBody()}
                </div>
              </div>
            </div>,
            document.body
          )}
      </>
    );
  }

  // ==================== DESKTOP RENDERING ====================
  return (
    <>
      <motion.div
        id={`product-card-${product?.id || title.replace(/\s+/g, '-').toLowerCase()}`}
        layoutId={layoutId}
        transition={sharedTransition}
        role="button"
        tabIndex={0}
        onClick={handleOpenModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenModal();
          }
        }}
        className="cursor-pointer relative studio-product-card w-full overflow-hidden rounded-2xl group shadow-sm"
        whileHover={!isOpen ? "hover" : undefined}
      >
        <motion.img 
          layoutId={`image-${layoutId}`} 
          src={imageSrc} 
          alt={title}
          className="absolute inset-0 h-full w-full object-cover" 
          variants={{
            hover: { scale: 1.05 }
          }}
          transition={sharedTransition}
          onError={(e) => {
            e.currentTarget.src = defaultImg;
          }}
        />
        {product?.inStock === false && (
          <>
            <div className="absolute inset-0 z-[2] bg-black/30" style={{ backdropFilter: 'grayscale(80%) brightness(0.85)' }} />
            <span className="absolute z-10" style={{ top: '14px', left: '14px', padding: '6px 16px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', border: '2px solid rgba(255,255,255,0.9)', borderRadius: '9999px', backdropFilter: 'blur(6px)', background: 'rgba(255,255,255,0.18)' }}>
              EN RUPTURE
            </span>
          </>
        )}


        <div className="absolute bottom-0 left-0 p-5 sm:p-6 w-full">
          <h3 className="studio-card-title text-lg sm:text-xl font-semibold tracking-tight text-white">{title}</h3>
        </div>
      </motion.div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.28 } }}
                  exit={{ opacity: 0, transition: { duration: 0.32, ease: 'easeOut' } }}
                  onClick={handleCloseModal}
                  className="absolute inset-0 bg-background/80 backdrop-blur-md"
                />
                <motion.div
                  layoutId={layoutId}
                  transition={sharedTransition}
                  onClick={(e) => e.stopPropagation()}
                  className="product-detail-modal-card portrait-modal"
                >
                  {/* Left Side: Photo */}
                  <motion.img 
                    layoutId={`image-${layoutId}`} 
                    transition={sharedTransition}
                    src={imageSrc} 
                    alt={title}
                    className="product-detail-modal-media portrait" 
                  />
                  
                  {/* Right Side: White Content Panel (Enters from right, slides towards photo and disappears on close) */}
                  <motion.div 
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: 0.08, duration: 0.25, ease: [0.22, 1, 0.36, 1] }
                    }}
                    exit={{ 
                      opacity: 0, 
                      x: -30,
                      transition: { duration: 0.15, ease: 'easeIn' }
                    }}
                    className="product-detail-modal-content custom-scrollbar"
                  >
                    <div className="mb-5 sm:mb-6">
                      <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground" style={{ color: 'var(--brand-burgundy-dark, #2b0509)' }}>{title}</h3>
                    </div>

                    <div className="text-foreground/80 text-sm leading-relaxed grow flex flex-col">
                      {renderUnifiedBody()}
                    </div>
                  </motion.div>

                  {/* Close Button: Scales in on open, scales out in reverse on close */}
                  <motion.button 
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.2 } }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseModal();
                    }} 
                    className="product-detail-close-btn"
                    aria-label="Fermer"
                  >
                    <X size={18} />
                  </motion.button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
