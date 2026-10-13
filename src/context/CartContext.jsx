import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('atelier_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [activeOrder, setActiveOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('atelier_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('atelier_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('atelier_active_order', JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem('atelier_active_order');
    }
  }, [activeOrder]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.customKey === item.customKey);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.customKey === item.customKey
            ? { ...i, qty: i.qty + item.qty }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateQty = (id, customKey, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.customKey === customKey) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id, customKey) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.customKey === customKey)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyDiscount = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'STARBUCKS10' || clean === 'LATTE10') {
      setDiscountPercent(10);
      showToast('Code promo **-10%** appliqué avec succès !');
      return true;
    } else if (clean === 'BARISTA20') {
      setDiscountPercent(20);
      showToast('Code VIP Barista **-20%** appliqué !');
      return true;
    } else {
      showToast('Code promo invalide (Essayez **LATTE10**)', 'error');
      return false;
    }
  };

  const checkout = (customerInfo = {}) => {
    if (cart.length === 0) {
      showToast('Votre panier est vide.', 'error');
      return null;
    }

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const estimatedMinutes = 12;
    const createdAt = Date.now();

    const newOrder = {
      orderId,
      items: [...cart],
      customerInfo,
      subtotal: rawSubtotal,
      discount: discountAmount,
      total: finalTotal,
      createdAt,
      readyAt: createdAt + estimatedMinutes * 60 * 1000,
      status: 'preparing' // 'received' -> 'preparing' -> 'ready'
    };

    setActiveOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    showToast(`Commande **#${orderId}** validée ! Retrait estimé dans ${estimatedMinutes} min.`);
    return orderId;
  };

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        totalCount,
        rawSubtotal,
        discountPercent,
        discountAmount,
        finalTotal,
        discountCode,
        setDiscountCode,
        applyDiscount,
        checkout,
        activeOrder,
        setActiveOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
