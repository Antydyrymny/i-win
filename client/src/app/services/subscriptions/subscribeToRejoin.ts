import {
    type ApiSocket,
    type ApiBuilder,
    ClientToServer,
    ServerToClient,
    RejoinRequest,
} from '../../../types/types';

export function subsctibeToRejoin(builder: ApiBuilder, socket: ApiSocket) {
    return builder.query<boolean, RejoinRequest>({
        queryFn: (rejoinRequest) => {
            return new Promise((resolve) => {
                socket.emit(
                    ClientToServer.AllowRejoin,
                    rejoinRequest,
                    (allow: boolean) => {
                        resolve({ data: allow });
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
                socket.on(ServerToClient.RejoinStatusUpdated, (newStatus: boolean) => {
                    updateCachedData(() => newStatus);
                });
                await cacheEntryRemoved;
                socket.off(ServerToClient.RejoinStatusUpdated);
            } catch {
                // if cacheEntryRemoved resolved before cacheDataLoaded,
                // cacheDataLoaded throws
            }
        },
        providesTags: ['RejoinStatus'],
    });
}
