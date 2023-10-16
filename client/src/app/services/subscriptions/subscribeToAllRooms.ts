import {
    type ApiSocket,
    type ApiBuilder,
    ClientToServer,
    ServerToClient,
    RoomPreview,
    UpdatedRoomPreview,
} from '../../../types/types';
import { toast } from 'react-toastify';

export function subscribeToAllRooms(builder: ApiBuilder, socket: ApiSocket) {
    return builder.query<RoomPreview[], void>({
        queryFn: () => {
            return new Promise((resolve) => {
                socket.emit(ClientToServer.RequestingAllRooms, (rooms: RoomPreview[]) => {
                    resolve({ data: rooms });
                });
            });
        },
        async onCacheEntryAdded(
            _,
            { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
        ) {
            try {
                await cacheDataLoaded;
                socket.on(ServerToClient.RoomCreated, (room: RoomPreview) => {
                    updateCachedData((draft) => {
                        toast.info(`New room created: ${room.name}`, {
                            autoClose: 2000,
                            hideProgressBar: true,
                        });
                        return [...draft, room];
                    });
                });
                socket.on(ServerToClient.RoomDeleted, (roomId: string) => {
                    updateCachedData((draft) => {
                        return draft.filter((room) => room.id !== roomId);
                    });
                });
                socket.on(
                    ServerToClient.RoomPreviewUpdated,
                    (updatedRoom: UpdatedRoomPreview) => {
                        updateCachedData((draft) => {
                            return draft.map((room) =>
                                room.id === updatedRoom.id
                                    ? Object.getOwnPropertyNames(updatedRoom).reduce(
                                          (acc, prop) => ({ ...acc, prop }),
                                          room
                                      )
                                    : room
                            );
                        });
                    }
                );
                await cacheEntryRemoved;
                socket.off(ServerToClient.RoomCreated);
                socket.off(ServerToClient.RoomDeleted);
                socket.off(ServerToClient.RoomPreviewUpdated);
            } catch {
                // if cacheEntryRemoved resolved before cacheDataLoaded,
                // cacheDataLoaded throws
            }
        },
        providesTags: ['AllRooms'],
    });
}
