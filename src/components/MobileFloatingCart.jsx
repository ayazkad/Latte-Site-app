import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SwipeableCartItem } from './CartDrawer';

export const MobileFloatingCart = () => {
  const {
    cart,
    totalCount,
    rawSubtotal,
    discountPercent,
    discountAmount,
    finalTotal,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    applyDiscount,
    checkout
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [pickupNote, setPickupNote] = useState('');
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));
  const location = useLocation();
  const navigate = useNavigate();

  const [isFooterSlidingDown, setIsFooterSlidingDown] = useState(false);

  const handleItemDelete = (itemToDelete) => {
    if (cart.length <= 1) {
      setIsFooterSlidingDown(true);
    }
    setTimeout(() => {
      removeFromCart(itemToDelete.id, itemToDelete.customKey);
      setIsFooterSlidingDown(false);
    }, 750);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }

    if (isMobile && isCartOpen) {
      metaTheme.setAttribute('content', '#ffffff');
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsCartOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        metaTheme.setAttribute('content', '#FAF7F2');
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      metaTheme.setAttribute('content', '#FAF7F2');
      if (isMobile) {
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
      }
    }
  }, [isMobile, isCartOpen, setIsCartOpen]);

  if (!isMobile || location.pathname === '/admin') {
    return null;
  }

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput) {
      applyDiscount(promoInput);
      setPromoInput('');
    }
  };

  const handleCheckout = () => {
    const orderId = checkout({ name: customerName || 'Client Gourmet', note: pickupNote });
    if (orderId) {
      setIsCartOpen(false);
      navigate('/order-tracking');
    }
  };

  return (
    <>
      {/* Pure CSS Floating Bottom Trigger Pill */}
      {totalCount > 0 && (
        <div className={`mobile-floating-cart-wrap ${isCartOpen ? 'cart-is-active' : ''}`}>
          <button
            type="button"
            className="mobile-floating-cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Voir le panier"
          >
            <span className="floating-cart-label">VOIR LE PANIER</span>
            <span className="floating-cart-badge">{totalCount}</span>
          </button>
        </div>
      )}

      {/* Pure CSS Hardware-Accelerated 120 FPS Mobile Cart Screen */}
      <div className={`mobile-css-cart-overlay ${isCartOpen ? 'active' : ''}`}>
        <div className="mobile-css-cart-backdrop" onClick={() => setIsCartOpen(false)} />
        <div className="mobile-css-cart-screen">
          <div className="cart-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShoppingBag size={20} color="var(--brand-burgundy)" />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Votre Panier</h3>
            </div>
            <button
              className="cart-close-btn"
              onClick={() => setIsCartOpen(false)}
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="cart-items-list">
            {cart.length === 0 ? (
              <div className="cart-empty-state">
                <ShoppingBag size={44} />
                <h4>Votre panier est vide</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                  Découvrez notre carte et ajoutez vos créations préférées.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <SwipeableCartItem
                  key={item.id + (item.customKey || '')}
                  item={item}
                  removeFromCart={removeFromCart}
                  onDelete={handleItemDelete}
                />
              ))
            )}
          </div>

          {(cart.length > 0 || isFooterSlidingDown) && (
            <div className={`cart-footer ${isFooterSlidingDown ? 'sliding-down' : ''}`}>
              <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <input
                  type="text"
                  placeholder="Code promo (ex. LATTE10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
                >
                  Appliquer
                </button>
              </form>

              <div style={{ marginBottom: '0.65rem' }}>
                <input
                  type="text"
                  placeholder="Votre prénom pour le retrait (ex. Karim)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}
                />
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Sous-total</span>
                <span>{rawSubtotal} DH</span>
              </div>

              {discountPercent > 0 && (
                <div style={{ fontSize: '0.85rem', color: 'var(--brand-burgundy)', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Remise ({discountPercent}%)</span>
                  <span>-{discountAmount} DH</span>
                </div>
              )}

              <div className="cart-subtotal" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.55rem', marginTop: '0.35rem' }}>
                <span>Total à régler</span>
                <span>{finalTotal} DH</span>
              </div>

              <button
                className="btn btn-primary"
                id="checkoutBtn"
                style={{ width: '100%', marginTop: '0.45rem', padding: '0.85rem 1.2rem', borderRadius: '12px' }}
                onClick={handleCheckout}
              >
                <span>Valider le Click & Collect</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
