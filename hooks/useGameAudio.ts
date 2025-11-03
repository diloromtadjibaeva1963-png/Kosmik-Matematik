import { useState, useCallback, useRef } from 'react';
import { SoundType } from '../types';

// Helper functions for audio decoding, placed outside the hook
const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

// Simple synthesized sounds to avoid extra assets
const createSoundBuffer = (ctx: AudioContext, type: SoundType): AudioBuffer => {
  const duration = 0.2;
  const sampleRate = ctx.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  switch (type) {
    case 'correct': // Ascending tone
      for (let i = 0; i < frameCount; i++) {
        data[i] = Math.sin(2 * Math.PI * (440 + i * 0.5) * i / sampleRate) * Math.exp(-i / sampleRate * 4) * 0.5;
      }
      break;
    case 'incorrect': // Buzz tone
      for (let i = 0; i < frameCount; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / sampleRate * 10);
      }
      break;
    case 'whoosh': // White noise sweep
      for (let i = 0; i < frameCount; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frameCount, 2) * 0.2;
      }
      break;
  }
  return buffer;
};

// Background music generation
const musicNotes = [
    { freq: 261.63, duration: 0.4 }, // C4
    { freq: 293.66, duration: 0.4 }, // D4
    { freq: 329.63, duration: 0.4 }, // E4
    { freq: 261.63, duration: 0.4 }, // C4
    { freq: 392.00, duration: 0.8 }, // G4
    { freq: 349.23, duration: 0.8 }, // F4
];

export const useGameAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const soundBuffers = useRef<Map<SoundType, AudioBuffer>>(new Map());
  const musicState = useRef<{ osc?: OscillatorNode, gain?: GainNode, timeoutId?: number, noteIndex: number, isPlaying: boolean }>({ noteIndex: 0, isPlaying: false });

  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext({ sampleRate: 24000 });
            audioContextRef.current = ctx;

            // Pre-generate simple sound effects
            soundBuffers.current.set('correct', createSoundBuffer(ctx, 'correct'));
            soundBuffers.current.set('incorrect', createSoundBuffer(ctx, 'incorrect'));
            soundBuffers.current.set('whoosh', createSoundBuffer(ctx, 'whoosh'));
        }
    }
  }, []);

  const playBuffer = useCallback((buffer: AudioBuffer) => {
    if (!audioContextRef.current || isMuted) return;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  }, [isMuted]);

  const playSound = useCallback((type: SoundType) => {
    const buffer = soundBuffers.current.get(type);
    if(buffer) {
        playBuffer(buffer);
    }
  }, [playBuffer]);
  
  const playNextNote = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !musicState.current.isPlaying) return;

    const note = musicNotes[musicState.current.noteIndex];
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(isMuted ? 0 : 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + note.duration - 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + note.duration);

    musicState.current.noteIndex = (musicState.current.noteIndex + 1) % musicNotes.length;
    musicState.current.timeoutId = window.setTimeout(playNextNote, note.duration * 1000);
  }, [isMuted]);

  const playMusic = useCallback(() => {
    if (musicState.current.isPlaying) return;
    musicState.current.isPlaying = true;
    playNextNote();
  }, [playNextNote]);

  const stopMusic = useCallback(() => {
    if (!musicState.current.isPlaying) return;
    musicState.current.isPlaying = false;
    clearTimeout(musicState.current.timeoutId);
    musicState.current.noteIndex = 0;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return { initializeAudio, playSound, isMuted, toggleMute, playMusic, stopMusic };
};
