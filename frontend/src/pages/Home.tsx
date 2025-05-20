import React, { useState } from "react";
import { FaRocket, FaPalette, FaTree } from "react-icons/fa";
import SocialGraph from "../components/SocialGraph";
// import WonderLensDaily from "../components/WonderLensDaily"; // Uncomment if using this component

// --- Image URLs with image transformation parameters ---
// Increasing width to 400px for the logo
const LOGO_URL = "https://zgbkpnceymplssmpxgsi.supabase.co/storage/v1/object/public/assets//Header_log.png?width=300&quality=90";

const NEWS_AVATARS = [
  {
    title: "Puppy News",
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=200&h=200&auto=format&fit=crop",
  },
  {
    title: "Rainbow City",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&auto=format&fit=crop",
  },
  {
    title: "Super Cat",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&auto=format&fit=crop",
  },
  {
    title: "Super Cat",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&auto=format&fit=crop",
  },
  {
    title: "Super Cat",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&auto=format&fit=crop",
  },
  {
    title: "Super Cat",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=200&auto=format&fit=crop",
  },
];

const QUIZZES = [
  {
    label: "Space Quiz",
    icon: <FaRocket size={16} />,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=120&h=120&auto=format&fit=crop",
  },
  {
    label: "Art Quiz",
    icon: <FaPalette size={16} />,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&h=120&auto=format&fit=crop",
  },
  {
    label: "Nature Quiz",
    icon: <FaTree size={16} />,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=120&h=120&auto=format&fit=crop",
  },
];

const SHARED_LEARNING_IMAGE =
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=200&auto=format&fit=crop";

const Home: React.FC = () => {
  const [selectedNews, setSelectedNews] = useState(0);

  return (
    <div className="w-full max-w-md mx-auto overflow-x-hidden">
      {/* Header with minimal spacing for iPhone camera notch */}
      <div className="flex flex-col items-center pb-0">
        <img
          src={LOGO_URL}
          alt="WonderLensAI Logo"
          style={{ 
            width: '400px',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
            marginBottom: '0'
          }}
        />
      </div>

      {/* Content Container with tighter spacing */}
      <div className="w-full px-3">
        {/* Daily News */}
        <section className="mb-3">
          <h2 className="font-bold text-lg mb-2">Daily News</h2>
          
          {/* Fixed width scrollable container */}
          <div className="flex gap-5 overflow-x-auto pb-2 w-full hide-scrollbar" style={{WebkitOverflowScrolling: 'touch'}}>
            {NEWS_AVATARS.map((avatar, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center cursor-pointer flex-none"
                onClick={() => setSelectedNews(idx)}
                style={{ width: '70px', marginRight: '5px' }}
              >
                <div
                  className={`rounded-full bg-gray-200 border-2 overflow-hidden`}
                  style={{ 
                    width: '65px', 
                    height: '65px',
                    borderColor: selectedNews === idx ? '#5EC6FF' : 'transparent'
                  }}
                >
                  <img
                    src={avatar.image}
                    alt={avatar.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <span 
                  className="mt-1 text-xs font-semibold text-center truncate w-full"
                  style={{ color: selectedNews === idx ? '#5EC6FF' : '#232B3A' }}
                >
                  {avatar.title}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Quiz Section */}
        <section className="mb-3 mt-1">
          <h2 className="font-bold text-lg mb-2">Quiz</h2>
          <div 
            className="flex overflow-x-auto w-full items-start px-1 hide-scrollbar" 
            style={{
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {/* Ensure absolutely no scrollbar UI is shown */}
            <style dangerouslySetInnerHTML={{
              __html: `
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                  width: 0;
                  height: 0;
                }
              `
            }} />
            
            {QUIZZES.map((quiz, idx) => (
              <div
                key={quiz.label}
                className="flex-none flex flex-col items-center"
                style={{
                  marginRight: '24px',
                }}
              >
                {/* Image container */}
                <div 
                  className="flex items-center justify-center cursor-pointer mb-2"
                  onClick={() => alert(`${quiz.label} coming soon!`)}
                  style={{
                    width: '96px', // 80px * 1.2 = 96px
                    height: '96px',
                    backgroundColor: idx === 0 ? '#f0f8ff' : idx === 1 ? '#fdf5e6' : '#f5fffa',
                    border: '2px solid #e0e0e0',
                    boxShadow: '0 4px 8px rgba(94, 198, 255, 0.12)',
                    borderRadius: '20px',
                  }}
                >
                  {quiz.image && (
                    <img
                      src={quiz.image}
                      alt={quiz.label}
                      className="w-full h-full object-cover"
                      style={{ borderRadius: '18px', width: '96px', height: '96px' }}
                      loading="eager"
                    />
                  )}
                </div>
                
                {/* Text container */}
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span style={{ fontSize: '14px', color: '#5EC6FF' }}>{quiz.icon}</span>
                  <span className="font-semibold text-center text-xs" style={{ color: '#232B3A' }}>
                    {quiz.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shared Learning Section */}
        <section className="mb-4">
          <h2 className="font-bold text-lg mb-2">Shared Learning</h2>
          <div className="w-full h-[320px] bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-md" style={{
            boxShadow: '0 4px 12px rgba(94, 198, 255, 0.08)',
            border: '1px solid #f0f0f0'
          }}>
            <SocialGraph />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;