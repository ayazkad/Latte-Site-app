import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const SwipeableCartItem = ({ item, removeFromCart, onDelete }) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);
  const currentOffsetX = React.useRef(0);
  const isHorizontalSwipe = React.useRef(null);

  const defaultImg = '/assets/images/hero_latte.jpg';
  const itemImg = item.image || defaultImg;

  const handleDelete = (e) => {
    if (e) e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    setOffsetX(0);
    if (onDelete) {
      onDelete(item);
    } else {
      setTimeout(() => {
        removeFromCart(item.id, item.customKey);
      }, 750);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    currentOffsetX.current = 0;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipe.current) {
      if (deltaX < 0) {
        currentOffsetX.current = deltaX;
        setOffsetX(deltaX);
      } else {
        currentOffsetX.current = Math.min(10, deltaX * 0.2);
        setOffsetX(currentOffsetX.current);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartX.current = 0;

    if (currentOffsetX.current < -80) {
      handleDelete();
    } else {
      setOffsetX(0);
    }
    currentOffsetX.current = 0;
  };

  return (
    <div className={`cart-item-swipe-container ${isDeleting ? 'deleting' : ''}`}>
      {/* Background delete action that reveals when swiping left */}
      <div
        className="cart-item-delete-backdrop"
        style={{
          opacity: isDeleting ? 0 : Math.min(1, Math.max(0, -offsetX / 50))
        }}
        onClick={handleDelete}
      >
        <Trash2 size={20} color="#ffffff" />
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>Supprimer</span>
      </div>

      {/* Foreground item card */}
      <div
        className={`cart-item ${isDeleting ? 'deleting-slide-left' : ''}`}
        style={{
          transform: isDeleting ? 'translate3d(-125%, 0, 0)' : `translate3d(${offsetX}px, 0, 0)`,
          transition: isDragging ? 'none' : 'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1), opacity 0.65s cubic-bezier(0.25, 1, 0.35, 1)',
          willChange: isDragging ? 'transform' : 'auto'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className="cart-item-media">
          <img
            src={itemImg}
            alt={item.name}
            className="cart-item-thumb"
            onError={(e) => {
              e.currentTarget.src = defaultImg;
            }}
          />
          {item.qty > 1 && <span className="cart-item-qty-badge">×{item.qty}</span>}
        </div>

        <div className="cart-item-info">
          <h5>{item.name}</h5>
          {item.customDetails && (
            <p className="cart-item-custom-detail">
              {item.customDetails}
            </p>
          )}
        </div>

        <div className="cart-item-actions-col">
          <div className="cart-item-price-col">
            <span className="cart-item-total-price">{item.price * item.qty} DH</span>
          </div>
          <button
            type="button"
            className="cart-item-delete-btn"
            onClick={handleDelete}
            title="Supprimer du panier"
            aria-label={`Supprimer ${item.name}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    removeFromCart,
    rawSubtotal,
    discountAmount,
    finalTotal,
    discountPercent,
    applyDiscount,
    checkout
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [pickupNote, setPickupNote] = useState('');
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));
  const [isFooterSlidingDown, setIsFooterSlidingDown] = useState(false);
  const navigate = useNavigate();

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
    if (isCartOpen) {
      document.body.classList.add('cart-open');
      document.documentElement.classList.add('cart-open');
    } else {
      document.body.classList.remove('cart-open');
      document.documentElement.classList.remove('cart-open');
    }
    return () => {
      document.body.classList.remove('cart-open');
      document.documentElement.classList.remove('cart-open');
    };
  }, [isCartOpen]);

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
      navigate('/order-tracking');
    }
  };

  // MOBILE: Handled by MobileFloatingCart with ExpandableScreen
  if (isMobile) {
    return null;
  }

  // DESKTOP: Classic side drawer
  return (
    <>
      <div
        className={`cart-drawer-overlay ${isCartOpen ? 'active' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />
      <aside className={`cart-drawer ${isCartOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="var(--sb-green)" />
            <h3>Votre Panier</h3>
          </div>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)} aria-label="Fermer">
            <X size={22} />
          </button>
        </div>

        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={48} />
              <h4>Votre panier est vide</h4>
              <p style={{ fontSize: '0.88rem', marginTop: '0.5rem' }}>
                Découvrez notre carte et ajoutez vos cafés de spécialité ou douceurs préférées.
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
            {/* Promo Code Box */}
            <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
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
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                Appliquer
              </button>
            </form>

            {/* Quick Customer Name for Click & Collect */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Votre prénom pour le retrait (ex. Karim)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}
              />
            </div>

            {/* Price breakdown */}
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Sous-total</span>
              <span>{rawSubtotal} DH</span>
            </div>

            {discountPercent > 0 && (
              <div style={{ fontSize: '0.88rem', color: 'var(--sb-green)', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Remise ({discountPercent}%)</span>
                <span>-{discountAmount} DH</span>
              </div>
            )}

            <div className="cart-subtotal" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span>Total à régler</span>
              <span>{finalTotal} DH</span>
            </div>

            <button
              className="btn btn-primary"
              id="checkoutBtn"
              style={{ width: '100%' }}
              onClick={handleCheckout}
            >
              <span>Valider le Click & Collect</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
