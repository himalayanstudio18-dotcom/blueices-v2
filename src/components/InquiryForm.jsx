import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import t from '../translations';
import { usePublishedRooms } from '../lib/usePublishedRooms';
import { submitInquiry } from '../lib/inquiriesApi';

const emptyForm = {
  name: '', phone: '', email: '', checkIn: '', checkOut: '',
  guests: '', preferredRoomId: '', message: '',
};

export default function InquiryForm() {
  const { lang } = useLanguage();
  const tx = t[lang].inquiryForm;
  const { rooms } = usePublishedRooms(lang);

  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [fieldError, setFieldError] = useState('');

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFieldError(tx.requiredName);
      return;
    }
    setFieldError('');
    setStatus('submitting');
    try {
      await submitInquiry(form);
      setStatus('success');
      setForm(emptyForm);
    } catch (err) {
      setStatus('error');
    }
  }

  return (
    <section className="inquiry-form-section">
      <div className="section-inner">
        <div className="inquiry-form-box" data-reveal="fade-up">
          <div className="inquiry-form-header">
            <p className="eyebrow-warm">{tx.eyebrow}</p>
            <h2 className="section-heading">{tx.h2}</h2>
            <p className="section-sub">{tx.sub}</p>
          </div>

          {status === 'success' ? (
            <p className="inquiry-form-feedback inquiry-form-feedback--success" role="status">{tx.success}</p>
          ) : (
            <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
              <div className="inquiry-form-grid">
                <label className="inquiry-field">
                  <span>{tx.labelName}</span>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
                </label>
                <label className="inquiry-field">
                  <span>{tx.labelPhone}</span>
                  <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </label>
                <label className="inquiry-field">
                  <span>{tx.labelEmail}</span>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </label>
                <label className="inquiry-field">
                  <span>{tx.labelGuests}</span>
                  <input type="number" min="1" value={form.guests} onChange={(e) => set('guests', e.target.value)} />
                </label>
                <label className="inquiry-field">
                  <span>{tx.labelCheckIn}</span>
                  <input type="date" value={form.checkIn} onChange={(e) => set('checkIn', e.target.value)} />
                </label>
                <label className="inquiry-field">
                  <span>{tx.labelCheckOut}</span>
                  <input type="date" value={form.checkOut} onChange={(e) => set('checkOut', e.target.value)} />
                </label>
                <label className="inquiry-field inquiry-field--wide">
                  <span>{tx.labelRoom}</span>
                  <select value={form.preferredRoomId} onChange={(e) => set('preferredRoomId', e.target.value)}>
                    <option value="">{tx.roomAny}</option>
                    {rooms?.map((room) => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="inquiry-field">
                <span>{tx.labelMessage}</span>
                <textarea rows={4} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder={tx.messagePlaceholder} />
              </label>

              {fieldError && <p className="inquiry-form-feedback inquiry-form-feedback--error" role="alert">{fieldError}</p>}
              {status === 'error' && <p className="inquiry-form-feedback inquiry-form-feedback--error" role="alert">{tx.error}</p>}

              <button type="submit" className="btn-warm inquiry-form-submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? tx.submitting : tx.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
