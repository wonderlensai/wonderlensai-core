import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ReactDOM from 'react-dom';
import modalState from '../utils/modalState';

// Environment-specific API URL handling (reusing from WonderLensDaily pattern)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to determine if we're running in development
const isDevelopment = () => {
  const dev = import.meta.env.DEV || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
  console.log('🎮 isDevelopment:', dev);
  return dev;
};

// Get the correct API endpoint based on environment
const getApiUrl = (endpoint: string) => {
  // Log the current environment for debugging
  console.log('🎮 getApiUrl called with endpoint:', endpoint);
  console.log('🎮 Current API_BASE_URL:', API_BASE_URL);
  
  // In development without explicit VITE_API_URL, use localhost
  if (isDevelopment() && !import.meta.env.VITE_API_URL) {
    const url = `http://localhost:7001${endpoint}`;
    console.log('🎮 Using development URL:', url);
    return url;
  }
  
  // For production environment or when VITE_API_URL is set
  if (import.meta.env.PROD) {
    // Use Render backend URL (where the API is hosted)
    const renderUrl = 'https://wonderlensai-core.onrender.com';
    const url = `${renderUrl}${endpoint}`;
    console.log('🎮 Using Render backend URL:', url);
    return url;
  }
  
  // Otherwise use the configured API_BASE_URL (may be empty string if API is on same domain)
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🎮 Using API URL:', url);
  return url;
};

// Quiz categories with icons and colors - updated to match database exactly
const QUIZ_CATEGORIES = [
  {
    id: 'Space & Astronomy',
    name: 'Space',
    emoji: '🚀',
    color: '#a5d8ff',
    bgColor: '#E6F4FF',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=120&h=120&auto=format&fit=crop',
    description: 'Discover planets, stars, and the universe!'
  },
  {
    id: 'Animals & Wildlife',
    name: 'Animals',
    emoji: '🦁',
    color: '#b2f2bb',
    bgColor: '#E6FFF0',
    image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=120&h=120&auto=format&fit=crop',
    description: 'Learn about amazing creatures from around the world'
  },
  {
    id: 'Science Experiments',
    name: 'Science',
    emoji: '🔬',
    color: '#ffe066',
    bgColor: '#FFF9E6',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=120&h=120&auto=format&fit=crop',
    description: 'Fun experiments and cool scientific discoveries'
  },
  {
    id: 'History & Civilizations',
    name: 'History',
    emoji: '🏛️',
    color: '#ffd8a8',
    bgColor: '#FFF4E6',
    image: 'https://images.unsplash.com/photo-1603888613934-ee2f7d143dd0?w=120&h=120&auto=format&fit=crop',
    description: 'Travel back in time to ancient civilizations'
  },
  {
    id: 'Technology & Computers',
    name: 'Tech',
    emoji: '💻',
    color: '#eebefa',
    bgColor: '#F3E6FF',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&h=120&auto=format&fit=crop',
    description: 'Explore the world of computers and technology'
  },
  {
    id: 'Math Puzzles',
    name: 'Math',
    emoji: '🧮',
    color: '#ffd6a5',
    bgColor: '#FFECE6',
    image: 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=120&h=120&auto=format&fit=crop',
    description: 'Solve fun puzzles and brain teasers'
  },
  {
    id: 'Geography & Places',
    name: 'Geography',
    emoji: '🌍',
    color: '#90d4f7',
    bgColor: '#E6F6FF',
    image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=120&h=120&auto=format&fit=crop',
    description: 'Explore countries, landmarks, and natural wonders'
  },
  {
    id: 'Art & Music',
    name: 'Art',
    emoji: '🎨',
    color: '#ffb4a2',
    bgColor: '#FFE6E6',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=120&h=120&auto=format&fit=crop',
    description: 'Discover beautiful art and amazing music'
  }
];

// Define the interface for quiz question data
interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizContent {
  category: string;
  age_band: string;
  questions: Question[];
}

// Main quiz section component
const QuizSection: React.FC<{ age?: number }> = ({ age = 8 }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Add swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  
  // Handle selecting a category to open the quiz modal
  const handleCategorySelect = (categoryId: string) => {
    console.log('🎮 Category selected:', categoryId);
    setSelectedCategory(categoryId);
    modalState.openModal('quiz-modal');
  };
  
  // Handle closing the quiz modal
  const handleCloseQuiz = () => {
    console.log('🎮 Closing quiz modal');
    modalState.closeModal();
  };
  
  // Subscribe to modal state changes - simplified
  useEffect(() => {
    console.log('🎮 Setting up modal subscription');
    
    const unsubscribe = modalState.subscribe((modalId) => {
      console.log('🎮 Modal state changed:', modalId);
      setModalOpen(modalId === 'quiz-modal');
    });
    
    return () => {
      console.log('🎮 Cleaning up modal subscription');
      unsubscribe();
    };
  }, []);
  
  // Fetch quiz data when a category is selected
  useEffect(() => {
    if (!selectedCategory) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const apiUrl = getApiUrl(`/api/quiz?category=${encodeURIComponent(selectedCategory)}&age=${age}`);
    console.log('🎮 Fetching quiz:', apiUrl);
    
    fetch(apiUrl)
      .then(res => {
        console.log('🎮 API Response Status:', res.status);
        if (!res.ok) {
          return Promise.reject(new Error(`API error: ${res.status}`));
        }
        return res.json();
      })
      .then(data => {
        console.log('🎮 Quiz data received:', data);
        setQuizData(data);
        // Reset quiz state when new data is loaded
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowExplanation(false);
        setScore(0);
        setQuizComplete(false);
      })
      .catch(err => {
        console.error('🎮 Fetch error:', err);
        setError(err.message || 'Failed to load quiz');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCategory, age]);
  
  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    // Allow changing answer if previous was wrong
    if (selectedAnswer && isCorrect) return; // Only prevent changing if answer was correct
    
    setSelectedAnswer(answer);
    const correct = answer === quizData?.questions[currentQuestion].correct_answer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
      setShowConfetti(true);
      // Hide confetti after 2.5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 2500);
      
      // Show explanation for correct answers
      setTimeout(() => {
        setShowExplanation(true);
      }, 500);
    } else {
      // For wrong answers, show the "try again" message but allow selecting again
      setShowExplanation(true);
      // Reset selection after a short delay to allow re-selecting
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 1500);
    }
  };
  
  // Handle moving to next question
  const handleNextQuestion = () => {
    if (!quizData) return;
    
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };
  
  // Handle restarting the quiz
  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setScore(0);
    setQuizComplete(false);
  };
  
  // Add swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (!quizData) return;
    
    // Left swipe: next question (allow without answering)
    if (isLeftSwipe && currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
    }
    
    // Right swipe: previous question (only if not on first question)
    if (isRightSwipe && currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
    }
  };
  
  // Get the current category data
  const getCategoryData = () => {
    console.log('🎮 Getting category data for:', selectedCategory);
    const categoryData = selectedCategory 
      ? QUIZ_CATEGORIES.find(c => c.id === selectedCategory) || QUIZ_CATEGORIES[0]
      : null;
    console.log('🎮 Category data:', categoryData);
    return categoryData;
  };
  
  return (
    <div className="w-full">
      {/* Quiz category selection */}
      <div className="relative overflow-x-auto" style={{ minWidth: '100%' }}>
        {/* Removed fade gradients */}
        
        <div 
          className="flex overflow-x-auto scrollbar-hide" 
          style={{ 
            gap: 16,
            padding: '12px 6px 16px 6px',
            alignItems: 'center',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {QUIZ_CATEGORIES.map((category, index) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className="flex-none group"
              style={{ 
                width: 107,
                flex: '0 0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <div 
                style={{
                  borderRadius: '26px',
                  overflow: 'hidden',
                  width: '99px',
                  height: '99px',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                className="relative hover:scale-110 hover:shadow-2xl active:scale-95 shadow-lg"
              >
                {/* Category image - no overlay, no bounding box */}
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover"
                />
                
                {/* Emoji overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-3xl">{category.emoji}</span>
                  </div>
                </div>
              </div>
              
              {/* Category name below */}
              <span 
                style={{ 
                  fontWeight: 600, 
                  fontSize: 16, 
                  textAlign: 'center', 
                  color: '#444', 
                  lineHeight: 1.2,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  transition: 'color 0.3s ease'
                }}
              >
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Quiz Modal - v0 Inspired Clean Design */}
      {modalOpen && selectedCategory && (
        ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100vh',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              zIndex: 9999,
              overflow: 'hidden',
            }}
            className="p-4"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="max-w-md mx-auto h-full flex flex-col">
              {/* Header - Simplified with just back button */}
              <div className="flex items-center justify-start mb-6 pt-4 px-4">
                <button
                  onClick={handleCloseQuiz}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-100 transition-all duration-200 active:scale-95 shadow-lg"
                  style={{
                    border: '1px solid #e5e7eb',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                >
                  ←
                </button>
                {/* Removed progression indicator */}
              </div>

              {/* Progress Bar */}
              {quizData && (
                <div className="mb-8 px-4">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Main Content with side padding */}
              <div className="flex-1 flex flex-col px-4">
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative mb-8">
                      <div className="w-16 h-16 border-4 border-white/30 rounded-full"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-t-white rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-white text-2xl font-bold mb-4 text-center">
                      Loading Quiz
                    </h2>
                    <p className="text-white/80 text-lg text-center">
                      Get ready for an amazing challenge! 🧠
                    </p>
                  </div>
                ) : error ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
                      <span className="text-3xl">😕</span>
                    </div>
                    <h2 className="text-white text-2xl font-bold mb-4">
                      Something went wrong
                    </h2>
                    <p className="text-white/80 text-lg mb-8">{error}</p>
                    <button
                      onClick={handleCloseQuiz}
                      className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all duration-200 active:scale-95"
                    >
                      Try Again
                    </button>
                  </div>
                ) : quizData && quizComplete ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-6 animate-bounce">
                      {score >= quizData.questions.length * 0.8 ? '🏆' : score >= quizData.questions.length * 0.5 ? '🎉' : '👏'}
                    </div>
                    
                    <div className="bg-white rounded-3xl p-8 mb-8 shadow-xl max-w-sm w-full">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
                      <div className="text-4xl font-black text-gray-800 mb-4">
                        {score}/{quizData.questions.length}
                      </div>
                      <div className="text-lg text-gray-600 mb-4">
                        {Math.round((score / quizData.questions.length) * 100)}% Correct
                      </div>
                      <p className="text-gray-600">
                        {score >= quizData.questions.length * 0.8 ? 'Outstanding! You\'re brilliant! 🌟' : 
                         score >= quizData.questions.length * 0.5 ? 'Great job! Keep learning! 💪' : 
                         'Good effort! Every quiz makes you smarter! 🚀'}
                      </p>
                    </div>

                    <div className="space-y-4 w-full max-w-sm">
                      <button
                        onClick={handleRestartQuiz}
                        className="w-full bg-white text-purple-600 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all duration-200 active:scale-95"
                      >
                        🔄 Play Again
                      </button>
                      <button
                        onClick={handleCloseQuiz}
                        className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-full font-semibold border border-white/30 hover:bg-white/30 transition-all duration-200 active:scale-95"
                      >
                        ✨ Explore More
                      </button>
                    </div>
                  </div>
                ) : quizData ? (
                  <>
                    {/* Category and Title - Compact */}
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl">{QUIZ_CATEGORIES.find(c => c.id === selectedCategory)?.emoji || '🧠'}</span>
                        <h1 className="text-2xl font-bold text-white">{getCategoryData()?.name || 'Quiz'}</h1>
                      </div>
                      <p className="text-white/80 text-base">Challenge yourself!</p>
                    </div>

                    {/* Question Card - Compact for mobile */}
                    <div 
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
                        marginBottom: '20px',
                        overflow: 'hidden',
                        border: '1px solid #f3f4f6',
                      }}
                    >
                      <div style={{ padding: '24px 20px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div 
                            style={{
                              width: '48px',
                              height: '48px',
                              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 16px auto',
                            }}
                          >
                            <span style={{ 
                              fontSize: '20px', 
                              fontWeight: 'bold', 
                              color: '#ffffff' 
                            }}>Q</span>
                          </div>
                          <h2 style={{ 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: '#1f2937', 
                            lineHeight: '1.5',
                            margin: 0,
                          }}>
                            {quizData.questions[currentQuestion].question}
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Answer Options - Compact spacing */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px', 
                      marginBottom: '16px',
                      marginLeft: '8px',
                      marginRight: '8px'
                    }}>
                      {quizData.questions[currentQuestion].options.map((option, idx) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrectAnswer = option === quizData.questions[currentQuestion].correct_answer;
                        const showResult = selectedAnswer !== null;
                        
                        // Pure inline styling logic
                        const getAnswerCardStyle = () => {
                          const baseStyle = {
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '16px',
                            border: '2px solid',
                            overflow: 'hidden',
                            transform: 'scale(1)',
                          };
                          
                          if (!showResult && selectedAnswer !== option) {
                            return {
                              ...baseStyle,
                              backgroundColor: '#ffffff',
                              borderColor: '#e5e7eb',
                              boxShadow: '0 8px 12px -4px rgba(0, 0, 0, 0.1)',
                            };
                          }
                          if (!showResult && selectedAnswer === option) {
                            return {
                              ...baseStyle,
                              backgroundColor: '#eff6ff',
                              borderColor: '#93c5fd',
                              boxShadow: '0 8px 12px -4px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(147, 197, 253, 0.4)',
                            };
                          }
                          if (showResult && isCorrectAnswer) {
                            return {
                              ...baseStyle,
                              backgroundColor: '#f0fdf4',
                              borderColor: '#86efac',
                              boxShadow: '0 8px 12px -4px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(134, 239, 172, 0.4)',
                            };
                          }
                          if (showResult && selectedAnswer === option && !isCorrectAnswer) {
                            return {
                              ...baseStyle,
                              backgroundColor: '#fef2f2',
                              borderColor: '#fca5a5',
                              boxShadow: '0 8px 12px -4px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(252, 165, 165, 0.4)',
                            };
                          }
                          return {
                            ...baseStyle,
                            backgroundColor: '#f9fafb',
                            borderColor: '#e5e7eb',
                            boxShadow: '0 8px 12px -4px rgba(0, 0, 0, 0.1)',
                          };
                        };

                        const getAnswerIcon = () => {
                          if (!showResult) return null;
                          if (isCorrectAnswer) {
                            return (
                              <svg style={{ width: '18px', height: '18px', color: '#16a34a' }} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            );
                          }
                          if (selectedAnswer === option && !isCorrectAnswer) {
                            return (
                              <svg style={{ width: '18px', height: '18px', color: '#dc2626' }} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            );
                          }
                          return null;
                        };

                        return (
                          <div
                            key={idx}
                            onClick={() => handleAnswerSelect(option)}
                            style={getAnswerCardStyle()}
                            onMouseEnter={(e) => {
                              if (!showResult || !isSelected) {
                                e.currentTarget.style.transform = 'scale(1.02)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <div style={{ padding: '10px 12px' }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between' 
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    color: '#374151',
                                    fontSize: '12px',
                                  }}>
                                    {String.fromCharCode(65 + idx)}
                                  </div>
                                  <span style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '500', 
                                    color: '#1f2937' 
                                  }}>
                                    {option}
                                  </span>
                                </div>
                                {getAnswerIcon()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Compact Explanation + Next Button - Combined for mobile */}
                    {showExplanation && (
                      <div 
                        style={{
                          backgroundColor: isCorrect ? '#f0fdf4' : '#fff7ed',
                          borderRadius: '16px',
                          padding: '16px',
                          marginBottom: '12px',
                          marginLeft: '8px',
                          marginRight: '8px',
                          border: `2px solid ${isCorrect ? '#86efac' : '#fed7aa'}`,
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '8px' 
                        }}>
                          <span style={{ fontSize: '20px', marginRight: '8px' }}>
                            {isCorrect ? '🎉' : '💡'}
                          </span>
                          <h4 style={{ 
                            fontWeight: 'bold', 
                            fontSize: '16px', 
                            color: '#1f2937',
                            margin: 0,
                          }}>
                            {isCorrect ? 'Correct!' : 'Learn & Try Again!'}
                          </h4>
                        </div>
                        <p style={{ 
                          color: '#374151', 
                          marginBottom: isCorrect ? '12px' : '8px',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          margin: isCorrect ? '0 0 12px 0' : '0 0 8px 0',
                        }}>
                          {quizData.questions[currentQuestion].explanation}
                        </p>
                        
                        {isCorrect ? (
                          <button
                            onClick={handleNextQuestion}
                            style={{
                              backgroundColor: '#ffffff',
                              color: '#8b5cf6',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '12px 24px',
                              fontSize: '16px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.2s',
                              width: '100%',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                              e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {currentQuestion < quizData.questions.length - 1 ? 'Next Question →' : 'Finish Quiz 🏁'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedAnswer(null);
                              setIsCorrect(null);
                              setShowExplanation(false);
                            }}
                            style={{
                              backgroundColor: '#f97316',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '10px 20px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#ea580c';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#f97316';
                            }}
                          >
                            Try Again 🔄
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-xl font-semibold">Preparing your quiz...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Swipe indicator */}
              {quizData && !quizComplete && (
                <div className="pb-4 px-4">
                  <div className="flex justify-center items-center gap-2 text-white/60 text-sm">
                    {currentQuestion > 0 && (
                      <span>← Swipe right for previous</span>
                    )}
                    {currentQuestion > 0 && currentQuestion < quizData.questions.length - 1 && (
                      <span className="mx-2">|</span>
                    )}
                    {currentQuestion < quizData.questions.length - 1 && (
                      <span>Swipe left for next →</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
};

export default QuizSection; 