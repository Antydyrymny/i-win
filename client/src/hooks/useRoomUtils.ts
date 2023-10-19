import { useMemo } from 'react';
import { ClientRoom, UserType } from '../types/types';

export default function useRoomUtils(roomData: ClientRoom, userType: UserType) {
    const playerName = useMemo(
        () => roomData.players.find((user) => user.userType === userType)?.name,
        [roomData.players, userType]
    );
    const opponentName = useMemo(
        () => roomData.players.find((user) => user.userType !== userType)?.name,
        [roomData.players, userType]
    );
    const [playerScore, opponentScore] = useMemo(
        () =>
            userType === 'host' ? roomData.score : [roomData.score[1], roomData.score[0]],
        [roomData.score, userType]
    );

    return {
        playerName,
        opponentName,
        playerScore,
        opponentScore,
    };
}
