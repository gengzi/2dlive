import React, { useEffect, useState, useRef } from 'react';

interface AvatarProps {
  audioLevel: number; // 0.0 to 1.0
  isConnected: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ audioLevel, isConnected }) => {
  const [blink, setBlink] = useState(false);
  const [smoothLevel, setSmoothLevel] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Blinking Logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Smoothing Logic: Linear Interpolation (Lerp)
  useEffect(() => {
    const animate = () => {
        setSmoothLevel(prev => {
            // Move 15% of the way towards the target (audioLevel) each frame
            // This creates a smooth, organic spring-like motion
            const diff = audioLevel - prev;
            if (Math.abs(diff) < 0.001) return audioLevel;
            return prev + diff * 0.15;
        });
        rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    }
  }, [audioLevel]);

  // Map smoothed level to openness
  const openness = Math.min(1, smoothLevel * 5); 
  
  // Mouth Dimensions
  const mouthH = 2 + (openness * 18); // Height
  const mouthW = 12 + (openness * 5); // Width

  const eyeColor = isConnected ? "#3B82F6" : "#64748B";

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] transition-transform duration-300">
        <svg 
            viewBox="0 0 200 200" 
            className="w-full h-full drop-shadow-2xl"
            style={{ 
                filter: isConnected ? 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.4))' : 'grayscale(0.9)',
                transition: 'filter 0.5s ease'
            }}
        >
            <defs>
                <linearGradient id="skinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFE0C4" />
                    <stop offset="100%" stopColor="#F0C0A0" />
                </linearGradient>
                <linearGradient id="hairGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2A2A2A" />
                    <stop offset="100%" stopColor="#1A1A1A" />
                </linearGradient>
            </defs>
            
            {/* Back Hair */}
            <path d="M 50,60 C 20,100 20,160 40,180 C 60,200 140,200 160,180 C 180,160 180,100 150,60" fill="url(#hairGradient)" />

            {/* Face Base */}
            <ellipse cx="100" cy="100" rx="60" ry="70" fill="url(#skinGradient)" />
            
            {/* Ears */}
            <ellipse cx="38" cy="100" rx="8" ry="15" fill="#F0C0A0" />
            <ellipse cx="162" cy="100" rx="8" ry="15" fill="#F0C0A0" />

            {/* Front Hair / Bangs */}
            <path d="M 40,70 C 40,20 160,20 160,70 C 160,40 100,40 40,70" fill="url(#hairGradient)" />

            {/* Eyes Group */}
            <g transform="translate(0, 0)">
                {/* Left Eye */}
                <g transform={`translate(75, 95) scale(1, ${blink ? 0.1 : 1})`} className="transition-transform duration-100">
                    <ellipse cx="0" cy="0" rx="9" ry="6" fill="#FFF" />
                    <circle cx="0" cy="0" r="4" fill={eyeColor} className="transition-colors duration-500" />
                    <circle cx="0" cy="0" r="1.8" fill="#000" />
                    <circle cx="2" cy="-2" r="1.5" fill="#FFF" opacity="0.9" />
                </g>
                
                {/* Right Eye */}
                <g transform={`translate(125, 95) scale(1, ${blink ? 0.1 : 1})`} className="transition-transform duration-100">
                    <ellipse cx="0" cy="0" rx="9" ry="6" fill="#FFF" />
                    <circle cx="0" cy="0" r="4" fill={eyeColor} className="transition-colors duration-500" />
                    <circle cx="0" cy="0" r="1.8" fill="#000" />
                    <circle cx="2" cy="-2" r="1.5" fill="#FFF" opacity="0.9" />
                </g>
            </g>
            
            {/* Eyebrows */}
            <path d="M 68,82 Q 75,79 82,82" stroke="#5A3A20" strokeWidth="2" fill="none" opacity="0.8" />
            <path d="M 118,82 Q 125,79 132,82" stroke="#5A3A20" strokeWidth="2" fill="none" opacity="0.8" />

            {/* Nose */}
            <path d="M 100,105 L 97,112 L 103,112 Z" fill="#D0A080" opacity="0.5" />

            {/* Animated Mouth */}
            <g transform="translate(100, 135)">
                {/* Inner Mouth */}
                <ellipse cx="0" cy="0" rx={mouthW - 2} ry={Math.max(0, mouthH - 1)} fill="#501010" opacity={openness > 0.05 ? 1 : 0} />
                
                {/* Tongue */}
                <ellipse cx="0" cy={mouthH * 0.4} rx={mouthW * 0.5} ry={mouthH * 0.4} fill="#C05050" opacity={openness > 0.2 ? 1 : 0} />

                {/* Lips */}
                <ellipse 
                    cx="0" 
                    cy="0" 
                    rx={mouthW} 
                    ry={mouthH} 
                    fill="none" 
                    stroke={openness > 0.1 ? "#C06060" : "#B05050"} 
                    strokeWidth={openness > 0.1 ? "1.5" : "2.5"}
                />
            </g>

        </svg>

        {/* Ambient Particles */}
        {isConnected && (
            <div className="absolute inset-0 pointer-events-none">
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500 blur-[80px] mix-blend-screen transition-opacity duration-300 ${openness > 0.1 ? 'opacity-20' : 'opacity-5'}`} />
            </div>
        )}
      </div>
    </div>
  );
};

export default Avatar;