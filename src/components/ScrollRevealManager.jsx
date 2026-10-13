import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollRevealManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    let observer = null;
    let mutationObserver = null;

    const targetSelectors = [
      '.hero-split-grid',
      '.hero-split-media',
      '.hero-split-content',
      '.studio-product-card',
      '.teaser-card',
      '.menu-item-card',
      '.card-item-wrapper',
      '.feature-box',
      '.gallery-card',
      '.booking-form-box',
      '.hours-info-card',
      '.section-title',
      '.section-header',
      '.page-header',
      '.story-grid',
      '.story-images',
      '.story-content',
      '.customizer-grid',
      '.reservation-grid',
      '.menu-category-section',
      '.order-tracking-card',
      '.order-tracking-box',
      '.home-teasers-section',
      '.wifi-card'
    ];

    const selectorString = targetSelectors.join(', ');

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(selectorString).forEach((el) => {
        el.classList.add('reveal-on-scroll', 'is-revealed');
      });
      return;
    }

    const handleIntersect = (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    };

    observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.04,
      rootMargin: '0px 0px -30px 0px'
    });

    const initReveal = () => {
      const elements = document.querySelectorAll(selectorString);
      if (!elements || elements.length === 0) return;

      const staggerDelay = 0.1;

      elements.forEach((el) => {
        if (!el.classList.contains('reveal-on-scroll')) {
          el.classList.add('reveal-on-scroll');
        }

        // Stagger child elements inside grids and containers for a cascading wave effect
        const parentGrid = el.closest(
          '.studio-products-grid, .menu-grid, .story-features, .gallery-grid, .teasers-grid, .featured-slider-track, .hero-split-grid, .story-grid, .customizer-grid, .reservation-grid'
        );
        if (parentGrid && !el.style.transitionDelay) {
          const siblings = Array.from(parentGrid.children);
          const itemIndex = siblings.indexOf(el);
          if (itemIndex >= 0) {
            const cappedIndex = Math.min(itemIndex, 8);
            el.style.transitionDelay = `${cappedIndex * staggerDelay}s`;
          }
        }

        if (!el.classList.contains('is-revealed')) {
          observer.observe(el);
        }
      });
    };

    // Initial setup with requestAnimationFrame for smooth first paint
    requestAnimationFrame(() => {
      initReveal();
    });

    const t1 = setTimeout(initReveal, 100);
    const t2 = setTimeout(initReveal, 350);

    // Watch for dynamic DOM changes (e.g. category switching, search filtering)
    mutationObserver = new MutationObserver(() => {
      initReveal();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
};


