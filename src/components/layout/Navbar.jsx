import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, Bot, History,
  Trophy, FileText, LogOut, Leaf, Menu, X, Dna
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { signOut } from '../../services/auth';

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/log',        icon: PlusCircle,      label: 'Log Today'      },
  { to: '/coach',      icon: Bot,             label: 'AI Coach'       },
  { to: '/twin',       icon: Dna,             label: 'Carbon Twin',  badge: '✨' },
  { to: '/history',    icon: History,         label: 'History'        },
  { to: '/challenges', icon: Trophy,          label: 'Challenges'     },
  { to: '/report',     icon: FileText,        label: 'Weekly Report'  },
];

export default function Navbar() {
  const { user, stats } = useAppStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">CarbonWise AI</p>
          <p className="text-xs text-green-400">Your carbon coach</p>
        </div>
      </div>

      {/* Streak badge */}
      {stats?.currentStreak > 0 && (
        <div className="mx-4 mt-4 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-xs font-semibold text-orange-300">{stats.currentStreak}-day streak!</p>
            <p className="text-xs text-gray-500">Keep it going</p>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && <span className="text-xs">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full ring-2 ring-green-500/30" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-forest-700 flex items-center justify-center text-xs font-bold text-green-300">
              {user?.displayName?.[0] ?? 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.displayName ?? 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="btn-secondary w-full text-xs py-2">
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col glass-card rounded-none border-r border-white/5 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between border-b border-white/5"
              style={{ background: 'rgba(8,12,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">CarbonWise AI</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-gray-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full flex flex-col"
                 style={{ background: 'rgba(8,12,8,0.98)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
