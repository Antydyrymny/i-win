import { rooms, games } from '../../data/data';
import type {
    TTTMove,
    TicTacToe,
    TicTacToeCell,
    UpdatedGameState,
    GameWon,
} from '../../types/types';
import { swapTurns } from '../utils';

export const getTTTGameState = (roomId: string): TicTacToe =>
    games.ticTacToe.get(roomId) as TicTacToe;

export const processMove = (
    roomId: string,
    move: TTTMove
): { newGameState: UpdatedGameState<TicTacToe>; gameWon: GameWon<TicTacToe> | false } => {
    const game = games.ticTacToe.get(roomId) as TicTacToe;
    const [row, col] = move.coordinates;
    game.boardState[row][col] = move.type;
    game.playerToMove = swapTurns(game.playerToMove);
    const newGameState: UpdatedGameState<TicTacToe> = {
        newMove: move,
        playerToMove: game.playerToMove,
    };
    const winningMove = validateBoard(game.boardState, move, game.lengthToWin);
    let gameWon: GameWon<TicTacToe> | false = false;
    if (winningMove) {
        const winner = swapTurns(game.playerToMove);
        const room = rooms.get(roomId);
        const [hostsPoints, guestsPoints] = room.score;
        room.score =
            winner === 'host'
                ? [hostsPoints + 1, guestsPoints]
                : [hostsPoints, guestsPoints + 1];
        gameWon = {
            winner,
            newScore: room.score,
            winningMove,
        };
    }

    return { newGameState, gameWon };
};

const directions = [
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
];

const validateBoard = (
    board: TicTacToeCell[][],
    move: TTTMove,
    lengthToWin: number
): TTTMove | null => {
    const yLen = board.length;
    const xLen = board[0].length;
    const queue: [number, number, number][] = [[...move.coordinates, 1]];

    while (queue.length) {
        const [y, x, curLen] = queue.shift();
        if (curLen === lengthToWin) return { type: move.type, coordinates: [y, x] };
        directions.forEach((direction) => {
            const newY = y + direction[0];
            const newX = x + direction[1];
            if (
                newY >= 0 &&
                newY < yLen &&
                newX >= 0 &&
                newX < xLen &&
                board[newY][newX] === move.type
            )
                queue.push([newY, newX, curLen + 1]);
        });
    }

    return null;
};
