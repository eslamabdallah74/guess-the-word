import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Lock } from 'lucide-react';
import { GameState } from '../types';

interface SetupPhaseProps {
  socket: Socket;
  gameState: GameState;
}

const SetupPhase: React.FC<SetupPhaseProps> = ({ socket, gameState }) => {
  const [word, setWord] = useState('');
  const isReady = gameState.players.find(p => p.id === socket.id)?.ready;

  const handleSubmitWord = () => {
    if (word.trim()) {
      socket.emit('setWord', { 
        gameId: gameState.gameId, 
        word: word.trim().toLowerCase() 
      });
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl">
      <h2 className="text-2xl font-semibold mb-6 text-center">Game Setup</h2>
      
      <div className="mb-6">
        <div className="flex justify-between mb-4">
          <span>Players:</span>
          <span>{gameState.players.length}/2</span>
        </div>
        <div className="space-y-2">
          {gameState.players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <span>Player {index + 1}</span>
              <span className={`px-2 py-1 rounded ${
                player.ready 
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {player.ready ? 'Ready' : 'Not Ready'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {!isReady && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-lg mb-2 block">Enter Your Secret Word</span>
            <div className="relative">
              <input
                type="password"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="Enter your word..."
              />
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400/50 w-5 h-5" />
            </div>
          </label>

          <button
            onClick={handleSubmitWord}
            disabled={!word.trim()}
            className="w-full py-3 px-6 text-lg font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            Set Word
          </button>
        </div>
      )}

      {isReady && (
        <div className="text-center text-lg">
          Waiting for other player...
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-400">
        Game ID: {gameState.gameId}
      </div>
    </div>
  );
};

export default SetupPhase;