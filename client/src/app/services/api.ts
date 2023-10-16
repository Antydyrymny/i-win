import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getSocket from './getSocket';
import {
    ClientToServer,
    JoinRoomRequest,
    GameType,
    TTTClientToServer,
    TTTMove,
} from '../../types/types';
import {
    subscribeToOnlineStatus,
    subscribeToAllRooms,
    subscribeToRoomEvents,
    subscribeToTicTacToe,
} from './subscriptions';

const baseUrl =
    import.meta.env.VITE_ENV === 'DEV'
        ? import.meta.env.VITE_DEV_URL
        : import.meta.env.VITE_SERVER_URL;

const socket = getSocket();

const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl,
    }),
    tagTypes: ['OnlineNumber', 'AllRooms', 'MyRoom', 'GameState'],
    endpoints: (builder) => ({
        subscribeToOnlineStatus: subscribeToOnlineStatus(builder, socket),
        subscribeToAllRooms: subscribeToAllRooms(builder, socket),
        subscribeToRoomEvents: subscribeToRoomEvents(builder, socket),
        subscribeToTicTacToe: subscribeToTicTacToe(builder, socket),

        createRoom: builder.mutation<string, string>({
            queryFn: (userName) => {
                return new Promise((resolve) => {
                    socket.emit(
                        ClientToServer.CreatingRoom,
                        userName,
                        (roomId: string) => {
                            resolve({ data: roomId });
                        }
                    );
                });
            },
            invalidatesTags: ['AllRooms', 'MyRoom'],
        }),
        hostJoinRoom: builder.mutation<void, JoinRoomRequest>({
            queryFn: (joinRoomRequest) => {
                socket.emit(ClientToServer.HostJoiningRoom, joinRoomRequest);
                return { data: undefined };
            },
            invalidatesTags: ['OnlineNumber', 'AllRooms', 'MyRoom'],
        }),
        guestJoinRoom: builder.mutation<string, JoinRoomRequest>({
            queryFn: (joinRoomRequest) => {
                return new Promise((resolve) => {
                    socket.emit(
                        ClientToServer.GuestJoiningRoom,
                        joinRoomRequest,
                        (validatedName: string) => {
                            resolve({ data: validatedName });
                        }
                    );
                });
            },
            invalidatesTags: ['OnlineNumber', 'AllRooms', 'MyRoom'],
        }),
        hostLeave: builder.mutation<void, void>({
            queryFn: () => {
                socket.emit(ClientToServer.HostLeavingRoom);
                return { data: undefined };
            },
        }),
        guestLeave: builder.mutation<void, void>({
            queryFn: () => {
                socket.emit(ClientToServer.GuestLeavingRoom);
                return { data: undefined };
            },
        }),
        changeGame: builder.mutation<void, GameType>({
            queryFn: (gameType) => {
                socket.emit(ClientToServer.ChangingGame, gameType);
                return { data: undefined };
            },
        }),
        checkReady: builder.mutation<void, void>({
            queryFn: () => {
                socket.emit(ClientToServer.GuestCheksReady);
                return { data: undefined };
            },
        }),
        uncheckReady: builder.mutation<void, void>({
            queryFn: () => {
                socket.emit(ClientToServer.GuestUnchecksReady);
                return { data: undefined };
            },
        }),
        startGame: builder.mutation<void, void>({
            queryFn: () => {
                socket.emit(ClientToServer.StartingGame);
                return { data: undefined };
            },
        }),
        makeTTTMove: builder.mutation<void, TTTMove>({
            queryFn: (move) => {
                socket.emit(TTTClientToServer.MakingMove, move);
                return { data: undefined };
            },
        }),
    }),
});

export default apiSlice;

export const {
    useSubscribeToOnlineStatusQuery,
    useCreateRoomMutation,
    useSubscribeToAllRoomsQuery,
    useHostJoinRoomMutation,
    useGuestJoinRoomMutation,
    useSubscribeToRoomEventsQuery,
    useHostLeaveMutation,
    useGuestLeaveMutation,
    useChangeGameMutation,
    useCheckReadyMutation,
    useUncheckReadyMutation,
    useStartGameMutation,
    useSubscribeToTicTacToeQuery,
    useMakeTTTMoveMutation,
} = apiSlice;
