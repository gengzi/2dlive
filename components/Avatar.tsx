import React, { useEffect, useState, useRef } from 'react';

interface AvatarProps {
  audioLevel: number; // 0.0 to 1.0
  isConnected: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ audioLevel, isConnected }) => {
  const [blink, setBlink] = useState(false);
  const [smoothLevel, setSmoothLevel] = useState(0);
  const [lookTarget, setLookTarget] = useState({ x: 0, y: 0 }); // Values between -1 and 1
  const rafRef = useRef<number | null>(null);

  // Blinking Logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Eye Movement Logic (Simulate looking around)
  useEffect(() => {
    const lookInterval = setInterval(() => {
        // 70% chance to look center, 30% chance to look elsewhere
        if (Math.random() > 0.7) {
            setLookTarget({
                x: (Math.random() - 0.5) * 1.5,
                y: (Math.random() - 0.5) * 0.5
            });
        } else {
             setLookTarget({ x: 0, y: 0 });
        }
    }, 2000);
    return () => clearInterval(lookInterval);
  }, []);

  // Smoothing Logic: Linear Interpolation (Lerp) for Mouth
  useEffect(() => {
    const animate = () => {
        setSmoothLevel(prev => {
            const diff = audioLevel - prev;
            // Snappier opening, slower closing for natural speech
            const speed = diff > 0 ? 0.3 : 0.1; 
            return prev + diff * speed;
        });
        rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    }
  }, [audioLevel]);

  // Derived animation values
  const openness = Math.min(1.2, smoothLevel * 8); 
  const mouthH = 2 + (openness * 20);
  const mouthW = 14 + (openness * 3);
  const smileCurve = 10 - (openness * 10); // Flatten smile when mouth opens
  
  // Eye Colors
  const irisColor = isConnected ? "#60A5FA" : "#94A3B8";
  const glowColor = isConnected ? "rgba(96, 165, 250, 0.5)" : "transparent";

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Container with idle float animation */}
      <div className="relative w-[320px] h-[320px] md:w-[480px] md:h-[480px] animate-float">
        <svg 
            viewBox="0 0 200 220" 
            className="w-full h-full drop-shadow-2xl animate-breathe"
            style={{ 
                filter: isConnected ? 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))' : 'grayscale(0.8)',
                transition: 'filter 0.5s ease'
            }}
        >
            <defs>
                <linearGradient id="skinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFF0E0" />
                    <stop offset="100%" stopColor="#EAC0A0" />
                </linearGradient>
                <linearGradient id="hairGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2D3748" />
                    <stop offset="100%" stopColor="#1A202C" />
                </linearGradient>
                <clipPath id="faceClip">
                    <path d="M 40,70 C 40,20 160,20 160,70 C 160,160 130,190 100,200 C 70,190 40,160 40,70" />
                </clipPath>
            </defs>
            
            {/* --- BACK HAIR --- */}
            <path d="M 30,80 C 10,120 20,200 60,210 C 100,220 140,220 180,210 C 220,200 230,120 210,80 C 190,40 150,20 120,20" fill="url(#hairGradient)" />

            {/* --- NECK --- */}
            <path d="M 85,180 L 85,220 L 115,220 L 115,180 Z" fill="#EAC0A0" />

            {/* --- FACE BASE --- */}
            <path d="M 40,70 C 40,20 160,20 160,70 C 160,160 130,190 100,200 C 70,190 40,160 40,70" fill="url(#skinGradient)" />
            
            {/* --- EARS --- */}
            <path d="M 38,90 Q 30,100 38,120" fill="#EAC0A0" stroke="none" />
            <path d="M 162,90 Q 170,100 162,120" fill="#EAC0A0" stroke="none" />

            {/* --- EYES & EYEBROWS (Moves slightly with lookTarget) --- */}
            <g transform={`translate(${lookTarget.x * 2}, ${lookTarget.y * 2})`}>
                
                {/* Eyebrows */}
                <path d="M 65,78 Q 75,72 85,78" stroke="#4A3A30" strokeWidth="2.5" fill="none" opacity="0.8" />
                <path d="M 115,78 Q 125,72 135,78" stroke="#4A3A30" strokeWidth="2.5" fill="none" opacity="0.8" />

                {/* Left Eye */}
                <g transform={`translate(75, 95) scale(1, ${blink ? 0.05 : 1})`} className="transition-transform duration-100">
                    <ellipse cx="0" cy="0" rx="10" ry="7" fill="#FFF" />
                    {/* Iris Group - moves more than the eye container */}
                    <g transform={`translate(${lookTarget.x * 3}, ${lookTarget.y * 2})`}>
                        <circle cx="0" cy="0" r="4.5" fill={irisColor} className="transition-colors duration-500" />
                        <circle cx="0" cy="0" r="2" fill="#000" />
                        <circle cx="1.5" cy="-1.5" r="1.5" fill="#FFF" opacity="0.8" />
                    </g>
                </g>
                
                {/* Right Eye */}
                <g transform={`translate(125, 95) scale(1, ${blink ? 0.05 : 1})`} className="transition-transform duration-100">
                    <ellipse cx="0" cy="0" rx="10" ry="7" fill="#FFF" />
                    <g transform={`translate(${lookTarget.x * 3}, ${lookTarget.y * 2})`}>
                         <circle cx="0" cy="0" r="4.5" fill={irisColor} className="transition-colors duration-500" />
                         <circle cx="0" cy="0" r="2" fill="#000" />
                         <circle cx="1.5" cy="-1.5" r="1.5" fill="#FFF" opacity="0.8" />
                    </g>
                </g>
            </g>

            {/* --- NOSE --- */}
            <path d="M 100,105 Q 98,115 100,120 Q 102,115 100,105" fill="#D0A080" opacity="0.6" />

            {/* --- MOUTH --- */}
            <g transform="translate(100, 145)">
                 {/* Inside Mouth (visible when open) */}
                <path 
                    d={`M -${mouthW/2},0 Q 0,${mouthH} ${mouthW/2},0 Q 0,-${mouthH/3} -${mouthW/2},0`} 
                    fill="#602020" 
                    opacity={openness > 0.1 ? 1 : 0} 
                />
                
                {/* Tongue */}
                 <path 
                    d={`M -${mouthW/3},${mouthH/2} Q 0,${mouthH} ${mouthW/3},${mouthH/2}`} 
                    fill="#C06060" 
                    opacity={openness > 0.2 ? 1 : 0} 
                />

                {/* Lips (Upper and Lower) */}
                <path 
                    d={`M -${mouthW},0 Q 0,${smileCurve + (openness * 2)} ${mouthW},0`} 
                    stroke="#C07070" 
                    strokeWidth="2" 
                    fill="none" 
                    strokeLinecap="round"
                />
                {openness > 0.05 && (
                    <path 
                        d={`M -${mouthW * 0.8},${mouthH * 0.8} Q 0,${mouthH + 2} ${mouthW * 0.8},${mouthH * 0.8}`} 
                        stroke="#C07070" 
                        strokeWidth="1.5" 
                        fill="none" 
                        strokeLinecap="round"
                        opacity="0.8"
                    />
                )}
            </g>

            {/* --- FRONT HAIR / BANGS --- */}
            <path d="M 40,70 C 50,40 150,40 160,70 C 160,60 180,90 180,140 L 170,130 C 170,80 160,60 140,55 C 130,90 120,90 110,60 C 90,80 80,80 70,60 C 50,70 40,120 30,130 L 20,140 C 20,90 30,60 40,70" fill="url(#hairGradient)" />

        </svg>

        {/* --- HOLOGRAM / TECH OVERLAY EFFECTS --- */}
        {isConnected && (
            <div className="absolute inset-0 pointer-events-none">
                 {/* Glowing Aura */}
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-blue-400 blur-[60px] mix-blend-screen transition-opacity duration-300 rounded-full ${openness > 0.1 ? 'opacity-30' : 'opacity-10'}`} />
                 
                 {/* Tech Ring (Rotating) */}
                 <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] border border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite] opacity-50" 
                      style={{ borderStyle: 'dashed' }} />
            </div>
        )}
      </div>
    </div>
  );
};

export default Avatar;