
export type GameState = 'start' | 'playing' | 'gameOver';

export type LanePosition = 'left' | 'middle' | 'right';

export interface Problem {
  num1: number;
  num2: number;
  operator: '+' | '-';
  answer: number;
}

export interface Lane {
  position: LanePosition;
  value: number;
  state: 'default' | 'correct' | 'incorrect';
}

export type SoundType = 'correct' | 'incorrect' | 'whoosh';
