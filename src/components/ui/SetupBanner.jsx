import React, { useState } from 'react';
import { AlertTriangle, X, ExternalLink, Copy, CheckCheck } from 'lucide-react';
import { FIREBASE_READY } from '../../services/firebase';
import { DEMO_MODE as GEMINI_DEMO } from '../../services/gemini';

export default function SetupBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [copied,    setCopied]    = useState(false);

  // Only show if something is in demo mode
  if ((!FIREBASE_READY || GEMINI_DEMO) === false) return null;
  if (dismissed) return null;

  const missingFirebase = !FIREBASE_READY;
  const missingGemini   = GEMINI_DEMO;

  async function copyEnvTemplate() {
    const template = [
      '# Firebase',
      'VITE_FIREBASE_API_KEY=your_key',
      'VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com',
      'VITE_FIREBASE_PROJECT_ID=your-project-id',
      'VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com',
      'VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id',
      'VITE_FIREBASE_APP_ID=your_app_id',
      '',
      '# Gemini AI',
      'VITE_GEMINI_API_KEY=your_gemini_key',
    ].join('\n');
    await navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[200]">
      <div className="mx-auto max-w-4xl m-2">
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/80 backdrop-blur-md px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-300 mb-0.5">
              🎮 Demo Mode Active
              {missingFirebase && <span className="ml-2 badge-pill bg-red-500/20 text-red-400 border border-red-500/20">Firebase missing</span>}
              {missingGemini   && <span className="ml-2 badge-pill bg-orange-500/20 text-orange-400 border border-orange-500/20">Gemini missing</span>}
            </p>
            <p className="text-xs text-amber-200/70">
              Add your API keys to <code className="px-1 py-0.5 rounded bg-black/30 font-mono text-amber-300">.env.local</code> to enable real Auth, Firestore &amp; AI.{' '}
              <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-0.5 text-amber-300 hover:text-amber-200 underline">
                Firebase Console <ExternalLink className="w-2.5 h-2.5" />
              </a>
              {' · '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-0.5 text-amber-300 hover:text-amber-200 underline">
                Gemini Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={copyEnvTemplate}
                    className="text-xs px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-1">
              {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : '.env template'}
            </button>
            <button onClick={() => setDismissed(true)}
                    className="p-1 text-amber-500/60 hover:text-amber-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
