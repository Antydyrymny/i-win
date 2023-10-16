import { io } from '../../app';
import {
    ClientToServer,
    ServerToClient,
    DefaultRooms,
    UserType,
} from '../../types/types';
import { rooms, playersInGame, manageGameSubscriptions } from '../../data/data';
import { createUsersRoomGetter } from '../utils';
import {
    createNewRoom,
    getRoomPreview,
    getAllRooms,
    populateRoom,
    validateGuestName,
    clearUserFromRoom,
    deleteRoomWithNoHost,
    getUserType,
    changeRoomProp,
    createGame,
} from './roomDataActions';

export default function subscribeToFeatures() {
    io.on(ClientToServer.Connection, (socket) => {
        const getUsersRoom = createUsersRoomGetter(socket);

        socket.on(ClientToServer.RequestingOnlineStatus, (acknowledgeOnlineStatus) => {
            socket.join(DefaultRooms.lobby);
            acknowledgeOnlineStatus(playersInGame[0]);
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

        socket.on(ClientToServer.HostJoiningRoom, ({ roomId, userName }) => {
            socket.join(roomId);
            const updatedRoomPreview = populateRoom({
                roomId,
                userId: socket.id,
                userName,
                userType: 'host',
            });
            manageGameSubscriptions[getRoomPreview(roomId).gameType](socket);

            socket.to(roomId).emit(ServerToClient.HostJoinedRoom, socket.id, userName);
            io.in(DefaultRooms.lobby).emit(ServerToClient.OnlineIncreased);
            io.in(DefaultRooms.lookingForRoom).emit(
                ServerToClient.RoomPreviewUpdated,
                updatedRoomPreview
            );
        });

        socket.on(
            ClientToServer.GuestJoiningRoom,
            ({ roomId, userName }, acknowledgeName) => {
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
            }
        );

        socket.on(ClientToServer.RequestingRoomData, (acknowledgeRoomData) => {
            const roomId = getUsersRoom();
            acknowledgeRoomData(rooms.get(roomId));
        });

        socket.on(ClientToServer.ChangingGame, (gameType) => {
            const roomId = getUsersRoom();
            let updatedRoomPreview = changeRoomProp(roomId, 'gameType', gameType);
            manageGameSubscriptions[gameType](socket);
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
            socket.leave(DefaultRooms.lookingForRoom);
            socket.leave(DefaultRooms.lobby);
            const roomId = getUsersRoom();
            const userType = getUserType(socket.id, roomId);
            if (userType) onLeave(userType, roomId);
        });

        const onLeave = (userType: UserType, roomId: string) => {
            if (!roomId) return;
            const { updatedRoomPreview } = clearUserFromRoom(socket.id, roomId);
            socket.leave(roomId);
            changeRoomProp(roomId, 'readyStatus', false);
            io.in(roomId).emit(ServerToClient.GuestIsNotReady);
            io.in(DefaultRooms.lobby).emit(ServerToClient.OnlineDecreased);
            io.in(DefaultRooms.lookingForRoom).emit(
                ServerToClient.RoomPreviewUpdated,
                updatedRoomPreview
            );
            manageGameSubscriptions['choosing'](socket); // unsubscribes

            if (userType === 'guest') {
                io.in(roomId).emit(ServerToClient.GuestLeftRoom, socket.id);
            } else {
                io.in(roomId).emit(ServerToClient.HostLeftRoom, socket.id);
                setTimeout(() => {
                    if (deleteRoomWithNoHost(roomId)) {
                        io.in(DefaultRooms.lobby).emit(
                            ServerToClient.RoomDeleted,
                            roomId
                        );
                    }
                }, 7000);
            }
        };
    });
}
