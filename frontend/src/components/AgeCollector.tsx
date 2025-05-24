import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgeCollectorProps {
  onAgeSelect: (age: number) => void;
  isVisible: boolean;
}

const AgeCollector: React.FC<AgeCollectorProps> = ({ onAgeSelect, isVisible }) => {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);

  const ageOptions = [
    { value: 6, label: '6 years old', color: '#FFE4E1' },
    { value: 7, label: '7 years old', color: '#E1F5FE' },
    { value: 8, label: '8 years old', color: '#E8F5E8' },
    { value: 9, label: '9 years old', color: '#FFF3E0' },
    { value: 10, label: '10 years old', color: '#F3E5F5' },
  ];

  const handleAgeSelect = (age: number) => {
    setSelectedAge(age);
    // Add a small delay for visual feedback
    setTimeout(() => {
      onAgeSelect(age);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '32px 24px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, #FFD93D, #FF6B6B)',
              borderRadius: '50%',
              opacity: 0.1
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-15px',
              right: '-15px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
              borderRadius: '50%',
              opacity: 0.1
            }} />

            {/* Main content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Welcome icon */}
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                👋
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#2D3748',
                marginBottom: '12px',
                lineHeight: '1.3'
              }}>
                Welcome to WonderLens!
              </h2>

              {/* Explanation message */}
              <p style={{
                fontSize: '16px',
                color: '#4A5568',
                lineHeight: '1.5',
                marginBottom: '24px'
              }}>
                To give you the best learning experience with age-appropriate content, 
                quizzes, and news stories, could you please tell us your age?
              </p>

              {/* Age selection buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {ageOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleAgeSelect(option.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: selectedAge === option.value 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : option.color,
                      border: '2px solid',
                      borderColor: selectedAge === option.value ? '#667eea' : 'transparent',
                      borderRadius: '16px',
                      padding: '16px 12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: selectedAge === option.value ? '#ffffff' : '#2D3748',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      boxShadow: selectedAge === option.value 
                        ? '0 8px 20px rgba(102, 126, 234, 0.3)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>

              {/* Privacy note */}
              <p style={{
                fontSize: '12px',
                color: '#718096',
                lineHeight: '1.4',
                fontStyle: 'italic'
              }}>
                🔒 Your age helps us personalize your experience and is never shared with anyone.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgeCollector; 