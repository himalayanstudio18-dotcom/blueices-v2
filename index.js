/* ═══════════════════════════════════════════════════════════════════
   LAKHEY LACHEN HOMESTAY BY BLUE ICE
   index.js — Cinematic Interaction, Hero Mouse Parallax & Particles Engine
   ═══════════════════════════════════════════════════════════════════ */

/* global Lenis */
'use strict';

// ─── REDUCED MOTION GUARD ────────────────────────────────────────────
// Single source of truth for all animation-gating throughout this file.
// When true, every requestAnimationFrame loop and motion effect is
// skipped. Content remains fully visible and interactive.
const PREFERS_REDUCED_MOTION = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// ─── CONTACT CONFIGURATION (C-01 FIX) ───────────────────────────────
// ┌─────────────────────────────────────────────────────────────────┐
// │  BEFORE GO-LIVE: replace the values below with real details.    │
// │  This is the SINGLE SOURCE OF TRUTH for all contact links.      │
// │  After editing here, all CTAs on the page update automatically. │
// └─────────────────────────────────────────────────────────────────┘
const CONTACT_CONFIG = {
  // WhatsApp number in international format WITHOUT + or spaces
  // e.g. '919876543210' for +91 98765 43210
  whatsapp: '91XXXXXXXXXX',

  // The message pre-filled in WhatsApp (URL-encoded)
  whatsappMsg: 'Hello!%20I%20would%20like%20to%20plan%20my%20stay%20at%20Lakhey%20Lachen%20Homestay.',

  // Full number for tel: links (with country code, no spaces)
  // e.g. '+919876543210'
  phone: '+91XXXXXXXXXX',

  // Email
  email: 'blueicemunsong@gmail.com',
};

// Development-mode guard: warn in console if placeholders not replaced
(function warnIfPlaceholders() {
  const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isPlaceholder = CONTACT_CONFIG.whatsapp.includes('XXXXXXXXXX');
  if (IS_DEV && isPlaceholder) {
    console.warn(
      '%c[BLUE ICE] CONTACT DETAILS NOT CONFIGURED',
      'background:#b45309;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold;',
      '\n\nAll WhatsApp, Call, and Email links are using placeholder values.',
      '\n\nTo fix: edit CONTACT_CONFIG in index.js and replace all href values',
      '\nin index.html containing "XXXXXXXXXX" with the real phone number.',
      '\n\nSearch for "XXXXXXXXXX" in index.html to find all 5 occurrences.'
    );
  }
})();

// ─── INITIALIZE LENIS SMOOTH SCROLL ──────────────────────────────────
let lenis;
if (typeof Lenis !== 'undefined' && !PREFERS_REDUCED_MOTION) {
  lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ─── EXTERNAL IMAGE FALLBACK ENGINE (H-05) ───────────────────────────
// All Unsplash images are served at runtime. If the CDN is unreachable
// (network error, corporate firewall, rate-limit), sections should not
// break. Each external image falls back to the closest local WebP asset.
//
// PRODUCTION NOTE: Before go-live, download all 10 Unsplash images
// locally, convert to WebP, and replace the src attributes in index.html.
// This fallback is a safety net — not a substitute for local assets.
(function initExternalImageFallbacks() {
  // Map: partial Unsplash photo ID → local fallback WebP path
  const FALLBACK_MAP = {
    '1464822759023': 'images/story_mountain_path.webp',      // mountain panorama
    '1586105251261': 'images/experience_sunrise_tea.webp',   // tea/warm light
    '1590073242678': 'images/experience_bonfire.webp',       // interior/warm
    '1566073771259': 'images/hero_himalayan_sunrise.webp',   // hotel room → sunrise
    '1506905925346': 'images/experience_waterfall.webp',     // mountain trail
    '1548013146-72': 'images/experience_tea_garden.webp',    // landscape
    '1544366208-8f': 'images/story_mountain_path.webp',      // mountain
    '1570168007204': 'images/experience_tea_garden.webp',    // green landscape
    '1531366936337': 'images/hero_himalayan_sunrise.webp',   // night sky → sunrise
    'default':       'images/hero_himalayan_sunrise.webp',   // catch-all
  };

  function getFallback(src) {
    for (const [key, fallback] of Object.entries(FALLBACK_MAP)) {
      if (src.includes(key)) return fallback;
    }
    return FALLBACK_MAP['default'];
  }

  // Attach onerror to all external <img> elements
  document.querySelectorAll('img[src*="unsplash.com"]').forEach(img => {
    img.addEventListener('error', function onImgError() {
      const fallback = getFallback(this.src);
      if (this.src !== fallback) {
        this.src = fallback;
        this.closest('.spread-img-wrap, .stay-spread-img-col, .gallery-item, .explore-card, .ec-img-wrap, .gi-img-wrap')
            ?.classList.add('img-fallback-active');
      }
      this.removeEventListener('error', onImgError);
    });
  });

  // CTA background-image fallback (inline style — cannot use onerror)
  // Check by loading the image in a hidden Image object
  const ctaBg = document.querySelector('.cta-bg');
  if (ctaBg) {
    const ctaBgUrl = ctaBg.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
    if (ctaBgUrl && ctaBgUrl.includes('unsplash.com')) {
      const probe = new Image();
      probe.onerror = () => {
        ctaBg.style.backgroundImage = "url('images/hero_himalayan_sunrise.webp')";
      };
      probe.src = ctaBgUrl;
    }
  }
})();


// ─── LOADING SCREEN & HERO REVEAL ─────────────────────────────────────
const loader = document.getElementById('loader');
const loaderProgress = document.getElementById('loader-progress-fill');
const heroContent = document.getElementById('hero-content');
const heroSection = document.getElementById('hero');

let progress = 0;

const progressInterval = setInterval(() => {
  progress += Math.random() * 18;
  if (progress > 100) progress = 100;
  if (loaderProgress) loaderProgress.style.width = progress + '%';

  if (progress === 100) {
    clearInterval(progressInterval);
    setTimeout(hideLoader, 500);
  }
}, 120);

function hideLoader() {
  if (!loader) return;
  loader.classList.add('loaded');

  // Trigger Hero Line-by-Line Reveal Sequence
  setTimeout(() => {
    if (heroContent) heroContent.classList.add('revealed');
    if (heroSection) heroSection.classList.add('hero-loaded');
  }, 200);

  initScrollAnimations();
}

window.addEventListener('load', () => {
  progress = 100;
  if (loaderProgress) loaderProgress.style.width = '100%';
});

// ─── HERO INTERACTIVE CANVAS PARTICLES ENGINE ─────────────────────────
// Skipped entirely for users who prefer reduced motion (WCAG 2.1 SC 2.3.3).
// Also paused automatically via IntersectionObserver when hero is off-screen
// to avoid burning GPU/battery during the rest of the page session.
(function initHeroParticles() {
  if (PREFERS_REDUCED_MOTION) return; // C-04 guard

  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = 45;
  const particles = [];

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.5 + 0.8;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -Math.random() * 0.4 - 0.1;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.fade = Math.random() * 0.008 + 0.002;
      this.isGold = Math.random() > 0.4;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      const dx = mouseTargetX - this.x;
      const dy = mouseTargetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        this.x -= (dx / dist) * 0.5;
        this.y -= (dy / dist) * 0.5;
      }

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
        this.y = height + 10;
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.isGold
        ? `rgba(240, 197, 117, ${this.alpha})`
        : `rgba(248, 250, 252, ${this.alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.isGold ? '#d4a24c' : '#ffffff';
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // H-03 fix: pause RAF when hero is scrolled out of view
  let particlesActive = true;

  function renderParticles() {
    if (!particlesActive) return;
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => { p.update(); p.draw(); });
    requestAnimationFrame(renderParticles);
  }

  const heroEl = document.getElementById('hero');
  if (heroEl && 'IntersectionObserver' in window) {
    const heroVisibilityObserver = new IntersectionObserver((entries) => {
      const wasActive = particlesActive;
      particlesActive = entries[0].isIntersecting;
      // Restart RAF only if transitioning from paused → active
      if (particlesActive && !wasActive) renderParticles();
    }, { threshold: 0 });
    heroVisibilityObserver.observe(heroEl);
  }

  renderParticles();
})();

// ─── HERO MULTI-LAYER MOUSE PARALLAX ENGINE ───────────────────────────
let mouseTargetX = window.innerWidth / 2;
let mouseTargetY = window.innerHeight / 2;
let currentMouseX = 0;
let currentMouseY = 0;

window.addEventListener('mousemove', (e) => {
  mouseTargetX = e.clientX;
  mouseTargetY = e.clientY;

  // Custom Cursor Updates
  if (cursorDot) {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
  }
});

function updateHeroMouseParallax() {
  const normX = (mouseTargetX / window.innerWidth - 0.5) * 2; // -1 to 1
  const normY = (mouseTargetY / window.innerHeight - 0.5) * 2; // -1 to 1

  currentMouseX += (normX - currentMouseX) * 0.08;
  currentMouseY += (normY - currentMouseY) * 0.08;

  // Apply Mouse Parallax to Elements with data-mouse-factor
  document.querySelectorAll('[data-mouse-factor]').forEach((el) => {
    const factor = parseFloat(el.getAttribute('data-mouse-factor')) * 100;
    const scrollParallax = parseFloat(el.getAttribute('data-parallax') || 0) * window.scrollY;
    
    el.style.transform = `translate3d(${currentMouseX * factor}px, ${currentMouseY * factor + scrollParallax}px, 0)`;
  });

  requestAnimationFrame(updateHeroMouseParallax);
}
if (!PREFERS_REDUCED_MOTION) updateHeroMouseParallax(); // C-04 guard

// ─── CUSTOM CURSOR RING ANIMATION ────────────────────────────────────
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let ringX = -100, ringY = -100;

function animateCursorRing() {
  ringX += (mouseTargetX - ringX) * 0.15;
  ringY += (mouseTargetY - ringY) * 0.15;
  if (cursorRing) {
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
  }
  requestAnimationFrame(animateCursorRing);
}
if (!PREFERS_REDUCED_MOTION) animateCursorRing(); // C-04 guard

// Interactive element hover effects for cursor
document.querySelectorAll('a, button, [tabindex], .gallery-item, .explore-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing?.classList.add('active'));
  el.addEventListener('mouseleave', () => cursorRing?.classList.remove('active'));
});

// ─── ATMOSPHERIC SCROLL SHIFT ─────────────────────────────────────────
const atmosSky = document.getElementById('atmos-sky');

const atmosThemes = [
  { id: 'hero', sky: 'radial-gradient(circle at 50% 20%, rgba(212,162,76,0.35) 0%, rgba(30,78,121,0.45) 40%, rgba(4,8,20,1) 85%)' },
  { id: 'story', sky: 'radial-gradient(ellipse at 30% 40%, rgba(30,78,121,0.3) 0%, rgba(14,24,46,1) 75%)' },
  { id: 'moments', sky: 'radial-gradient(ellipse at 70% 30%, rgba(212,162,76,0.15) 0%, rgba(8,16,34,1) 75%)' },
  { id: 'stays', sky: 'radial-gradient(circle at 50% 50%, rgba(30,78,121,0.25) 0%, rgba(14,24,46,1) 80%)' },
  { id: 'timeline', sky: 'radial-gradient(ellipse at 20% 60%, rgba(212,162,76,0.12) 0%, rgba(4,8,20,1) 75%)' },
  { id: 'gallery', sky: 'radial-gradient(ellipse at 50% 30%, rgba(30,78,121,0.3) 0%, rgba(8,16,34,1) 80%)' },
  { id: 'guests', sky: 'radial-gradient(circle at 80% 40%, rgba(212,162,76,0.18) 0%, rgba(14,24,46,1) 80%)' },
  { id: 'explore', sky: 'radial-gradient(ellipse at 30% 70%, rgba(30,78,121,0.2) 0%, rgba(8,16,34,1) 80%)' },
  { id: 'why', sky: 'radial-gradient(ellipse at 50% 50%, rgba(4,8,20,1) 0%, rgba(2,5,15,1) 100%)' },
  { id: 'cta', sky: 'radial-gradient(circle at 50% 50%, rgba(4,8,20,0.6) 0%, rgba(2,5,15,1) 90%)' }
];

function handleAtmosphereChange() {
  const scrollPosition = window.scrollY + window.innerHeight / 2;

  atmosThemes.forEach(theme => {
    const section = document.getElementById(theme.id);
    if (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        if (atmosSky) atmosSky.style.background = theme.sky;
      }
    }
  });
}

// ─── SCROLL EVENTS: NAVBAR, PARALLAX & DISSOLVE ──────────────────────
const navbar = document.getElementById('navbar');
const progressBar = document.getElementById('progress-bar');
const backToTop = document.getElementById('back-to-top');
const floatWa = document.getElementById('float-wa');

function onScroll() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight - vh;

  // Progress Bar
  if (progressBar) progressBar.style.width = (y / docHeight) * 100 + '%';

  // Navbar scrolled class
  if (navbar) {
    if (y > 80) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }

  // Floating Buttons
  if (backToTop) {
    if (y > 600) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  }

  if (floatWa) {
    if (y > vh * 0.8) {
      floatWa.style.opacity = '1';
      floatWa.style.transform = 'scale(1)';
    } else {
      floatWa.style.opacity = '0';
      floatWa.style.transform = 'scale(0.8)';
    }
  }

  // Hero Dissolve effect on scroll
  if (y < vh && heroContent) {
    const ratio = y / vh;
    heroContent.style.opacity = (1 - ratio * 1.6).toString();
  }

  handleAtmosphereChange();
  updateActiveNavLink();
}

window.addEventListener('scroll', onScroll, { passive: true });

// Active nav link highlight
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 300;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href')?.replace('#', '') === current) {
      link.classList.add('active');
    }
  });
}

// ─── SCROLLTRIGGER & REVEAL ANIMATIONS FOR OTHER SECTIONS ─────────────
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseFloat(el.getAttribute('data-delay') || 0);
          setTimeout(() => {
            el.classList.add('revealed');
          }, delay * 1000);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }
}

// ─── MOBILE MENU ──────────────────────────────────────────────────
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileClose = document.getElementById('mobile-menu-close');

function openMobile() {
  mobileMenu?.classList.add('open');
  hamburger?.setAttribute('aria-expanded', 'true');
}

function closeMobile() {
  mobileMenu?.classList.remove('open');
  hamburger?.setAttribute('aria-expanded', 'false');
}

hamburger?.addEventListener('click', openMobile);
mobileClose?.addEventListener('click', closeMobile);

mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobile);
});

// ─── LIGHTBOX FOR GALLERY ─────────────────────────────────────────
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

let currentIndex = 0;
const galleryData = [];

galleryItems.forEach((item, index) => {
  const img = item.querySelector('.gi-img');
  const cap = item.querySelector('.gi-caption');
  if (img) {
    galleryData.push({ src: img.src, alt: img.alt, caption: cap?.textContent || '' });
    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  }
});

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  lightbox?.classList.add('open');
  lightboxClose?.focus();
}

function closeLightbox() {
  lightbox?.classList.remove('open');
}

function updateLightbox() {
  const item = galleryData[currentIndex];
  if (!item || !lightboxImg) return;
  lightboxImg.src = item.src;
  lightboxImg.alt = item.alt;
  if (lightboxCaption) lightboxCaption.textContent = item.caption;
}

lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
  updateLightbox();
});
lightboxNext?.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % galleryData.length;
  updateLightbox();
});

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard Navigation for Lightbox
document.addEventListener('keydown', (e) => {
  if (!lightbox?.classList.contains('open')) return;

  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') {
    currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
    updateLightbox();
  }
  if (e.key === 'ArrowRight') {
    currentIndex = (currentIndex + 1) % galleryData.length;
    updateLightbox();
  }
});

// ─── WEATHER WIDGET ───────────────────────────────────────────────
function initWeather() {
  const tempEl = document.getElementById('weather-temp');
  const feelsEl = document.getElementById('weather-feels');
  const cloudsEl = document.getElementById('weather-clouds');
  const scoreEl = document.getElementById('weather-score');
  const tipEl = document.getElementById('weather-tip');

  const lat = 27.04, lon = 88.69;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,cloud_cover&daily=sunrise,sunset&timezone=Asia%2FCalcutta&forecast_days=1`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  fetch(url, { signal: controller.signal })
    .then(res => {
      clearTimeout(timeoutId);
      return res.json();
    })
    .then(data => {
      const current = data.current;
      if (tempEl) tempEl.textContent = Math.round(current.temperature_2m) + '°C';
      if (feelsEl) feelsEl.textContent = Math.round(current.apparent_temperature) + '°C';
      if (cloudsEl) cloudsEl.textContent = current.cloud_cover + '%';
      
      const score = Math.max(1, Math.min(10, Math.round(10 - current.cloud_cover / 15)));
      if (scoreEl) scoreEl.textContent = score + '/10';
      if (tipEl) tipEl.textContent = score >= 7 ? '📸 Outstanding photography conditions today!' : '⛅ Moody mist today — great for atmospheric shots.';
    })
    .catch(() => {
      clearTimeout(timeoutId);
      if (tempEl) tempEl.textContent = '18°C';
      if (feelsEl) feelsEl.textContent = '16°C';
      if (cloudsEl) cloudsEl.textContent = '35%';
      if (scoreEl) scoreEl.textContent = '8/10';
      if (tipEl) tipEl.textContent = '🌤 Good light. The kind of morning worth waking up for.';
    });
}
initWeather();

// ─── STARS GENERATION FOR CTA ────────────────────────────────────────
function createStars() {
  const container = document.getElementById('stars-container');
  if (!container) return;

  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = Math.random() * 2 + 1;
    star.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 80}%;
      width: ${size}px;
      height: ${size}px;
      --duration: ${(Math.random() * 3 + 2).toFixed(1)}s;
      --min-opacity: ${(Math.random() * 0.3).toFixed(2)};
      --max-opacity: ${(Math.random() * 0.7 + 0.3).toFixed(2)};
      animation-delay: ${(Math.random() * 3).toFixed(1)}s;
    `;
    container.appendChild(star);
  }
}
createStars();

// ─── NEWSLETTER FORM HANDLER (C-02 FIX) ──────────────────────────────
// Formspree is a zero-backend form service. Replace YOUR_FORM_ID with
// the ID from your Formspree dashboard (https://formspree.io).
// Free tier: 50 submissions/month. Emails delivered to your inbox.
//
// TO ACTIVATE:
//   1. Sign up at https://formspree.io
//   2. Create a new form → copy the 8-character ID
//   3. Replace 'YOUR_FORM_ID' below with your real ID
//
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

(function initNewsletterForm() {
  const form      = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('newsletter-email');
  const submitBtn = form?.querySelector('.footer-email-btn');
  if (!form || !emailInput || !submitBtn) return;

  // Accessible live region for screen reader announcements
  const liveRegion = document.createElement('p');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
  form.appendChild(liveRegion);

  const originalBtnText = submitBtn.textContent;

  function setState(state, message) {
    const noteEl = form.parentElement?.querySelector('.footer-newsletter-note');

    switch (state) {
      case 'loading':
        submitBtn.textContent = '…';
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        break;

      case 'success':
        submitBtn.textContent = '✓';
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        emailInput.value = '';
        if (noteEl) {
          noteEl.textContent = message || 'You\'re in. Mountain stories incoming.';
          noteEl.style.color = '#6ee7b7'; // soft green — same tone as brand
        }
        liveRegion.textContent = 'Success! You\'ve subscribed to Mountain Letters.';
        // Reset button after 3s
        setTimeout(() => {
          submitBtn.textContent = originalBtnText;
          if (noteEl) {
            noteEl.textContent = 'No spam. Only mountains.';
            noteEl.style.color = '';
          }
        }, 4000);
        break;

      case 'error':
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        if (noteEl) {
          noteEl.textContent = message || 'Something went wrong. Please try again.';
          noteEl.style.color = '#fca5a5'; // soft red
        }
        liveRegion.textContent = message || 'Subscription failed. Please try again.';
        setTimeout(() => {
          if (noteEl) {
            noteEl.textContent = 'No spam. Only mountains.';
            noteEl.style.color = '';
          }
        }, 5000);
        break;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Client-side email validation (browser already validates type=email
    // but novalidate is set, so we validate manually for better UX)
    const email = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      setState('error', 'Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    // Skip real submission if Formspree ID is still placeholder
    if (FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
      const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (IS_DEV) console.warn('[Newsletter] Formspree endpoint not configured. Replace YOUR_FORM_ID in index.js.');
      setState('success', 'Demo mode — configure Formspree to enable real submissions.');
      return;
    }

    setState('loading');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify({ email, _subject: 'New Mountain Letters Subscription', source: 'homepage-footer' }),
      });

      if (response.ok) {
        setState('success');
      } else {
        const data = await response.json().catch(() => ({}));
        setState('error', data?.errors?.[0]?.message || 'Submission failed. Please try again.');
      }
    } catch {
      setState('error', 'Network error. Please check your connection and try again.');
    }
  });
})();

// ─── BACK TO TOP ──────────────────────────────────────────────────────
backToTop?.addEventListener('click', () => {
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: 'smooth' });
  // Return focus to top of document for keyboard users (M-06 fix)
  const skipTarget = document.getElementById('hero') || document.body;
  skipTarget.setAttribute('tabindex', '-1');
  skipTarget.focus({ preventScroll: true });
  skipTarget.addEventListener('blur', () => skipTarget.removeAttribute('tabindex'), { once: true });
});


// Dynamic Copyright Year
(function updateCopyrightYear() {
  const copyEl = document.querySelector('.footer-copyright');
  if (copyEl) {
    copyEl.textContent = copyEl.textContent.replace('2025', new Date().getFullYear());
  }
})();
