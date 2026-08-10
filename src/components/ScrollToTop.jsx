import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop({ onCloseMobile }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Scroll to top immediately
    window.scrollTo(0, 0);

    // 2. Unlock body overflow and close mobile menu
    document.body.style.overflow = '';
    if (onCloseMobile) onCloseMobile();

    // 3. Immediately reveal all sections on the new page
    const revealPage = () => {
      const els = document.querySelectorAll('[data-reveal]');
      els.forEach((el) => {
        el.classList.add('revealed');
        el.style.opacity = '1';
        el.style.transform = 'none';

        const children = el.querySelectorAll(
          '.moment-card, .room-card, .why-card, .act-chip, .fan-card, .amenity-pill, .contact-card, .het-card, .hst-card'
        );
        children.forEach((child) => {
          child.style.opacity = '1';
          child.style.transform = 'none';
        });
      });
    };

    // Run immediately and after short tick for React DOM render
    revealPage();
    const t = setTimeout(revealPage, 50);
    return () => clearTimeout(t);
  }, [pathname, onCloseMobile]);

  return null;
}
