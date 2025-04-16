import React, { useState, useEffect } from 'react';

const InteractiveEyes: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [eyePositions, setEyePositions] = useState([
    { x: 0, y: 0 }, // left eye
    { x: 0, y: 0 }, // right eye
  ]);
  const [blinking, setBlinking] = useState(false);
  const [laughing, setLaughing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Set up random blinking
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, Math.random() * 5000 + 2000); // Random blink between 2-7 seconds

    // Set up random laughing
    const laughInterval = setInterval(() => {
      setLaughing(true);
      setTimeout(() => setLaughing(false), 500);
    }, Math.random() * 8000 + 5000); // Random laugh between 5-13 seconds

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(blinkInterval);
      clearInterval(laughInterval);
    };
  }, []);

  useEffect(() => {
    // Calculate eye positions based on mouse position
    const calculateEyePositions = () => {
      const leftEyeEl = document.getElementById('left-eye');
      const rightEyeEl = document.getElementById('right-eye');

      if (leftEyeEl && rightEyeEl) {
        const leftEyeRect = leftEyeEl.getBoundingClientRect();
        const rightEyeRect = rightEyeEl.getBoundingClientRect();

        const leftEyeCenter = {
          x: leftEyeRect.left + leftEyeRect.width / 2,
          y: leftEyeRect.top + leftEyeRect.height / 2,
        };

        const rightEyeCenter = {
          x: rightEyeRect.left + rightEyeRect.width / 2,
          y: rightEyeRect.top + rightEyeRect.height / 2,
        };

        // Calculate angle for left eye
        const leftAngle = Math.atan2(
          mousePosition.y - leftEyeCenter.y,
          mousePosition.x - leftEyeCenter.x
        );

        // Calculate angle for right eye
        const rightAngle = Math.atan2(
          mousePosition.y - rightEyeCenter.y,
          mousePosition.x - rightEyeCenter.x
        );

        // Eye movement limits (pupil should stay within eye)
        const eyeRadius = Math.min(leftEyeRect.width, leftEyeRect.height) / 5;

        setEyePositions([
          {
            x: Math.cos(leftAngle) * eyeRadius,
            y: Math.sin(leftAngle) * eyeRadius,
          },
          {
            x: Math.cos(rightAngle) * eyeRadius,
            y: Math.sin(rightAngle) * eyeRadius,
          },
        ]);
      }
    };

    // Calculate on mount and when mouse position changes
    calculateEyePositions();
    // Set up interval for smoother updates
    const interval = setInterval(calculateEyePositions, 50);

    return () => clearInterval(interval);
  }, [mousePosition]);

  return (
    <div className="interactive-face w-full h-full flex items-center justify-center">
      <div className="face bg-amber-300 rounded-full w-full h-full flex items-center justify-center relative border-4 border-amber-500">
        {/* Face elements */}
        
        {/* Eyes container */}
        <div className="eyes-container absolute w-3/4 h-2/5 flex justify-around items-center" style={{ top: '20%' }}>
          {/* Left eye */}
          <div 
            id="left-eye"
            className={`eye bg-white rounded-full w-2/5 h-5/6 relative flex items-center justify-center border-4 border-black ${blinking ? 'h-1/6' : 'h-5/6'}`}
            style={{ transition: 'height 0.1s ease-out' }}
          >
            <div 
              className="pupil bg-black rounded-full w-1/2 h-1/2 absolute"
              style={{
                transform: `translate(${eyePositions[0].x}px, ${eyePositions[0].y}px)`,
                transition: 'transform 0.1s ease-out',
                display: blinking ? 'none' : 'block'
              }}
            >
              <div className="eye-shine bg-white rounded-full w-1/3 h-1/3 absolute top-1/4 left-1/4"></div>
            </div>
          </div>
          
          {/* Right eye */}
          <div 
            id="right-eye"
            className={`eye bg-white rounded-full w-2/5 h-5/6 relative flex items-center justify-center border-4 border-black ${blinking ? 'h-1/6' : 'h-5/6'}`}
            style={{ transition: 'height 0.1s ease-out' }}
          >
            <div 
              className="pupil bg-black rounded-full w-1/2 h-1/2 absolute"
              style={{
                transform: `translate(${eyePositions[1].x}px, ${eyePositions[1].y}px)`,
                transition: 'transform 0.1s ease-out',
                display: blinking ? 'none' : 'block'
              }}
            >
              <div className="eye-shine bg-white rounded-full w-1/3 h-1/3 absolute top-1/4 left-1/4"></div>
            </div>
          </div>
        </div>
        
        {/* Laughing Mouth */}
        <div className="mouth absolute w-3/5 h-1/3" style={{ top: '60%' }}>
          <div 
            className={`laugh-container w-full ${laughing ? 'h-4/5' : 'h-2/3'} bg-black rounded-b-[100px] flex justify-center items-end overflow-hidden transition-all duration-300`} 
            style={{ clipPath: 'polygon(0 40%, 100% 40%, 100% 100%, 0% 100%)' }}
          >
            {/* Teeth */}
            <div className="teeth-row w-full h-2/5 flex justify-center">
              <div className="teeth-container w-[95%] h-full flex">
                {[...Array(8)].map((_, index) => (
                  <div 
                    key={index} 
                    className="tooth bg-white border border-black h-full" 
                    style={{ width: `${100 / 8}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Blush */}
        <div className="left-blush absolute w-1/6 h-1/8 bg-red-400 rounded-full opacity-40" style={{ left: '20%', top: '55%' }}></div>
        <div className="right-blush absolute w-1/6 h-1/8 bg-red-400 rounded-full opacity-40" style={{ right: '20%', top: '55%' }}></div>
      </div>
    </div>
  );
};

export default InteractiveEyes; 