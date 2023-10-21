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
        acknowledgeTTTState: (gameState: TicTacToe) => void
    ) => void;
    [TTTClientToServer.MakingMove]: (move: TTTMove) => void;
    [BSClientToServer.RequestingGameState]: (
        userType: UserType,
        acknowledgeBSState: (gameState: ClientBattleShips) => void
    ) => void;
    [BSClientToServer.UserIsReady]: ({
        userType,
        ships,
    }: {
        userType: UserType;
        ships: PlayerShips;
    }) => void;
    [BSClientToServer.MakingMove]: (move: BattleShipsMove) => void;
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
    [ServerToClient.GameEnds]: (newScore: [number, number]) => void;
    [ServerToClient.SendingGameState]: (gameState: GameState) => void;
    [TTTServerToClient.PlayerMoved]: (newGameState: UpdatedGameState<TicTacToe>) => void;
    [TTTServerToClient.GameWon]: (gameWon: GameWon<TicTacToe>) => void;
    [BSServerToClient.PlayersReady]: () => void;
    [BSServerToClient.PlayerMoved]: (newGameState: UpdatedGameState<BattleShips>) => void;
    [BSServerToClient.GameWon]: (gameWon: GameWon<BattleShips>) => void;
};

export enum DefaultRooms {
    lobby = 'lobby',
    lookingForRoom = 'lookingForRoom',
    rejoining = 'rejoining',
    hostRejoining = 'rejoiningHost',
    guestRejoining = 'rejoiningGuest',
}

export type MySocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    unknown
>;

export type Subscription = (socket: MySocket) => void;

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
    newMove: T extends TicTacToe ? TTTMove : BSMoveResult;
    playerToMove: UserType | null;
};

export type BSMoveResult = BattleShipsMove &
    (
        | {
              result: 'miss';
          }
        | { result: 'hit' | 'destroyed'; name: string }
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
    playerToMove: UserType | null;
    hostReady: boolean;
    guestReady: boolean;
    hostMisses: Coordinates[];
    guestMisses: Coordinates[];
    hostShips?: AllShips;
    guestShips?: AllShips;
    winner?: UserType;
};

export type ClientBattleShips = {
    playerToMove: UserType | null;
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
