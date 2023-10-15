import { io } from '../../app';
import {
    ClientToServer,
    ServerToClient,
    DefaultRooms,
    UserType,
} from '../../types/types';
import { rooms, playersInGame } from 'src/data/data';
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
} from './roomActions';

export default function subscribeToRoomEvents() {
    io.on(ClientToServer.Connection, (socket) => {
        const getUsersRoom = () =>
            Array.from(socket.rooms).find(
                (room) =>
                    room !== socket.id &&
                    room !== DefaultRooms.lobby &&
                    room !== DefaultRooms.lookingForRoom
            );

        socket.on(ClientToServer.RequestingOnlineStatus, (acknowledgeOnlineStatus) => {
            socket.join(DefaultRooms.lobby);
            acknowledgeOnlineStatus(playersInGame[0]);
        });

        socket.on(ClientToServer.CreatingRoom, (userName, acknowledgeCreating) => {
            const newRoomId = createNewRoom(userName);
            socket.leave(DefaultRooms.lobby);
            acknowledgeCreating(newRoomId);
            io.in(DefaultRooms.lobby).emit(
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
            socket.to(roomId).emit(ServerToClient.HostJoinedRoom, userName);
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
                socket.to(roomId).emit(ServerToClient.GuestJoinedRoom, nameValidated);
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
            const updatedRoomPreview = changeRoomProp(roomId, 'gameType', gameType);
            io.in(roomId).emit(ServerToClient.RoomGameChanged, gameType);
            io.in(DefaultRooms.lookingForRoom).emit(
                ServerToClient.RoomPreviewUpdated,
                updatedRoomPreview
            );
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
            const { userName, updatedRoomPreview } = clearUserFromRoom(socket.id, roomId);
            socket.leave(roomId);
            io.in(DefaultRooms.lobby).emit(ServerToClient.OnlineDecreased);
            io.in(DefaultRooms.lookingForRoom).emit(
                ServerToClient.RoomPreviewUpdated,
                updatedRoomPreview
            );
            if (userType === 'guest') {
                io.in(roomId).emit(ServerToClient.GuestLeftRoom, userName);
            } else {
                io.in(roomId).emit(ServerToClient.HostLeftRoom, userName);
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
