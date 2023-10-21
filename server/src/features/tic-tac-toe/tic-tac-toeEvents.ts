import { io } from '../../app';
import { createUsersRoomGetter } from '../utils';
import { changeRoomProp, getRoomPreview } from '../rooms/roomDataActions';
import { getTTTGameState, processTTTMove } from './tic-tac-toeDataActions';
import {
    MySocket,
    DefaultRooms,
    ServerToClient,
    TTTClientToServer,
    TTTServerToClient,
} from '../../types/types';

export function subscribeToTicTacToeEvents(socket: MySocket) {
    const getUsersRoom = createUsersRoomGetter(socket);

    socket.on(TTTClientToServer.RequestingGameState, (acknowledgeTTCState) => {
        const roomId = getUsersRoom();
        acknowledgeTTCState(getTTTGameState(roomId));
        io.to(socket.id).emit(
            ServerToClient.SendingGameState,
            getRoomPreview(roomId).gameState
        );
    });

    socket.on(TTTClientToServer.MakingMove, (move) => {
        const roomId = getUsersRoom();
        const moveResult = processTTTMove(roomId, move);
        io.in(roomId).emit(TTTServerToClient.PlayerMoved, moveResult.newGameState);
        if (moveResult.gameWon) {
            io.in(roomId).emit(TTTServerToClient.GameWon, moveResult.gameWon);
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

export function unsubscribeFromTTT(socket: MySocket) {
    socket.removeAllListeners(TTTClientToServer.RequestingGameState);
    socket.removeAllListeners(TTTClientToServer.MakingMove);
}
