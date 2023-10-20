import { rooms, games } from '../../data/data';
import type {
    TTTMove,
    TicTacToe,
    TicTacToeCell,
    UpdatedGameState,
    GameWon,
    Coordinates,
} from '../../types/types';
import { swapTurns } from '../utils';

export const getTTTGameState = (roomId: string): TicTacToe =>
    games.ticTacToe.get(roomId) as TicTacToe;

export const processMove = (
    roomId: string,
    move: TTTMove
): {
    newGameState: UpdatedGameState<TicTacToe>;
    gameWon: GameWon<TicTacToe> | false;
    newScore: [number, number] | null;
} => {
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
    let newScore: [number, number] | null = null;
    if (winningMove) {
        newGameState.playerToMove = null;
        const room = rooms.get(roomId);
        if (winningMove === 'draw') {
            gameWon = {
                winner: 'draw',
            };
            game.winner = 'draw';
        } else {
            const winner = swapTurns(game.playerToMove);
            const [hostsPoints, guestsPoints] = room.score;
            room.score =
                winner === 'host'
                    ? [hostsPoints + 1, guestsPoints]
                    : [hostsPoints, guestsPoints + 1];
            newScore = room.score;
            gameWon = {
                winner,
                winningMove,
            };

            game.winner = winner;
            game.winningMove = winningMove;
        }
        game.playerToMove = null;
    }

    return { newGameState, gameWon, newScore };
};

const directions: Coordinates[] = [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
];

const validateBoard = (
    board: TicTacToeCell[][],
    move: TTTMove,
    lengthToWin: number
): Coordinates[] | 'draw' | false => {
    if (!board.flat().includes('')) return 'draw';
    const yLen = board.length;
    const xLen = board[0].length;
    const winningPath: [number, number][] = [];

    for (let y = 0; y < yLen; y++) {
        for (let x = 0; x < xLen; x++) {
            if (board[y][x] !== move.type) continue;
            winningPath.push([y, x]);
            for (const direction of directions) {
                if (dfs(y, x, direction, 1)) return winningPath;
            }
            winningPath.pop();
        }
    }

    function dfs(y: number, x: number, direction: Coordinates, curLen: number) {
        if (y >= yLen || x >= xLen || x < 0 || board[y][x] !== move.type) {
            return false;
        }
        if (curLen === lengthToWin) return true;
        const newY = y + direction[0];
        const newX = x + direction[1];
        winningPath.push([newY, newX]);
        if (dfs(newY, newX, direction, curLen + 1)) return true;
        else {
            winningPath.pop();
            return false;
        }
    }

    return false;
};
