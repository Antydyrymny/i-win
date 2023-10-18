import { UserType, MySocket } from '../../types/types';
import { DefaultRooms } from '../../types/types';

export function createUsersRoomGetter(socket: MySocket) {
    return () =>
        Array.from(socket.rooms).find(
            (room) =>
                room !== socket.id &&
                room !== DefaultRooms.lobby &&
                room !== DefaultRooms.lookingForRoom &&
                !room.startsWith(DefaultRooms.rejoining)
        );
}

export function clearRejoinRooms(socket: MySocket) {
    const roomsToClear: string[] = [];
    Array.from(socket.rooms).forEach((room) => {
        if (room.startsWith(DefaultRooms.rejoining)) roomsToClear.push(room);
    });
    roomsToClear.forEach((room) => socket.leave(room));
}

export const swapTurns = (lastMoveBy: UserType): UserType =>
    lastMoveBy === 'host' ? 'guest' : 'host';
