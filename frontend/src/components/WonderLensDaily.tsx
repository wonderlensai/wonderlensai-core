import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface Story {
  category: string;
  headline: string;
  body: string;
}

interface KidNews {
  date: string;
  country: string;
  age_band: string;
  stories: Story[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Science Spark': '🔬',
  'Space & Sky': '🌌',
  'Animals & Nature': '🦁',
  'Tech & Inventions': '🤖',
  'Math & Logic Fun': '🧮',
  'Culture Pop': '🎨',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Science Spark': '#ffe066',
  'Space & Sky': '#a5d8ff',
  'Animals & Nature': '#b2f2bb',
  'Tech & Inventions': '#eebefa',
  'Math & Logic Fun': '#ffd6a5',
  'Culture Pop': '#ffb4a2',
};

const WonderLensDaily: React.FC<{ country?: string; age?: number }> = ({ country = 'global', age = 8 }) => {
  const [news, setNews] = useState<KidNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/kidnews?country=${country}&age=${age}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setNews)
      .catch(() => setError('No news found for today.'))
      .finally(() => setLoading(false));
  }, [country, age]);

  if (loading) return <div>Loading WonderLens Daily...</div>;
  if (error || !news) return <div>{error || 'No news available.'}</div>;

  return (
    <div style={{ width: '100%', margin: '0 0 0.5rem 0', padding: 0, position: 'relative' }}>
      {/* Centered, playful label */}
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: '"Baloo 2", "Comic Sans MS", "Comic Sans", cursive' }}>
        <span role="img" aria-label="sparkle">✨</span>
        <span>WonderLens Daily</span>
        <span role="img" aria-label="sparkle">✨</span>
      </div>
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Left fade */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 24, zIndex: 2, background: 'linear-gradient(90deg, #f7f9fc 90%, rgba(247,249,252,0))', pointerEvents: 'none' }} />
        {/* Right fade */}
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 24, zIndex: 2, background: 'linear-gradient(270deg, #f7f9fc 90%, rgba(247,249,252,0))', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', gap: 22, overflowX: 'auto', padding: '10px 20px 10px 20px', alignItems: 'center', margin: '0 -20px', scrollbarWidth: 'none' }}>
          {news.stories.map((story, _idx) => (
            <div
              key={story.category}
              style={{
                width: 78,
                height: 78,
                borderRadius: '50%',
                background: '#fff',
                border: `4px solid ${CATEGORY_COLORS[story.category] || '#e0e0e0'}`,
                boxShadow: '0 4px 16px #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flex: '0 0 auto',
                position: 'relative',
                transition: 'transform 0.15s',
                fontFamily: '"Baloo 2", "Comic Sans MS", "Comic Sans", cursive',
                fontWeight: 700,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              tabIndex={0}
              onClick={() => setSelectedIdx(_idx)}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(1.07)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(1.07)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{ fontSize: 32, marginBottom: 2 }}>{CATEGORY_EMOJIS[story.category] || '📰'}</span>
              <span style={{ fontWeight: 700, fontSize: 13, textAlign: 'center', color: '#444', lineHeight: 1.1 }}>{story.category.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Ask a question pill */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, marginBottom: 12 }}>
        <button
          style={{ padding: '10px 32px', borderRadius: 28, background: '#2979ff', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 17, boxShadow: '0 2px 12px #e0e0e0', letterSpacing: 0.2, display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => alert('Coming soon!')}
        >
          <HelpOutlineIcon style={{ fontSize: 22, marginRight: 2 }} />
          Ask a question
        </button>
      </div>
      {/* Gentle fade at bottom for visual balance */}
      <div style={{ width: '100%', height: 32, background: 'linear-gradient(180deg, rgba(247,249,252,0) 0%, #f7f9fc 100%)', position: 'absolute', left: 0, bottom: -32, zIndex: 0, pointerEvents: 'none' }} />
      {selectedIdx !== null && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
          onClick={() => setSelectedIdx(null)}
        >
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            initialSlide={selectedIdx}
            slidesPerView={1}
            style={{ width: '90vw', maxWidth: 400, minHeight: 340 }}
            onSlideChange={swiper => setSelectedIdx(swiper.activeIndex)}
          >
            {news.stories.map((story, _) => (
              <SwiperSlide key={story.category}>
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 18,
                    padding: 28,
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 1px 8px #ccc',
                    minHeight: 320,
                    maxWidth: 340,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{CATEGORY_EMOJIS[story.category] || '📰'} {story.category}</div>
                  <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>{story.headline}</div>
                  <div style={{ fontSize: 16, color: '#333', textAlign: 'center', opacity: 0.85 }}>{story.body}</div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <button style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', fontSize: 32, color: '#fff', cursor: 'pointer', zIndex: 1001 }} onClick={() => setSelectedIdx(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default WonderLensDaily; 