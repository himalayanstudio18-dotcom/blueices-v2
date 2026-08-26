/* ═══════════════════════════════════════════════════════════════
   REAL PROPERTY PHOTOGRAPHY — ASSET MANIFEST
   ───────────────────────────────────────────────���───────────────
   Source folders live outside /public and contain spaces (and a
   typo: "room imeges"). Rather than duplicate ~20MB into /public,
   we let Vite bundle them: import.meta.glob with eager+url returns
   hashed, build-optimised URLs and works in dev and prod alike.

   Filenames are WhatsApp exports (IMG-20260804-WA0003.jpg) and
   carry no meaning, so the curated arrays below assign each photo
   an editorial ROLE. If a photo is swapped, change it here only —
   components import roles, never raw filenames.
   ═══════════════════════════════════════════════════════════════ */

/* Signature fan-carousel source photos (Story page) — a dedicated,
   explicitly-ordered set, imported by name rather than through a
   sorted glob because the sequence itself is curated editorial flow
   (nature → exterior → interior rhythm), not filename order. */
import galleryTeaGarden from '../../gallery imeges/experience_tea_garden.png';
import galleryMountainView from '../../gallery imeges/IMG-20260804-WA0003.jpg';
import galleryForestTrail from '../../gallery imeges/IMG-20260806-WA0021.jpg';
import galleryPeakThroughTrees from '../../gallery imeges/IMG-20260806-WA0023.jpg';
import galleryValleyRoad from '../../gallery imeges/IMG-20260806-WA0024.jpg';
import galleryCloudsHills from '../../gallery imeges/IMG-20260806-WA0025.jpg';
import galleryDuskExteriorA from '../../gallery imeges/IMG-20260806-WA0027.jpg';
import galleryDuskExteriorB from '../../gallery imeges/IMG-20260806-WA0029.jpg';
import galleryRiverValley from '../../gallery imeges/IMG-20260806-WA0030.jpg';
import galleryRoomWindowSeat from '../../gallery imeges/photo_2026-08-06_21-36-21.jpg';
import galleryRoomEvening from '../../gallery imeges/photo_2026-08-06_21-36-31.jpg';
import galleryRoomMorning from '../../gallery imeges/photo_2026-08-06_21-36-34.jpg';
import galleryKitchen from '../../gallery imeges/photo_2026-08-06_21-36-37.jpg';
import galleryVillageView from '../../gallery imeges/village_valley_view.png';

const outsideMods = import.meta.glob('../../outside images/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const roomMods = import.meta.glob('../../room imeges/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

/* The one official brand asset currently supplied. */
const brandMods = import.meta.glob('../../brand assets/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const brandLogo = Object.values(brandMods)[0];

/* Sort by path so ordering is deterministic across platforms —
   glob key order is not guaranteed to be sorted. */
const byPath = (mods) =>
  Object.keys(mods)
    .sort()
    .map((k) => mods[k]);

export const outsidePhotos = byPath(outsideMods);
export const roomPhotos = byPath(roomMods);

/* ── Editorial roles ──────────────────────────────────────────
   outsidePhotos sorted → WA0003, WA0006, WA0008, WA0015, WA0017
   WA0008 is the strongest above-the-clouds frame → hero.        */
export const photos = {
  hero: outsidePhotos[2] ?? outsidePhotos[0],
  /* arrival/valley: the "Private Himalayan Sanctuary" homepage teaser
     only — nothing else imports these two keys. */
  arrival: galleryTeaGarden,
  /* outside images/ holds a single photo, so any index past [0] was
     silently undefined (a pre-existing bug — FinalCTA's .cta-bg was
     rendering url("undefined")). Given the fallback pattern already
     used for `hero` above. */
  landscape: outsidePhotos[1] ?? outsidePhotos[0],
  valley: galleryValleyRoad,
  exterior: outsidePhotos[4] ?? outsidePhotos[1] ?? outsidePhotos[0],

  roomFeature: galleryRoomWindowSeat,
  roomSecond: galleryRoomEvening,
  roomThird: galleryRoomMorning,

  /* Lakhey Heritage section (Story page) only — kept distinct from
     `arrival`/`exterior` above, which HomeTeasers.jsx also uses. */
  heritageMain: galleryForestTrail,
  heritageInset: galleryVillageView,

  /* "The Lakhey Promise" homepage closing statement — a small
     supporting thumbnail. Deliberately not `landscape` (the single
     outside images/ photo), which is already the homepage hero. */
  promiseAccent: galleryDuskExteriorA,

  /* Homepage video poster (click-to-play facade). Not `valley`/
     `arrival` (used immediately below by the Welcome section) or
     `promiseAccent` (used further down by Why) — kept visually
     distinct from its neighbors. */
  videoPoster: galleryMountainView,
};

/* Room detail-modal galleries (Stay page) — each room's cover photo
   (the same frame used on its card) plus two supporting interior
   frames from room imeges/, chosen so no two rooms repeat the same
   supporting shot. */
export const roomGalleries = [
  [galleryRoomWindowSeat, roomPhotos[0], roomPhotos[6]],
  [galleryRoomEvening, roomPhotos[4], roomPhotos[8]],
  [galleryRoomMorning, roomPhotos[9], roomPhotos[11]],
].map((set) => set.filter(Boolean));

/* Home "Signature Impressions" gallery strip — every strong frame in
   gallery imeges/, in the same nature → exterior → interior rhythm
   as the Story page's fan carousel (kitchen and one duplicate
   bedroom angle excluded to keep the twelve varied, not because
   they're lower quality). */
export const galleryPhotos = [
  galleryTeaGarden,
  galleryMountainView,
  galleryForestTrail,
  galleryPeakThroughTrees,
  galleryValleyRoad,
  galleryCloudsHills,
  galleryDuskExteriorA,
  galleryDuskExteriorB,
  galleryRiverValley,
  galleryRoomWindowSeat,
  galleryRoomEvening,
  galleryVillageView,
].filter(Boolean);

/* Signature gallery + fan carousel (Story page) — fourteen frames
   from gallery imeges/, ordered as a deliberate editorial rhythm
   (nature → exterior → interior, never too many of one kind in a
   row) rather than filename order. Every card in the carousel
   renders at one fixed portrait ratio (see .fan-card-frame in
   index.css) — object-fit:cover crops each photo into it regardless
   of its native orientation, so `focus` optionally overrides the
   crop's object-position when the default center crop would lose
   the subject (e.g. a wide panorama). */
export const signaturePhotos = [
  { src: galleryTeaGarden, alt: 'Terraced tea gardens wrapped in morning mist' },
  { src: galleryMountainView, alt: 'Above the cloud line at first light' },
  { src: galleryForestTrail, alt: 'A misty forest trail through tall pines', focus: 'center 60%' },
  { src: galleryPeakThroughTrees, alt: 'The Kanchenjunga range framed by trees above the village' },
  { src: galleryValleyRoad, alt: 'The valley road winding through forested hills' },
  { src: galleryRiverValley, alt: 'A panoramic view of the river valley below' },
  { src: galleryDuskExteriorA, alt: 'The homestay lit warmly at dusk' },
  { src: galleryDuskExteriorB, alt: 'The homestay balcony glowing in the evening' },
  { src: galleryCloudsHills, alt: 'Clouds drifting over the forested ridgeline', focus: 'center 35%' },
  { src: galleryRoomWindowSeat, alt: 'A sunlit guest room with a window seat' },
  { src: galleryRoomEvening, alt: 'A cozy bedroom corner in warm evening light' },
  { src: galleryRoomMorning, alt: 'A guest room bathed in morning light', focus: '35% center' },
  { src: galleryKitchen, alt: 'The homestay kitchen' },
  { src: galleryVillageView, alt: 'The village terraced into the mountainside at sunrise' },
].filter((p) => p.src);

/* Why Blue Ice — three supporting frames. Card 1 ("Stay Like
   Family") keeps its original photo; cards 2 and 3 use the same
   frames as the Signature Gallery for a cinematic mountain horizon
   and the terraced village respectively. */
export const whyPhotos = [
  roomPhotos[7] ?? roomPhotos[0],
  galleryCloudsHills,
  galleryVillageView,
].filter(Boolean);

/* Page banner imagery, keyed by route */
export const banners = {
  stays: roomPhotos[1] ?? roomPhotos[0],
  experiences: outsidePhotos[1],
  story: outsidePhotos[0],
  contact: outsidePhotos[3] ?? outsidePhotos[1],
};

export default photos;
