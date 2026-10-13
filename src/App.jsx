import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { MobileFloatingCart } from './components/MobileFloatingCart';
import { ToastContainer } from './components/Toast';
import { ScrollRevealManager } from './components/ScrollRevealManager';

import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Story } from './pages/Story';
import { Reservation } from './pages/Reservation';
import { OrderTracking } from './pages/OrderTracking';
import { AdminDashboard } from './pages/AdminDashboard';

// Helper component to scroll to top only on actual route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  return null;
};

// Animated route transitions with fade effect
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition-fade">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/story" element={<Story />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <ProductProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <ScrollRevealManager />
            <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <AnimatedRoutes />
              </main>
              <CartDrawer />
              <MobileFloatingCart />
              <ToastContainer />
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </ProductProvider>
    </ToastProvider>
  );
}

export default App;
