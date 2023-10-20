import {
    type ApiSocket,
    type ApiBuilder,
    ClientToServer,
    ServerToClient,
    RoomPreview,
    UpdatedRoomPreview,
} from '../../../types/types';

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
                                          (acc, prop) => ({
                                              ...acc,
                                              [prop]: updatedRoom[
                                                  prop as keyof UpdatedRoomPreview
                                              ],
                                          }),
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
