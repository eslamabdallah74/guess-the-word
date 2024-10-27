export type GamePhase = 'lobby' | 'setup' | 'gameplay';

export type PlayerGuess = {
  word: string;
  matches: boolean[];
};

export type Player = {
  id: string;
  ready: boolean;
};

export type GameState = {
  gameId: string | null;
  players: Player[];
  currentTurn: string | null;
  myGuesses: PlayerGuess[];
  opponentGuesses: PlayerGuess[];
  winner: string | null;
  targetWord: string | null;
};