import React from 'react';
import Background from './Background';

interface EndScreenProps {
  score: number;
  onRestart: () => void;
  outcome: 'win' | 'lose';
}

const EndScreen: React.FC<EndScreenProps> = ({ score, onRestart, outcome }) => {
  const isWin = outcome === 'win';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-4">
      <Background />
      <div className="relative z-10 bg-black/50 backdrop-blur-lg p-8 rounded-2xl border-4 border-purple-500 shadow-2xl">
        <h2 className={`text-4xl md:text-6xl font-black ${isWin ? 'text-green-400' : 'text-red-400'} drop-shadow-lg mb-4`}>
          {isWin ? 'Missiya Bajarildi!' : "O'yin Tugadi"}
        </h2>
        <p className="text-xl md:text-3xl text-white mb-2">
          {isWin ? 'Tabriklayman, Koinot Uchuvchisi!' : 'Yaxshi harakat, Koinot Uchuvchisi!'}
        </p>
        <p className="text-2xl md:text-4xl text-yellow-300 font-bold mb-8">
          Yakuniy Hisobingiz: {score}
        </p>
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-blue-500 text-white text-2xl font-bold rounded-full shadow-lg border-4 border-blue-300
                     hover:bg-blue-600 hover:scale-105 transform transition-all duration-300"
        >
          Qayta O'ynash!
        </button>
      </div>
    </div>
  );
};

export default EndScreen;