import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const games = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createGame', () => {
    const gameId = uuidv4();
    games.set(gameId, {
      players: [{ id: socket.id, ready: false }],
      words: {},
      guesses: {},
      currentTurn: null,
      started: false
    });
    socket.join(gameId);
    socket.emit('gameCreated', { gameId });
  });

  socket.on('joinGame', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    if (game.players.length >= 2) {
      socket.emit('error', { message: 'Game is full' });
      return;
    }
    game.players.push({ id: socket.id, ready: false });
    socket.join(gameId);
    io.to(gameId).emit('playerJoined', { players: game.players });
  });

  socket.on('setWord', ({ gameId, word }) => {
    const game = games.get(gameId);
    if (!game) return;

    game.words[socket.id] = word;
    game.players = game.players.map(p => 
      p.id === socket.id ? { ...p, ready: true } : p
    );

    if (game.players.every(p => p.ready) && !game.started) {
      game.started = true;
      game.currentTurn = game.players[0].id;
      io.to(gameId).emit('gameStarted', { 
        currentTurn: game.currentTurn 
      });
    } else {
      io.to(gameId).emit('playerReady', { 
        players: game.players 
      });
    }
  });

  socket.on('makeGuess', ({ gameId, guess }) => {
    const game = games.get(gameId);
    if (!game || game.currentTurn !== socket.id) return;

    const opponentId = game.players.find(p => p.id !== socket.id).id;
    const targetWord = game.words[opponentId];

    const matches = Array.from(guess).map((letter, index) => 
      letter === targetWord[index]
    );

    if (!game.guesses[socket.id]) {
      game.guesses[socket.id] = [];
    }
    game.guesses[socket.id].push({ word: guess, matches });

    if (guess === targetWord) {
      io.to(gameId).emit('gameOver', { 
        winner: socket.id,
        word: targetWord
      });
    } else {
      game.currentTurn = opponentId;
      io.to(gameId).emit('turnChanged', {
        currentTurn: game.currentTurn,
        lastGuess: { playerId: socket.id, guess: { word: guess, matches } }
      });
    }
  });

  socket.on('disconnect', () => {
    games.forEach((game, gameId) => {
      if (game.players.some(p => p.id === socket.id)) {
        io.to(gameId).emit('playerLeft');
        games.delete(gameId);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});