import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpandableScreenContext = createContext(null);

export const useExpandableScreen = () => {
  const context = useContext(ExpandableScreenContext);
  if (!context) {
    throw new Error('useExpandableScreen must be used within an ExpandableScreen');
  }
  return context;
};

export const ExpandableScreen = ({
  children,
  layoutId = 'cta-card',
  triggerRadius = '100px',
  contentRadius = '24px',
  animationDuration = 0.3,
  isExpanded: controlledExpanded,
  onExpandChange,
  className = ''
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const setExpanded = (value) => {
    if (onExpandChange) onExpandChange(value);
    if (controlledExpanded === undefined) setInternalExpanded(value);
  };

  useEffect(() => {
    if (isExpanded) {
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
  }, [isExpanded]);

  return (
    <ExpandableScreenContext.Provider
      value={{
        isExpanded,
        setExpanded,
        layoutId,
        triggerRadius,
        contentRadius,
        animationDuration
      }}
    >
      <div className={`expandable-screen-root ${className}`}>
        {children}
      </div>
    </ExpandableScreenContext.Provider>
  );
};

export const ExpandableScreenTrigger = ({ children, className = '' }) => {
  const { isExpanded, setExpanded, layoutId, triggerRadius, animationDuration } = useExpandableScreen();

  return (
    <AnimatePresence>
      {!isExpanded && (
        <motion.div
          layoutId={layoutId}
          onClick={() => setExpanded(true)}
          style={{ borderRadius: triggerRadius, cursor: 'pointer' }}
          className={`expandable-screen-trigger ${className}`}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: animationDuration
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ExpandableScreenContent = ({
  children,
  className = '',
  overlayClassName = '',
  onClose
}) => {
  const { isExpanded, setExpanded, layoutId, contentRadius, animationDuration } = useExpandableScreen();

  const handleClose = () => {
    if (onClose) onClose();
    setExpanded(false);
  };

  return (
    <AnimatePresence>
      {isExpanded && (
        <div className={`expandable-screen-overlay-wrapper ${overlayClassName}`}>
          <motion.div
            className="expandable-screen-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration }}
            onClick={handleClose}
          />
          <div className="expandable-screen-container" onClick={handleClose}>
            <motion.div
              layoutId={layoutId}
              style={{ borderRadius: contentRadius }}
              onClick={(e) => e.stopPropagation()}
              className={`expandable-screen-content-card ${className}`}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: animationDuration
              }}
            >
              <motion.div
                className="expandable-screen-inner"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
