import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AnimatedDropdown = ({
  options = [],
  value,
  onChange,
  icon: Icon,
  placeholder = 'Sélectionner',
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`animated-dropdown-wrapper ${isOpen ? 'open' : ''}`} ref={containerRef} id={id}>
      {/* Trigger Button: In-flow, never pushes or expands the form */}
      <button
        type="button"
        className="animated-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="animated-dropdown-trigger-left">
          {Icon && <Icon size={16} className="dropdown-leading-icon" />}
          <span className="dropdown-selected-label">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="dropdown-chevron-box"
        >
          <ChevronDown size={17} />
        </motion.div>
      </button>

      {/* Floating Popover: Passes OVER everything with high z-index without pushing form fields */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown-popover"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="animated-dropdown-popover"
          >
            <div className="animated-dropdown-menu-inner">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`animated-dropdown-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    <span className="dropdown-item-text">{opt.label}</span>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="dropdown-item-check"
                      >
                        <Check size={15} />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
