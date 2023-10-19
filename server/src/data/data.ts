import {
    subscribeToTicTacToeEvents,
    unsubscribeFromTTT,
} from '../features/tic-tac-toe/tic-tac-toeEvents';
import {
    subscribeToBatleshipsEvents,
    // unsubscribeFromBattleships,
} from '../features/battleships/battleshipEvents';
import type {
    Room,
    TicTacToe,
    BattleShips,
    GameType,
    Subscription,
} from '../types/types';

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
        // unsubscribeFromBattleships(socket);
    },
};

export const accessDeniedErr = '_access_denied';
