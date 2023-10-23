import { rooms, games } from '../../data/data';
import { getOppositeUserType } from '../utils';
import {
    BattleShips,
    BattleShipsMove,
    ClientBattleShips,
    GameWon,
    PlayerShips,
    Ship,
    ShipBlock,
    UpdatedGameState,
    UserType,
} from '../../types/types';
import { v4 as uuidv4 } from 'uuid';

export const getBSGameState = (roomId: string, userType: UserType): ClientBattleShips => {
    const game = games.battleships.get(roomId) as BattleShips;
    const oppositeUser = getOppositeUserType(userType);
    if (!(oppositeUser + 'Ships' in game)) return game;
    return {
        ...game,
        [oppositeUser + 'Ships']: game[oppositeUser + 'Ships'].reduce(
            (acc: Ship[], ship: Ship) => {
                if (ship.state === 'X') {
                    acc.push(ship);
                } else {
                    acc.push({
                        ...ship,
                        coords: ship.coords.filter((coord) => coord[2] === 'X'),
                    });
                }
                return acc;
            },
            []
        ),
    };
};

export const setShipData = (
    roomId: string,
    userType: UserType,
    ships: PlayerShips
): boolean => {
    const game = games.battleships.get(roomId) as BattleShips;
    game[userType + 'Ships'] = ships.map((playerShip) => ({
        name: uuidv4().slice(6),
        state: 'O',
        coords: playerShip.map((coord) => [...coord, 'O']),
    }));
    game[userType + 'Ready'] = true;
    if (game[getOppositeUserType(userType) + 'Ready']) return true;
    else return false;
};

export const processBSMove = (
    roomId: string,
    move: BattleShipsMove
): {
    newGameState: UpdatedGameState<BattleShips>;
    gameWon?: GameWon<BattleShips> | undefined;
    newScore?: [number, number] | undefined;
} => {
    const game = games.battleships.get(roomId) as BattleShips;
    game.playerToMove = move.target;

    const damagedShipInd: number = game[move.target + 'Ships'].findIndex((ship: Ship) => {
        const hitInd = ship.coords.findIndex(
            (coord) =>
                coord[0] === move.coordinates[0] && coord[1] === move.coordinates[1]
        );
        if (hitInd !== -1) {
            ship.coords[hitInd][2] = 'X';
            return true;
        }
        return false;
    });
    if (damagedShipInd === -1) {
        game[move.target + 'Misses'].push(move.coordinates);
        return {
            newGameState: {
                playerToMove: game.playerToMove,
                newMove: { ...move, result: 'miss' },
            },
        };
    }

    const shipDestroyed: boolean = game[move.target + 'Ships'][
        damagedShipInd
    ].coords.every((shipBlock: ShipBlock) => shipBlock[2] === 'X');
    if (!shipDestroyed) {
        return {
            newGameState: {
                playerToMove: game.playerToMove,
                newMove: {
                    ...move,
                    result: 'hit',
                    name: game[move.target + 'Ships'][damagedShipInd].name,
                },
            },
        };
    }

    game[move.target + 'Ships'][damagedShipInd].state = 'X';
    const gameOver: boolean = game[move.target + 'Ships'].every(
        (ship: Ship) => ship.state === 'X'
    );

    if (!gameOver) {
        return {
            newGameState: {
                playerToMove: game.playerToMove,
                newMove: {
                    ...move,
                    result: 'destroyed',
                    name: game[move.target + 'Ships'][damagedShipInd].name,
                },
            },
        };
    }

    const winner = getOppositeUserType(move.target);
    game.winner = winner;
    game.playerToMove = null;
    const room = rooms.get(roomId);
    const [hostsPoints, guestsPoints] = room.score;
    room.score =
        winner === 'host'
            ? [hostsPoints + 1, guestsPoints]
            : [hostsPoints, guestsPoints + 1];
    return {
        newGameState: {
            playerToMove: null,
            newMove: {
                ...move,
                result: 'destroyed',
                name: game[move.target + 'Ships'][damagedShipInd].name,
            },
        },
        gameWon: {
            winner,
        },
        newScore: room.score,
    };
};
