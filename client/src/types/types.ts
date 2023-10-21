import {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import getSocket from '../app/services/getSocket';
import {
    userNameKey,
    userTypeKey,
    lastRoomKey,
    wasInRoomKey,
} from '../data/localStorageKeys';

export type ApiSocket = ReturnType<typeof getSocket>;
export type ApiBuilder = EndpointBuilder<
    BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError,
        object,
        FetchBaseQueryMeta
    >,
    'AllRooms' | 'MyRoom' | 'GameState' | 'OnlineNumber' | 'RejoinStatus',
    'api'
>;

export type LocalStorageSchema = {
    [userNameKey]: string;
    [userTypeKey]: UserType;
    [lastRoomKey]: RejoinRequest;
    [wasInRoomKey]: boolean;
};

export type RejoinRequest = { roomId: string; userType: UserType };

export enum ClientToServer {
    Connection = 'connection',
    RequestingOnlineStatus = 'requestingOnlineStatus',
    AllowRejoin = 'allowRejoin',
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
    RejoinStatusUpdated = 'rejoinStatusUpdated',
    RoomPreviewUpdated = 'roomPreviewUpdated',
    HostJoinedRoom = 'hostJoined',
    GuestJoinedRoom = 'guestJoined',
    RoomGameChanged = 'roomGameChanged',
    GuestIsReady = 'guestIsReady',
    GuestIsNotReady = 'guestIsNotReady',
    GameStarts = 'gameStarts',
    SendingGameState = 'sendingState',
    GameEnds = 'gameEnds',
    HostLeftRoom = 'hostLeft',
    GuestLeftRoom = 'guestLeft',
    RoomDeleted = 'roomDeleted',
}

export enum TTTClientToServer {
    RequestingGameState = 'TTT_requestingState',
    MakingMove = 'TTT_makingMove',
}

export enum TTTServerToClient {
    PlayerMoved = 'TTT_playerMoved',
    GameWon = 'TTT_gameWon',
}

export enum BSClientToServer {
    RequestingGameState = 'BS_requestingState',
    UserIsReady = 'BS_userReady',
    MakingMove = 'BS_makingMove',
}

export enum BSServerToClient {
    PlayersReady = 'BS_playersReady',
    PlayerMoved = 'BS_playerMoved',
    GameWon = 'BS_gameWon',
}

export type UserType = 'host' | 'guest';

export type User = {
    userType: UserType;
    name: string;
};

export type ClientUser = User & {
    id: string;
};

export type RoomPreview = {
    id: string;
    name: string;
    playerCount: number;
    gameType: GameType;
    gameState: GameState;
    waitingForHost: boolean;
};

export type UpdatedRoomPreview = {
    id: string;
    playerCount?: number;
    gameType?: GameType;
    gameState?: GameState;
    waitingForHost?: boolean;
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
    waitingForHost: boolean;
    deleted?: true;
};

export type ClientRoom = {
    name: string;
    players: ClientUser[];
    gameType: GameType;
    readyStatus: boolean;
    gameState: GameState;
    gameId: string | null;
    score: [number, number];
    waitingForHost: boolean;
    deleted?: true;
};

export type GameType = 'choosing' | 'ticTacToe' | 'battleships';
export type GameState = 'in lobby' | 'playing' | 'viewing results';

export type UpdatedGameState<T extends TicTacToe | BattleShips> = {
    newMove: T extends TicTacToe ? TTTMove : BSMoveResult;
    playerToMove: UserType | null;
};

export type BSMoveResult = BattleShipsMove &
    (
        | {
              result: 'miss';
          }
        | { result: 'hit'; name: string }
        | { result: 'destroyed'; name: string; shipCoords: Coordinates[] }
    );

export type GameWon<T extends TicTacToe | BattleShips> = {
    winner: T extends TicTacToe ? UserType | 'draw' : UserType;
    winningMove?: T extends TicTacToe ? Coordinates[] : undefined;
};

export type TicTacToeCell = '' | 'X' | 'O';
export type TicTacToe = {
    playerToMove: UserType | null;
    boardState: TicTacToeCell[][];
    lengthToWin: 4;
    winner?: UserType | 'draw';
    winningMove?: Coordinates[];
};

export type TTTMove = {
    type: 'X' | 'O';
    coordinates: Coordinates;
};

export type Coordinates = [number, number];

export type BattleShips = {
    playerToMove: UserType;
    hostReady: boolean;
    guestReady: boolean;
    hostMisses: Coordinates[];
    guestMisses: Coordinates[];
    hostShips?: AllShips;
    guestShips?: AllShips;
    winner?: UserType;
};

export type ClientBattleShips = {
    playerToMove: UserType;
    hostReady: boolean;
    guestReady: boolean;
    hostMisses: Coordinates[];
    guestMisses: Coordinates[];
    hostShips?: Ship[];
    guestShips?: Ship[];
    winner?: UserType;
};

export type AllShips = [
    {
        name: string;
        state: 'O' | 'X';
        coords: [ShipBlock, ShipBlock, ShipBlock, ShipBlock, ShipBlock];
    },
    {
        name: string;
        state: 'O' | 'X';
        coords: [ShipBlock, ShipBlock, ShipBlock, ShipBlock];
    },
    {
        name: string;
        state: 'O' | 'X';
        coords: [ShipBlock, ShipBlock, ShipBlock];
    },
    {
        name: string;
        state: 'O' | 'X';
        coords: [ShipBlock, ShipBlock, ShipBlock];
    },
    {
        name: string;
        state: 'O' | 'X';
        coords: [ShipBlock, ShipBlock];
    }
];

export type PlayerShips = [
    [ShipBlock, ShipBlock, ShipBlock, ShipBlock, ShipBlock],
    [ShipBlock, ShipBlock, ShipBlock, ShipBlock],
    [ShipBlock, ShipBlock, ShipBlock],
    [ShipBlock, ShipBlock, ShipBlock],
    [ShipBlock, ShipBlock]
];

export type Ship = {
    name: string;
    state: 'O' | 'X';
    coords: ShipBlock[];
};

export type ShipBlock = [number, number, 'O' | 'X'];

export type BattleShipsMove = {
    target: UserType;
    coordinates: Coordinates;
};
