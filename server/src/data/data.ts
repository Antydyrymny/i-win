import type { Room, TicTacToe, BattleShips } from '../types/types';

export const rooms = new Map<string, Room>();
export const games = {
    ticTacToe: new Map<string, TicTacToe>(),
    battleShips: new Map<string, BattleShips>(),
};
export const playersInGame: [number] = [0];
