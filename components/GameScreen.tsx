import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LanePosition, Lane, Problem } from '../types';
import Background from './Background';
import { RocketIcon } from './assets';
import { useGameAudio } from '../hooks/useGameAudio';

const WIN_SCORE = 30;

// Stage configuration based on score
const getStageConfig = (score: number) => {
    const stage = Math.floor(score / 10) + 1;
    if (stage === 1) { // Stage 1 (Score 0-9)
        return { stage, timeLimit: 5, maxNum: 10 };
    } else if (stage === 2) { // Stage 2 (Score 10-19)
        return { stage, timeLimit: 10, maxNum: 20 };
    } else { // Stage 3 (Score 20+)
        return { stage, timeLimit: 15, maxNum: 40 };
    }
};

const generateProblem = (score: number): Problem => {
    const config = getStageConfig(score);
    const maxNum = config.maxNum;
    const operator = config.stage >= 2 && Math.random() > 0.4 ? '-' : '+';
    
    let num1 = Math.floor(Math.random() * maxNum) + 1;
    let num2 = Math.floor(Math.random() * maxNum) + 1;

    // For stage 3, ensure numbers are larger
    if (config.stage === 3) {
        num1 = Math.floor(Math.random() * (maxNum - 15)) + 15;
        num2 = Math.floor(Math.random() * (maxNum - 15)) + 15;
    }
    
    if (operator === '-') {
        if (num1 < num2) [num1, num2] = [num2, num1]; // Ensure positive result
    }

    const answer = operator === '+' ? num1 + num2 : num1 - num2;
    return { num1, num2, operator, answer };
};

const generateLanes = (correctAnswer: number): Lane[] => {
    const positions: LanePosition[] = ['left', 'middle', 'right'];
    let answers = new Set<number>([correctAnswer]);
    while (answers.size < 3) {
        const offset = Math.floor(Math.random() * 5) + 1;
        const wrongAnswer = Math.random() > 0.5 ? correctAnswer + offset : Math.max(0, correctAnswer - offset);
        answers.add(wrongAnswer);
    }

    const shuffledAnswers = Array.from(answers).sort(() => Math.random() - 0.5);

    return positions.map((pos, i) => ({
        position: pos,
        value: shuffledAnswers[i],
        state: 'default'
    }));
};

interface GameScreenProps {
  onEndGame: (finalScore: number, reason: 'win' | 'lose') => void;
  audio: Omit<ReturnType<typeof useGameAudio>, 'initializeAudio'>;
}

const GameScreen: React.FC<GameScreenProps> = ({ onEndGame, audio }) => {
    const [score, setScore] = useState(0);
    const [problem, setProblem] = useState<Problem>(() => generateProblem(0));
    const [lanes, setLanes] = useState<Lane[]>(() => generateLanes(problem.answer));
    const [rocketPosition, setRocketPosition] = useState<LanePosition>('middle');
    const [isAnswering, setIsAnswering] = useState(false);
    const [showSparkles, setShowSparkles] = useState(false);
    
    const [currentProblemTimeLimit, setCurrentProblemTimeLimit] = useState(() => getStageConfig(0).timeLimit);
    const [timeLeft, setTimeLeft] = useState(() => getStageConfig(0).timeLimit);
    
    const [showStageNotification, setShowStageNotification] = useState(false);
    const [notificationStage, setNotificationStage] = useState(0);

    const { playSound, isMuted, toggleMute } = audio;
    
    const nextProblem = useCallback(() => {
        // This function is called after a correct answer. The `score` in this
        // callback's closure is stale, so we calculate based on the next score.
        const newScore = score + 1;
        const newConfig = getStageConfig(newScore);
        const newProblem = generateProblem(newScore);
        setProblem(newProblem);
        setLanes(generateLanes(newProblem.answer));
        setIsAnswering(false);
        setCurrentProblemTimeLimit(newConfig.timeLimit);
        setTimeLeft(newConfig.timeLimit);
    }, [score]);
    
    useEffect(() => {
        if (score === 10 || score === 20) {
            const stage = getStageConfig(score).stage;
            setNotificationStage(stage);
            setShowStageNotification(true);
            const timer = setTimeout(() => {
                setShowStageNotification(false);
            }, 2500); // Display for 2.5 seconds
            return () => clearTimeout(timer);
        }
    }, [score]);

    useEffect(() => {
        if (isAnswering) return;

        if (timeLeft <= 0) {
            playSound('incorrect');
            onEndGame(score, 'lose');
            return;
        }

        const timerId = setTimeout(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearTimeout(timerId);
    }, [timeLeft, isAnswering, onEndGame, score, playSound]);

    const handleAnswer = useCallback((chosenPosition: LanePosition) => {
        if (isAnswering) return;
        setIsAnswering(true);

        const chosenLane = lanes.find(l => l.position === chosenPosition);
        if (!chosenLane) return;

        const isCorrect = chosenLane.value === problem.answer;

        setLanes(lanes.map(l => l.position === chosenPosition ? { ...l, state: isCorrect ? 'correct' : 'incorrect' } : l));

        if (isCorrect) {
            setScore(prev => prev + 1);
            setShowSparkles(true);
            playSound('correct');
        } else {
            playSound('incorrect');
        }

        setTimeout(() => {
            if (isCorrect) {
                const newScore = score + 1;
                if (newScore >= WIN_SCORE) {
                    onEndGame(newScore, 'win');
                } else {
                    nextProblem();
                }
            } else {
                onEndGame(score, 'lose');
            }
            setShowSparkles(false);
        }, 1500);
    }, [isAnswering, lanes, problem.answer, playSound, score, onEndGame, nextProblem]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isAnswering || showStageNotification) return;
            if (e.key === 'ArrowLeft') {
                setRocketPosition(prev => prev === 'middle' ? 'left' : 'left');
                playSound('whoosh');
            } else if (e.key === 'ArrowRight') {
                setRocketPosition(prev => prev === 'middle' ? 'right' : 'right');
                playSound('whoosh');
            } else if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleAnswer(rocketPosition);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [rocketPosition, handleAnswer, isAnswering, playSound, showStageNotification]);
    
    const rocketTranslateClass = useMemo(() => {
        if (rocketPosition === 'left') return '-translate-x-[90%]';
        if (rocketPosition === 'right') return 'translate-x-[90%]';
        return 'translate-x-0';
    }, [rocketPosition]);

    const laneBgClass = (state: Lane['state']) => {
        switch (state) {
            case 'correct': return 'bg-green-500/50 border-green-400';
            case 'incorrect': return 'bg-red-500/50 border-red-400';
            default: return 'bg-blue-500/10 border-blue-400/30';
        }
    };
    
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-between">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                .animate-float {
                    animation: float 2.5s ease-in-out infinite;
                }
                .transition-width {
                    transition-property: width;
                }
                @keyframes stage-up-animation {
                    0% { opacity: 0; transform: scale(0.5); }
                    15% { opacity: 1; transform: scale(1.05); }
                    85% { opacity: 1; transform: scale(1.05); }
                    100% { opacity: 0; transform: scale(0.5); }
                }
                .animate-stage-up {
                    animation: stage-up-animation 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
            <Background />

            {showStageNotification && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="text-center p-8 animate-stage-up">
                        <div className="text-7xl mb-4">🎉</div>
                        <h2 className="text-4xl sm:text-6xl font-black text-yellow-300 drop-shadow-lg">
                            Tabriklaymiz!
                        </h2>
                        <p className="text-2xl sm:text-4xl text-white mt-4 font-bold">
                            {notificationStage}-bosqichga o'tdingiz!
                        </p>
                    </div>
                </div>
            )}

            {/* Top UI */}
             <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex flex-wrap justify-between items-center gap-4 z-10">
                <h1 className="text-2xl sm:text-3xl font-black text-yellow-300 drop-shadow-lg order-1 sm:order-1">
                    Kosmik Matematika
                </h1>

                <div className="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 sm:max-w-xs sm:mx-4">
                    <div className="w-full bg-slate-700/80 rounded-full h-4 border-2 border-cyan-400/50 overflow-hidden shadow-inner backdrop-blur-sm">
                        <div
                            className={`h-full rounded-full transition-width duration-1000 linear ${
                                timeLeft / currentProblemTimeLimit > 0.4 ? 'bg-green-400' : 'bg-red-500'
                            }`}
                            style={{ width: `${(timeLeft / currentProblemTimeLimit) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center gap-4 order-2 sm:order-3">
                    <button onClick={toggleMute} className="text-2xl">
                        {isMuted ? '🔇' : '🔊'}
                    </button>
                    <div className="text-xl sm:text-2xl font-bold bg-cyan-600/50 text-white rounded-lg px-4 py-2 border-2 border-cyan-400">
                        Bosqich: {Math.floor(score / 10) + 1}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold bg-purple-600/50 text-white rounded-lg px-4 py-2 border-2 border-purple-400">
                        Hisob: {score}
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="w-full h-full flex items-center justify-center pt-28 pb-40">
                <div className="relative w-full max-w-2xl h-full flex justify-center items-end">
                    {/* Rocket */}
                    <div className={`absolute bottom-[15%] w-20 h-20 sm:w-28 sm:h-28 z-20 transition-transform duration-300 ease-out ${rocketTranslateClass}`}>
                         <div className="animate-float w-full h-full relative">
                            <RocketIcon className={`w-full h-full transition-transform duration-500 ${isAnswering ? 'scale-125' : ''}`}/>
                            {showSparkles && (
                                <div className="absolute inset-0">
                                    {Array.from({length: 10}).map((_, i) => (
                                        <div key={i} className="absolute bg-yellow-300 rounded-full animate-ping" style={{
                                            width: `${Math.random()*6+2}px`, height: `${Math.random()*6+2}px`,
                                            top: `${Math.random()*100}%`, left: `${Math.random()*100}%`,
                                            animationDuration: `${Math.random()*0.5+0.5}s`
                                        }}></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lanes */}
                    <div className="absolute bottom-0 w-full grid grid-cols-3 gap-2 px-2">
                        {lanes.map(lane => (
                            <button key={lane.position} disabled={isAnswering} onClick={() => { setRocketPosition(lane.position); playSound('whoosh'); handleAnswer(lane.position); }}
                                className={`h-24 sm:h-32 flex items-center justify-center rounded-xl border-4 transition-all duration-300 ${laneBgClass(lane.state)} backdrop-blur-sm active:scale-95`}>
                                <span className="text-4xl sm:text-6xl font-black text-white drop-shadow-md">{lane.value}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom UI - Problem */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-slate-800/50 backdrop-blur-md z-10">
                <p className="text-center text-3xl sm:text-5xl font-black text-yellow-300 tracking-widest drop-shadow-lg">
                    {problem.num1} {problem.operator} {problem.num2} = ?
                </p>
            </div>
        </div>
    );
};

export default GameScreen;