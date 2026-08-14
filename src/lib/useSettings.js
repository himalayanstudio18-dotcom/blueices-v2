import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

/* Property-wide settings (phone, email, social links, etc.), fetched
   once and shared. Returns null while loading — callers should fall
   back to their existing hardcoded defaults until it resolves, same
   pattern as useSiteContent. */
export function useSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let active = true;
    supabase
      .from('settings')
      .select(`
        id, property_name, logo_url, favicon_url, phone, email, whatsapp,
        address, google_maps_url, google_maps_embed_url, location_label,
        latitude, longitude, location_note, map_cta_label_en, map_cta_label_bn,
        checkin_time, checkout_time,
        booking_enabled, min_stay, max_guests, cancellation_policy,
        booking_message, instagram_url, facebook_url, youtube_url,
        google_business_url, notify_new_inquiry, notify_booking,
        notify_staff, inquiry_numbers, updated_at
      `)
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        setSettings(error ? {} : (data ?? {}));
      });
    return () => { active = false; };
  }, []);

  return settings;
}
