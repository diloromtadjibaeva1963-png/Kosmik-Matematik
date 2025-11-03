import React from 'react';

export const RocketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
  >
    <defs>
      <linearGradient id="rocketBodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#d1d5db', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#9ca3af', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="rocketFlameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#fef08a', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
      </linearGradient>
      <style>{`
        @keyframes flicker {
          0%, 100% { transform: scaleY(1) translateY(0); opacity: 1; }
          50% { transform: scaleY(1.2) translateY(-3px); opacity: 0.85; }
        }
        .flame {
          animation: flicker 0.2s infinite ease-in-out;
          transform-origin: 50% 100%;
        }
      `}</style>
    </defs>
    <path
      d="M21.1,43.3a2.3,2.3,0,0,1,1.1-3.1,23.5,23.5,0,0,0,9.8-19.8,2.3,2.3,0,0,1,4,0,23.5,23.5,0,0,0,9.8,19.8,2.3,2.3,0,0,1,1.1,3.1L32,56.7Z"
      fill="#ef4444"
      stroke="#c22d2d"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.1,43.3,10.3,50.1a2.3,2.3,0,0,1-3.2-1.7L4.7,35.9a2.3,2.3,0,0,1,3.2-2.6l12,6.9a2.3,2.3,0,0,0,1.1,3.1Z"
      fill="#3b82f6"
      stroke="#1e68e3"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M42.9,43.3,53.7,50.1a2.3,2.3,0,0,0,3.2-1.7l2.4-12.5a2.3,2.3,0,0,0-3.2-2.6l-12-6.9a2.3,2.3,0,0,1-1.1,3.1Z"
      fill="#3b82f6"
      stroke="#1e68e3"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32,7.3,23.4,26.5a24.2,24.2,0,0,1-9.3,11.5L32,49.5l17.9-11.5a24.2,24.2,0,0,1-9.3-11.5Z"
      fill="url(#rocketBodyGradient)"
      stroke="#6b7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="32" cy="27" r="5" fill="#a5f3fc" stroke="#0e7490" strokeWidth="2" />
    <path 
        className="flame"
        d="M28 54 Q32 64 36 54 Q32 58 28 54Z"
        fill="url(#rocketFlameGradient)"
        stroke="#eab308"
        strokeWidth="1.5"
    />
  </svg>
);


export const StarIcon: React.FC<{ style: React.CSSProperties, className?: string }> = ({ style, className }) => (
    <div style={style} className={`absolute ${className}`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 4.517 1.48-8.279-6.064-5.828 8.332-1.151z"/>
        </svg>
    </div>
);

export const CometIcon: React.FC<{ style: React.CSSProperties, className?: string }> = ({ style, className }) => (
    <div style={style} className={`absolute ${className}`}>
         <svg viewBox="0 0 100 50" className="w-full h-full" fill="none">
            <defs>
                <radialGradient id="cometHead" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="white"/>
                    <stop offset="100%" stopColor="#a5f3fc"/>
                </radialGradient>
                 <linearGradient id="cometTail" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#67e8f9" stopOpacity="0"/>
                </linearGradient>
            </defs>
            <path d="M 25,25 C 50,10 75,10 100,0 L 100,50 C 75,40 50,40 25,25 Z" fill="url(#cometTail)"/>
            <circle cx="25" cy="25" r="15" fill="url(#cometHead)"/>
        </svg>
    </div>
);

export const PlanetIcon: React.FC<{ style: React.CSSProperties, className?: string, color: string, ringColor?: string }> = ({ style, className, color, ringColor }) => (
    <div style={style} className={`absolute ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-50">
            <defs>
                <radialGradient id={`planetGrad_${color.replace('#', '')}`} cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                    <stop offset="100%" stopColor={color} />
                </radialGradient>
            </defs>
            {ringColor && (
                <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke={ringColor} strokeWidth="5" transform="rotate(-20 50 50)" />
            )}
            <circle cx="50" cy="50" r="30" fill={`url(#planetGrad_${color.replace('#', '')})`} />
        </svg>
    </div>
);
