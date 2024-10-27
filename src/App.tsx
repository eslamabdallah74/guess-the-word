import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GamePhase, GameState } from './types';
import LobbyPhase from './components/LobbyPhase';
import SetupPhase from './components/SetupPhase';
import GameplayPhase from './components/GameplayPhase';
import { Brain, Swords } from 'lucide-react';

const socket = io('http://localhost:3000');

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby');
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    players: [],
    currentTurn: null,
    myGuesses: [],
    opponentGuesses: [],
    winner: null,
    targetWord: null,
  });

  useEffect(() => {
    socket.on('gameCreated', ({ gameId }) => {
      setGameState(prev => ({ ...prev, gameId }));
      setGamePhase('setup');
    });

    socket.on('playerJoined', ({ players }) => {
      setGameState(prev => ({ ...prev, players }));
      setGamePhase('setup');
    });

    socket.on('playerReady', ({ players }) => {
      setGameState(prev => ({ ...prev, players }));
    });

    socket.on('gameStarted', ({ currentTurn }) => {
      setGameState(prev => ({ ...prev, currentTurn }));
      setGamePhase('gameplay');
    });

    socket.on('turnChanged', ({ currentTurn, lastGuess }) => {
      setGameState(prev => ({
        ...prev,
        currentTurn,
        ...(lastGuess.playerId === socket.id
          ? { myGuesses: [...prev.myGuesses, lastGuess.guess] }
          : { opponentGuesses: [...prev.opponentGuesses, lastGuess.guess] })
      }));
    });

    socket.on('gameOver', ({ winner, word }) => {
      setGameState(prev => ({ ...prev, winner, targetWord: word }));
    });

    socket.on('playerLeft', () => {
      alert('Your opponent has left the game');
      window.location.reload();
    });

    socket.on('error', ({ message }) => {
      alert(message);
    });

    return () => {
      socket.off('gameCreated');
      socket.off('playerJoined');
      socket.off('playerReady');
      socket.off('gameStarted');
      socket.off('turnChanged');
      socket.off('gameOver');
      socket.off('playerLeft');
      socket.off('error');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Brain className="w-12 h-12 text-pink-400" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
              Word Duel
            </h1>
            <Swords className="w-12 h-12 text-purple-400" />
          </div>
          <p className="text-lg text-gray-300">A multiplayer word guessing battle</p>
        </header>

        <main className="max-w-2xl mx-auto">
          {gamePhase === 'lobby' && (
            <LobbyPhase
              socket={socket}
            />
          )}
          {gamePhase === 'setup' && (
            <SetupPhase
              socket={socket}
              gameState={gameState}
            />
          )}
          {gamePhase === 'gameplay' && (
            <GameplayPhase
              socket={socket}
              gameState={gameState}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;