import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpandableProfileCard({
  imageSrc = "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1000",
  title = "Jane Doe",
  subtitle = "Senior UX Designer",
  content
}) {
  const [isOpen, setIsOpen] = useState(false);
  const layoutId = `expandable-profile-card-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <>
      <motion.div
        layoutId={layoutId}
        onClick={() => setIsOpen(true)}
        className="cursor-pointer relative h-64 w-full overflow-hidden rounded-xl border border-border group shadow-sm"
        style={{ cursor: 'pointer' }}
        whileHover="hover"
      >
        <motion.img 
          layoutId={`image-${layoutId}`} 
          src={imageSrc} 
          className="absolute inset-0 h-full w-full object-cover" 
          variants={{
            hover: { scale: 1.05 }
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute bottom-0 left-0 p-5 sm:p-6 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <motion.p layoutId={`subtitle-${layoutId}`} className="text-primary text-xs font-medium tracking-wide uppercase mb-1.5">{subtitle}</motion.p>
          <motion.h3 layoutId={`title-${layoutId}`} className="text-lg sm:text-xl font-semibold tracking-tight text-white">{title}</motion.h3>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              layoutId={layoutId}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl h-[80vh] bg-white rounded-2xl overflow-hidden border border-gray-100 z-10 flex flex-col md:flex-row shadow-2xl"
            >
              <button 
                onClick={() => setIsOpen(false)} 
                className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center bg-black/10 hover:bg-black/20 rounded-full border border-white/20 text-gray-800 transition-colors backdrop-blur-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              
              <div className="relative h-64 w-full shrink-0 overflow-hidden md:h-full md:w-1/2">
                <motion.img 
                  layoutId={`image-${layoutId}`} 
                  src={imageSrc} 
                  className="h-full w-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
              </div>
              
              <div className="p-6 sm:p-8 w-full md:w-1/2 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <motion.p layoutId={`subtitle-${layoutId}`} className="text-primary text-xs font-medium tracking-wide uppercase mb-3">{subtitle}</motion.p>
                <motion.h3 layoutId={`title-${layoutId}`} className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 mb-6 pb-4 border-b border-gray-100">{title}</motion.h3>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: 0.2, duration: 0.35 }}
                  className="text-gray-700 text-sm leading-relaxed grow"
                >
                  {content || (
                    <div className="flex flex-col gap-6">
                      <p>Description détaillée du produit ou profil avec un aperçu complet de ses caractéristiques d'exception.</p>
                      
                      <div>
                        <h4 className="text-gray-900 font-semibold tracking-tight mb-2">Détails & Spécificités</h4>
                        <p className="text-gray-500">Sélection raffinée, ingrédients nobles et préparation soignée.</p>
                      </div>

                      <button 
                        onClick={() => setIsOpen(false)}
                        className="mt-4 px-5 py-2.5 bg-[#820b17] text-white font-medium rounded-lg hover:opacity-90 transition-opacity self-start shadow-sm"
                      >
                        Fermer
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
