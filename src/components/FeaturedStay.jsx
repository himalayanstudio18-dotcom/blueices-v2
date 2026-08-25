import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KitchenIcon, ElevationIcon, FireIcon, WifiIcon, CarIcon, TeaIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { usePublishedRooms } from '../lib/usePublishedRooms';
import RoomDetailsModal from './RoomDetailsModal';

const amenityIcons = [
  <KitchenIcon key="kitchen" size={20} color="var(--amber-light)" />,
  <ElevationIcon key="elevation" size={20} color="var(--amber-light)" />,
  <FireIcon key="fire" size={20} color="var(--amber-light)" />,
  <WifiIcon key="wifi" size={20} color="var(--amber-light)" />,
  <CarIcon key="car" size={20} color="var(--amber-light)" />,
  <TeaIcon key="tea" size={20} color="var(--amber-light)" />,
];

export default function FeaturedStay() {
  const { lang } = useLanguage();
  const tx = t[lang].featuredStay;
  const [openRoom, setOpenRoom] = useState(null);
  const { rooms, loading, error } = usePublishedRooms(lang);

  const handleCardKeyDown = (e, i) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpenRoom(i);
    }
  };

  return (
    <section id="stays" className="stays-section" aria-label="Stay Collection">
      <div className="section-inner">
        {/* Header */}
        <div className="section-header" data-reveal="fade-up">
          <p className="eyebrow-warm">{tx.eyebrow}</p>
          <h2 className="section-heading">
            {tx.h2line1} <em>{tx.h2line2}</em>
          </h2>
          <p className="section-sub">{tx.sub}</p>
        </div>

        {/* Room Cards */}
        <div className="stays-grid" data-reveal="fade-up">
          {loading && <p className="section-sub">Loading rooms…</p>}
          {error && <p className="section-sub">Rooms are temporarily unavailable — please check back shortly.</p>}
          {!loading && !error && rooms.length === 0 && (
            <p className="section-sub">No rooms published yet.</p>
          )}
          {rooms?.map((room, i) => (
            <article
              key={room.id}
              className="room-card"
              role="button"
              tabIndex={0}
              aria-label={`View details for ${room.name}`}
              onClick={() => setOpenRoom(i)}
              onKeyDown={(e) => handleCardKeyDown(e, i)}
            >
              <div className="rc-img-wrap">
                <img src={room.img} alt={room.name} className="rc-img" loading="lazy" />
                <div className="rc-img-overlay"></div>
                <span className={`rc-tag ${room.tagClass}`}>{room.tag}</span>
              </div>
              <div className="rc-body">
                <span className="rc-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="rc-name">{room.name}</h3>
                <div className="rc-meta">
                  <span>{room.capacity}</span>
                  <span className="rc-meta-sep" aria-hidden="true"></span>
                  <span>{room.size}</span>
                </div>
                <p className="rc-desc">{room.shortDesc}</p>
                {room.isAvailable ? (
                  <Link to="/contact" className="btn-warm rc-btn" onClick={(e) => e.stopPropagation()}>
                    {tx.ctaCard}
                  </Link>
                ) : (
                  <span className="btn-warm rc-btn rc-btn--disabled" aria-disabled="true" onClick={(e) => e.stopPropagation()}>
                    Currently Unavailable
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Amenities Bar */}
        <div className="amenities-bar" data-reveal="fade-up">
          <p className="amenities-title">{tx.amenitiesTitle}</p>
          <div className="amenities-row">
            {tx.amenities.map((label, i) => (
              <div key={i} className="amenity-pill">
                <span className="ap-icon">{amenityIcons[i]}</span>
                <span className="ap-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section-cta-row" data-reveal="fade-up">
          <Link to="/contact" className="btn-outline-warm">{tx.ctaBottom}</Link>
        </div>
      </div>

      {openRoom !== null && rooms?.[openRoom] && (
        <RoomDetailsModal
          key={rooms[openRoom].id}
          room={rooms[openRoom]}
          ctaLabel={tx.ctaCard}
          onClose={() => setOpenRoom(null)}
        />
      )}
    </section>
  );
}
