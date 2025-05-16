import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WonderLensDaily from '../components/WonderLensDaily';
import {
  FaHistory,
  FaFlask,
  FaCalculator,
  FaGlobeAmericas,
} from 'react-icons/fa';

const modules = [
  {
    title: 'Science',
    icon: <FaFlask className="text-teal-500" />,
    desc: 'Discover scientific wonders!',
    route: '/science',
    bg: 'from-cyan-200 to-teal-100',
  },
  {
    title: 'History',
    icon: <FaHistory className="text-pink-400" />,
    desc: 'Explore historical discoveries!',
    route: '/history',
    bg: 'from-pink-200 to-pink-100',
  },
  {
    title: 'Math',
    icon: <FaCalculator className="text-yellow-400" />,
    desc: 'Explore mathematical concepts!',
    route: '/math',
    bg: 'from-yellow-200 to-yellow-100',
  },
  {
    title: 'Geography',
    icon: <FaGlobeAmericas className="text-green-400" />,
    desc: 'Discover world geography!',
    route: '/geography',
    bg: 'from-green-200 to-green-100',
  },
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

function CategoryCard({ icon, title, desc, onClick, bg }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void; bg: string }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.97 }}
      className={`flex flex-col items-center justify-center rounded-3xl shadow-xl p-6 min-w-[140px] min-h-[170px] cursor-pointer bg-gradient-to-br ${bg} transition-transform hover:shadow-2xl border-2 border-white`}
      onClick={onClick}
    >
      <div className="text-5xl mb-2 drop-shadow-lg">{icon}</div>
      <div className="text-lg font-extrabold text-center mb-1 text-gray-700 font-[Fredoka]">{title}</div>
      <div className="text-xs text-gray-600 text-center font-semibold">{desc}</div>
    </motion.div>
  );
}

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gradient-to-br from-yellow-50 to-blue-100 px-2 pt-8 pb-28 relative overflow-x-hidden">
      {/* Animated playful background shapes */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-10 left-5 w-24 h-24 rounded-full bg-gradient-to-br from-pink-200 to-yellow-100 opacity-20 animate-float1" />
        <div className="absolute bottom-16 right-8 w-32 h-32 rounded-full bg-gradient-to-br from-teal-200 to-pink-200 opacity-15 animate-float2" />
        <div className="absolute top-48 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-indigo-200 opacity-10 animate-float3" />
        <style>{`
          @keyframes float1 { 0%{transform:translateY(0);} 50%{transform:translateY(-20px);} 100%{transform:translateY(0);} }
          @keyframes float2 { 0%{transform:translateY(0);} 50%{transform:translateY(30px);} 100%{transform:translateY(0);} }
          @keyframes float3 { 0%{transform:translateY(0);} 50%{transform:translateY(-15px);} 100%{transform:translateY(0);} }
        `}</style>
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        {/* WonderLens Daily */}
        <motion.div variants={cardVariants} className="w-full mb-6 rounded-2xl bg-white/80 shadow-lg p-4">
          <h2 className="text-lg font-bold mb-2 text-center text-blue-600">✨ WonderLens Daily ✨</h2>
          <WonderLensDaily country="global" age={8} />
        </motion.div>

        {/* Main modules grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 gap-6 mb-10 w-full"
        >
          {modules.map((m) => (
            <CategoryCard
              key={m.title}
              icon={m.icon}
              title={m.title}
              desc={m.desc}
              bg={m.bg}
              onClick={() => navigate(m.route)}
            />
          ))}
        </motion.div>

        {/* Ask a Question CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full px-8 py-4 bg-gradient-to-r from-pink-400 via-yellow-300 to-blue-300 text-white text-lg font-extrabold rounded-full shadow-xl hover:scale-105 transition-all duration-150 mb-10 border-4 border-white"
        >
          <span role="img" aria-label="question">❓</span> Ask a Question
        </motion.button>

        {/* Shared Learning */}
        <motion.div
          variants={cardVariants}
          className="w-full bg-white rounded-2xl shadow p-6 text-center mb-4"
        >
          <h3 className="text-base font-bold mb-2 text-purple-700">Shared Learning</h3>
          <p className="text-gray-600 mb-4">See what others are learning!</p>
          <button
            className="w-full px-6 py-2 bg-gradient-to-r from-purple-400 to-pink-300 hover:from-purple-500 hover:to-pink-400 text-white font-bold rounded-xl shadow transition-all duration-200"
            onClick={() => navigate('/shared')}
          >
            Explore Shared Learning
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Home; 
