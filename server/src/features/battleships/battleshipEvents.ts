import { io } from '../../app';
import { createUsersRoomGetter } from '../utils';
import { changeRoomProp, getRoomPreview } from '../rooms/roomDataActions';
import { getBSGameState, processBSMove, setShipData } from './battleshipDataActions';
import {
    MySocket,
    DefaultRooms,
    BSClientToServer,
    BSServerToClient,
    ServerToClient,
} from '../../types/types';

export function subscribeToBatleshipsEvents(socket: MySocket) {
    const getUsersRoom = createUsersRoomGetter(socket);

    socket.on(BSClientToServer.RequestingGameState, (userType, acknowledgeBSState) => {
        const roomId = getUsersRoom();
        acknowledgeBSState(getBSGameState(roomId, userType));
        io.to(socket.id).emit(
            ServerToClient.SendingGameState,
            getRoomPreview(roomId).gameState
        );
    });

    socket.on(BSClientToServer.UserIsReady, (userType, ships) => {
        const roomId = getUsersRoom();
        if (setShipData(roomId, userType, ships)) {
            io.in(roomId).emit(BSServerToClient.PlayersReady);
        }
    });

    socket.on(BSClientToServer.MakingMove, (move) => {
        const roomId = getUsersRoom();
        const moveResult = processBSMove(roomId, move);
        io.in(roomId).emit(BSServerToClient.PlayerMoved, moveResult.newGameState);
        if ('gameWon' in moveResult) {
            io.in(roomId).emit(BSServerToClient.GameWon, moveResult.gameWon);
            const updatedRoomPreview = changeRoomProp(
                roomId,
                'gameState',
                'viewing results'
            );
            io.in(roomId).emit(ServerToClient.GameEnds, moveResult.newScore);
            io.in(DefaultRooms.lookingForRoom).emit(
                ServerToClient.RoomPreviewUpdated,
                updatedRoomPreview
            );
        }
    });
}

export function unsubscribeFromBattleships(socket: MySocket) {
    socket.removeAllListeners(BSClientToServer.RequestingGameState);
    socket.removeAllListeners(BSClientToServer.UserIsReady);
    socket.removeAllListeners(BSClientToServer.MakingMove);
}
