import React from 'react';
import Hero from '../components/Hero';
import {
  HomeVideoTeaser,
  HomeWelcomeTeaser,
  HomeExperiencesTeaser,
  HomeDiningTeaser,
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
      <HomeDiningTeaser />
      <HomeGalleryStrip />
      <HomeWhyTeaser />
      <FinalCTA />
    </div>
  );
}
