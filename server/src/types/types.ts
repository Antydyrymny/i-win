import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

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

export type ClientToServerEvents = {
    [ClientToServer.RequestingOnlineStatus]: (
        acknowledgeOnlineStatus: (playingNow: number) => void
    ) => void;
    [ClientToServer.AllowRejoin]: (
        rejoinRequest: RejoinRequest,
        acknowledgeRejoin: (allow: boolean) => void
    ) => void;
    [ClientToServer.CreatingRoom]: (
        userName: string,
        acknowledgeCreating: (roomId: string) => void
    ) => void;
    [ClientToServer.RequestingAllRooms]: (
        acknowledgeAllRooms: (rooms: RoomPreview[]) => void
    ) => void;
    [ClientToServer.HostJoiningRoom]: (
        joinRoomRequest: JoinRoomRequest,
        acknowledgeName: (newName: string) => void
    ) => void;
    [ClientToServer.GuestJoiningRoom]: (
        joinRoomRequest: JoinRoomRequest,
        acknowledgeName: (newName: string) => void
    ) => void;
    [ClientToServer.RequestingRoomData]: (
        acknowledgeRoomData: (roomData: ClientRoom) => void
    ) => void;
    [ClientToServer.HostLeavingRoom]: () => void;
    [ClientToServer.GuestLeavingRoom]: () => void;
    [ClientToServer.ChangingGame]: (gameType: GameType) => void;
    [ClientToServer.GuestCheksReady]: () => void;
    [ClientToServer.GuestUnchecksReady]: () => void;
    [ClientToServer.StartingGame]: () => void;
    [TTTClientToServer.RequestingGameState]: (
        acknowledgeTTCState: (gameState: TicTacToe) => void
    ) => void;
    [TTTClientToServer.MakingMove]: (move: TTTMove) => void;
};

export type ServerToClientEvents = {
    [ServerToClient.OnlineIncreased]: () => void;
    [ServerToClient.OnlineDecreased]: () => void;
    [ServerToClient.RejoinStatusUpdated]: (allow: boolean) => void;
    [ServerToClient.RoomCreated]: (roomPreview: RoomPreview) => void;
    [ServerToClient.RoomDeleted]: (roomId: string) => void;
    [ServerToClient.RoomPreviewUpdated]: (updatedRoom: UpdatedRoomPreview) => void;
    [ServerToClient.HostJoinedRoom]: (userId: string, userName: string) => void;
    [ServerToClient.GuestJoinedRoom]: (userId: string, userName: string) => void;
    [ServerToClient.HostLeftRoom]: (userId: string) => void;
    [ServerToClient.GuestLeftRoom]: (userId: string) => void;
    [ServerToClient.RoomGameChanged]: (newGameType: GameType) => void;
    [ServerToClient.GuestIsReady]: () => void;
    [ServerToClient.GuestIsNotReady]: () => void;
    [ServerToClient.GameStarts]: () => void;
    [TTTServerToClient.PlayerMoved]: (newGameState: UpdatedGameState<TicTacToe>) => void;
    [TTTServerToClient.GameWon]: (gameWon: GameWon<TicTacToe>) => void;
};

export enum DefaultRooms {
    lobby = 'lobby',
    lookingForRoom = 'lookingForRoom',
    rejoining = 'rejoining',
    hostRejoining = 'rejoiningHost',
    guestRejoining = 'rejoiningGuest',
}

export type UserType = 'host' | 'guest';

export type RejoinRequest = { roomId: string; userType: UserType };

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

export type MySocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    unknown
>;

export type Subscription = (socket: MySocket) => void;
