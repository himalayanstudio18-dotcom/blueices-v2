import React from 'react';
import { ZapIcon, PlaneIcon, TrainIcon, CarIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../lib/useSiteContent';

const POLICY_ICONS = { checkin: PlaneIcon, checkout: TrainIcon, cancellation: CarIcon, house_rules: ZapIcon };
const POLICY_LABELS = {
  en: { checkin: 'Check-in Policy', checkout: 'Check-out Policy', cancellation: 'Cancellation Policy', house_rules: 'House Rules' },
  bn: { checkin: 'চেক-ইন নীতি', checkout: 'চেক-আউট নীতি', cancellation: 'বাতিলের নীতি', house_rules: 'বাড়ির নিয়ম' },
};

/* Renders nothing until the admin has filled in at least one policy
   field — used on the real Contact page and, unmodified, inside the
   admin's Draft Preview for the Policies section. */
export default function PoliciesBox() {
  const { lang } = useLanguage();
  const { get: getPolicy } = useSiteContent('policies', lang);
  const policyKeys = ['checkin', 'checkout', 'cancellation', 'house_rules'];
  const policies = policyKeys
    .map((key) => ({ key, text: getPolicy(key, '') }))
    .filter((p) => p.text);

  if (policies.length === 0) return null;

  return (
    <div className="location-guide-box policies-box" data-reveal="fade-up">
      <div className="lgb-header">
        <h2>{lang === 'bn' ? 'নীতিমালা' : 'Good to Know'}</h2>
      </div>
      <div className="lgb-grid">
        {policies.map(({ key, text }) => {
          const Icon = POLICY_ICONS[key];
          return (
            <div key={key} className="lgb-item">
              <span className="lgb-icon"><Icon size={17} color="var(--amber-light)" /></span>
              <div className="lgb-text">
                <strong>{POLICY_LABELS[lang][key]}</strong>
                <p>{text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
