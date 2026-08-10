import React from 'react';
import StaysHero from '../components/StaysHero';
import FeaturedStay from '../components/FeaturedStay';
import FinalCTA from '../components/FinalCTA';

export default function StaysPage() {
  return (
    <div className="page-stays page-padding-top">
      <StaysHero />
      <FeaturedStay />
      <FinalCTA />
    </div>
  );
}
