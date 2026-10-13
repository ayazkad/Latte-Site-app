import React, { useState } from 'react';
import { Camera, Volume2, VolumeX, Maximize2, X, Music } from 'lucide-react';

export const Ambiance = () => {
  const [activePhoto, setActivePhoto] = useState(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const galleryItems = [
    {
      id: 1,
      title: "L'Art du Latte Signature",
      subtitle: 'Chaque tasse est une création unique réalisée à la main',
      image: '/assets/images/hero_latte.jpg'
    },
    {
      id: 2,
      title: 'Pâtisseries & Buns Artisanaux',
      subtitle: 'Croissants pur beurre feuilletés et brioches cardamome suédoises',
      image: '/assets/images/pastries.jpg'
    },
    {
      id: 3,
      title: 'Fraîcheur & Élégance',
      subtitle: 'Cold brew infusé 18h et thés glacés de saison',
      image: '/assets/images/iced_drinks.jpg'
    },
    {
      id: 4,
      title: 'Atmosphère Cosy & Moderne',
      subtitle: 'Un havre de paix épuré au cœur de la ville',
      image: '/assets/images/ambiance.jpg'
    }
  ];

  return (
    <div className="ambiance-page">
      {/* Header */}
      <header className="page-header">
        <div className="container">
          <h1 className="page-title">L'Expérience Latte</h1>
          <p className="page-desc">
            Un cadre épuré pensé pour savourer le temps, travailler au calme avec prises individuelles ou partager un moment convivial.
          </p>
        </div>
      </header>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          {/* Sound & Atmosphere Player Box */}
          <div
            style={{
              backgroundColor: 'var(--brand-cream)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.5rem 2rem',
              marginBottom: '3.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-burgundy)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Music size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, color: 'var(--brand-burgundy-dark)', fontSize: '1rem' }}>
                  Café Vibe & Bossa Nova Barista
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Immergez-vous dans l'ambiance sonore feutrée de notre coffee shop à Casablanca.
                </p>
              </div>
            </div>

            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem' }}
              onClick={() => setIsPlayingSound(!isPlayingSound)}
            >
              {isPlayingSound ? (
                <>
                  <Volume2 size={18} color="var(--brand-burgundy)" />
                  <span>Ambiance Sonore Active</span>
                </>
              ) : (
                <>
                  <VolumeX size={18} />
                  <span>Activer l'ambiance sonore</span>
                </>
              )}
            </button>
          </div>

          {/* Grid */}
          <div className="gallery-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {galleryItems.map((item) => (
              <div
                className="gallery-card"
                key={item.id}
                onClick={() => setActivePhoto(item)}
                title="Cliquer pour agrandir"
              >
                <img src={item.image} alt={item.title} />
                <div className="gallery-overlay">
                  <h4>{item.title}</h4>
                  <p>{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(43, 5, 9, 0.85)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setActivePhoto(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '850px',
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <X size={20} color="var(--brand-burgundy-dark)" />
            </button>

            <img
              src={activePhoto.image}
              alt={activePhoto.title}
              style={{ width: '100%', maxHeight: '550px', objectFit: 'cover' }}
            />

            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-burgundy-dark)', marginBottom: '0.3rem' }}>
                {activePhoto.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{activePhoto.subtitle}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
