import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { signaturePhotos } from '../assets/photos';
import { useGalleryImages } from '../lib/useGalleryImages';

/* ── Fan tiers ─────────────────────────────────────────────────────
   Every card's transform is looked up by its absolute slot-distance
   from the centered card (0 = hero, 1 = its immediate neighbour, …).
   Progressive rotation + shrinking scale + fading opacity + rising
   blur is what reads as cinematic depth-of-field rather than a flat
   carousel — the further a card sits from center, the more all four
   recede together. */
const ROT_Z = [0, 10, 18, 28, 38];
const ROT_Y = [0, 8, 14, 20, 24];
const SCALE = [1, 0.95, 0.90, 0.86, 0.82];
const OPACITY = [1, 0.95, 0.8, 0.55, 0.3];
const BLUR = [0, 0.5, 1.1, 2, 3.2];
const X_FRAC = [0, 0.58, 1.02, 1.38, 1.66];
const Y_FRAC = [0, 0.05, 0.16, 0.32, 0.52];

/* Widens the fan's horizontal reach on large desktops only (>=1280px)
   so a 9-card fan fills the section instead of huddling at center —
   card size and tier hierarchy are untouched, just how far each card
   travels from the hero. */
function spreadMultiplierForWidth(width) {
  return width >= 1280 ? 1.5 : 1;
}

function tierAt(distance) {
  const i = Math.min(distance, ROT_Z.length - 1);
  return {
    rotZ: ROT_Z[i], rotY: ROT_Y[i], scale: SCALE[i],
    opacity: OPACITY[i], blur: BLUR[i], xFrac: X_FRAC[i], yFrac: Y_FRAC[i],
  };
}

function targetFor(signedDistance, cardW, cardH, width) {
  const dist = Math.abs(signedDistance);
  const sign = Math.sign(signedDistance);
  const tier = tierAt(dist);
  const spread = spreadMultiplierForWidth(width);
  return {
    x: sign * tier.xFrac * cardW * spread,
    y: tier.yFrac * cardH,
    rotateZ: sign * tier.rotZ,
    rotateY: -sign * tier.rotY,
    scale: tier.scale,
    opacity: tier.opacity,
    blurPx: tier.blur,
    zIndex: 100 - dist * 10,
  };
}

/* Contiguous window of `visibleCount` slots centered on centerIndex,
   wrapping circularly — cardIndex -> signed distance from center. */
function computeVisibleMap(centerIndex, visibleCount, total) {
  const effective = Math.min(visibleCount, total);
  const half = Math.floor(effective / 2);
  const map = new Map();
  for (let s = 0; s < effective; s++) {
    const idx = ((centerIndex + s - half) % total + total) % total;
    map.set(idx, s - half);
  }
  return map;
}

/* Signed shortest-path distance from `from` to `to` on a circular
   track of `total` slots — used only to pick which way a jump (e.g.
   a dot click) should visually travel. */
function circularDelta(to, from, total) {
  let raw = to - from;
  if (raw > total / 2) raw -= total;
  if (raw < -total / 2) raw += total;
  return raw;
}

const CARD_RATIO = 4 / 5; // width / height — must match .fan-card-frame's aspect-ratio in index.css

function clampNum(min, val, max) {
  return Math.min(max, Math.max(min, val));
}

/* Card height as a pure function of viewport width — mirrors the
   clamp() breakpoints on .fan-card-frame in index.css exactly, so
   fan geometry is deterministic: calculated fresh from the viewport
   every time, never read back off a live DOM element. Measuring a
   rendered card's getBoundingClientRect() was the earlier approach,
   but that rect includes whatever GSAP transform the card currently
   has (rotateZ/rotateY/scale) — under rapid clicking a mid-tween
   card could get measured, feeding a skewed size into every other
   card's position and making the whole fan's radius/angles drift. */
function cardSizeForWidth(width) {
  const rem = 16;
  let h;
  if (width <= 640) {
    h = clampNum(8.5 * rem, 0.32 * width, 11 * rem);
  } else if (width <= 1279) {
    h = clampNum(10 * rem, 0.16 * width, 15.5 * rem);
  } else {
    h = clampNum(13.5 * rem, 0.13 * width, 18 * rem);
  }
  return { w: h * CARD_RATIO, h };
}

function visibleCountForWidth(width) {
  if (width <= 640) return 3;
  if (width <= 1279) return 7;
  return 9;
}

const SPRING = 'back.out(1.4)';

export default function SignatureGallery({ onOpenLightbox }) {
  const { lang } = useLanguage();
  const tx = t[lang].gallery;
  const { photos: dbPhotos } = useGalleryImages(lang);

  /* Admin-uploaded photos (Supabase) take over once any exist; the
     curated static set is the fallback while loading and if the
     gallery hasn't been populated in the admin panel yet — this
     keeps the carousel from ever rendering empty. */
  const staticCards = signaturePhotos.map((p, i) => ({
    ...p,
    caption: tx.photos[i]?.caption ?? p.alt,
  }));
  const cards = dbPhotos?.length ? dbPhotos : staticCards;
  const total = cards.length;

  const [centerIndex, setCenterIndex] = useState(Math.floor(total / 2));
  const [visibleCount, setVisibleCount] = useState(() => visibleCountForWidth(typeof window !== 'undefined' ? window.innerWidth : 1200));

  /* Re-clamps if the card count changes at runtime (static fallback
     swapping for a differently-sized set of DB photos after load). */
  useEffect(() => {
    setCenterIndex((prev) => Math.min(prev, Math.max(0, total - 1)));
  }, [total]);

  const fanRef = useRef(null);
  const hasEntered = useRef(false);
  const directionRef = useRef('right');
  const prevVisibleRef = useRef(new Set());

  const visibleMap = computeVisibleMap(centerIndex, visibleCount, total);

  const goTo = useCallback((index) => {
    setCenterIndex((prev) => {
      if (prev === index) return prev;
      directionRef.current = circularDelta(index, prev, total) > 0 ? 'right' : 'left';
      return index;
    });
  }, [total]);

  const cycle = useCallback((dir) => {
    directionRef.current = dir;
    setCenterIndex((prev) => (dir === 'right' ? (prev + 1) % total : (prev - 1 + total) % total));
  }, [total]);

  /* Anchor every card to dead-center once; all further movement is
     layered on top via GSAP's own x/y (not the CSS transform). */
  useEffect(() => {
    const container = fanRef.current;
    if (!container) return;
    gsap.set(container.querySelectorAll('.fan-card'), { xPercent: -50, yPercent: -50 });
  }, []);

  /* ── Layout — entrance, re-slot on navigate, enter/exit at the
     visible-window edge when the breakpoint hides some cards ── */
  useEffect(() => {
    const container = fanRef.current;
    if (!container || !total) return;
    const cardEls = Array.from(container.querySelectorAll('.fan-card'));
    if (!cardEls.length) return;

    const { w: cardW, h: cardH } = cardSizeForWidth(window.innerWidth);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFirstMount = !hasEntered.current;
    const map = computeVisibleMap(centerIndex, visibleCount, total);
    const prevVisible = prevVisibleRef.current;
    const direction = directionRef.current;
    const viewportW = window.innerWidth;

    cardEls.forEach((card, i) => {
      const d = map.get(i);
      const wasVisible = prevVisible.has(i);

      if (d !== undefined) {
        const target = targetFor(d, cardW, cardH, viewportW);
        const props = {
          x: target.x, y: target.y, rotateZ: target.rotateZ, rotateY: target.rotateY,
          scale: target.scale, opacity: target.opacity, zIndex: target.zIndex,
          filter: `blur(${target.blurPx}px)`,
        };
        if (isFirstMount) {
          if (reduceMotion) {
            gsap.set(card, props);
          } else {
            gsap.set(card, { x: 0, y: cardH * 0.35, rotateZ: 0, rotateY: 0, scale: 0.5, opacity: 0, filter: 'blur(6px)' });
            gsap.to(card, { ...props, duration: 0.85, ease: SPRING, delay: 0.08 + Math.abs(d) * 0.07, overwrite: 'auto' });
          }
        } else if (!wasVisible) {
          const enterSign = direction === 'right' ? 1 : -1;
          gsap.set(card, {
            x: enterSign * cardW * 2.1, y: cardH * 0.3,
            rotateZ: enterSign * 50, rotateY: -enterSign * 26,
            scale: 0.5, opacity: 0, filter: 'blur(4px)',
          });
          gsap.to(card, { ...props, duration: reduceMotion ? 0.01 : 0.75, ease: SPRING, overwrite: 'auto' });
        } else {
          gsap.to(card, { ...props, duration: reduceMotion ? 0.01 : 0.75, ease: SPRING, overwrite: 'auto' });
        }
      } else if (wasVisible) {
        /* Was in the fan last pass, isn't now — animate it out. */
        const exitSign = direction === 'right' ? -1 : 1;
        gsap.to(card, {
          x: exitSign * cardW * 2.1, y: cardH * 0.3,
          rotateZ: exitSign * 50, rotateY: exitSign * 26,
          scale: 0.5, opacity: 0, filter: 'blur(4px)', zIndex: 0,
          duration: reduceMotion ? 0.01 : 0.55, ease: 'power2.in', overwrite: 'auto',
        });
      } else {
        /* Wasn't visible last pass either — whether that's because
           this is the first mount, or because it's been sitting out
           of view for several navigations, the destination is the
           same: fully hidden. Forcing it every pass (instead of only
           on first mount) closes the gap that let a card camped just
           outside the visible window retain a stale transform from
           whenever it last animated. Every property any other branch
           can drive is force-set here, not just opacity/scale/zIndex —
           gsap.set() only overwrites the properties it's given, so a
           partial set left x/y/rotateZ/rotateY/filter under the
           control of whatever tween had been running before, which is
           what actually produced a card frozen mid-flight (visible,
           wrong position, stuck opacity) under rapid clicking. */
        gsap.set(card, { x: 0, y: 0, rotateZ: 0, rotateY: 0, scale: 0.4, opacity: 0, filter: 'blur(4px)', zIndex: 0 });
      }
    });

    prevVisibleRef.current = new Set(map.keys());
    hasEntered.current = true;
  }, [centerIndex, total, visibleCount]);

  /* ── Breakpoint watch — only touches state when the visible-card
     bucket actually changes (640 / 1279 / above). Repositioning is
     deliberately left to the layout effect above, keyed off this
     same visibleCount state — a single source of truth for geometry
     instead of a second tweening path that could race it. */
  useEffect(() => {
    const onResize = () => {
      setVisibleCount((prev) => {
        const next = visibleCountForWidth(window.innerWidth);
        return prev === next ? prev : next;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── Hover — lift + straighten the hovered card, part its
     neighbours a little further along the fan ── */
  useEffect(() => {
    const container = fanRef.current;
    if (!container || !window.matchMedia('(hover: hover)').matches) return;
    let hovered = null;
    let leaveTimer;

    const apply = () => {
      const { w: cardW, h: cardH } = cardSizeForWidth(window.innerWidth);
      const map = computeVisibleMap(centerIndex, visibleCount, total);
      Array.from(container.querySelectorAll('.fan-card')).forEach((card, i) => {
        const d = map.get(i);
        if (d === undefined) return;
        const target = targetFor(d, cardW, cardH, window.innerWidth);
        let { x, y, rotateZ, rotateY, scale, opacity, zIndex } = target;
        if (hovered !== null) {
          if (i === hovered) {
            y -= cardH * 0.06;
            scale *= 1.06;
            rotateZ *= 0.4;
            opacity = 1;
            zIndex = 200;
          } else {
            const hd = map.get(hovered) ?? 0;
            x += (d > hd ? 1 : -1) * cardW * 0.14;
          }
        }
        gsap.to(card, { x, y, rotateZ, rotateY, scale, opacity, zIndex, duration: 0.5, ease: SPRING, overwrite: 'auto' });
        card.classList.toggle('is-active', hovered === i);
      });
    };

    const cardEls = Array.from(container.querySelectorAll('.fan-card'));
    const bound = cardEls.map((card, i) => {
      const enter = () => {
        if (card.getAttribute('aria-hidden') === 'true') return;
        clearTimeout(leaveTimer);
        hovered = i;
        apply();
      };
      card.addEventListener('mouseenter', enter);
      return { card, enter };
    });
    const onLeave = () => { leaveTimer = setTimeout(() => { hovered = null; apply(); }, 60); };
    container.addEventListener('mouseleave', onLeave);

    return () => {
      bound.forEach(({ card, enter }) => card.removeEventListener('mouseenter', enter));
      container.removeEventListener('mouseleave', onLeave);
      clearTimeout(leaveTimer);
    };
  }, [centerIndex, total, visibleCount]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); cycle('left'); }
    if (e.key === 'ArrowRight') { e.preventDefault(); cycle('right'); }
  };

  return (
    <section id="gallery" className="gallery-section" aria-label="Photo Gallery">
      <div className="section-inner">
        <div className="section-header" data-reveal="fade-up">
          <p className="eyebrow-warm">{tx.eyebrow}</p>
          <h2 className="section-heading">
            {tx.h2line1}<br/><em>{tx.h2line2}</em>
          </h2>
          <p className="section-sub">{tx.sub}</p>
        </div>

        <div
          className="fan-gallery"
          data-reveal="fade-up"
          role="group"
          aria-roledescription="carousel"
          aria-label="Signature photo carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="fan-stage">
            <div className="fan-layout" ref={fanRef}>
              {cards.map((card, i) => {
                const d = visibleMap.get(i);
                const hidden = d === undefined;
                const tier = hidden ? 4 : Math.min(Math.abs(d), 4);
                return (
                  <button
                    key={i}
                    type="button"
                    className={`fan-card${d === 0 ? ' is-hero' : ''}`}
                    style={{ '--tier': tier }}
                    onClick={() => onOpenLightbox(i)}
                    aria-label={`View photo: ${card.alt}`}
                    aria-hidden={hidden}
                    tabIndex={hidden ? -1 : 0}
                  >
                    <span className="fan-card-frame">
                      <img
                        src={card.src}
                        alt={card.alt}
                        className="fan-card-img"
                        loading={d === 0 ? 'eager' : 'lazy'}
                        fetchPriority={d === 0 ? 'high' : 'auto'}
                        style={card.focus ? { objectPosition: card.focus } : undefined}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="fan-controls">
            <button type="button" className="fan-arrow fan-arrow--prev" onClick={() => cycle('left')} aria-label="Previous photo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className="fan-dots">
              {cards.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`fan-dot${i === centerIndex ? ' is-active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  aria-current={i === centerIndex}
                />
              ))}
            </div>
            <button type="button" className="fan-arrow fan-arrow--next" onClick={() => cycle('right')} aria-label="Next photo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <p className="fan-caption">
            <span className="fan-caption-num">{String(centerIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            <span key={centerIndex} className="fan-caption-text">{cards[centerIndex].caption}</span>
          </p>
        </div>

        <div className="section-cta-row" data-reveal="fade-up">
          <Link to="/contact" className="btn-warm">{tx.cta}</Link>
        </div>
      </div>
    </section>
  );
}
