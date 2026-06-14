import React from 'react';

export default function Privacy() {
  return (
    <div className="px-4 md:px-8 pt-24 pb-12 max-w-3xl mx-auto space-y-6 animate-fade-in text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
      
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
        <p>Welcome to CarbonWise AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2. Data We Collect</h2>
        <p>We collect carbon footprint logs, activity data, and user preferences to generate personalized AI coaching and track your weekly challenges. This includes dietary preferences, transportation habits, and energy usage logged by you.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">3. How We Use Your Data</h2>
        <p>We use your data strictly to calculate your carbon footprint, update your leaderboard status, and interact with the Gemini AI API to provide personalized eco-friendly suggestions. We do not sell your personal data to third parties.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
        <p>We use Google Firebase for secure authentication and data storage, ensuring your data is protected according to industry standards.</p>
      </section>

      <p className="text-sm text-gray-500 mt-8 pt-4 border-t border-white/10">Last updated: {new Date().toLocaleDateString()}</p>
    </div>
  );
}
