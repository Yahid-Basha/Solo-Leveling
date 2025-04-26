import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface ConfettiEffectProps {
  show: boolean;
  duration?: number; // in milliseconds
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ 
  show,
  duration = 5000
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!showConfetti) return null;

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={true}
      numberOfPieces={500}
      gravity={0.1}
      colors={['#0071e3', '#00c2ff', '#e0f7ff', '#ffffff', '#ffd60a']}
    />
  );
};

export default ConfettiEffect;