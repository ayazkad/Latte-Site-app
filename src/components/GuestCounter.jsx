import React from 'react';
import { Minus, Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export const GuestCounter = ({ value, onChange, min = 1, max = 10, id = 'resGuests' }) => {
  const count = parseInt(value, 10) || 1;

  const handleDecrement = (e) => {
    e.preventDefault();
    if (count > min) {
      onChange(String(count - 1));
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    if (count < max) {
      onChange(String(count + 1));
    }
  };

  return (
    <div className="guest-counter-control" id={id}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        className="guest-counter-btn"
        onClick={handleDecrement}
        disabled={count <= min}
        aria-label="Diminuer le nombre d'invités"
      >
        <Minus size={15} />
      </motion.button>

      <div className="guest-counter-display">
        <Users size={16} className="guest-counter-icon" />
        <span className="guest-counter-label">
          <strong>{count}</strong> {count > 1 ? 'Personnes' : 'Personne'} {count >= 5 ? '• Salon' : ''}
        </span>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        className="guest-counter-btn"
        onClick={handleIncrement}
        disabled={count >= max}
        aria-label="Augmenter le nombre d'invités"
      >
        <Plus size={15} />
      </motion.button>
    </div>
  );
};
