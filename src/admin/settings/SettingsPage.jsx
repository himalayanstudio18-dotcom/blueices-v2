import React, { useEffect, useState } from 'react';
import { getSettings, saveSettingsDraft, publishSettingsDraft, revertSettingsDraft } from './settingsApi';
import { useAdminAuth } from '../AdminAuthContext';
import { updateStaffName } from '../staff/staffApi';
import { logActivity } from '../activityLogApi';
import { supabase } from '../../lib/supabaseClient';
import { friendlyError } from '../friendlyError';
import { useToast, useConfirm } from '../ui/AdminUIProvider';
import { visibleSettingsTabs } from '../permissions';

const MAX_NAME_LENGTH = 80;

const GOOGLE_MAPS_URL_HOSTS = ['maps.app.goo.gl', 'goo.gl', 'google.com', 'www.google.com', 'maps.google.com'];

function validateField(field, value) {
  if (field === 'email') {
    if (!value) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  }
  if (field === 'whatsapp') {
    if (!value) return 'WhatsApp number is required.';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) return 'Enter a valid WhatsApp number (7–15 digits).';
  }
  if (field === 'address') {
    if (!value) return 'Property address is required.';
  }
  if (field === 'google_maps_url') {
    if (!value) return 'Google Maps location URL is required.';
    let url;
    try { url = new URL(value); } catch { return 'Enter a valid URL (starting with https://).'; }
    if (url.protocol !== 'https:') return 'Google Maps URL must use https://.';
    if (!GOOGLE_MAPS_URL_HOSTS.includes(url.hostname)) return 'Enter a Google Maps link (e.g. maps.app.goo.gl or google.com/maps).';
  }
  if (field === 'google_maps_embed_url') {
    if (!value) return 'Google Maps embed URL is required.';
    let url;
    try { url = new URL(value); } catch { return 'Enter a valid embed URL (starting with https://).'; }
    if (url.protocol !== 'https:') return 'Embed URL must use https://.';
    if (url.hostname !== 'www.google.com' || !url.pathname.startsWith('/maps/embed')) {
      return 'Enter a Google Maps embed URL (starts with https://www.google.com/maps/embed).';
    }
  }
  if (field === 'latitude') {
    if (value !== null && value !== '' && (Number.isNaN(Number(value)) || Number(value) < -90 || Number(value) > 90)) {
      return 'Latitude must be a number between -90 and 90.';
    }
  }
  if (field === 'longitude') {
    if (value !== null && value !== '' && (Number.isNaN(Number(value)) || Number(value) < -180 || Number(value) > 180)) {
      return 'Longitude must be a number between -180 and 180.';
    }
  }
  return null;
}

function swapItems(list, i, j) {
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function TextField({ settings, shown, save, savedField, field, label, type = 'text' }) {
  if (!settings) return null;
  const value = shown(field);
  return (
    <label className="admin-field">
      <span>{label} {savedField === field && <span className="admin-content-saved">Draft saved</span>}</span>
      <input
        type={type}
        defaultValue={value ?? ''}
        key={`${field}-${value}`}
        onBlur={(e) => e.target.value !== (value ?? '') && save(field, e.target.value || null)}
      />
    </label>
  );
}

function ToggleField({ settings, shown, save, field, label }) {
  if (!settings) return null;
  return (
    <label className="admin-field admin-field--checkbox">
      <input type="checkbox" checked={!!shown(field)} onChange={(e) => save(field, e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function InquiryNumbersField({ settings, shown, save, savedField, inquiryError, setInquiryError }) {
  if (!settings) return null;
  const raw = shown('inquiry_numbers');
  const list = Array.isArray(raw) && raw.length ? raw : [''];

  function commit(next) {
    setInquiryError('');
    save('inquiry_numbers', next);
  }

  function handleBlur(i, typed) {
    const trimmed = typed.trim();
    if (trimmed === (list[i] ?? '')) return;
    if (trimmed) {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        setInquiryError('Enter a valid phone number (7–15 digits) or remove it.');
        return;
      }
    }
    const next = [...list];
    next[i] = trimmed;
    commit(next);
  }

  return (
    <div className="admin-field admin-inquiry-numbers">
      <span>
        Inquiry Numbers {savedField === 'inquiry_numbers' && <span className="admin-content-saved">Draft saved</span>}
      </span>
      <div className="admin-inquiry-number-list">
        {list.map((n, i) => (
          <div className="admin-inquiry-number-row" key={i}>
            <input
              type="tel"
              defaultValue={n}
              key={`inquiry-${i}-${n}`}
              placeholder="e.g. 9804974595"
              onBlur={(e) => handleBlur(i, e.target.value)}
            />
            <div className="admin-room-row-reorder admin-gallery-reorder">
              <button
                type="button"
                onClick={() => commit(swapItems(list, i, i - 1))}
                disabled={i === 0}
                aria-label="Move number up"
              >↑</button>
              <button
                type="button"
                onClick={() => commit(swapItems(list, i, i + 1))}
                disabled={i === list.length - 1}
                aria-label="Move number down"
              >↓</button>
            </div>
            <button
              type="button"
              className="admin-btn-ghost admin-btn-ghost--danger"
              onClick={() => commit(list.length > 1 ? list.filter((_, idx) => idx !== i) : [''])}
            >Remove</button>
          </div>
        ))}
      </div>
      {inquiryError && <p className="admin-auth-error">{inquiryError}</p>}
      <button type="button" className="admin-btn-ghost" onClick={() => commit([...list, ''])}>
        + Add Another Number
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { staff, user, role, signOut, refreshStaff } = useAdminAuth();
  const TABS = visibleSettingsTabs(role);
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState(TABS[0]);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [savedField, setSavedField] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [showMapPreview, setShowMapPreview] = useState(false);

  async function load() {
    try {
      setSettings(await getSettings());
      setError('');
    } catch (err) {
      setError(friendlyError(err, 'load settings'));
    }
  }

  useEffect(() => { load(); }, []);

  const draft = settings?.draft_data ?? {};
  const hasDraft = settings?.draft_data != null && Object.keys(draft).length > 0;

  function shown(field) {
    return field in draft ? draft[field] : settings?.[field];
  }

  async function save(field, value) {
    const validationError = validateField(field, value);
    if (validationError) {
      showToast({ type: 'error', title: 'Invalid value', message: validationError });
      return;
    }
    try {
      const previous = shown(field);
      await saveSettingsDraft({ [field]: value });
      setSettings((s) => ({ ...s, draft_data: { ...(s.draft_data ?? {}), [field]: value } }));
      logActivity(staff, { action: 'settings_change', entity: 'settings', detail: `${field} (draft)`, oldValue: previous, newValue: value });
      setSavedField(field);
      setTimeout(() => setSavedField((f) => (f === field ? null : f)), 1500);
    } catch (err) {
      const friendly = friendlyError(err, 'save this setting');
      setError(friendly);
      showToast({ type: 'error', title: 'Save failed', message: friendly });
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      await publishSettingsDraft();
      logActivity(staff, { action: 'settings_change', entity: 'settings', detail: `${Object.keys(draft).length} field(s) published` });
      showToast({ type: 'success', title: 'Changes published', message: 'Changes published successfully.' });
      await load();
    } catch {
      showToast({ type: 'error', title: 'Publish failed', message: 'Unable to publish changes. Please try again.' });
    } finally {
      setPublishing(false);
    }
  }

  async function handleDiscard() {
    const confirmed = await confirm({
      title: 'Discard Draft?',
      message: 'Discard your unpublished settings changes? The live site will stay exactly as it is now.',
      confirmLabel: 'Discard Draft',
    });
    if (!confirmed) return;
    try {
      await revertSettingsDraft();
      showToast({ type: 'info', title: 'Draft discarded', message: 'Your pending changes were removed.' });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Discard failed', message: friendlyError(err, 'discard this draft') });
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header admin-page-header--row">
        <div>
          <p className="admin-eyebrow">Settings</p>
          <h1>Property Settings</h1>
        </div>
        {tab !== 'Account' && hasDraft && (
          <div className="admin-editor-status">
            <span className="admin-badge is-draft">{Object.keys(draft).length} pending change{Object.keys(draft).length > 1 ? 's' : ''}</span>
            <button type="button" className="admin-btn-ghost admin-btn-ghost--danger" onClick={handleDiscard}>Discard Draft</button>
            <button type="button" className="admin-btn-primary" onClick={handlePublish} disabled={publishing}>
              {publishing ? 'Publishing…' : 'Publish Changes'}
            </button>
          </div>
        )}
      </header>

      {tab !== 'Account' && (
        <p className="admin-placeholder-note admin-editor-hint">
          Changes save as a draft — the live site won&rsquo;t change until you Publish.
        </p>
      )}

      {error && <p className="admin-auth-error">{error}</p>}

      {hasDraft && tab !== 'Account' && Object.keys(draft).length > 0 && (
        <div className="admin-content-card admin-preview-note-card">
          <p className="admin-preview-note">Pending changes: {Object.keys(draft).map((k) => k.replace(/_/g, ' ')).join(', ')}</p>
        </div>
      )}

      <div className="admin-filter-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`admin-filter-tab${tab === t ? ' is-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {settings === null && !error && <p>Loading…</p>}

      {settings && tab === 'Property' && (
        <div className="admin-content-card">
          <div className="admin-form-grid">
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="property_name" label="Property Name" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="logo_url" label="Logo URL" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="favicon_url" label="Favicon URL" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="phone" label="Phone" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="email" label="Email" type="email" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="whatsapp" label="WhatsApp Number (digits only, with country code)" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="checkin_time" label="Check-in Time" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="checkout_time" label="Check-out Time" />
          </div>
          <InquiryNumbersField settings={settings} shown={shown} save={save} savedField={savedField} inquiryError={inquiryError} setInquiryError={setInquiryError} />
        </div>
      )}

      {settings && tab === 'Property' && (
        <div className="admin-content-card" style={{ marginTop: '1rem' }}>
          <h2 className="admin-content-card-header">Location &amp; Map</h2>
          <div className="admin-form-grid">
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="address" label="Property Address" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="location_label" label="Location Label (e.g. Find Us)" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="google_maps_url" label="Google Maps Location URL" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="google_maps_embed_url" label="Google Maps Embed URL" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="latitude" label="Latitude" type="number" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="longitude" label="Longitude" type="number" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="location_note" label="Directions / Location Note" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="map_cta_label_en" label="English Map CTA Label" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="map_cta_label_bn" label="Bengali Map CTA Label" />
          </div>

          <div className="admin-location-actions">
            <a
              href={shown('google_maps_url') || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`admin-btn-ghost${!shown('google_maps_url') ? ' is-disabled' : ''}`}
              onClick={(e) => { if (!shown('google_maps_url')) e.preventDefault(); }}
              aria-disabled={!shown('google_maps_url')}
            >
              Test Google Maps Link
            </a>
            <button type="button" className="admin-btn-ghost" onClick={() => setShowMapPreview((v) => !v)}>
              {showMapPreview ? 'Hide Preview' : 'Preview Map'}
            </button>
          </div>

          {showMapPreview && (
            <div className="admin-location-preview">
              <p className="admin-content-card-header" style={{ fontSize: '0.9rem' }}>{shown('location_label') || 'Find Us'}</p>
              <p className="admin-placeholder-note" style={{ margin: '0.25rem 0 0.75rem' }}>{shown('address') || 'No address set yet.'}</p>
              {shown('google_maps_embed_url') ? (
                <div className="admin-location-preview-map">
                  <iframe
                    src={shown('google_maps_embed_url')}
                    title="Location preview"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : (
                <p className="admin-placeholder-note">Set a Google Maps Embed URL to preview the map here.</p>
              )}
              {shown('location_note') && <p className="admin-placeholder-note" style={{ marginTop: '0.75rem' }}>{shown('location_note')}</p>}
              <div className="admin-location-preview-cta">
                {shown('map_cta_label_en') && <span className="admin-badge">EN: {shown('map_cta_label_en')}</span>}
                {shown('map_cta_label_bn') && <span className="admin-badge">BN: {shown('map_cta_label_bn')}</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {settings && tab === 'Booking' && (
        <div className="admin-content-card">
          <div className="admin-form-grid">
            <ToggleField settings={settings} shown={shown} save={save} field="booking_enabled" label="Inquiries Enabled" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="min_stay" label="Minimum Stay (nights)" type="number" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="max_guests" label="Maximum Guests" type="number" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="cancellation_policy" label="Cancellation Policy (short summary)" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="booking_message" label="Booking Message" />
          </div>
        </div>
      )}

      {settings && tab === 'Social' && (
        <div className="admin-content-card">
          <div className="admin-form-grid">
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="instagram_url" label="Instagram URL" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="facebook_url" label="Facebook URL" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="youtube_url" label="YouTube URL" />
            <TextField settings={settings} shown={shown} save={save} savedField={savedField} field="google_business_url" label="Google Business Profile URL" />
          </div>
        </div>
      )}

      {settings && tab === 'Notifications' && (
        <div className="admin-content-card">
          <div className="admin-form-grid">
            <ToggleField settings={settings} shown={shown} save={save} field="notify_new_inquiry" label="Notify on New Inquiry" />
            <ToggleField settings={settings} shown={shown} save={save} field="notify_booking" label="Notify on Booking Confirmation" />
            <ToggleField settings={settings} shown={shown} save={save} field="notify_staff" label="Notify on Staff Changes" />
          </div>
        </div>
      )}

      {tab === 'Account' && (
        <AccountTab user={user} staff={staff} signOut={signOut} refreshStaff={refreshStaff} />
      )}
    </div>
  );
}

function AccountTab({ user, staff, signOut, refreshStaff }) {
  const { showToast } = useToast();
  const [name, setName] = useState(staff?.name ?? '');
  const [nameStatus, setNameStatus] = useState('idle');
  const [nameError, setNameError] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(staff?.name ?? '');
  }, [staff?.name]);

  const trimmedName = name.trim().replace(/\s+/g, ' ');
  const initial = (trimmedName || staff?.name || '?').charAt(0).toUpperCase();
  const nameUnchanged = trimmedName === (staff?.name ?? '');

  async function handleNameSave(e) {
    e.preventDefault();
    if (!trimmedName) {
      setNameError('Display name cannot be empty.');
      return;
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setNameError(`Display name must be ${MAX_NAME_LENGTH} characters or fewer.`);
      return;
    }
    setNameError('');
    setNameStatus('saving');
    try {
      const previousName = staff?.name ?? '';
      await updateStaffName(staff.id, trimmedName);
      logActivity(staff, { action: 'update', entity: 'account', detail: 'Display name updated', oldValue: previousName, newValue: trimmedName });
      await refreshStaff();
      setName(trimmedName);
      setNameStatus('saved');
      showToast({ type: 'success', title: 'Profile updated', message: 'Profile updated successfully.' });
      setTimeout(() => setNameStatus('idle'), 2000);
    } catch (err) {
      const friendly = friendlyError(err, 'update your profile');
      setNameError(friendly);
      showToast({ type: 'error', title: 'Update failed', message: friendly });
      setNameStatus('idle');
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    setError('');
    setStatus('saving');
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      logActivity(staff, { action: 'update', entity: 'account', detail: 'Password changed' });
      setPassword('');
      setStatus('saved');
      showToast({ type: 'success', title: 'Password updated', message: 'Your password was changed successfully.' });
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setError(err.message);
      showToast({ type: 'error', title: 'Update failed', message: err.message || 'Unable to update your password. Please try again.' });
      setStatus('idle');
    }
  }

  return (
    <>
      <div className="admin-content-card admin-profile-card">
        <h2 className="admin-content-card-header">Owner Profile</h2>
        <form onSubmit={handleNameSave} className="admin-profile-form">
          <div className="admin-profile-avatar" aria-hidden="true">{initial}</div>
          <label className="admin-field admin-profile-name-field">
            <span>Display Name {nameStatus === 'saved' && <span className="admin-content-saved">Saved</span>}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_NAME_LENGTH}
              required
            />
          </label>
          <div className="admin-field admin-profile-save">
            <button type="submit" className="admin-btn-primary" disabled={nameStatus === 'saving' || nameUnchanged || !trimmedName}>
              {nameStatus === 'saving' ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
        {nameError && <p className="admin-auth-error">{nameError}</p>}
      </div>

      <div className="admin-content-card" style={{ marginTop: '1rem' }}>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Email</span>
            <input value={user?.email ?? ''} disabled />
          </label>
          <label className="admin-field">
            <span>Role</span>
            <input value={staff?.role ?? ''} disabled />
          </label>
        </div>

        <form onSubmit={handlePasswordReset} className="admin-form-grid" style={{ marginTop: '1.25rem' }}>
          <label className="admin-field">
            <span>New Password {status === 'saved' && <span className="admin-content-saved">Saved</span>}</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
          </label>
          <div className="admin-field" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn-primary" disabled={status === 'saving' || password.length < 6}>
              {status === 'saving' ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </form>
        {error && <p className="admin-auth-error">{error}</p>}

        <button type="button" className="admin-btn-ghost admin-btn-ghost--dark" style={{ marginTop: '1.25rem' }} onClick={signOut}>
          Sign Out
        </button>
      </div>
    </>
  );
}
