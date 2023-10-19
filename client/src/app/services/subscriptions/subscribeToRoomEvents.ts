import {
    type ApiSocket,
    type ApiBuilder,
    ClientToServer,
    ServerToClient,
    GameType,
    TTTServerToClient,
    ClientRoom,
} from '../../../types/types';
import { toast } from 'react-toastify';

export function subscribeToRoomEvents(builder: ApiBuilder, socket: ApiSocket) {
    return builder.query<ClientRoom, void>({
        queryFn: () => {
            return new Promise((resolve) => {
                socket.emit(ClientToServer.RequestingRoomData, (roomData: ClientRoom) => {
                    resolve({
                        data: roomData,
                    });
                });
            });
        },
        async onCacheEntryAdded(
            _,
            { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
        ) {
            try {
                await cacheDataLoaded;
                socket.on(ServerToClient.HostLeftRoom, (userId: string) => {
                    updateCachedData((draft) => {
                        return {
                            ...draft,
                            readyStatus: false,
                            waitingForHost: true,
                            players: draft.players.filter((user) => user.id !== userId),
                        };
                    });
                });
                socket.on(ServerToClient.GuestLeftRoom, (userId: string) => {
                    updateCachedData((draft) => {
                        toast.error(
                            `${
                                draft.players.find((user) => user.id === userId)?.name
                            } left!`,
                            {
                                autoClose: 2000,
                                hideProgressBar: true,
                            }
                        );

                        return {
                            ...draft,
                            readyStatus: false,
                            players: draft.players.filter((user) => user.id !== userId),
                        };
                    });
                });
                socket.on(
                    ServerToClient.HostJoinedRoom,
                    (userId: string, name: string) => {
                        updateCachedData((draft) => {
                            toast.success(`⭐${name} rejoined!⭐`, {
                                autoClose: 2000,
                                hideProgressBar: true,
                            });

                            return {
                                ...draft,
                                waitingForHost: false,
                                players: [
                                    ...draft.players,
                                    { id: userId, name, userType: 'host' },
                                ],
                            };
                        });
                    }
                );
                socket.on(
                    ServerToClient.GuestJoinedRoom,
                    (userId: string, name: string) => {
                        updateCachedData((draft) => {
                            toast.success(`⭐${name} joined!⭐`, {
                                autoClose: 2000,
                                hideProgressBar: true,
                            });

                            return {
                                ...draft,
                                players: [
                                    ...draft.players,
                                    { id: userId, name, userType: 'guest' },
                                ],
                            };
                        });
                    }
                );
                socket.on(ServerToClient.RoomGameChanged, (newGameType: GameType) => {
                    updateCachedData((draft) => {
                        return { ...draft, gameType: newGameType };
                    });
                });
                socket.on(ServerToClient.GuestIsReady, () => {
                    updateCachedData((draft) => {
                        return { ...draft, readyStatus: true };
                    });
                });
                socket.on(ServerToClient.GuestIsNotReady, () => {
                    updateCachedData((draft) => {
                        return { ...draft, readyStatus: false, gameState: 'in lobby' };
                    });
                });
                socket.on(ServerToClient.GameStarts, () => {
                    updateCachedData((draft) => {
                        return { ...draft, gameState: 'playing' };
                    });
                });
                socket.on(TTTServerToClient.SendingGameState, () => {
                    updateCachedData((draft) => {
                        return { ...draft, gameState: 'playing' };
                    });
                });

                socket.on(ServerToClient.RoomDeleted, () => {
                    updateCachedData((draft) => {
                        return { ...draft, deleted: true };
                    });
                });
                await cacheEntryRemoved;
                socket.off(ServerToClient.HostLeftRoom);
                socket.off(ServerToClient.HostJoinedRoom);
                socket.off(ServerToClient.GuestLeftRoom);
                socket.off(ServerToClient.GuestJoinedRoom);
                socket.off(ServerToClient.RoomGameChanged);
                socket.off(ServerToClient.GuestIsReady);
                socket.off(ServerToClient.GuestIsNotReady);
                socket.off(ServerToClient.GameStarts);
                socket.off(ServerToClient.RoomDeleted);
                socket.off(TTTServerToClient.SendingGameState);
            } catch {
                // if cacheEntryRemoved resolved before cacheDataLoaded,
                // cacheDataLoaded throws
            }
        },
        providesTags: ['MyRoom'],
    });
}
