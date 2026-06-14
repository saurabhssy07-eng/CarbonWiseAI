import React from 'react';

export default function Terms() {
  return (
    <div className="px-4 md:px-8 pt-24 pb-12 max-w-3xl mx-auto space-y-6 animate-fade-in text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
      
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
        <p>By accessing and using CarbonWise AI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2. Description of Service</h2>
        <p>CarbonWise AI provides tools for tracking carbon footprints, participating in eco-friendly challenges, and receiving AI-generated sustainability coaching.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">3. User Conduct</h2>
        <p>You agree to use the service only for lawful purposes. You must not submit false or misleading information that could manipulate the public leaderboard or challenges.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">4. Disclaimer</h2>
        <p>The calculations and coaching provided by CarbonWise AI are estimates based on standard conversion factors and AI generation. They are for educational purposes and should not be considered exact scientific measurements.</p>
      </section>

      <p className="text-sm text-gray-500 mt-8 pt-4 border-t border-white/10">Last updated: {new Date().toLocaleDateString()}</p>
    </div>
  );
}
