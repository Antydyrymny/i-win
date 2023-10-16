import {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import getSocket from '../app/services/getSocket';

export type ApiSocket = ReturnType<typeof getSocket>;
export type ApiBuilder = EndpointBuilder<
    BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError,
        object,
        FetchBaseQueryMeta
    >,
    'AllRooms' | 'MyRoom' | 'GameState' | 'OnlineNumber',
    'api'
>;

export enum ClientToServer {
    Connection = 'connection',
    RequestingOnlineStatus = 'requestingOnlineStatus',
    CreatingRoom = 'creatingRoom',
    RequestingAllRooms = 'requestingAllRooms',
    HostJoiningRoom = 'hostJoining',
    GuestJoiningRoom = 'guestJoining',
    RequestingRoomData = 'requestingRoomData',
    ChangingGame = 'changingGame',
    GuestCheksReady = 'guestChecksReady',
    GuestUnchecksReady = 'guestUnchecksReady',
    StartingGame = 'startingGame',
    HostLeavingRoom = 'hostLeaving',
    GuestLeavingRoom = 'guestLeaving',
    Disconnecting = 'disconnecting',
}

export enum ServerToClient {
    RoomCreated = 'roomCreated',
    OnlineIncreased = 'onlineIncreased',
    OnlineDecreased = 'onlineDecreased',
    RoomPreviewUpdated = 'roomPreviewUpdated',
    HostJoinedRoom = 'hostJoined',
    GuestJoinedRoom = 'guestJoined',
    RoomGameChanged = 'roomgGameChanged',
    GuestIsReady = 'guestIsReady',
    GuestIsNotReady = 'guestIsNotReady',
    GameStarts = 'gameStarts',
    HostLeftRoom = 'hostLeft',
    GuestLeftRoom = 'guestLeft',
    RoomDeleted = 'roomDeleted',
}

export enum TTTClientToServer {
    RequestingGameState = 'TTT_RequestringState',
    MakingMove = 'TTT_MakingMove',
}

export enum TTTServerToClient {
    PlayerMoved = 'TTT_PlayerMoved',
    GameWon = 'TTT_gameWon',
}

export enum BSClientToServer {}

export enum BSServerToClient {}

export type UserType = 'host' | 'guest';

export type User = {
    userType: UserType;
    name: string;
};

export type RoomPreview = {
    id: string;
    name: string;
    playerCount: number;
    gameType: GameType;
    gameState: GameState;
};

export type UpdatedRoomPreview = {
    id: string;
    playerCount?: number;
    gameType?: GameType;
    gameState?: GameState;
};

export type JoinRoomRequest = {
    roomId: string;
    userName: string;
};

export type Room = {
    name: string;
    players: Map<string, User>;
    gameType: GameType;
    readyStatus: boolean;
    gameState: GameState;
    gameId: string | null;
    score: [number, number];
};

export type GameType = 'choosing' | 'ticTacToe' | 'battleships';
export type GameState = 'in lobby' | 'playing' | 'viewing results';

export type UpdatedGameState<T extends TicTacToe | BattleShips> = {
    newMove: T extends TicTacToe ? TTTMove : BattleShipsMove;
    playerToMove: UserType | null;
};

export type GameWon<T extends TicTacToe | BattleShips> = {
    winner: UserType | 'draw';
    newScore: [number, number];
    winningMove?: T extends TicTacToe ? TTTMove : BattleShipsMove;
};

export type TicTacToeCell = '' | 'X' | 'O';
export type TicTacToe = {
    playerToMove: UserType | null;
    boardState: TicTacToeCell[][];
    lengthToWin: 4;
    winner?: UserType | 'draw';
    winningMove?: TTTMove;
};

export type TTTMove = {
    type: 'X' | 'O';
    coordinates: [number, number];
};

export type BattleShipsBoardCell = '' | '[]' | 'X' | '*';
export type BattleShipsBoard = BattleShipsBoardCell[][];

export type BattleShips = {
    playerToMove: UserType;
    hostBoard: BattleShipsBoard;
    guestBorad: BattleShipsBoard;
    hostHealth: number; // initial of 17 = 1 of 5-square, 1 of 4, 2 of 3, 1 of 2 ships
    guestHealth: number;
    winner?: UserType;
    winningMove?: BattleShipsMove;
};

export type BattleShipsMove = {
    player: UserType;
    coordinates: [number, number];
};
