import { useCallback, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    useChangeGameMutation,
    useCheckReadyMutation,
    useUncheckReadyMutation,
    useStartGameMutation,
} from '../../app/services/api';
import { getTypedStorageItem } from '../../utils/typesLocalStorage';
import { userTypeKey } from '../../data/localStorageKeys';
import useRoomUtils from '../../hooks/useRoomUtils';
import useInformOfHostLeave from '../../hooks/useInformOfHostLeave';
import { ClientRoom, GameType } from '../../types/types';
import { Container, Button, Spinner } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Vs from './Vs';
import GameCarousel from './GameCarousel';
import styles from './roomStyles.module.scss';

function Room() {
    const roomData: ClientRoom = useOutletContext();

    const userType = getTypedStorageItem(userTypeKey) ?? 'guest';
    const { playerName, opponentName, playerScore, opponentScore } = useRoomUtils(
        roomData,
        userType
    );

    const [changeGame, { isLoading: isChanging }] = useChangeGameMutation();
    const [setReady, { isLoading: settingReady }] = useCheckReadyMutation();
    const [setNotReady, { isLoading: settingNotReady }] = useUncheckReadyMutation();
    const [startGame, { isLoading: startingGame }] = useStartGameMutation();

    const handleReady = () => {
        if (roomData.readyStatus) setNotReady();
        else setReady();
    };

    const changeGameHandler = useCallback(
        (game: Exclude<GameType, 'choosing'>) => {
            if (isChanging || startingGame) return;
            changeGame(game);
        },
        [changeGame, isChanging, startingGame]
    );

    const [show, setShow] = useState(false);
    const [gameToDescribe, setGameToDescribe] =
        useState<Exclude<GameType, 'choosing'>>('ticTacToe');

    const handleClose = useCallback(() => setShow(false), []);
    const showTicTacToe = useCallback(() => {
        setGameToDescribe('ticTacToe');
        setShow(true);
    }, []);
    const showBattleships = useCallback(() => {
        setGameToDescribe('battleships');
        setShow(true);
    }, []);

    useInformOfHostLeave(roomData.waitingForHost);

    const ReadyButton = () => (
        <Button
            onClick={handleReady}
            disabled={settingReady || settingNotReady}
            variant='danger'
            className={`${styles.btn} ${styles.btnCenter}`}
        >
            {roomData.readyStatus ? (
                <Spinner as='span' size='sm' role='status' aria-hidden='true' />
            ) : (
                'Ready Up'
            )}
        </Button>
    );

    const StartButton = () => (
        <div className={styles.startBtn}>
            <Button
                onClick={() => startGame()}
                disabled={!roomData.readyStatus || startingGame}
                variant='danger'
                className={`${styles.btn} ${styles.btnCenter}`}
            >
                Start game
            </Button>
            {!roomData.readyStatus && (
                <p className={styles.tooltip}>Waiting for opponent</p>
            )}
        </div>
    );

    return (
        <div className={styles.wrapper}>
            <Vs
                playerName={playerName}
                opponentName={opponentName}
                playerIsHost={userType === 'host'}
                playerScore={playerScore}
                opponentScore={opponentScore}
                showScore={roomData.players.length > 1}
            />
            <Container className={styles.readyButtons}>
                {roomData.gameType !== 'choosing' ? (
                    <>
                        <span className={`${styles.gameTitle}  ${styles.pulse}`}>
                            Playing
                        </span>
                        {userType === 'guest' && <ReadyButton />}
                        {userType === 'host' && <StartButton />}
                        <span className={`${styles.gameTitle} ${styles.pulse}`}>
                            {roomData.gameType === 'ticTacToe'
                                ? 'Tic-Tac-Toe'
                                : 'Battleships'}
                        </span>
                    </>
                ) : (
                    <>
                        <span className={styles.gameTitle}>Choose the Game</span>
                    </>
                )}
            </Container>
            <Sidebar
                show={show}
                handleClose={handleClose}
                game={gameToDescribe}
                chooseGame={changeGameHandler}
                allowChange={userType === 'host'}
                disabled={gameToDescribe === roomData.gameType}
            />
            <GameCarousel
                show={show}
                showTicTacToe={showTicTacToe}
                showBattleships={showBattleships}
            />
        </div>
    );
}

export default Room;
