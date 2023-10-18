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
    subsctibeToRejoin,
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
    tagTypes: ['OnlineNumber', 'AllRooms', 'MyRoom', 'GameState', 'RejoinStatus'],
    endpoints: (builder) => ({
        subscribeToOnlineStatus: subscribeToOnlineStatus(builder, socket),
        subscribeToAllRooms: subscribeToAllRooms(builder, socket),
        subscribeToRoomEvents: subscribeToRoomEvents(builder, socket),
        subscribeToTicTacToe: subscribeToTicTacToe(builder, socket),
        subsctibeToRejoin: subsctibeToRejoin(builder, socket),

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
            invalidatesTags: ['AllRooms', 'MyRoom', 'RejoinStatus'],
        }),
        hostJoinRoom: builder.mutation<string, JoinRoomRequest>({
            queryFn: (joinRoomRequest) => {
                return new Promise((resolve) => {
                    socket.emit(
                        ClientToServer.HostJoiningRoom,
                        joinRoomRequest,
                        (validatedName: string) => {
                            resolve({ data: validatedName });
                        }
                    );
                });
            },
            invalidatesTags: ['OnlineNumber', 'AllRooms', 'MyRoom', 'RejoinStatus'],
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
            invalidatesTags: ['OnlineNumber', 'AllRooms', 'MyRoom', 'RejoinStatus'],
        }),
        hostLeave: builder.mutation<void, void>({
            queryFn: () => {
                socket.emit(ClientToServer.HostLeavingRoom);
                return { data: undefined };
            },
            invalidatesTags: ['OnlineNumber', 'AllRooms', 'MyRoom', 'RejoinStatus'],
        }),
        guestLeave: builder.mutation<void, void>({
            queryFn: () => {
                socket.emit(ClientToServer.GuestLeavingRoom);
                return { data: undefined };
            },
            invalidatesTags: ['OnlineNumber', 'AllRooms', 'MyRoom', 'RejoinStatus'],
        }),
        changeGame: builder.mutation<void, GameType>({
            queryFn: (gameType) => {
                socket.emit(ClientToServer.ChangingGame, gameType);
                return { data: undefined };
            },
            invalidatesTags: ['AllRooms', 'MyRoom'],
        }),
        checkReady: builder.mutation<void, void>({
            queryFn: () => {
                socket.emit(ClientToServer.GuestCheksReady);
                return { data: undefined };
            },
            invalidatesTags: ['MyRoom'],
        }),
        uncheckReady: builder.mutation<void, void>({
            queryFn: () => {
                socket.emit(ClientToServer.GuestUnchecksReady);
                return { data: undefined };
            },
            invalidatesTags: ['MyRoom'],
        }),
        startGame: builder.mutation<void, void>({
            queryFn: () => {
                socket.emit(ClientToServer.StartingGame);
                return { data: undefined };
            },
            invalidatesTags: ['AllRooms', 'MyRoom'],
        }),
        makeTTTMove: builder.mutation<void, TTTMove>({
            queryFn: (move) => {
                socket.emit(TTTClientToServer.MakingMove, move);
                return { data: undefined };
            },
            invalidatesTags: ['GameState'],
        }),
    }),
});

export default apiSlice;

export const {
    useSubscribeToOnlineStatusQuery,
    useCreateRoomMutation,
    useSubscribeToAllRoomsQuery,
    useSubsctibeToRejoinQuery,
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
