import { v4 as uuidv4 } from 'uuid';
import { rooms, playersInGame, games } from '../../data/data';
import type {
    BattleShips,
    ClientRoom,
    GameType,
    Room,
    RoomPreview,
    TicTacToe,
    UpdatedRoomPreview,
    User,
    UserType,
} from '../../types/types';

export const getAllRooms = (): RoomPreview[] =>
    Array.from(rooms.entries()).map(([id, room]) => ({
        id,
        name: room.name,
        playerCount: room.players.size,
        gameType: room.gameType,
        gameState: room.gameState,
        waitingForHost: room.waitingForHost,
    }));

export const getClientRoomData = (roomId: string): ClientRoom => {
    const room = rooms.get(roomId);

    return {
        ...room,
        players: Array.from(room.players.entries()).map((entry) => ({
            id: entry[0],
            ...entry[1],
        })),
    };
};

export const userAlreadyInRoom = (roomId: string, userId: string) =>
    rooms.has(roomId) && rooms.get(roomId).players.has(userId);

export const validateRoom = (roomId: string, userId: string) =>
    rooms.has(roomId) &&
    (userAlreadyInRoom(roomId, userId) || rooms.get(roomId).players.size < 2);

export const allowRejoin = (roomId: string, userType: UserType, userId: string) => {
    if (!validateRoom(roomId, userId)) return false;
    const hasHost = !!Array.from(rooms.get(roomId).players.values()).find(
        (user) => user.userType === 'host'
    );

    return userType === 'guest' ? hasHost : !hasHost;
};

export const getRoomPreview = (roomId: string): RoomPreview => {
    const room = rooms.get(roomId);

    return {
        id: roomId,
        name: room.name,
        playerCount: room.players.size,
        gameType: room.gameType,
        gameState: room.gameState,
        waitingForHost: room.waitingForHost,
    };
};

export const getRoomUsersIds = (roomId: string) =>
    Array.from(rooms.get(roomId).players.keys());

export const validateGuestName = ({ roomId, userName }): string => {
    const room = rooms.get(roomId);
    let validatedName = userName;
    while (
        validatedName === room.name.split(`'s room`)[0] ||
        Array.from(room.players.values())
            .map((player) => player.name)
            .includes(validatedName)
    ) {
        validatedName = userName + '#' + uuidv4().slice(0, 2);
    }
    return validatedName;
};

export const createNewRoom = (userName: string) => {
    const roomId = uuidv4().slice(0, 5);
    rooms.set(roomId, {
        name: userName + `'s room`,
        players: new Map<string, User>(),
        gameType: 'choosing',
        readyStatus: false,
        gameState: 'in lobby',
        gameId: null,
        score: [0, 0],
        waitingForHost: true,
    });

    return roomId;
};

export const populateRoom = ({
    roomId,
    userId,
    userName,
    userType,
}: {
    roomId: string;
    userId: string;
    userName: string;
    userType: UserType;
}): UpdatedRoomPreview => {
    const room = rooms.get(roomId);
    if (!room) createNewRoom(userName);
    room.players.set(userId, { name: userName, userType });
    if (userType === 'host') room.waitingForHost = false;
    playersInGame[0]++;
    return userType === 'host'
        ? getUpdatedRoomPreview(roomId, 'playerCount', 'waitingForHost')
        : getUpdatedRoomPreview(roomId, 'playerCount');
};

type PropToUpdate = keyof Pick<
    Room,
    'gameType' | 'gameState' | 'readyStatus' | 'score' | 'waitingForHost'
>;
type UpdatedPropToBroadcast = Exclude<keyof UpdatedRoomPreview, 'id'>;
export const changeRoomProp = <T extends PropToUpdate>(
    roomId: string,
    propToChange: T,
    value: Room[T]
): T extends UpdatedPropToBroadcast ? UpdatedRoomPreview : null => {
    const room = rooms.get(roomId);
    room[propToChange] = value;
    const updatedPreview =
        propToChange === 'gameType' ||
        propToChange === 'gameState' ||
        propToChange === 'waitingForHost'
            ? getUpdatedRoomPreview(roomId, propToChange)
            : null;

    return updatedPreview as T extends UpdatedPropToBroadcast ? UpdatedRoomPreview : null;
};

export const clearUserFromRoom = (userId: string, roomId: string, userType: UserType) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.players.delete(userId);
    playersInGame[0]--;
    if (userType === 'host') {
        room.waitingForHost = true;
        return getUpdatedRoomPreview(roomId, 'playerCount', 'waitingForHost');
    } else return getUpdatedRoomPreview(roomId, 'playerCount');
};

export const deleteRoomWithNoHost = (roomId: string): boolean => {
    const room = rooms.get(roomId);
    if (!room) return true;
    if (
        !room.players.size ||
        !Array.from(room.players.values())
            .map((player) => player.userType)
            .includes('host')
    ) {
        games[room.gameType]?.delete(room.gameId);
        const usersNumber = room.players.size;
        playersInGame[0] -= usersNumber;
        rooms.delete(roomId);
        return true;
    }
    return false;
};

export const getUserType = (userId: string, roomId: string): UserType | undefined => {
    return rooms.get(roomId)?.players?.get(userId)?.userType;
};

export const createGame = (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room || room.players.size < 2 || room.gameType === 'choosing') return;
    games[room.gameType].set(roomId, gameInitializer[room.gameType]());
    return changeRoomProp(roomId, 'gameState', 'playing');
};

const gameInitializer: Record<
    Exclude<GameType, 'choosing'>,
    () => TicTacToe | BattleShips
> = {
    ticTacToe: (): TicTacToe => ({
        playerToMove: Math.random() > 0.5 ? 'host' : 'guest',
        boardState: Array.from(new Array(10), () => Array.from(new Array(10)).fill('')),
        lengthToWin: 4,
    }),
    battleships: (): BattleShips => ({
        playerToMove: Math.random() > 0.5 ? 'host' : 'guest',
        hostBoard: Array.from(new Array(10), () => Array.from(new Array(10)).fill('')),
        guestBorad: Array.from(new Array(10), () => Array.from(new Array(10)).fill('')),
        hostHealth: 17,
        guestHealth: 17,
    }),
};

const getUpdatedRoomPreview = (
    roomId: string,
    ...updatedParams: UpdatedPropToBroadcast[]
): UpdatedRoomPreview =>
    updatedParams.reduce(
        (acc: UpdatedRoomPreview, param) =>
            param === 'playerCount'
                ? { ...acc, playerCount: rooms.get(roomId).players.size }
                : { ...acc, [param]: rooms.get(roomId)[param] },
        { id: roomId }
    );
