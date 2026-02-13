import React from 'react';

interface CrystalOrbProps {
  percentage: number; // 0 to 100
}

export const CrystalOrb: React.FC<CrystalOrbProps> = ({ percentage }) => {
  const size = 260;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth - 10;
  const circumference = 2 * Math.PI * radius;
  // Calculate offset: Start full (offset=circumference) and reduce to 0 to fill
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-full my-10">
       <div className="relative" style={{ width: size, height: size }}>
          
          {/* Subtle Background Glow Behind the Circle */}
          <div className="absolute inset-0 rounded-full bg-teal-500/5 blur-3xl transform scale-110" />

          <svg className="w-full h-full transform -rotate-90">
            <defs>
               {/* Neon Gradient Definition for the Stroke */}
               <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2dd4bf" /> {/* teal-400 */}
                  <stop offset="50%" stopColor="#818cf8" /> {/* indigo-400 */}
                  <stop offset="100%" stopColor="#c084fc" /> {/* purple-400 */}
               </linearGradient>
            </defs>

            {/* Track Circle (Faint Background Ring) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#ffffff"
              strokeWidth={strokeWidth}
              strokeOpacity="0.05"
            />

            {/* Progress Circle (Fills up) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={percentage > 0 ? "url(#neonGradient)" : "transparent"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
              style={{ filter: 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.5))' }}
            />
          </svg>

          {/* Text Content - Absolute Center, No Background Box */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
             <div className="text-6xl font-bold text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                {Math.round(percentage)}<span className="text-3xl align-top ml-1 opacity-50 font-light">%</span>
             </div>
             <div className="text-xs font-medium text-teal-200/70 uppercase tracking-[0.3em] mt-3">
                오늘의 몰입도
             </div>
          </div>
       </div>
    </div>
  );
};