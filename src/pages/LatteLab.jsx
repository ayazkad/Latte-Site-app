import React, { useState } from 'react';
import { Sparkles, Plus, Check, RefreshCw } from 'lucide-react';
import { customizerOptions } from '../data/products';
import { useCart } from '../context/CartContext';

export const LatteLab = () => {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(customizerOptions.sizes[1]); // Grande
  const [selectedBase, setSelectedBase] = useState(customizerOptions.bases[0]); // Ethiopia
  const [selectedMilk, setSelectedMilk] = useState(customizerOptions.milks[0]); // Oat
  const [selectedSyrup, setSelectedSyrup] = useState(customizerOptions.syrups[0]); // None
  const [selectedTemp, setSelectedTemp] = useState(customizerOptions.temps[0]); // Hot

  const baseDrinkPrice = 35;
  const totalPrice =
    baseDrinkPrice +
    selectedSize.price +
    selectedBase.price +
    selectedMilk.price +
    selectedSyrup.price;

  // Custom Drink Naming logic
  let drinkTitle = 'Latte Création ';
  if (selectedBase.type === 'matcha') drinkTitle = 'Matcha Latte ';
  else if (selectedBase.type === 'chai') drinkTitle = 'Chai Latte ';
  else drinkTitle += selectedMilk.name.replace('Lait d\'', '').replace('Lait ', '');

  if (selectedTemp.isCold) drinkTitle = 'Iced ' + drinkTitle;

  const handleAddCustomToCart = () => {
    const customKey = `${selectedSize.id}-${selectedBase.id}-${selectedMilk.id}-${selectedSyrup.id}-${selectedTemp.id}`;
    const customDetails = `${selectedSize.name} • ${selectedBase.name} • ${selectedMilk.name} • ${selectedSyrup.name} • ${selectedTemp.name}`;

    addToCart({
      id: 'custom-drink',
      customKey,
      name: drinkTitle,
      customDetails,
      price: totalPrice,
      qty: 1
    });
  };

  return (
    <div className="latte-lab-page">
      {/* Header */}
      <header className="page-header">
        <div className="container">
          <span className="badge-tag">
            <Sparkles size={14} /> Atelier Sur-Mesure
          </span>
          <h1 className="page-title">Le Latte Lab</h1>
          <p className="page-desc">
            Composez la création barista qui correspond à vos envies du moment. Chaque ingrédient est dosé au gramme près pour une texture soyeuse.
          </p>
        </div>
      </header>

      {/* Customizer */}
      <section className="customizer-section">
        <div className="container customizer-grid">
          {/* Controls column */}
          <div className="customizer-controls">
            {/* 1. Size */}
            <div className="config-group">
              <div className="config-group-title">1. Format de Tasse</div>
              <div className="options-row">
                {customizerOptions.sizes.map((s) => (
                  <button
                    key={s.id}
                    className={`option-btn ${selectedSize.id === s.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s.name} {s.price > 0 && `(+${s.price} DH)`}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Base & Roast */}
            <div className="config-group">
              <div className="config-group-title">2. Base Café ou Infusion</div>
              <div className="options-row">
                {customizerOptions.bases.map((b) => (
                  <button
                    key={b.id}
                    className={`option-btn ${selectedBase.id === b.id ? 'selected' : ''}`}
                    onClick={() => setSelectedBase(b)}
                  >
                    <span>{b.name}</span>
                    {b.price > 0 && <span>(+{b.price} DH)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Milk */}
            <div className="config-group">
              <div className="config-group-title">3. Choix du Lait & Émulsion</div>
              <div className="options-row">
                {customizerOptions.milks.map((m) => (
                  <button
                    key={m.id}
                    className={`option-btn ${selectedMilk.id === m.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMilk(m)}
                  >
                    <span>{m.name}</span>
                    {m.price > 0 && <span>(+{m.price} DH)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Syrup */}
            <div className="config-group">
              <div className="config-group-title">4. Sirop & Arôme Fait Maison</div>
              <div className="options-row">
                {customizerOptions.syrups.map((sy) => (
                  <button
                    key={sy.id}
                    className={`option-btn ${selectedSyrup.id === sy.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSyrup(sy)}
                  >
                    <span>{sy.name}</span>
                    {sy.price > 0 && <span>(+{sy.price} DH)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Temperature */}
            <div className="config-group">
              <div className="config-group-title">5. Température</div>
              <div className="options-row">
                {customizerOptions.temps.map((t) => (
                  <button
                    key={t.id}
                    className={`option-btn ${selectedTemp.id === t.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTemp(t)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Preview column */}
          <div className="customizer-preview-box">
            <span className="badge-tag" style={{ marginBottom: '1.5rem' }}>
              Rendu Visuel en Direct
            </span>

            <div className="cup-visual-wrapper">
              <div className="cup-steam">
                {selectedTemp.isCold ? '🧊' : '💨'}
              </div>

              <div
                className="cup-graphic"
                style={{
                  transform: `scale(${selectedSize.scale})`,
                  transition: 'transform 0.3s ease'
                }}
              >
                {/* Base Layer */}
                <div
                  className="cup-layer-base"
                  style={{ background: selectedBase.color }}
                />
                {/* Milk Layer */}
                <div
                  className="cup-layer-milk"
                  style={{
                    backgroundColor: selectedMilk.color,
                    opacity: 0.95
                  }}
                />
                {/* Foam Layer */}
                <div className="cup-layer-foam">
                  {selectedBase.type === 'matcha' ? '🍵' : '🌿'}
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-burgundy-dark)', marginBottom: '0.4rem' }}>
              {drinkTitle}
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {selectedSize.name} • {selectedBase.name} • {selectedMilk.name} • {selectedSyrup.name}
            </p>

            <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontWeight: 700 }}>
                <span>Prix de votre recette :</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-burgundy)' }}>
                  {totalPrice} DH
                </span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleAddCustomToCart}
              >
                <Plus size={18} />
                <span>Ajouter Cette Création au Panier</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
