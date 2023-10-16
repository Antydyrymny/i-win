import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

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

export type ClientToServerEvents = {
    [ClientToServer.RequestingOnlineStatus]: (
        acknowledgeOnlineStatus: (playingNow: number) => void
    ) => void;
    [ClientToServer.CreatingRoom]: (
        userName: string,
        acknowledgeCreating: (roomId: string) => void
    ) => void;
    [ClientToServer.RequestingAllRooms]: (
        acknowledgeAllRooms: (rooms: RoomPreview[]) => void
    ) => void;
    [ClientToServer.HostJoiningRoom]: (joinRoomRequest: JoinRoomRequest) => void;
    [ClientToServer.GuestJoiningRoom]: (
        joinRoomRequest: JoinRoomRequest,
        acknowledgeName: (newName: string) => void
    ) => void;
    [ClientToServer.RequestingRoomData]: (
        acknowledgeRoomData: (roomData: Room) => void
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
    [ServerToClient.RoomCreated]: (roomPreview: RoomPreview) => void;
    [ServerToClient.OnlineIncreased]: () => void;
    [ServerToClient.OnlineDecreased]: () => void;
    [ServerToClient.HostJoinedRoom]: (userName: string) => void;
    [ServerToClient.GuestJoinedRoom]: (userName: string) => void;
    [ServerToClient.HostLeftRoom]: (userName: string) => void;
    [ServerToClient.RoomDeleted]: (roomId: string) => void;
    [ServerToClient.GuestLeftRoom]: (userName: string) => void;
    [ServerToClient.RoomPreviewUpdated]: (updatedRoom: UpdatedRoomPreview) => void;
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
}

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
    playerToMove: UserType;
};

export type GameWon<T extends TicTacToe | BattleShips> = {
    winner: UserType;
    newScore: [number, number];
    winningMove?: T extends TicTacToe ? TTTMove : BattleShipsMove;
};

export type TicTacToeCell = '' | 'X' | 'O';
export type TicTacToe = {
    playerToMove: UserType;
    boardState: TicTacToeCell[][];
    lengthToWin: 4;
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
