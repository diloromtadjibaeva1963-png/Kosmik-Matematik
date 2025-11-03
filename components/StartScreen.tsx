import React from 'react';
import Background from './Background';
import { RocketIcon } from './assets';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-4">
      <Background />
      <div className="relative z-10 flex flex-col items-center">
        <RocketIcon className="w-32 h-32 md:w-48 md:h-48 mb-4 animate-bounce" />
        <h1 className="text-5xl md:text-7xl font-black text-yellow-300 drop-shadow-[0_5px_5px_rgba(0,0,0,0.4)] mb-2">
          Kosmik Matematika Sarguzashti
        </h1>
        <p className="text-lg md:text-2xl text-cyan-200 mb-8 max-w-2xl">
          Misollarni yechib, galaktika bo'ylab raketangizni boshqaring! Harakatlanish uchun strelka tugmalaridan foydalaning va javobni tanlash uchun 'Enter' tugmasini bosing.
        </p>
        <button
          onClick={onStart}
          className="px-10 py-5 bg-green-500 text-white text-3xl font-bold rounded-full shadow-lg border-4 border-green-300
                     hover:bg-green-600 hover:scale-105 transform transition-all duration-300
                     animate-pulse"
        >
          Missiyani Boshlash!
        </button>
      </div>
    </div>
  );
};

export default StartScreen;