import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { brandLogo } from '../assets/photos';

export default function Navbar({ onOpenMobile }) {
  const { lang, setLang } = useLanguage();
  const tx = t[lang].nav;

  const toggleLang = () => setLang(lang === 'en' ? 'bn' : 'en');

  return (
    <nav id="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <Link to="/" className="nav-logo" aria-label="Blue Ice Homestay — Home">
          <img src={brandLogo} alt="" aria-hidden="true" className="nav-logo-crest" />
          <span className="nav-logo-text">
            <span className="nav-logo-mark">Blue<span>Ice</span></span>
            <span className="nav-logo-sub">Lakhey Lachen &middot; Munsong</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="nav-links" role="list">
          <li><NavLink to="/"            end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{tx.home}</NavLink></li>
          <li><NavLink to="/stays"           className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{tx.stays}</NavLink></li>
          <li><NavLink to="/experiences"     className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{tx.experiences}</NavLink></li>
          <li><NavLink to="/dining"          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{tx.dining}</NavLink></li>
          <li><NavLink to="/story"           className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{tx.story}</NavLink></li>
          <li><NavLink to="/contact"         className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{tx.contact}</NavLink></li>
        </ul>

        <div className="nav-right">
          {/* Language toggle — visible on desktop */}
          <button
            type="button"
            className="lang-toggle nav-lang-toggle"
            onClick={toggleLang}
            aria-label={`Switch to ${lang === 'en' ? 'Bengali' : 'English'}`}
            title={lang === 'en' ? 'বাংলায় পড়ুন' : 'Read in English'}
          >
            <span className="lt-dot"></span>
            {tx.langLabel}
          </button>

          <Link to="/contact" className="nav-cta btn-gold" id="nav-reserve-btn">{tx.book}</Link>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="nav-hamburger"
            id="nav-hamburger"
            aria-label="Open navigation menu"
            onClick={(e) => { e.stopPropagation(); onOpenMobile(); }}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
