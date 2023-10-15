export enum ClientToServer {
    Connection = 'connection',
    RequestingOnlineStatus = 'requestingOnlineStatus',
    CreatingRoom = 'creatingRoom',
    HostJoiningRoom = 'hostJoining',
    GuestJoiningRoom = 'guestJoining',
    RequestingRoomData = 'requestingRoomData',
    HostLeavingRoom = 'hostLeaving',
    GuestLeavingRoom = 'guestLeaving',
    ChangingGame = 'changingGame',
    GuestPressingReady = 'guestPressingReaady',
    StartingGame = 'startingGame',
    Disconnecting = 'disconnecting',
    IWin = 'iWin',
    PlayingAgain = 'playingAgain',
}

export enum ServerToClient {
    RoomCreated = 'roomCreated',
    OnlineIncreased = 'onlineIncreased',
    OnlineDecreased = 'onlineDecreased',
    HostJoinedRoom = 'hostJoined',
    GuestJoinedRoom = 'guestJoined',
    HostLeftRoom = 'hostLeft',
    GuestLeftRoom = 'guestLeft',
    RoomPreviewUpdated = 'roomPreviewUpdated',
    RoomGameChanged = 'roomgGameChanged',
    GuestIsReady = 'guestIsReady',
    GameStarts = 'gameStarts',
    YouLost = 'youLost',
}

export enum TTTClientToServer {
    RequestingGameState = 'TTC_RequestringState',
    MakingMove = 'TTC_MakingMove',
}

export enum TTCServerToClient {
    PlayerMoved = 'TTC_PlayerMoved',
}

export type ClientToServerEvents = {
    [ClientToServer.RequestingOnlineStatus]: (
        acknowledgeOnlineStatus: (playingNow: number) => void
    ) => void;
    [ClientToServer.CreatingRoom]: (
        userName: string,
        acknowledgeCreating: (roomId: string) => void
    ) => void;
    [ClientToServer.HostJoiningRoom]: (
        JoinRoomRequest: JoinRoomRequest,
        acknowledgeName: (newName: string) => void
    ) => void;
    [ClientToServer.GuestJoiningRoom]: (
        JoinRoomRequest: JoinRoomRequest,
        acknowledgeName: (newName: string) => void
    ) => void;
    [ClientToServer.RequestingRoomData]: (
        acknowledgeRoomData: (roomData: Room) => void
    ) => void;
    [ClientToServer.HostLeavingRoom]: () => void;
    [ClientToServer.GuestLeavingRoom]: () => void;
    [ClientToServer.ChangingGame]: (gameType: GameType) => void;
    [ClientToServer.GuestPressingReady]: () => void;
    [ClientToServer.StartingGame]: () => void;
    [ClientToServer.IWin]: (acknowledgeScore: (score: [number, number]) => void) => void;
    [ClientToServer.PlayingAgain]: () => void;
    [TTTClientToServer.RequestingGameState]: (
        acknowledgeTTCState: (gameState: TicTacToe) => void
    ) => void;
    [TTTClientToServer.MakingMove]: () => void;
};

export type ServerToClientEvents = {
    [ServerToClient.RoomCreated]: (roomPreview: RoomPreview) => void;
    [ServerToClient.OnlineIncreased]: () => void;
    [ServerToClient.OnlineDecreased]: () => void;
    [ServerToClient.HostJoinedRoom]: (userName: string) => void;
    [ServerToClient.GuestJoinedRoom]: (userName: string) => void;
    [ServerToClient.HostLeftRoom]: (userName: string) => void;
    [ServerToClient.GuestLeftRoom]: (userName: string) => void;
    [ServerToClient.RoomPreviewUpdated]: (updatedRoom: UpdatedRoomPreview) => void;
    [ServerToClient.RoomGameChanged]: (newGameType: GameType) => void;
    [ServerToClient.GuestIsReady]: () => void;
    [ServerToClient.GameStarts]: () => void;
    [ServerToClient.YouLost]: (newScore: [number, number]) => void;
};

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
    playingStatus: boolean;
};

export type UpdatedRoomPreview = {
    id: string;
    playerCount?: number;
    gameType?: GameType;
    playingStatus?: boolean;
};

export type JoinRoomRequest = {
    roomId: string;
    userName: string;
};

export type Room = {
    name: string;
    players: { host: User | null; guest: User | null };
    gameType: GameType;
    readyStatus: boolean;
    playStatus: boolean;
    gameId: string | null;
    score: [number, number];
};

export type GameType = 'choosing' | 'tic-tac-toe' | 'battleships';
export type GameState = 'in lobby' | 'playing' | 'viewing results';

export type TicTacToe = {
    boardState: ['' | 'X' | 'O'][];
    playerToMove: string;
};

export type TTCMove = {
    type: 'X' | 'O';
    coordinates: [number, number];
};
