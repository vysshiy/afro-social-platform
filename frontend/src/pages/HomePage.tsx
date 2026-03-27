import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FEED = [
  {
    id: 1, user: 'Amara Okonkwo', handle: '@amara', time: '2m',
    avatar: '✊🏿', avatarBg: 'rgba(212,160,23,0.2)', avatarBorder: 'rgba(212,160,23,0.4)',
    text: 'Just joined Afro Social! 🎉 Excited to connect with this incredible community.',
    likes: 12, comments: 3, image: null, tag: '#NewMember',
  },
  {
    id: 2, user: 'Kwame Asante', handle: '@kwame_creates', time: '18m',
    avatar: '🎨', avatarBg: 'rgba(139,92,246,0.2)', avatarBorder: 'rgba(139,92,246,0.4)',
    text: 'Lagos Fashion Week 2026 was everything 🔥 The designs, the culture, the energy — unmatched.',
    likes: 147, comments: 24, image: null, tag: '#AfroFashion',
  },
  {
    id: 3, user: 'Zuri Nkosi', handle: '@zuri_vibes', time: '1h',
    avatar: '🌍', avatarBg: 'rgba(16,185,129,0.2)', avatarBorder: 'rgba(16,185,129,0.4)',
    text: 'Afrobeats concert last night had me in tears 😭🎶 The music, the people — this culture is everything.',
    likes: 328, comments: 51, image: null, tag: '#Afrobeats',
  },
  {
    id: 4, user: 'Temi Adeyemi', handle: '@temi_builds', time: '3h',
    avatar: '💡', avatarBg: 'rgba(245,158,11,0.2)', avatarBorder: 'rgba(245,158,11,0.4)',
    text: 'African tech founders are BUILDING 🚀 So proud to see the ecosystem growing every single day.',
    likes: 89, comments: 17, image: null, tag: '#AfroTech',
  },
];

const STORIES = [
  { name: 'Your Story', emoji: '➕', bg: 'rgba(212,160,23,0.15)', border: '#d4a017', isAdd: true },
  { name: 'Amara',      emoji: '✊🏿',  bg: 'rgba(212,160,23,0.1)', border: 'rgba(212,160,23,0.5)', isAdd: false },
  { name: 'Kwame',      emoji: '🎨',  bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.5)', isAdd: false },
  { name: 'Zuri',       emoji: '🌍',  bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.5)', isAdd: false },
  { name: 'Temi',       emoji: '💡',  bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.5)', isAdd: false },
  { name: 'Lola',       emoji: '💃',  bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.5)',  isAdd: false },
];

const NAV = [
  { icon: '🏠', label: 'Home'    },
  { icon: '🔍', label: 'Explore' },
  { icon: '➕', label: 'Post'    },
  { icon: '🔔', label: 'Notifs'  },
  { icon: '👤', label: 'Profile' },
];

export default function HomePage() {
  const [activeNav, setActiveNav] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  function toggleLike(id: number) {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg,#05050f 0%,#0a0a1a 100%)' }}
    >
      {/* ── Top nav ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
        style={{
          background: 'rgba(5,5,15,0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">✊🏿</span>
          <span
            className="text-xl font-bold"
            style={{
              background: 'linear-gradient(135deg,#d4a017,#f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Afro Social
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="text-xl">💬</span>
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: '#d4a017' }}
            />
          </button>
          <Link
            to="/register"
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold border"
            style={{
              background: 'linear-gradient(135deg,#d4a017,#8b6508)',
              borderColor: 'rgba(212,160,23,0.4)',
              color: '#05050f',
            }}
          >
            A
          </Link>
        </div>
      </header>

      {/* ── Stories ── */}
      <div className="px-4 pt-4">
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {STORIES.map((s, i) => (
            <button key={s.name} className="flex flex-col items-center gap-1.5 flex-shrink-0 group">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-transform group-hover:scale-105"
                style={{
                  background: s.bg,
                  border: `2.5px solid ${s.border}`,
                  boxShadow: `0 0 12px ${s.border.replace('0.5', '0.2')}`,
                }}
              >
                {s.emoji}
              </div>
              <span className="text-[11px] text-white/50 max-w-[58px] text-center leading-tight truncate">
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Post composer ── */}
      <div
        className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#d4a017,#8b6508)' }}
        >
          ✊🏿
        </div>
        <button
          className="flex-1 text-left px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          What's on your mind?
        </button>
        <button className="text-xl text-white/35 hover:text-afro-gold transition-colors">📸</button>
      </div>

      {/* ── Feed ── */}
      <div className="px-4 mt-3 space-y-3 pb-28">
        {FEED.map(post => {
          const liked = likedPosts.has(post.id);
          return (
            <article
              key={post.id}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="px-4 pt-4 pb-3">
                {/* Post header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: post.avatarBg, border: `1.5px solid ${post.avatarBorder}` }}
                  >
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{post.user}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(212,160,23,0.12)', color: '#d4a017', border: '1px solid rgba(212,160,23,0.2)' }}
                      >
                        {post.tag}
                      </span>
                    </div>
                    <p className="text-xs text-white/38">{post.handle} · {post.time} ago</p>
                  </div>
                  <button className="text-white/25 hover:text-white/60 text-xl leading-none">⋯</button>
                </div>

                {/* Post text */}
                <p className="text-sm text-white/85 leading-relaxed">{post.text}</p>
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-1 px-3 py-2.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: liked ? 'rgba(239,68,68,0.12)' : 'transparent',
                    color: liked ? '#f87171' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {liked ? '❤️' : '🤍'} {post.likes + (liked ? 1 : 0)}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
                  💬 {post.comments}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
                  🔁 Share
                </button>
                <div className="flex-1" />
                <button className="px-2 py-1.5 rounded-xl text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                  🔖
                </button>
              </div>
            </article>
          );
        })}

        {/* Load more */}
        <div className="text-center py-4">
          <button className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Load more posts
          </button>
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(5,5,15,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          {NAV.map((n, i) => {
            const isActive = i === activeNav;
            const isPost   = i === 2;
            return (
              <button
                key={n.label}
                onClick={() => setActiveNav(i)}
                className="relative flex flex-col items-center gap-0.5 transition-all duration-150"
                style={{
                  minWidth: 56,
                  padding: isPost ? 0 : '6px 8px',
                }}
              >
                {isPost ? (
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl -mt-4 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg,#d4a017,#f59e0b)',
                      boxShadow: '0 4px 20px rgba(212,160,23,0.4)',
                      color: '#05050f',
                    }}
                  >
                    {n.icon}
                  </div>
                ) : (
                  <>
                    <span
                      className="text-2xl transition-transform duration-150"
                      style={{
                        transform: isActive ? 'scale(1.15)' : 'scale(1)',
                        filter: isActive ? 'none' : 'grayscale(0.3) opacity(0.5)',
                      }}
                    >
                      {n.icon}
                    </span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: isActive ? '#d4a017' : 'rgba(255,255,255,0.35)' }}
                    >
                      {n.label}
                    </span>
                    {isActive && (
                      <div
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: '#d4a017' }}
                      />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
