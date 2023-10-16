import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ClientToServerEvents, ServerToClientEvents, UserType } from '../../types/types';
import { DefaultRooms } from '../../types/types';

export function createUsersRoomGetter(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, unknown>
) {
    return () =>
        Array.from(socket.rooms).find(
            (room) =>
                room !== socket.id &&
                room !== DefaultRooms.lobby &&
                room !== DefaultRooms.lookingForRoom
        );
}

export const swapTurns = (lastMoveBy: UserType): UserType =>
    lastMoveBy === 'host' ? 'guest' : 'host';
