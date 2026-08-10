import React from 'react';
import ContactHero from '../components/ContactHero';
import InquiryForm from '../components/InquiryForm';
import FinalCTA from '../components/FinalCTA';
import { ZapIcon, PhoneIcon, MailIcon, PlaneIcon, TrainIcon, CarIcon } from '../components/Icons';
import PoliciesBox from '../components/PoliciesBox';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { useSettings } from '../lib/useSettings';
import { normalizeWhatsAppNumber, toIndianTelHref } from '../lib/phone';

export default function ContactPage() {
  const { lang } = useLanguage();
  const tx = t[lang].contactPage;
  const settings = useSettings();
  const whatsappNumber = normalizeWhatsAppNumber(settings?.whatsapp || '919804974595');
  const phone = settings?.phone || '+919804974595';
  const email = settings?.email || 'blueicemunsong@gmail.com';
  const emailHref = `mailto:${email}?subject=${encodeURIComponent('Room Inquiry — BlueIce Lakhey Lachen Homestay')}&body=${encodeURIComponent('Hello,\n\nI would like to enquire about room availability and booking details.\n\nThank you.')}`;

  return (
    <div className="page-contact page-padding-top">
      <ContactHero />

      <section className="contact-details-section">
        <div className="section-inner">
          {/* Reuses the sitewide .section-header pattern (every other
              section opens this way) with copy that was already
              written for exactly this purpose in translations —
              tx.h1/tx.sub sat unused until now. */}
          <div className="section-header" data-reveal="fade-up">
            <h2 className="section-heading">{tx.h1line1} <em>{tx.h1line2}</em></h2>
            <p className="section-sub">{tx.sub}</p>
          </div>

          <div className="contact-cards-grid" data-reveal="fade-up">
            <div className="contact-card contact-card--primary">
              <span className="cc-num" aria-hidden="true">01</span>
              <span className="cc-badge"><ZapIcon size={14} color="var(--amber-light)" /> {tx.card1badge}</span>
              <h3>{tx.card1h3}</h3>
              <p>{tx.card1p}</p>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hello!%20I%20would%20like%20to%20reserve%20my%20stay%20at%20Lakhey%20Lachen%20Homestay.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-warm"
              >
                {tx.card1cta}
              </a>
            </div>

            <div className="contact-card">
              <span className="cc-num" aria-hidden="true">02</span>
              <span className="cc-badge"><PhoneIcon size={13} color="var(--amber-light)" /> {tx.card2badge}</span>
              <h3>{tx.card2h3}</h3>
              <p>{tx.card2p}</p>
              <a href={toIndianTelHref(phone)} className="btn-outline-warm">
                {tx.card2cta}
              </a>
            </div>

            <div className="contact-card">
              <span className="cc-num" aria-hidden="true">03</span>
              <span className="cc-badge"><MailIcon size={13} color="var(--amber-light)" /> {tx.card3badge}</span>
              <h3>{tx.card3h3}</h3>
              <p>{tx.card3p}</p>
              <a href={emailHref} className="btn-outline-warm">
                {tx.card3cta}
              </a>
            </div>
          </div>

          <div className="location-guide-box" data-reveal="fade-up">
            <div className="lgb-header">
              <h2>{tx.locationH2}</h2>
              <p>{tx.locationSub}</p>
            </div>
            <div className="lgb-grid">
              <div className="lgb-item">
                <span className="lgb-icon"><PlaneIcon size={17} color="var(--amber-light)" /></span>
                <div className="lgb-text">
                  <strong>{tx.loc1h}</strong>
                  <p>{tx.loc1p}</p>
                </div>
              </div>
              <div className="lgb-item">
                <span className="lgb-icon"><TrainIcon size={17} color="var(--amber-light)" /></span>
                <div className="lgb-text">
                  <strong>{tx.loc2h}</strong>
                  <p>{tx.loc2p}</p>
                </div>
              </div>
              <div className="lgb-item">
                <span className="lgb-icon"><CarIcon size={17} color="var(--amber-light)" /></span>
                <div className="lgb-text">
                  <strong>{tx.loc3h}</strong>
                  <p>{tx.loc3p}</p>
                </div>
              </div>
            </div>
          </div>

          <PoliciesBox />
        </div>
      </section>

      <InquiryForm />

      <FinalCTA />
    </div>
  );
}
