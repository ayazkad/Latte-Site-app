import React from 'react';

export const Story = () => {
  return (
    <div className="story-page">
      {/* Header */}
      <header className="page-header">
        <div className="container">
          <h1 className="page-title">Notre Vision & Philosophie</h1>
          <p className="page-desc">
            L'art de sélectionner et sublimer les plus grands terroirs de café de spécialité dans un nouveau concept chaleureux au cœur de Casablanca.
          </p>
        </div>
      </header>

      {/* Story Section */}
      <section className="story-section">
        <div className="container story-grid">
          <div className="story-images">
            <div className="story-img-main">
              <img src="/assets/images/ambiance.jpg" alt="Ambiance chaleureuse et raffinée du coffee shop" />
            </div>
          </div>

          <div className="story-content">
            <div className="section-header">
              <h2 className="section-title">La passion du café d'exception</h2>
            </div>

            <p style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Chez <strong>Latte</strong>, chaque tasse est pensée comme une parenthèse gourmande. Nous sélectionnons avec le plus grand soin des cafés de spécialité 100% Arabica réputés pour leurs profils aromatiques uniques.
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Notre approche marie la précision de l'extraction espresso et la délicatesse artistique du barista afin d'offrir une texture soyeuse et des saveurs équilibrées.
            </p>

            <div className="story-features">
              <div className="feature-box">
                <h4>Sélection des Grains</h4>
                <p>Grains de spécialité rigoureusement choisis parmi les meilleurs terroirs.</p>
              </div>

              <div className="feature-box">
                <h4>Laits Végétaux & Crèmes</h4>
                <p>Lait d'avoine barista crémeux, amande et noix de coco artisanale.</p>
              </div>

              <div className="feature-box">
                <h4>Fait Maison & Frais</h4>
                <p>Pâtisseries et gourmandises cuites chaque matin sur place.</p>
              </div>

              <div className="feature-box">
                <h4>Latte Art & Barista</h4>
                <p>Textures soyeuses, micro-mousses précises et latte art soigné en tasse.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
