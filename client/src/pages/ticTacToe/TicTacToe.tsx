import { useOutletContext } from 'react-router-dom';
import {
    useSubscribeToTicTacToeQuery,
    useMakeTTTMoveMutation,
} from '../../app/services/api';
import { getTypedStorageItem } from '../../utils/typesLocalStorage';
import { userTypeKey } from '../../data/localStorageKeys';
import useRoomUtils from '../../hooks/useRoomUtils';
import useInformOfHostLeave from '../../hooks/useInformOfHostLeave';
import { ClientRoom } from '../../types/types';
import Vs from '../room/Vs';
import { Container } from 'react-bootstrap';

import styles from './ticTacToe.module.scss';

function TicTacToe() {
    const roomData: ClientRoom = useOutletContext();
    const { data: gameData, isSuccess: subscribed } = useSubscribeToTicTacToeQuery();
    const [makeAMove, { isLoading }] = useMakeTTTMoveMutation();

    const userType = getTypedStorageItem(userTypeKey) ?? 'guest';
    const { playerName, opponentName, playerScore, opponentScore } = useRoomUtils(
        roomData,
        userType
    );
    useInformOfHostLeave(roomData.waitingForHost);

    return (
        <div className={styles.wrapper}>
            {subscribed && <div>{gameData?.playerToMove}</div>}
            <Vs
                playerName={playerName}
                opponentName={opponentName}
                playerScore={playerScore}
                opponentScore={opponentScore}
                showScore={roomData.players.length > 1}
            />
        </div>
    );
}

export default TicTacToe;
