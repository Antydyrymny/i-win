import {
    type ApiSocket,
    type ApiBuilder,
    ClientToServer,
    ServerToClient,
} from '../../../types/types';

export function subscribeToOnlineStatus(builder: ApiBuilder, socket: ApiSocket) {
    return builder.query<number, void>({
        queryFn: () => {
            return new Promise((resolve) => {
                socket.emit(
                    ClientToServer.RequestingOnlineStatus,
                    (currentlyOnline: number) => {
                        resolve({ data: currentlyOnline });
                    }
                );
            });
        },
        async onCacheEntryAdded(
            _,
            { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
        ) {
            try {
                await cacheDataLoaded;
                socket.on(ServerToClient.OnlineIncreased, () => {
                    updateCachedData((draft) => draft + 1);
                });
                socket.on(ServerToClient.OnlineDecreased, () => {
                    updateCachedData((draft) => Math.max(draft - 1, 0));
                });
                await cacheEntryRemoved;
                socket.off(ServerToClient.OnlineIncreased);
                socket.off(ServerToClient.OnlineDecreased);
            } catch {
                // if cacheEntryRemoved resolved before cacheDataLoaded,
                // cacheDataLoaded throws
            }
        },
        providesTags: ['OnlineNumber'],
    });
}
