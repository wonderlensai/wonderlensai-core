import React, { useState } from "react";
import { FaRocket, FaPalette, FaTree } from "react-icons/fa";
import SocialGraph from "../components/SocialGraph";
import Section from "../components/Section";
import PageContainer from "../components/PageContainer";
import WonderLensDaily from "../components/WonderLensDaily"; // Using the Daily News component

// Updated logo with better quality
const LOGO_URL = "https://zgbkpnceymplssmpxgsi.supabase.co/storage/v1/object/public/assets//Header_logo.png?width=300&quality=100";

// These static avatars are being replaced by dynamic content from the WonderLensDaily component
// Keeping the definition for reference but it's no longer used
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
    color: "#E9F2FF",
    iconColor: "#5E7BFF",
  },
  {
    label: "Art Quiz",
    icon: <FaPalette size={16} />,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&h=120&auto=format&fit=crop",
    color: "#FFE9EC",
    iconColor: "#FF7285",
  },
  {
    label: "Nature Quiz",
    icon: <FaTree size={16} />,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=120&h=120&auto=format&fit=crop",
    color: "#E6F9F1",
    iconColor: "#6BE4A3",
  },
];

const SHARED_LEARNING_IMAGE =
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=200&auto=format&fit=crop";

const Home: React.FC = () => {
  const [selectedNews, setSelectedNews] = useState(0);
  const isIpad = typeof window !== 'undefined' && window.innerWidth >= 768;

  return (
    <div className="space-y-5 md:space-y-8">
      {/* Integrated app header with logo */}
      <div className="app-header -mx-4 sm:-mx-6 px-4 sm:px-6 pt-5 pb-8 -mt-4 relative">
        {/* Background decorative elements */}
        <div className="absolute top-8 left-5 w-24 h-24 rounded-full opacity-10" style={{
          background: 'radial-gradient(circle, var(--color-primary-light), transparent 70%)',
        }}></div>
        <div className="absolute top-12 right-6 w-20 h-20 rounded-full opacity-10" style={{
          background: 'radial-gradient(circle, var(--color-secondary), transparent 70%)',
        }}></div>
        <div className="absolute bottom-4 left-1/4 w-16 h-16 rounded-full opacity-10" style={{
          background: 'radial-gradient(circle, var(--color-accent), transparent 70%)',
        }}></div>
        
        {/* Logo centered */}
        <div className="flex justify-center items-center relative">
          <img
            src={LOGO_URL}
            alt="WonderLensAI Logo"
            style={{ 
              width: isIpad ? '320px' : '270px',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 3px 6px rgba(94, 123, 255, 0.25))',
            }}
          />
        </div>
      </div>

      {/* Content sections with responsive layout */}
      <div className="md:grid md:grid-cols-2 md:gap-6 space-y-5 md:space-y-0">
        {/* Daily News Section - Now using the WonderLensDaily component */}
        <div className="bg-white rounded-2xl p-5 md:p-6 kid-card shadow-md">
          <Section title="Daily News">
            <WonderLensDaily />
          </Section>
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-2xl p-5 md:p-6 kid-card shadow-md">
          <Section title="Quiz">
            <div 
              className="flex md:grid overflow-x-auto w-full items-start hide-scrollbar px-1" 
              style={{
                WebkitOverflowScrolling: 'touch',
                gridTemplateColumns: isIpad ? 'repeat(auto-fill, minmax(120px, 1fr))' : 'unset',
                gridGap: '20px',
              }}
            >
              {QUIZZES.map((quiz, idx) => (
                <div
                  key={quiz.label}
                  className="flex-none flex flex-col items-center"
                  style={{
                    marginRight: isIpad ? '0' : '20px',
                    width: isIpad ? 'auto' : '104px',
                  }}
                >
                  {/* Image container */}
                  <div 
                    className="flex items-center justify-center cursor-pointer mb-3 relative overflow-hidden transition-all duration-300"
                    onClick={() => alert(`${quiz.label} coming soon!`)}
                    style={{
                      width: isIpad ? '120px' : '100px',
                      height: isIpad ? '120px' : '100px',
                      backgroundColor: quiz.color,
                      border: 'none',
                      boxShadow: 'var(--shadow-md)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    {/* Gradient overlay for images */}
                    <div className="absolute inset-0 opacity-20" style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)',
                    }} />
                    
                    {quiz.image && (
                      <img
                        src={quiz.image}
                        alt={quiz.label}
                        className="w-full h-full object-cover"
                        style={{ borderRadius: 'var(--radius-lg)' }}
                        loading="eager"
                      />
                    )}
                  </div>
                  
                  {/* Text container */}
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span style={{ fontSize: isIpad ? '18px' : '15px', color: quiz.iconColor }}>{quiz.icon}</span>
                    <span className="font-bold text-center text-xs md:text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {quiz.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Shared Learning Section - Full width on all devices */}
      <div className="bg-white rounded-2xl p-5 md:p-6 kid-card shadow-md">
        <Section title="Shared Learning">
          <div className="w-full md:h-[400px] h-[320px] rounded-xl overflow-hidden flex items-center justify-center" style={{
            boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(94, 123, 255, 0.1)',
            background: '#010D24', // Dark background for graph contrast
          }}>
            <SocialGraph />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default Home;