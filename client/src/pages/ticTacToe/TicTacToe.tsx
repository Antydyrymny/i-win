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
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap';

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

    const getMoveHandler = (y: number, x: number) => () => {
        if (
            gameData?.playerToMove !== userType ||
            gameData.boardState[y][x] !== '' ||
            isLoading
        )
            return;
        makeAMove({
            coordinates: [y, x],
            type: userType === 'host' ? 'X' : 'O',
        });
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.vs}>
                <Vs
                    playerName={playerName}
                    opponentName={opponentName}
                    playerIsHost={userType === 'host'}
                    playerScore={playerScore}
                    opponentScore={opponentScore}
                    showScore={roomData.players.length > 1}
                    showVs={false}
                />
            </div>
            {subscribed && (
                <Container className={styles.title}>
                    {gameData.playerToMove === userType ? 'Your Move' : 'Opponents move'}
                </Container>
            )}
            {subscribed && (
                <Container>
                    <Row className='justify-content-md-center'>
                        <Col lg='5'>
                            <Card data-bs-theme='dark' className={styles.card}>
                                <CardBody className={`${styles.grid} ${styles.shake}`}>
                                    {gameData.boardState.map((row, y) =>
                                        row.map((col, x) => (
                                            <div
                                                key={`y:${y}/x:${x}`}
                                                onClick={getMoveHandler(y, x)}
                                                className={styles.cell}
                                            >
                                                <div>{col}</div>
                                            </div>
                                        ))
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            )}
        </div>
    );
}

export default TicTacToe;
