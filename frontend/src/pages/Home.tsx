import React, { useState } from "react";
import { FaRocket, FaPalette, FaTree, FaStar, FaHeart } from "react-icons/fa";
import SocialGraph from "../components/SocialGraph";
import Section from "../components/Section";
import PageContainer from "../components/PageContainer";
import WonderLensDaily from "../components/WonderLensDaily"; // Using the Daily News component
import QuizSection from "../components/QuizSection"; // Import the new Quiz component

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

// Static quiz data - no longer used, replaced by QuizSection component
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-300 to-red-400 rounded-full opacity-15 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-green-300 to-blue-400 rounded-full opacity-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full opacity-10 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full opacity-8 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 space-y-6 md:space-y-8 pb-20">
        {/* Enhanced App Header with Floating Elements */}
        <div className="app-header -mx-4 sm:-mx-6 px-4 sm:px-6 pt-6 pb-10 -mt-4 relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-95"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          {/* Floating Decorative Elements */}
          <div className="absolute top-8 left-8 w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm animate-float" style={{ animationDelay: '0s' }}>
            <div className="w-full h-full flex items-center justify-center">
              <FaStar className="text-white/80 text-xl" />
            </div>
          </div>
          <div className="absolute top-12 right-12 w-12 h-12 bg-white/15 rounded-full backdrop-blur-sm animate-float" style={{ animationDelay: '1s' }}>
            <div className="w-full h-full flex items-center justify-center">
              <FaHeart className="text-white/70 text-sm" />
            </div>
          </div>
          <div className="absolute bottom-8 left-1/4 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-6 right-1/4 w-14 h-14 bg-white/15 rounded-full backdrop-blur-sm animate-float" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Logo with Enhanced Styling */}
          <div className="flex justify-center items-center relative z-10">
            <div className="relative">
              <div className="absolute -inset-4 bg-white/20 rounded-3xl backdrop-blur-sm"></div>
              <img
                src={LOGO_URL}
                alt="WonderLensAI Logo"
                className="relative z-10 drop-shadow-2xl"
                style={{ 
                  width: isIpad ? '320px' : '270px',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.3))',
                }}
              />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center mt-4 relative z-10">
            {/* Removed welcome message */}
          </div>
        </div>

        {/* Enhanced Content Grid */}
        <div className="px-4 sm:px-6">
          <div className="md:grid md:grid-cols-2 md:gap-8 space-y-6 md:space-y-0">
            {/* Enhanced Daily News Section */}
            <div className="group">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
                {/* Decorative gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
                
                <Section title="Daily News">
                  <WonderLensDaily />
                </Section>
              </div>
            </div>

            {/* Enhanced Quiz Section */}
            <div className="group">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
                {/* Decorative gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-yellow-500 to-orange-500"></div>
                
                <Section title="Interactive Quiz">
                  <QuizSection />
                </Section>
              </div>
            </div>
          </div>

          {/* Enhanced Shared Learning Section */}
          <div className="mt-8 group">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] relative overflow-hidden">
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500"></div>
              
              <Section title="Learning Network">
                <div className="w-full md:h-[400px] h-[320px] rounded-2xl overflow-hidden flex items-center justify-center relative" style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                }}>
                  {/* Decorative corner elements */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/30 rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/30 rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/30 rounded-br-lg"></div>
                  
                  <SocialGraph />
                </div>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;