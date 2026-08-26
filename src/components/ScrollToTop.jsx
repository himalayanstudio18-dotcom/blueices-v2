import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop({ onCloseMobile }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 1. Land on the requested section, or the top if none was requested.
    //    A route-change Link (unlike a real page load) doesn't natively
    //    jump to a #hash on its own, so that case needs a manual assist.
    //    The target section may not be painted on this very first tick
    //    (same race the revealPage retry below already guards against),
    //    so this gets the same immediate-plus-delayed-retry treatment.
    const scrollToTarget = () => {
      const target = hash ? document.getElementById(hash.slice(1)) : null;
      if (target) {
        target.scrollIntoView();
      } else if (!hash) {
        window.scrollTo(0, 0);
      }
    };
    scrollToTarget();

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
    const t = setTimeout(() => {
      revealPage();
      scrollToTarget();
    }, 50);
    return () => clearTimeout(t);
  }, [pathname, hash, onCloseMobile]);

  return null;
}
