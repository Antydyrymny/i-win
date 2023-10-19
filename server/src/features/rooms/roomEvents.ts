import { io } from '../../app';
import {
    ClientToServer,
    ServerToClient,
    DefaultRooms,
    UserType,
} from '../../types/types';
import { playersInGame, manageGameSubscriptions, accessDeniedErr } from '../../data/data';
import { createUsersRoomGetter, clearRejoinRooms } from '../utils';
import {
    createNewRoom,
    getRoomPreview,
    validateRoom,
    allowRejoin,
    getAllRooms,
    populateRoom,
    validateGuestName,
    clearUserFromRoom,
    deleteRoomWithNoHost,
    getUserType,
    changeRoomProp,
    createGame,
    getClientRoomData,
    userAlreadyInRoom,
    getRoomUsersIds,
} from './roomDataActions';

export default function subscribeToFeatures() {
    io.on(ClientToServer.Connection, (socket) => {
        const getUsersRoom = createUsersRoomGetter(socket);

        socket.on(ClientToServer.RequestingOnlineStatus, (acknowledgeOnlineStatus) => {
            acknowledgeOnlineStatus(playersInGame[0]);
            socket.join(DefaultRooms.lobby);
        });

        socket.on(ClientToServer.AllowRejoin, (rejoinRequest, acknowledgeRejoin) => {
            acknowledgeRejoin(
                allowRejoin(rejoinRequest.roomId, rejoinRequest.userType, socket.id)
            );
            clearRejoinRooms(socket);
            socket.join(DefaultRooms.rejoining + rejoinRequest.roomId);
            socket.join(
                (rejoinRequest.userType === 'host'
                    ? DefaultRooms.hostRejoining
                    : DefaultRooms.guestRejoining) + rejoinRequest.roomId
            );
        });

        socket.on(ClientToServer.CreatingRoom, (userName, acknowledgeCreating) => {
            const newRoomId = createNewRoom(userName);
            socket.leave(DefaultRooms.lobby);
            acknowledgeCreating(newRoomId);
            io.in(DefaultRooms.lookingForRoom).emit(
                ServerToClient.RoomCreated,
                getRoomPreview(newRoomId)
            );
        });

        socket.on(ClientToServer.RequestingAllRooms, (acknowledgeAllRooms) => {
            socket.leave(DefaultRooms.lobby);
            socket.join(DefaultRooms.lookingForRoom);
            acknowledgeAllRooms(getAllRooms());
        });

        socket.on(
            ClientToServer.HostJoiningRoom,
            ({ roomId, userName }, acknowledgeName) => {
                if (userAlreadyInRoom(roomId, socket.id)) {
                    acknowledgeName(userName);
                    return;
                }
                if (!validateRoom(roomId, socket.id)) {
                    acknowledgeName(accessDeniedErr);
                    return;
                }
                socket.join(roomId);
                const updatedRoomPreview = populateRoom({
                    roomId,
                    userId: socket.id,
                    userName,
                    userType: 'host',
                });
                acknowledgeName(userName);
                manageGameSubscriptions[getRoomPreview(roomId).gameType](socket);

                socket
                    .to(roomId)
                    .emit(ServerToClient.HostJoinedRoom, socket.id, userName);
                io.in(DefaultRooms.lobby).emit(ServerToClient.OnlineIncreased);
                io.in(DefaultRooms.lookingForRoom).emit(
                    ServerToClient.RoomPreviewUpdated,
                    updatedRoomPreview
                );
                handleRejoin(roomId, socket.id);
            }
        );

        socket.on(
            ClientToServer.GuestJoiningRoom,
            ({ roomId, userName }, acknowledgeName) => {
                if (userAlreadyInRoom(roomId, socket.id)) {
                    acknowledgeName(userName);
                    return;
                }
                if (!validateRoom(roomId, socket.id)) {
                    acknowledgeName(accessDeniedErr);
                    return;
                }
                socket.join(roomId);
                const nameValidated = validateGuestName({ roomId, userName });
                const updatedRoomPreview = populateRoom({
                    roomId,
                    userId: socket.id,
                    userName: nameValidated,
                    userType: 'guest',
                });
                acknowledgeName(nameValidated);
                manageGameSubscriptions[getRoomPreview(roomId).gameType](socket);

                socket
                    .to(roomId)
                    .emit(ServerToClient.GuestJoinedRoom, socket.id, nameValidated);
                io.in(DefaultRooms.lobby).emit(ServerToClient.OnlineIncreased);
                io.in(DefaultRooms.lookingForRoom).emit(
                    ServerToClient.RoomPreviewUpdated,
                    updatedRoomPreview
                );
                handleRejoin(roomId, socket.id);
            }
        );

        socket.on(ClientToServer.RequestingRoomData, (acknowledgeRoomData) => {
            const roomId = getUsersRoom();
            socket.leave(DefaultRooms.lobby);
            socket.leave(DefaultRooms.lookingForRoom);
            acknowledgeRoomData(getClientRoomData(roomId));
        });

        socket.on(ClientToServer.ChangingGame, (gameType) => {
            const roomId = getUsersRoom();
            let updatedRoomPreview = changeRoomProp(roomId, 'gameType', gameType);

            getRoomUsersIds(roomId).forEach((userId) => {
                const curSocket = io.sockets.sockets.get(userId);
                manageGameSubscriptions['choosing'](curSocket); // unsubscribes from old game
                manageGameSubscriptions[gameType](curSocket); // subscribes to new
            });

            changeRoomProp(roomId, 'readyStatus', false);

            io.in(roomId).emit(ServerToClient.RoomGameChanged, gameType);
            io.in(roomId).emit(ServerToClient.GuestIsNotReady);
            io.in(DefaultRooms.lookingForRoom).emit(
                ServerToClient.RoomPreviewUpdated,
                updatedRoomPreview
            );

            if (getRoomPreview(roomId).gameState !== 'in lobby') {
                updatedRoomPreview = changeRoomProp(roomId, 'gameState', 'in lobby');
                io.in(DefaultRooms.lookingForRoom).emit(
                    ServerToClient.RoomPreviewUpdated,
                    updatedRoomPreview
                );
            }
        });

        socket.on(ClientToServer.GuestCheksReady, () => {
            const roomId = getUsersRoom();
            socket.to(roomId).emit(ServerToClient.GuestIsReady);
            changeRoomProp(roomId, 'readyStatus', true);
        });

        socket.on(ClientToServer.GuestUnchecksReady, () => {
            const roomId = getUsersRoom();
            socket.to(roomId).emit(ServerToClient.GuestIsNotReady);
            changeRoomProp(roomId, 'readyStatus', false);
        });

        socket.on(ClientToServer.StartingGame, () => {
            const roomId = getUsersRoom();
            const updatedRoomPreview = createGame(roomId);

            io.in(roomId).emit(ServerToClient.GameStarts);
            io.in(DefaultRooms.lookingForRoom).emit(
                ServerToClient.RoomPreviewUpdated,
                updatedRoomPreview
            );
        });

        socket.on(ClientToServer.HostLeavingRoom, () => {
            const roomId = getUsersRoom();
            onLeave('host', roomId);
        });

        socket.on(ClientToServer.GuestLeavingRoom, () => {
            const roomId = getUsersRoom();
            onLeave('guest', roomId);
        });

        socket.on(ClientToServer.Disconnecting, () => {
            socket.leave(DefaultRooms.lobby);
            socket.leave(DefaultRooms.lookingForRoom);
            const roomId = getUsersRoom();
            const userType = getUserType(socket.id, roomId);
            if (userType) onLeave(userType, roomId);
        });

        const handleRejoin = (roomId: string, userId: string) => {
            io.in(DefaultRooms.guestRejoining + roomId).emit(
                ServerToClient.RejoinStatusUpdated,
                allowRejoin(roomId, 'guest', userId)
            );
            io.in(DefaultRooms.hostRejoining + roomId).emit(
                ServerToClient.RejoinStatusUpdated,
                allowRejoin(roomId, 'host', userId)
            );
        };

        const onLeave = (userType: UserType, roomId: string) => {
            if (!roomId) return;

            const updatedRoomPreview = clearUserFromRoom(socket.id, roomId, userType);
            handleRejoin(roomId, socket.id);
            socket.leave(roomId);
            if (updatedRoomPreview) {
                changeRoomProp(roomId, 'readyStatus', false);
                io.in(DefaultRooms.lookingForRoom).emit(
                    ServerToClient.RoomPreviewUpdated,
                    updatedRoomPreview
                );
            }
            io.in(roomId).emit(ServerToClient.GuestIsNotReady);
            io.in(DefaultRooms.lobby).emit(ServerToClient.OnlineDecreased);

            if (userType === 'guest') {
                io.in(roomId).emit(ServerToClient.GuestLeftRoom, socket.id);
            } else {
                io.in(roomId).emit(ServerToClient.HostLeftRoom, socket.id);
                setTimeout(() => {
                    if (deleteRoomWithNoHost(roomId)) {
                        io.in(DefaultRooms.lookingForRoom).emit(
                            ServerToClient.RoomDeleted,
                            roomId
                        );
                        io.in(roomId).emit(ServerToClient.RoomDeleted, roomId);
                        io.in(DefaultRooms.rejoining + roomId).emit(
                            ServerToClient.RejoinStatusUpdated,
                            false
                        );
                    }
                }, 10000);
            }
        };
    });
}
