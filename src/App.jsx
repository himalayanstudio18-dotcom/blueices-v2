import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import Footer from './components/Footer';
import LightboxModal from './components/LightboxModal';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';
import StaysPage from './pages/StaysPage';
import RoomDetailPage from './pages/RoomDetailPage';
import ExperiencesPage from './pages/ExperiencesPage';
import StoryPage from './pages/StoryPage';
import ContactPage from './pages/ContactPage';

/* Admin panel is code-split out of the public bundle — visitors
   never download it, and it isn't linked from the public nav. */
const AdminApp = lazy(() => import('./admin/AdminApp'));

/* Chooses between the public site shell and the admin app based on
   the URL. Needs to sit inside <Router> to read the location, and
   outside the public <Routes> since it swaps out Navbar/Footer
   entirely rather than just the routed page content. */
function AppShell({ mobileOpen, openMobile, closeMobile, lightboxIdx, setLightboxIdx }) {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return (
      <Suspense fallback={<div className="admin-fullscreen-state">Loading admin…</div>}>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>

      <Navbar onOpenMobile={openMobile} />

      {mobileOpen && <MobileMenu onClose={closeMobile} />}

      <main id="main-content">
        <Routes>
          <Route path="/"            element={<HomePage />} />
          <Route path="/stays"       element={<StaysPage />} />
          <Route path="/rooms/:slug" element={<RoomDetailPage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/story"       element={<StoryPage onOpenLightbox={(i) => setLightboxIdx(i)} />} />
          <Route path="/contact"     element={<ContactPage />} />
        </Routes>
      </main>

      <Footer />

      {lightboxIdx !== null && (
        <LightboxModal
          activeIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx((i) => Math.max(0, i - 1))}
          onNext={() => setLightboxIdx((i) => Math.min(5, i + 1))}
        />
      )}
    </>
  );
}

/* Inner app — needs access to LanguageContext */
function AppInner() {
  const { lang } = useLanguage();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const openMobile  = useCallback(() => setMobileOpen(true),  []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  /* ── Apply data-lang to <html> so CSS [data-lang="bn"] rules fire ── */
  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  /* ── Navbar shrink on scroll ── */
  useEffect(() => {
    const onScroll = () => {
      const navbar = document.getElementById('navbar');
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Lock body scroll when mobile menu open ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* ── Lightbox keyboard controls ── */
  useEffect(() => {
    const onKey = (e) => {
      if (lightboxIdx === null) return;
      if (e.key === 'Escape')     setLightboxIdx(null);
      if (e.key === 'ArrowLeft')  setLightboxIdx((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setLightboxIdx((i) => Math.min(5, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx]);

  return (
    <Router>
      <ScrollToTop onCloseMobile={closeMobile} />
      <AppShell
        mobileOpen={mobileOpen}
        openMobile={openMobile}
        closeMobile={closeMobile}
        lightboxIdx={lightboxIdx}
        setLightboxIdx={setLightboxIdx}
      />
    </Router>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
