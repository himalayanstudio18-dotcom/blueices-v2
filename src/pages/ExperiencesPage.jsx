import React from 'react';
import ExperiencesHero from '../components/ExperiencesHero';
import FeaturedExperiences from '../components/FeaturedExperiences';
import FinalCTA from '../components/FinalCTA';

export default function ExperiencesPage() {
  return (
    <div className="page-experiences page-padding-top">
      <ExperiencesHero />
      <FeaturedExperiences />
      <FinalCTA />
    </div>
  );
}
