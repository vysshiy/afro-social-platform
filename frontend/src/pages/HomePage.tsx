import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const FEED_ITEMS = [
  { id: 1, user: 'Amara O.', handle: '@amara_okonkwo', time: '2m', text: 'Just joined Afro Social! 🎉 Excited to connect with the community.', likes: 12, emoji: '✊🏿' },
  { id: 2, user: 'Kwame A.', handle: '@kwame_asante', time: '15m', text: 'Beautiful Lagos sunset 🌅 Nothing beats home.', likes: 47, emoji: '🌍' },
  { id: 3, user: 'Zuri N.', handle: '@zuri_nkosi',   time: '1h', text: 'African fashion week was 🔥 The designs were incredible this year.', likes: 103, emoji: '👑' },
];

export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg, #0a0a1a 0%, #0f0f2a 100%)' }}
    >
      {/* Nav */}
      <header
        className="sticky top-0 z-50 px-5 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(10,10,26,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">✊🏿</span>
          <span
            className="text-lg font-bold"
            style={{
              background: 'linear-gradient(135deg, #d4a017, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Afro Social
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-white/50 hover:text-white text-xl transition">🔔</button>
          <button className="text-white/50 hover:text-white text-xl transition">💬</button>
          <div className="w-8 h-8 rounded-full bg-afro-700 flex items-center justify-center text-sm font-bold text-afro-gold border border-afro-gold/30">
            A
          </div>
        </div>
      </header>

      {/* Welcome banner */}
      <div
        className="mx-4 mt-5 rounded-2xl px-5 py-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a3e 0%, #252550 100%)',
          border: '1px solid rgba(212,160,23,0.25)',
        }}
      >
        <div className="absolute right-4 top-4 text-4xl opacity-20">🌍</div>
        <p className="text-xs text-afro-gold/70 uppercase tracking-widest mb-1 font-medium">Welcome</p>
        <h1 className="text-2xl font-bold text-white mb-1">Your Feed 🏠</h1>
        <p className="text-sm text-white/50">Connect with the global African community</p>
      </div>

      {/* Stories row */}
      <div className="px-4 mt-5">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {['You', 'Amara', 'Kwame', 'Zuri', 'Temi', 'Lolo'].map((name, i) => (
            <div key={name} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2"
                style={{
                  borderColor: i === 0 ? '#d4a017' : 'rgba(255,255,255,0.15)',
                  background: `hsl(${i * 40}, 50%, 20%)`,
                }}
              >
                {['✊🏿','👤','🌟','🎨','🔥','💫'][i]}
              </div>
              <span className="text-xs text-white/50">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Post composer */}
      <div className="mx-4 mt-5 glass-card px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-afro-700 flex items-center justify-center text-lg border border-afro-gold/30 flex-shrink-0">
          ✊🏿
        </div>
        <button
          className="flex-1 text-left text-white/35 text-sm px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          What's on your mind?
        </button>
        <button className="text-white/40 hover:text-afro-gold text-xl transition">📸</button>
      </div>

      {/* Feed */}
      <div className="px-4 mt-4 space-y-3 pb-24">
        {FEED_ITEMS.map(item => (
          <div key={item.id} className="glass-card px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.2)' }}
              >
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{item.user}</p>
                <p className="text-xs text-white/40">{item.handle} · {item.time} ago</p>
              </div>
              <button className="text-white/30 hover:text-white/60 text-lg">⋯</button>
            </div>
            <p className="text-sm text-white/85 leading-relaxed mb-3">{item.text}</p>
            <div className="flex items-center gap-5 pt-2 border-t border-white/5">
              <button className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition">
                ❤️ {item.likes}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-white/40 hover:text-blue-400 transition">
                💬 Reply
              </button>
              <button className="flex items-center gap-1.5 text-xs text-white/40 hover:text-green-400 transition">
                🔁 Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-around items-center px-2 py-3 z-50"
        style={{
          background: 'rgba(10,10,26,0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {[
          { icon: '🏠', label: 'Home',    active: true  },
          { icon: '🔍', label: 'Explore', active: false },
          { icon: '➕', label: 'Post',    active: false },
          { icon: '📣', label: 'Notifs',  active: false },
          { icon: '👤', label: 'Profile', active: false },
        ].map(nav => (
          <button
            key={nav.label}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              nav.active ? 'text-afro-gold' : 'text-white/35 hover:text-white/70'
            }`}
          >
            <span className="text-xl">{nav.icon}</span>
            <span className="text-[10px] font-medium">{nav.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
