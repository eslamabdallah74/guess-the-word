import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Trophy, RotateCcw } from 'lucide-react';
import { GameState } from '../types';
import clsx from 'clsx';

interface GameplayPhaseProps {
  socket: Socket;
  gameState: GameState;
}

const GameplayPhase: React.FC<GameplayPhaseProps> = ({ socket, gameState }) => {
  const [guessInput, setGuessInput] = useState('');
  const isMyTurn = gameState.currentTurn === socket.id;

  const handleGuess = () => {
    if (!guessInput.trim() || !isMyTurn) return;

    socket.emit('makeGuess', {
      gameId: gameState.gameId,
      guess: guessInput.trim().toLowerCase()
    });
    setGuessInput('');
  };

  if (gameState.winner) {
    const didIWin = gameState.winner === socket.id;
    return (
      <div className="text-center space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl">
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            {didIWin ? 'You Won!' : 'Game Over'}
          </h2>
          <p className="text-xl mb-6">
            The word was: <span className="font-bold">{gameState.targetWord}</span>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const lastOpponentGuess = gameState.opponentGuesses[gameState.opponentGuesses.length - 1];

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
        </h2>

        {lastOpponentGuess && (
          <div className="mb-6">
            <h3 className="text-lg mb-2">Last Opponent's Guess:</h3>
            <div className="flex justify-center gap-2">
              {lastOpponentGuess.word.split('').map((letter, index) => (
                <div
                  key={index}
                  className={clsx(
                    "w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold border-2",
                    lastOpponentGuess.matches[index]
                      ? "border-green-500 text-green-400"
                      : "border-red-500/30 text-red-400/70"
                  )}
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>
        )}

        {isMyTurn && (
          <div className="flex gap-2">
            <input
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Enter your guess..."
            />
            <button
              onClick={handleGuess}
              disabled={!guessInput.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Guess
            </button>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Your Previous Guesses:</h3>
          <div className="space-y-2">
            {gameState.myGuesses.map((guess, index) => (
              <div key={index} className="flex gap-2 justify-center">
                {guess.word.split('').map((letter, letterIndex) => (
                  <div
                    key={letterIndex}
                    className={clsx(
                      "w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold border-2",
                      guess.matches[letterIndex]
                        ? "border-green-500 text-green-400"
                        : "border-red-500/30 text-red-400/70"
                    )}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameplayPhase;