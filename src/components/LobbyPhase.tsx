import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Users } from 'lucide-react';

interface LobbyPhaseProps {
  socket: Socket;
}

const LobbyPhase: React.FC<LobbyPhaseProps> = ({ socket }) => {
  const [gameId, setGameId] = useState('');

  const createGame = () => {
    socket.emit('createGame');
  };

  const joinGame = () => {
    if (gameId.trim()) {
      socket.emit('joinGame', { gameId: gameId.trim() });
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl">
      <div className="flex justify-center mb-6">
        <Users className="w-16 h-16 text-purple-400" />
      </div>
      
      <div className="space-y-6">
        <button
          onClick={createGame}
          className="w-full py-3 px-6 text-lg font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
        >
          Create New Game
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-300">or</span>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="Enter Game ID"
            className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          
          <button
            onClick={joinGame}
            disabled={!gameId.trim()}
            className="w-full py-3 px-6 text-lg font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyPhase;