import {
    type ApiSocket,
    type ApiBuilder,
    type Room,
    ClientToServer,
    ServerToClient,
    GameType,
    TTTServerToClient,
    GameWon,
    TicTacToe,
} from '../../../types/types';
import { toast } from 'react-toastify';

export function subscribeToRoomEvents(builder: ApiBuilder, socket: ApiSocket) {
    return builder.query<Room, void>({
        queryFn: () => {
            return new Promise((resolve) => {
                socket.emit(ClientToServer.RequestingRoomData, (roomData: Room) => {
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
                        toast.warn('Host left, lobby will be closed soon...', {
                            autoClose: 7000,
                            hideProgressBar: true,
                            pauseOnHover: false,
                            progress: undefined,
                            theme: 'dark',
                        });
                        draft.players.delete(userId);
                        draft.readyStatus = false;
                        // const guestEntry = Array.from(draft.players.entries()).find(
                        //     (entry) => entry[1].userType === 'guest'
                        // ) as [string, User];
                        // return {
                        //     ...draft,
                        //     players: new Map([guestEntry]),
                        //     readyStatus: false,
                        // };
                    });
                });
                socket.on(ServerToClient.GuestLeftRoom, (userId: string) => {
                    updateCachedData((draft) => {
                        toast.error(`${draft.players.get(userId)} left!`, {
                            autoClose: 2000,
                            hideProgressBar: true,
                        });
                        draft.players.delete(userId);
                        draft.readyStatus = false;
                    });
                });
                socket.on(
                    ServerToClient.HostJoinedRoom,
                    (userId: string, name: string) => {
                        updateCachedData((draft) => {
                            toast.dismiss;
                            toast.success(`⭐${name} rejoined!⭐`, {
                                autoClose: 2000,
                                hideProgressBar: true,
                            });
                            draft.players.set(userId, { name, userType: 'host' });
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
                            draft.players.set(userId, { name, userType: 'guest' });
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
                socket.on(TTTServerToClient.GameWon, (gameWon: GameWon<TicTacToe>) => {
                    updateCachedData((draft) => {
                        return { ...draft, score: gameWon.newScore };
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
                socket.off(TTTServerToClient.GameWon);
            } catch {
                // if cacheEntryRemoved resolved before cacheDataLoaded,
                // cacheDataLoaded throws
            }
        },
        providesTags: ['MyRoom'],
    });
}
