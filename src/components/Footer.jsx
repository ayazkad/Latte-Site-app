import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Instagram, Twitter, Facebook } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      showToast('Bienvenue dans le **Club Privé Latte** !');
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo-wrap" title="Latte Atelier">
            <img
              src="/assets/images/logo.png"
              alt="Latte"
              className="footer-logo-img"
            />
          </Link>
          <p>L'excellence du café de spécialité et l'art de vivre moderne réunis dans un espace chaleureux et raffiné.</p>
        </div>

        <div>
          <h4 className="footer-title">Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/story">Notre Histoire</Link></li>
            <li><Link to="/menu">La Carte</Link></li>
            <li><Link to="/reservation">Réservations</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-title">Spécialités</h4>
          <ul className="footer-links">
            <li><Link to="/menu">Swan Latte Art</Link></li>
            <li><Link to="/menu">Cold Brew Éthiopie</Link></li>
            <li><Link to="/menu">Matcha Cérémonial Uji</Link></li>
            <li><Link to="/menu">Cardamome Buns</Link></li>
            <li><Link to="/menu">Brunch Gourmet</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-title">Rejoignez le Club</h4>
          <p className="newsletter-desc">Recevez nos invitations exclusives et découvrez nos arrivages de cafés rares.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary newsletter-submit-btn" aria-label="S'inscrire">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <div>© 2026 Latte • Gauthier, Casablanca (Maroc). Tous droits réservés.</div>
        <div className="footer-socials">
          <a href="#instagram" aria-label="Instagram"><Instagram size={20} /></a>
          <a href="#twitter" aria-label="Twitter"><Twitter size={20} /></a>
          <a href="#facebook" aria-label="Facebook"><Facebook size={20} /></a>
        </div>
      </div>
    </footer>
  );
};
