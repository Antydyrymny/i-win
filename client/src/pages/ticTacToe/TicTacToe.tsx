import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    useSubscribeToTicTacToeQuery,
    useMakeTTTMoveMutation,
    useChangeGameMutation,
    useStartGameMutation,
} from '../../app/services/api';
import { getTypedStorageItem } from '../../utils/typesLocalStorage';
import { userTypeKey } from '../../data/localStorageKeys';
import useRoomUtils from '../../hooks/useRoomUtils';
import useInformOfHostLeave from '../../hooks/useInformOfHostLeave';
import { ClientRoom } from '../../types/types';
import Vs from '../room/Vs';
import { Card, CardBody, Col, Container, Row, Modal, Button } from 'react-bootstrap';

import styles from './ticTacToe.module.scss';

function TicTacToe() {
    const roomData: ClientRoom = useOutletContext();
    const { data: gameData, isSuccess: subscribed } = useSubscribeToTicTacToeQuery();
    const [makeAMove, { isLoading }] = useMakeTTTMoveMutation();

    const [changeGame, { isLoading: isChanging }] = useChangeGameMutation();
    const [startGame, { isLoading: startingGame }] = useStartGameMutation();

    const userType = getTypedStorageItem(userTypeKey) ?? 'guest';
    const { playerName, opponentName, playerScore, opponentScore } = useRoomUtils(
        roomData,
        userType
    );
    useInformOfHostLeave(roomData.waitingForHost);

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    useEffect(() => {
        if (!gameData || !gameData.winner) return;

        setTimeout(() => setShow(true), 2500);
    }, [gameData]);
    useEffect(() => {
        if (roomData.gameState === 'playing') setShow(false);
    }, [roomData.gameState]);

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

    const handleChooseAnotherGame = () => {
        changeGame('choosing');
    };

    const handleStart = () => startGame();

    const getConditionalClass = (y: number, x: number) =>
        subscribed &&
        gameData.winningMove &&
        !!gameData.winningMove.find((move) => move[0] === y && move[1] === x);

    return (
        <div className={styles.wrapper}>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop={userType === 'host' ? 'static' : undefined}
                keyboard={false}
                aria-labelledby='contained-modal-title-vcenter'
                centered
                contentClassName={styles.modalWrapper}
            >
                <Modal.Header className={`${styles.modal} ${styles.modalHeader}`}>
                    <Modal.Title className={`${styles.title} ${styles.modalTitle} `}>
                        Game ended
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={`${styles.modal} ${styles.modalBody}`}>
                    {userType === 'guest' ? (
                        'Waiting for host...'
                    ) : (
                        <>
                            <Button
                                onClick={handleChooseAnotherGame}
                                disabled={isChanging || startingGame}
                                className={styles.btn}
                            >
                                To Lobby
                            </Button>
                            <Button
                                onClick={handleStart}
                                className={`${styles.btn} ${styles.btnBlack}`}
                            >
                                Again!
                            </Button>
                        </>
                    )}
                </Modal.Body>
            </Modal>
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
                    {gameData.winner ? (
                        <>
                            {gameData.winner === 'draw'
                                ? 'Game ends in a Draw'
                                : gameData.winner === userType
                                ? 'Congratulations, you Win!'
                                : 'You lose!'}
                        </>
                    ) : (
                        <>
                            {gameData.playerToMove === userType
                                ? 'Your Move'
                                : 'Opponents move'}
                        </>
                    )}
                </Container>
            )}
            {subscribed && (
                <Container>
                    <Row className='justify-content-md-center'>
                        <Col xl='5' lg='6' md='9' sm='12'>
                            <Card data-bs-theme='dark' className={styles.card}>
                                <CardBody className={`${styles.grid}`}>
                                    {gameData.boardState.map((row, y) =>
                                        row.map((col, x) => (
                                            <div
                                                key={`y:${y}/x:${x}`}
                                                onClick={getMoveHandler(y, x)}
                                                className={styles.cell}
                                            >
                                                <div
                                                    className={`
                                                        ${
                                                            getConditionalClass(y, x)
                                                                ? styles.pulse
                                                                : ''
                                                        } ${
                                                        gameData.winner === userType
                                                            ? styles.won
                                                            : styles.lost
                                                    }
                                                    `}
                                                >
                                                    {col}
                                                </div>
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
