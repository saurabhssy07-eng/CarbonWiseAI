import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Zap, Shield, TrendingDown, Bot, Trophy, ArrowRight, PlayCircle } from 'lucide-react';
import { signInWithGoogle } from '../services/auth';
import { FIREBASE_READY } from '../services/firebase';
import useAppStore from '../store/useAppStore';

const features = [
  { icon: TrendingDown, title: 'Real-time Tracking',  desc: 'Log transport, food, energy & shopping. Get instant CO₂ scores.', color: 'text-green-400',  bg: 'bg-green-500/10'  },
  { icon: Bot,          title: 'AI Carbon Coach',     desc: 'Chat with Gemini AI for personalized tips and reduction plans.',  color: 'text-teal-400',  bg: 'bg-teal-500/10'   },
  { icon: Trophy,       title: 'Gamified Streaks',    desc: 'Build daily habits with streak badges and weekly challenges.',     color: 'text-amber-400', bg: 'bg-amber-500/10'  },
  { icon: Zap,          title: 'Weekly AI Reports',   desc: 'Get AI-generated weekly summaries and performance grades.',       color: 'text-purple-400',bg: 'bg-purple-500/10' },
];

const stats = [
  { value: '4.7 kg',   label: 'Global daily CO₂ average' },
  { value: '50%',      label: 'Reduction possible with habits' },
  { value: '2°C',      label: 'Target we\'re all working toward' },
];

export default function Landing() {
  const navigate  = useNavigate();
  const { showToast } = useAppStore();

  async function handleGoogleSignIn() {
    if (!FIREBASE_READY) {
      // In demo mode, go straight to dashboard (demo user already injected)
      navigate('/dashboard');
      return;
    }
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (e) {
      showToast('Sign in failed. Please check your Firebase config.', 'error');
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-3xl"
             style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl"
             style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />
        <div className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl"
             style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white">CarbonWise AI</span>
        </div>
        <button onClick={handleGoogleSignIn} className="btn-primary text-sm py-2 px-4">
          {FIREBASE_READY ? 'Get Started Free' : '▶ Try Demo'}
        </button>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 mb-8 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-300 font-medium">Powered by Gemini AI</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 max-w-4xl text-balance animate-slide-up">
          Know Your{' '}
          <span className="gradient-text">Carbon Footprint.</span>
          {' '}Change Your World.
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 text-balance animate-slide-up" style={{ animationDelay: '0.1s' }}>
          CarbonWise AI analyzes your daily habits, calculates your real CO₂ impact,
          and gives you an AI coach to help you hit your climate goals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button onClick={handleGoogleSignIn}
                  id="hero-signin-btn"
                  className="btn-primary text-base py-4 px-8 rounded-2xl">
            {FIREBASE_READY ? (
              <><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5 bg-white rounded-full p-0.5" />
              Continue with Google
              <ArrowRight className="w-5 h-5" /></>
            ) : (
              <><PlayCircle className="w-5 h-5" />
              Explore Demo Dashboard
              <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
          <button className="btn-secondary text-base py-4 px-8 rounded-2xl">
            See How It Works
          </button>
        </div>
        {!FIREBASE_READY && (
          <p className="text-xs text-amber-400/70 mt-3">⚡ Running in demo mode — add Firebase keys to enable real accounts</p>
        )}

        <p className="text-xs text-gray-600 mt-4">Free forever. No credit card required.</p>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 px-6 pb-16">
        <div className="max-w-3xl mx-auto glass-card p-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl md:text-3xl font-black gradient-text mb-1">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 pb-20 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">Everything you need to go green</h2>
        <p className="text-gray-400 text-center mb-10">AI-powered tools to track, understand, and reduce your footprint.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="glass-card p-6 hover:border-white/10 transition-all duration-300 group">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-2xl mx-auto glass-card p-10 text-center"
             style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(20,184,166,0.05))' }}>
          <div className="text-5xl mb-4 animate-bounce-gentle">🌍</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Start your green journey today</h2>
          <p className="text-gray-400 mb-8">Join thousands tracking and reducing their carbon footprint with AI guidance.</p>
          <button onClick={handleGoogleSignIn} className="btn-primary text-base py-4 px-10 rounded-2xl">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5 bg-white rounded-full p-0.5" />
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center text-xs text-gray-600">
        <p>© 2025 CarbonWise AI — PromptWars Virtual Hackathon</p>
      </footer>
    </div>
  );
}
