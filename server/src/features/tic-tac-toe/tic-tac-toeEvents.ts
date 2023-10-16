import { io } from '../../app';
import { createUsersRoomGetter } from '../utils';
import {
    MySocket,
    DefaultRooms,
    ServerToClient,
    TTTClientToServer,
    TTTServerToClient,
} from '../../types/types';
import { getTTTGameState, processMove } from './tic-tac-toeDataActions';
import { changeRoomProp } from '../rooms/roomDataActions';

export function subscribeToTicTacToeEvents(socket: MySocket) {
    const getUsersRoom = createUsersRoomGetter(socket);

    socket.on(TTTClientToServer.RequestingGameState, (acknowledgeTTCState) => {
        const roomId = getUsersRoom();
        acknowledgeTTCState(getTTTGameState(roomId));
    });

    socket.on(TTTClientToServer.MakingMove, (move) => {
        const roomId = getUsersRoom();
        const moveResult = processMove(roomId, move);
        socket.to(roomId).emit(TTTServerToClient.PlayerMoved, moveResult.newGameState);
        if (moveResult.gameWon) {
            io.in(roomId).emit(TTTServerToClient.GameWon, moveResult.gameWon);
            const updatedRoomPreview = changeRoomProp(
                roomId,
                'gameState',
                'viewing results'
            );
            io.in(DefaultRooms.lookingForRoom).emit(
                ServerToClient.RoomPreviewUpdated,
                updatedRoomPreview
            );
        }
    });
}

export function unsubscribeFromTTT(socket: MySocket) {
    socket.removeAllListeners(TTTClientToServer.RequestingGameState);
    socket.removeAllListeners(TTTClientToServer.MakingMove);
}
