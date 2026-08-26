import React from 'react';
import Hero from '../components/Hero';
import {
  HomeVideoTeaser,
  HomeWelcomeTeaser,
  HomeExperiencesTeaser,
  HomeGalleryStrip,
  HomeWhyTeaser
} from '../components/HomeTeasers';
import FinalCTA from '../components/FinalCTA';

export default function HomePage() {
  return (
    <div className="page-home">
      <Hero />
      <HomeVideoTeaser />
      <HomeWelcomeTeaser />
      <HomeExperiencesTeaser />
      <HomeGalleryStrip />
      <HomeWhyTeaser />
      <FinalCTA />
    </div>
  );
}
