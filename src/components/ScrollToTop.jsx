import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop({ onCloseMobile }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 1. Land on the requested section, or the top if none was requested.
    //    A route-change Link (unlike a real page load) doesn't natively
    //    jump to a #hash on its own, so that case needs a manual assist.
    //    The target section's mount time isn't fixed — it depends on real
    //    network/asset load on the deployed site (hero images, data
    //    fetches), which a single fixed-delay retry can lose the race
    //    against. So this polls every frame instead of guessing a delay,
    //    until the element shows up or a generous cap gives up.
    let pollId = null;
    if (hash) {
      const id = hash.slice(1);
      const deadline = Date.now() + 3000;
      const poll = () => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView();
        } else if (Date.now() < deadline) {
          pollId = requestAnimationFrame(poll);
        }
      };
      poll();
    } else {
      window.scrollTo(0, 0);
    }

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
    return () => {
      clearTimeout(t);
      if (pollId) cancelAnimationFrame(pollId);
    };
  }, [pathname, hash, onCloseMobile]);

  return null;
}
