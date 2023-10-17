import { useCallback, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    useChangeGameMutation,
    useCheckReadyMutation,
    useUncheckReadyMutation,
    useStartGameMutation,
} from '../../app/services/api';
import { getTypedStorageItem } from '../../utils/typesLocalStorage';
import { userTypeKey } from '../../data/localStorageKeys';
import { ClientRoom, GameType, UserType } from '../../types/types';
import { Container, Carousel, Stack, Image, Button, Spinner } from 'react-bootstrap';
import Sidebar from './Sidebar';
import ticTacToeImg from '../../assets/ticTacToe.jpg';
import battleshipsImg from '../../assets/battleships.jpg';
import styles from './roomStyles.module.scss';

function Room() {
    const roomData: ClientRoom = useOutletContext();
    const userType: UserType = useMemo(
        () => getTypedStorageItem(userTypeKey) ?? 'guest',
        []
    );
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

    const ReadyButton = () => (
        <Button
            onClick={handleReady}
            disabled={settingReady || settingNotReady}
            variant='warning'
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
        <>
            <Button
                onClick={() => startGame()}
                disabled={!roomData.readyStatus || startingGame}
                variant='warning'
                className={`${styles.btn} ${styles.btnCenter}`}
            >
                Start game
            </Button>
            {!roomData.readyStatus && <p>Waiting for players to get ready</p>}
        </>
    );

    const [show, setShow] = useState(false);
    const [gameToDescribe, setGameToDescribe] =
        useState<Exclude<GameType, 'choosing'>>('ticTacToe');

    const handleClose = useCallback(() => setShow(false), []);
    const getHandleShow = (game: Exclude<GameType, 'choosing'>) => () => {
        setGameToDescribe(game);
        setShow(true);
    };

    return (
        <div className={styles.wrapper}>
            <Stack>
                <div className={styles.main}>
                    <div className={styles.player}>
                        <div className={styles.name}>{playerName}</div>
                        {roomData.players.length > 1 && (
                            <div className={styles.score}>{playerScore}</div>
                        )}
                    </div>
                    <div className={styles.opponent}>
                        {roomData.players.length > 1 && (
                            <div className={styles.score}>{opponentScore}</div>
                        )}
                        <div className={styles.name}>{opponentName}</div>
                    </div>
                </div>
            </Stack>
            <Sidebar
                show={show}
                handleClose={handleClose}
                game={gameToDescribe}
                chooseGame={changeGameHandler}
                allowChange={userType === 'host'}
            />
            <Container className={styles.carouselWrapper}>
                {/* {userType === 'guest' && <ReadyButton />}
                {userType === 'host' && <StartButton />} */}
                <Carousel fade interval={4000} className={styles.carousel}>
                    <Carousel.Item
                        className={styles.carouselItem}
                        interval={roomData.gameType === 'ticTacToe' ? Infinity : 4000}
                    >
                        <Container className='d-flex justify-content-around'>
                            <Image
                                onClick={getHandleShow('ticTacToe')}
                                className={styles.img}
                                src={ticTacToeImg}
                                alt='tic-tac-toe'
                            />
                            <div
                                className={styles.description}
                                onClick={getHandleShow('ticTacToe')}
                            >
                                <h4>Tic-Tac-Toe!</h4>
                                <p>
                                    Enter the arena of strategic supremacy in Tic-Tac-Toe,
                                    where every X and O is a move in the ultimate battle
                                    for all-in-a-row dominance. Plot your cunning
                                    strategy, outwit your opponent, and claim victory in
                                    this timeless clash of wit and tactics!
                                </p>
                            </div>
                        </Container>
                    </Carousel.Item>
                    <Carousel.Item
                        className={styles.carouselItem}
                        interval={roomData.gameType === 'battleships' ? Infinity : 4000}
                    >
                        <Container className='d-flex justify-content-around'>
                            <Image
                                onClick={getHandleShow('battleships')}
                                className={styles.img}
                                src={battleshipsImg}
                                alt='tic-tac-toe'
                            />
                            <div
                                className={styles.description}
                                onClick={getHandleShow('battleships')}
                            >
                                <h4>Battleships!</h4>
                                <p>
                                    Embark on a naval odyssey in Battleships, where the
                                    seas are your battlefield and hidden fleets await
                                    discovery. Deploy your armada, navigate the unknown
                                    waters, and unleash precision strikes to rule the
                                    waves!
                                </p>
                            </div>
                        </Container>
                    </Carousel.Item>
                </Carousel>
            </Container>
        </div>
    );
}

export default Room;
