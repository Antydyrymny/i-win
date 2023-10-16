import {
    subscribeToTicTacToeEvents,
    unsubscribeFromTTT,
} from 'src/features/tic-tac-toe/tic-tac-toeEvents';
import type {
    Room,
    TicTacToe,
    BattleShips,
    GameType,
    Subscription,
} from '../types/types';
import {
    subscribeToBatleshipsEvents,
    unsubscribeFromBattleships,
} from 'src/features/battleships/battleshipEvents';

export const rooms = new Map<string, Room>();
export const games: Record<
    Exclude<GameType, 'choosing'>,
    Map<string, TicTacToe | BattleShips>
> = {
    ticTacToe: new Map<string, TicTacToe>(),
    battleships: new Map<string, BattleShips>(),
};
export const playersInGame: [number] = [0];

export const manageGameSubscriptions: Record<GameType, Subscription> = {
    ticTacToe: subscribeToTicTacToeEvents,
    battleships: subscribeToBatleshipsEvents,
    choosing: (socket) => {
        unsubscribeFromTTT(socket);
        unsubscribeFromBattleships(socket);
    },
};
