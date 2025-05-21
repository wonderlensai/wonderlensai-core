import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import ReactDOM from 'react-dom';
import 'swiper/css';
import 'swiper/css/pagination';

// Environment-specific API URL
// If VITE_API_URL is not set, we assume we're running in the same domain as the API
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
console.log('🔍 API_BASE_URL:', API_BASE_URL);
console.log('🔍 Environment:', import.meta.env.MODE); // 'development' or 'production'

// Helper function to determine if we're running in development
const isDevelopment = () => {
  const dev = import.meta.env.DEV || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
  console.log('🔍 isDevelopment:', dev);
  return dev;
};

// Get the correct API endpoint based on environment
const getApiUrl = (endpoint: string) => {
  // Log the current environment for debugging
  console.log('🔍 getApiUrl called with endpoint:', endpoint);
  console.log('🔍 Current API_BASE_URL:', API_BASE_URL);
  
  // In development without explicit VITE_API_URL, use localhost
  if (isDevelopment() && !import.meta.env.VITE_API_URL) {
    const url = `http://localhost:7001${endpoint}`;
    console.log('🔍 Using development URL:', url);
    return url;
  }
  
  // For production environment or when VITE_API_URL is set
  if (import.meta.env.PROD) {
    // Use absolute URL to the backend API
    const url = `https://api.wonderlens.app${endpoint}`;
    console.log('🔍 Using production URL:', url);
    return url;
  }
  
  // Otherwise use the configured API_BASE_URL (may be empty string if API is on same domain)
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🔍 Using API URL:', url);
  return url;
};

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

// Modal component to be rendered via portal
const StoryModal = ({ 
  story, 
  onClose 
}: { 
  story: Story; 
  onClose: () => void;
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '90%',
          maxWidth: 360,
          maxHeight: '80vh',
          background: '#fff',
          borderRadius: 20,
          padding: 24,
          position: 'relative',
          overflow: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          margin: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(0,0,0,0.08)',
            border: 'none',
            borderRadius: '50%',
            width: 30,
            height: 30,
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={onClose}
        >
          ×
        </button>

        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span style={{ fontSize: 24 }}>
            {CATEGORY_EMOJIS[story.category] || '📰'}
          </span>
          <span>{story.category}</span>
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 16,
            color: '#2D3748'
          }}
        >
          {story.headline}
        </div>
        <div
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: '#4A5568'
          }}
        >
          {story.body}
        </div>
      </div>
    </div>,
    document.body
  );
};

const WonderLensDaily: React.FC<{ country?: string; age?: number }> = ({ country = 'global', age = 8 }) => {
  console.log('🔍 WonderLensDaily Component Initialized');
  console.log('🔍 Environment Check:', {
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
    BASE_URL: import.meta.env.BASE_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    hostname: window.location.hostname,
    href: window.location.href
  });

  const [news, setNews] = useState<KidNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  // Track read stories in local storage
  const [readStories, setReadStories] = useState<Record<string, boolean>>(() => {
    // Load read status from localStorage
    const savedReadStatus = localStorage.getItem('wonderlens-read-stories');
    if (savedReadStatus) {
      try {
        return JSON.parse(savedReadStatus);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    setLoading(true);
    console.log('🔍 WonderLensDaily fetching news for:', { country, age });
    
    // Use the getApiUrl helper function for consistent API URLs across environments
    const apiUrl = getApiUrl(`/api/kidnews?country=${country}&age=${age}`);
    console.log('🔍 Full API URL:', apiUrl);
    
    fetch(apiUrl)
      .then(res => {
        console.log('🔍 API Response Status:', res.status);
        console.log('🔍 API Response OK:', res.ok);
        if (!res.ok) {
          console.error('🔍 API Error:', res.status, res.statusText);
          return Promise.reject(new Error(`API error: ${res.status} ${res.statusText}`));
        }
        return res.json();
      })
      .then(data => {
        console.log('🔍 API Data received:', data);
        if (!data || typeof data !== 'object') {
          console.error('🔍 Invalid data format:', data);
          throw new Error('Invalid data format');
        }
        setNews(data);
      })
      .catch((error) => {
        console.error('🔍 Fetch error:', error);
        setError(error.message || 'No news found for today.');
      })
      .finally(() => setLoading(false));
  }, [country, age]);

  // Save read status to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wonderlens-read-stories', JSON.stringify(readStories));
  }, [readStories]);

  // Mark a story as read
  const markAsRead = (category: string) => {
    setReadStories(prev => {
      // Create a unique key using date and category
      const storyKey = `${news?.date || 'today'}-${category}`;
      return { ...prev, [storyKey]: true };
    });
  };

  // Check if a story is read
  const isRead = (category: string): boolean => {
    const storyKey = `${news?.date || 'today'}-${category}`;
    return !!readStories[storyKey];
  };

  // Order stories with unread first, then read
  const getOrderedStories = () => {
    if (!news?.stories) {
      console.log('🔍 No stories found in news data:', news);
      return [];
    }
    
    console.log('🔍 Found stories in news data:', news.stories.length);
    return [...news.stories].sort((a, b) => {
      const aRead = isRead(a.category);
      const bRead = isRead(b.category);
      
      if (aRead && !bRead) return 1; // B comes first (unread)
      if (!aRead && bRead) return -1; // A comes first (unread)
      return 0; // Maintain original order
    });
  };

  if (loading) {
    console.log('🔍 WonderLensDaily in loading state');
    return <div>Loading news...</div>;
  }
  
  if (error || !news) {
    console.log('🔍 WonderLensDaily in error state:', { error, news });
    return <div>{error || 'No news available.'}</div>;
  }

  const orderedStories = getOrderedStories();
  console.log('🔍 Rendering with stories:', orderedStories.length);

  return (
    <div style={{ width: '100%', margin: '0', padding: 0, position: 'relative' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Left fade */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, zIndex: 2, background: 'linear-gradient(90deg, #F8FAFF 60%, rgba(248,250,255,0))', pointerEvents: 'none' }} />
        {/* Right fade */}
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 12, zIndex: 2, background: 'linear-gradient(270deg, #F8FAFF 60%, rgba(248,250,255,0))', pointerEvents: 'none' }} />
        
        <div style={{ 
          display: 'flex', 
          gap: 14, 
          overflowX: 'auto', 
          padding: '10px 16px 14px 16px', 
          alignItems: 'center', 
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          {orderedStories.map((story, _idx) => (
            <div
              key={story.category}
              style={{
                position: 'relative',
                width: 68,
                flex: '0 0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}
            >
              {/* Ring indicator for read/unread status */}
              <div 
                style={{
                  position: 'relative',
                  padding: 2, // Border padding
                  borderRadius: '50%',
                  background: isRead(story.category) 
                    ? '#e0e0e0' // Gray for read stories
                    : `linear-gradient(45deg, ${CATEGORY_COLORS[story.category] || '#5E7BFF'}, #738FFF)`
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: '#fff',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    outline: 'none',
                    overflow: 'hidden'
                  }}
                  tabIndex={0}
                  onClick={() => {
                    setSelectedIdx(_idx);
                    markAsRead(story.category);
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  onTouchStart={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <span style={{ fontSize: 28 }}>{CATEGORY_EMOJIS[story.category] || '📰'}</span>
                </div>
              </div>
              
              {/* Category text below */}
              <span 
                style={{ 
                  fontWeight: 600, 
                  fontSize: 12, 
                  textAlign: 'center', 
                  color: isRead(story.category) ? '#777' : '#444', 
                  lineHeight: 1.2,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}
              >
                {story.category.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Use portal for modals */}
      {selectedIdx !== null && orderedStories[selectedIdx] && (
        <StoryModal 
          story={orderedStories[selectedIdx]} 
          onClose={() => setSelectedIdx(null)} 
        />
      )}
    </div>
  );
};

export default WonderLensDaily; 