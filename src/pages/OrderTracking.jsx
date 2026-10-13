import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, ShoppingBag, ArrowLeft, Coffee, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const OrderTracking = () => {
  const { activeOrder, setActiveOrder } = useCart();
  const [timeLeft, setTimeLeft] = useState(12 * 60);

  useEffect(() => {
    if (!activeOrder) return;

    const interval = setInterval(() => {
      const remainingMs = activeOrder.readyAt - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeft(remainingSec);

      if (remainingSec === 0 && activeOrder.status !== 'ready') {
        setActiveOrder((prev) => (prev ? { ...prev, status: 'ready' } : null));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder, setActiveOrder]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!activeOrder) {
    return (
      <div className="order-tracking-page">
        <header className="page-header">
          <div className="container">
            <h1 className="page-title">Suivi de Commande</h1>
            <p className="page-desc">Aucune commande en cours pour le moment.</p>
          </div>
        </header>
        <section style={{ padding: '5rem 0', textAlign: 'center' }}>
          <div className="container">
            <ShoppingBag size={56} style={{ color: 'var(--brand-burgundy)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--brand-burgundy-dark)', marginBottom: '0.5rem' }}>
              Prêt pour une pause café d'exception ?
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Explorez notre carte et passez votre commande Click & Collect en 1 clic.
            </p>
            <Link to="/menu" className="btn btn-primary">
              Découvrir la Carte
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const isReady = activeOrder.status === 'ready' || timeLeft === 0;

  return (
    <div className="order-tracking-page">
      <header className="page-header">
        <div className="container">
          <h1 className="page-title">Commande #{activeOrder.orderId}</h1>
          <p className="page-desc">
            Votre commande est actuellement prise en charge par notre barista à l'Atelier.
          </p>
        </div>
      </header>

      <section style={{ padding: '5rem 0', backgroundColor: 'var(--brand-cream)' }}>
        <div className="container" style={{ maxWidth: '750px' }}>
          {/* Status Tracker Box */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '20px',
              padding: '2.5rem',
              border: '1px solid var(--border-color)',
              boxShadow: '0 10px 30px rgba(43, 5, 9, 0.05)',
              marginBottom: '2rem'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {isReady ? (
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-rose-subtle)',
                    color: 'var(--brand-burgundy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}
                >
                  <CheckCircle2 size={40} />
                </div>
              ) : (
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-rose-subtle)',
                    color: 'var(--brand-burgundy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    animation: 'pulseDot 2s infinite'
                  }}
                >
                  <Coffee size={36} />
                </div>
              )}

              <h2 style={{ fontSize: '1.8rem', color: 'var(--brand-burgundy-dark)', marginBottom: '0.4rem' }}>
                {isReady ? '🎉 Votre commande est prête au comptoir !' : '☕ Votre barista prépare votre boisson...'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {isReady
                  ? 'Présentez ce reçu au comptoir pour retirer vos créations fraîches.'
                  : `Temps d'attente estimé : ${minutes} min ${seconds < 10 ? '0' : ''}${seconds} s`}
              </p>
            </div>

            {/* Progress steps */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--brand-rose-subtle)', color: 'var(--brand-burgundy)', fontWeight: 700, fontSize: '0.85rem' }}>
                1. Reçue ✓
              </div>
              <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: isReady ? 'var(--brand-rose-subtle)' : 'var(--brand-burgundy)', color: isReady ? 'var(--brand-burgundy)' : '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                2. En préparation ☕
              </div>
              <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: isReady ? 'var(--brand-burgundy)' : 'var(--brand-cream)', color: isReady ? '#fff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>
                3. Prête au comptoir ✨
              </div>
            </div>

            {/* Order Items Recap */}
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-burgundy-dark)', marginBottom: '1rem' }}>
              Détail des créations :
            </h4>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              {activeOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 0',
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '0.92rem'
                  }}
                >
                  <div>
                    <strong>{item.qty}× {item.name}</strong>
                    {item.customDetails && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--brand-burgundy)' }}>{item.customDetails}</p>
                    )}
                  </div>
                  <strong>{item.price * item.qty} DH</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-burgundy-dark)' }}>
              <span>Total réglé :</span>
              <span style={{ color: 'var(--brand-burgundy)' }}>{activeOrder.total} DH</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/menu" className="btn btn-secondary" style={{ marginRight: '1rem' }}>
              <ArrowLeft size={16} /> Revenir à la carte
            </Link>
            <button
              className="btn btn-primary"
              onClick={() => {
                setActiveOrder(null);
              }}
            >
              Terminer la commande
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
