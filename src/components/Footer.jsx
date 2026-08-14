import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, MapIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { brandLogo } from '../assets/photos';
import { useSettings } from '../lib/useSettings';
import { normalizeWhatsAppNumber, toIndianTelHref } from '../lib/phone';

/* Fallback only — used while settings are loading or if the admin
   hasn't set inquiry_numbers yet. Once settings.inquiry_numbers is
   populated (Admin > Settings > Property), that list drives this
   block instead. */
const DEFAULT_INQUIRY_NUMBERS = ['9804974595', '7602661373', '7063122577'];

/* Same defaults as before this block became CMS-driven — kept as
   fallbacks so existing installs see no visible change until the
   admin sets Location fields in Property Settings. */
const DEFAULT_MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4405.880769181037!2d88.55515369999999!3d27.1375835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e41f00764cf4e9%3A0x81882ff4e9c42c54!2sLakhey%20Lachen%20Homestay%20(%20By%20blue%20ice%20)!5e1!3m2!1sen!2sin!4v1786642827296!5m2!1sen!2sin';
const DEFAULT_MAP_URL = 'https://maps.app.goo.gl/hLRna3J3rM35kYuPA?g_st=ac';

export default function Footer() {
  const { lang } = useLanguage();
  const tx = t[lang].footer;
  const settings = useSettings();

  const facebookUrl = settings?.facebook_url || 'https://facebook.com/blueice.munsong';
  const instagramUrl = settings?.instagram_url || 'https://instagram.com/blueice.munsong';
  const whatsappNumber = settings?.whatsapp || '919804974595';
  const email = settings?.email || 'blueicemunsong@gmail.com';
  const address = settings?.address || null;
  const mapEmbedUrl = settings?.google_maps_embed_url || DEFAULT_MAP_EMBED_URL;
  const mapUrl = settings?.google_maps_url || DEFAULT_MAP_URL;
  const locationLabel = settings?.location_label || tx.colFindUs;
  const locationNote = settings?.location_note || null;
  const mapCtaLabel = (lang === 'bn' ? settings?.map_cta_label_bn : settings?.map_cta_label_en) || tx.mapCta;
  const inquiryNumbers = (
    Array.isArray(settings?.inquiry_numbers) && settings.inquiry_numbers.length
      ? settings.inquiry_numbers
      : DEFAULT_INQUIRY_NUMBERS
  ).filter((n) => n && String(n).trim());

  return (
    <footer className="footer" aria-label="Site footer">
      <div className="footer-inner">
        <div className="footer-brand">
          {/* Same crest + mark + subtitle treatment as .nav-logo,
              scaled up for the footer's larger column. */}
          <div className="footer-logo">
            <img src={brandLogo} alt="" aria-hidden="true" className="footer-logo-crest" />
            <span className="footer-logo-text">
              <span className="footer-logo-mark">Blue<span>Ice</span></span>
              <span className="footer-logo-sub">Lakhey Lachen &middot; Munsong</span>
            </span>
          </div>
          <p className="footer-tagline">{tx.tagline}</p>
          <div className="footer-socials">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
              aria-label="Facebook"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href={`https://wa.me/${normalizeWhatsAppNumber(whatsappNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
              aria-label="WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-heading">{tx.colExplore}</h4>
          <ul>
            <li><Link to="/"           className="footer-link">{tx.linkHome}</Link></li>
            <li><Link to="/stays"      className="footer-link">{tx.linkStays}</Link></li>
            <li><Link to="/experiences" className="footer-link">{tx.linkExp}</Link></li>
            <li><Link to="/story"       className="footer-link">{tx.linkStory}</Link></li>
            <li><Link to="/contact"     className="footer-link">{tx.linkContact}</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-col-heading">{tx.colContact}</h4>
          <ul>
            <li><Link to="/contact" className="footer-link">{tx.linkWhatsApp}</Link></li>
            <li><a href={`mailto:${email}`} className="footer-link">{email}</a></li>
            {address ? (
              <li><span className="footer-plain">{address}</span></li>
            ) : (
              <>
                <li><span className="footer-plain">Lower Burmaik, Munsong</span></li>
                <li><span className="footer-plain">Kalimpong, West Bengal</span></li>
              </>
            )}
          </ul>

          {inquiryNumbers.length > 0 && (
            <>
              <p className="footer-inquiry-label">{tx.inquiryLabel}</p>
              <ul className="footer-inquiry-list">
                {inquiryNumbers.map((n) => (
                  <li key={n}><a href={toIndianTelHref(n)} className="footer-link">{n}</a></li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="footer-find-us">
          <h4 className="footer-col-heading">{locationLabel}</h4>
          <p className="footer-plain footer-find-us-address">
            {address || 'Lower Burmaik, Munsong, Kalimpong, West Bengal'}
          </p>
          <div className="footer-map">
            <iframe
              src={mapEmbedUrl}
              title="Lakhey Lachen Homestay location"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          {locationNote && <p className="footer-plain footer-find-us-note">{locationNote}</p>}
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-map-cta"
          >
            <MapIcon size={14} />
            <span>{mapCtaLabel}</span>
            <span aria-hidden="true" className="footer-map-cta-arrow">&#8599;</span>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{tx.copyright}</p>
        <p className="footer-made">{tx.madeWith} <HeartIcon size={12} color="var(--amber)" /> {tx.madeIn}</p>
      </div>
    </footer>
  );
}
