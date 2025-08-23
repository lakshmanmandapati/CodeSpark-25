import React, { useState } from 'react';
import { Hero1 } from './components/ui/hero-with-text-and-two-button';
import { BrandScroller } from './components/ui/brand-scoller';
import { Component as BgGradient } from './components/ui/bg-gredient';

export default function LandingPage({ onSignUp, onSignIn }) {
  return (
    <div className="min-h-screen relative" style={{background: 'radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)'}}>
      {/* Background Gradient - Applied directly to container */}
      {/* Hero Section */}
      <Hero1 onSignUp={onSignUp} onSignIn={onSignIn} />
    </div>
  );
}
