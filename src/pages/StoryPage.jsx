import React from 'react';
import StoryHero from '../components/StoryHero';
import Introduction from '../components/Introduction';
import SignatureGallery from '../components/SignatureGallery';
import WhyBlueIce from '../components/WhyBlueIce';
import FinalCTA from '../components/FinalCTA';

export default function StoryPage({ onOpenLightbox }) {
  return (
    <div className="page-story page-padding-top">
      <StoryHero />
      <Introduction />
      <SignatureGallery onOpenLightbox={onOpenLightbox} />
      <WhyBlueIce />
      <FinalCTA />
    </div>
  );
}
