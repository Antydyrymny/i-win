import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useChangeGameMutation, useStartGameMutation } from '../../app/services/api';
import { getTypedStorageItem } from '../../utils/typesLocalStorage';
import { userTypeKey } from '../../data/localStorageKeys';
import useRoomUtils from '../../hooks/useRoomUtils';
import useInformOfHostLeave from '../../hooks/useInformOfHostLeave';
import Vs from '../../pages/room/Vs';
import { Modal, Button } from 'react-bootstrap';
import { ClientRoom } from '../../types/types';
import styles from './gameWrapper.module.scss';

type GameWrapperProps = {
    children: React.ReactNode;
};

export default function GameWrapper({ children }: GameWrapperProps) {
    const roomData: ClientRoom = useOutletContext();
    const [showVictoryState, setShowVictoryState] = useState(false);
    const handleClose = () => setShowVictoryState(false);
    useEffect(() => {
        if (roomData.gameState === 'playing') setShowVictoryState(false);
        if (roomData.gameState === 'viewing results')
            setTimeout(() => setShowVictoryState(true), 2500);
    }, [roomData.gameState]);

    const userType = getTypedStorageItem(userTypeKey) ?? 'guest';
    const { playerName, opponentName, playerScore, opponentScore } = useRoomUtils(
        roomData,
        userType
    );
    useInformOfHostLeave(roomData.waitingForHost);

    const [changeGame, { isLoading: isChanging }] = useChangeGameMutation();
    const [startGame, { isLoading: startingGame }] = useStartGameMutation();
    const handleChooseAnotherGame = () => {
        changeGame('choosing');
    };
    const handleStart = () => startGame();

    return (
        <div className={styles.wrapper}>
            <Modal
                show={showVictoryState}
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
            {children}
        </div>
    );
}
