import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Leaf, CheckCircle } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { completeOnboarding, updateUserStats, updateUserProfile } from '../../services/firestore';
import { analyzeBaseline } from '../../services/gemini';
import { getBaselineCO2 } from '../../utils/carbonCalculator';
import LoadingSpinner from '../ui/LoadingSpinner';

const steps = [
  {
    id: 'transport',
    title: 'How do you usually get around?',
    subtitle: 'Your primary daily transport mode',
    field: 'transportMode',
    options: [
      { value: 'car',    label: 'Car',           icon: '🚗', desc: 'Petrol or diesel vehicle'    },
      { value: 'bike',   label: 'Bicycle',        icon: '🚲', desc: 'Human-powered cycling'       },
      { value: 'public', label: 'Public Transit', icon: '🚌', desc: 'Bus, train or metro'         },
      { value: 'walk',   label: 'Walking',         icon: '🚶', desc: 'Mostly on foot'             },
    ],
  },
  {
    id: 'diet',
    title: 'What best describes your diet?',
    subtitle: 'Food is one of the biggest carbon factors',
    field: 'dietType',
    options: [
      { value: 'vegan',      label: 'Vegan',         icon: '🌱', desc: 'No animal products'       },
      { value: 'vegetarian', label: 'Vegetarian',    icon: '🥗', desc: 'No meat, some dairy/eggs' },
      { value: 'omnivore',   label: 'Mixed Diet',    icon: '🍽️', desc: 'Balanced meat & veg'     },
      { value: 'meat-heavy', label: 'Meat Lover',    icon: '🥩', desc: 'Meat with most meals'     },
    ],
  },
  {
    id: 'energy',
    title: 'What powers your home?',
    subtitle: 'Home energy is your third biggest source',
    field: 'energySource',
    options: [
      { value: 'renewable', label: 'Renewable',    icon: '☀️', desc: 'Solar, wind or green tariff' },
      { value: 'mixed',     label: 'Mixed Grid',   icon: '⚡', desc: 'Standard grid electricity'   },
      { value: 'fossil',    label: 'Fossil Fuels', icon: '🔥', desc: 'Gas, oil or coal heating'    },
    ],
    extraField: 'homeSize',
    extraLabel: 'Home size',
    extraOptions: [
      { value: 'small',  label: 'Small',  desc: 'Studio / 1-bed' },
      { value: 'medium', label: 'Medium', desc: '2–3 bedrooms'   },
      { value: 'large',  label: 'Large',  desc: '4+ bedrooms'    },
    ],
  },
];

export default function OnboardingWizard() {
  const { user, setProfile, showToast } = useAppStore();
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState({ transportMode: '', dietType: '', energySource: '', homeSize: 'medium' });
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);

  const current = steps[step];
  const canNext  = answers[current.field];

  function select(field, value) {
    setAnswers((a) => ({ ...a, [field]: value }));
  }

  async function handleFinish() {
    setLoading(true);
    try {
      const baseline = await analyzeBaseline(answers);
      const baselineProfile = {
        ...answers,
        baselineCO2: baseline.baseline_kg_day ?? getBaselineCO2(answers),
      };
      await completeOnboarding(user.uid, baselineProfile);
      // Persist the tips so Dashboard can display them
      if (baseline.tips?.length) {
        await updateUserProfile(user.uid, { baselineTips: baseline.tips });
      }
      setProfile((p) => ({ ...p, onboardingComplete: true, baselineProfile, baselineTips: baseline.tips ?? [] }));
      showToast('Welcome to CarbonWise AI! 🌿 Your baseline is set.');
      window.location.reload(); // Reload to re-trigger auth listener
    } catch (e) {
      console.error(e);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function goNext() { if (!canNext) return; setDirection(1); if (step < steps.length - 1) setStep(step + 1); else handleFinish(); }
  function goPrev() { if (step === 0) return; setDirection(-1); setStep(step - 1); }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"  style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">CarbonWise AI</span>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-green-500' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="glass-card p-6 md:p-8"
          >
            <div className="mb-6">
              <p className="text-xs text-green-400 font-medium mb-1">Step {step + 1} of {steps.length}</p>
              <h1 className="text-xl md:text-2xl font-bold text-white mb-1">{current.title}</h1>
              <p className="text-sm text-gray-400">{current.subtitle}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {current.options.map((opt) => {
                const selected = answers[current.field] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => select(current.field, opt.value)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      selected
                        ? 'border-green-500 bg-green-500/15 shadow-lg shadow-green-500/10'
                        : 'border-white/10 bg-carbon-800/40 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{opt.icon}</span>
                    <p className={`text-sm font-semibold mb-0.5 ${selected ? 'text-green-300' : 'text-white'}`}>{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                    {selected && <CheckCircle className="w-4 h-4 text-green-400 absolute top-3 right-3" />}
                  </button>
                );
              })}
            </div>

            {/* Extra field (home size on step 3) */}
            {current.extraField && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-300 mb-2">{current.extraLabel}</p>
                <div className="flex gap-2">
                  {current.extraOptions.map((opt) => {
                    const sel = answers[current.extraField] === opt.value;
                    return (
                      <button key={opt.value} onClick={() => select(current.extraField, opt.value)}
                              className={`flex-1 py-2.5 px-3 rounded-xl border text-center text-xs transition-all ${sel ? 'border-green-500 bg-green-500/15 text-green-300' : 'border-white/10 bg-carbon-800/40 text-gray-400 hover:border-white/20'}`}>
                        <p className="font-semibold">{opt.label}</p>
                        <p className="text-gray-500 mt-0.5">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              {step > 0 && (
                <button onClick={goPrev} className="btn-secondary flex-1 py-3">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button onClick={goNext} disabled={!canNext || loading} className="btn-primary flex-1 py-3">
                {loading ? (
                  <><LoadingSpinner size="sm" color="white" /> Analyzing...</>
                ) : step < steps.length - 1 ? (
                  <> Next <ChevronRight className="w-4 h-4" /></>
                ) : (
                  <> Get My Baseline 🌱</>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
