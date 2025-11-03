
import React from 'react';
import { StarIcon, CometIcon, PlanetIcon } from './assets';

const backgroundElements = Array.from({ length: 50 }).map((_, i) => {
    const type = Math.random();
    const size = Math.random() * 20 + 5;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * -20;
    const top = `${Math.random() * 100}%`;
    
    const style: React.CSSProperties = {
        top,
        width: `${size}px`,
        height: `${size}px`,
        animation: `fall ${duration}s linear ${delay}s infinite`,
    };

    if (type < 0.7) { // Star
        return <StarIcon key={`bg-el-${i}`} style={style} className="text-yellow-200 opacity-70" />;
    } else if (type < 0.9) { // Comet
        return <CometIcon key={`bg-el-${i}`} style={{...style, width: `${size * 3}px`, height: `${size*1.5}px` }} />;
    } else { // Planet
        const planetColor = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7'][Math.floor(Math.random() * 4)];
        const hasRing = Math.random() > 0.5;
        return <PlanetIcon key={`bg-el-${i}`} style={{...style, width: `${size * 4}px`, height: `${size*4}px` }} color={planetColor} ringColor={hasRing ? '#e2e8f0' : undefined} />;
    }
});

const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#1e293b] to-[#0f172a] overflow-hidden">
      <style>
        {`
          @keyframes fall {
            from { transform: translateX(100vw) translateY(-10vh); }
            to { transform: translateX(-10vw) translateY(110vh); }
          }
        `}
      </style>
      {backgroundElements}
    </div>
  );
};

export default React.memo(Background);
