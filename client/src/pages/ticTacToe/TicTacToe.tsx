import GameWrapper from '../../components/gameWrapper/GameWrapper';
import {
    useSubscribeToTicTacToeQuery,
    useMakeTTTMoveMutation,
} from '../../app/services/api';
import { getTypedStorageItem } from '../../utils/typesLocalStorage';
import { userTypeKey } from '../../data/localStorageKeys';
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import styles from './ticTacToe.module.scss';

export default function TicTacToe() {
    const { data: gameData, isSuccess: subscribed } = useSubscribeToTicTacToeQuery();
    const [makeAMove, { isLoading }] = useMakeTTTMoveMutation();

    const userType = getTypedStorageItem(userTypeKey) ?? 'guest';

    const getMoveHandler = (y: number, x: number) => () => {
        if (
            gameData?.playerToMove !== userType ||
            gameData?.boardState[y][x] !== '' ||
            isLoading
        )
            return;
        makeAMove({
            coordinates: [y, x],
            type: userType === 'host' ? 'X' : 'O',
        });
    };

    const getHighlightOnWinClass = (y: number, x: number) =>
        subscribed &&
        gameData.winningMove &&
        !!gameData.winningMove.find((move) => move[0] === y && move[1] === x);

    return (
        <GameWrapper>
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
                                                            getHighlightOnWinClass(y, x)
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
        </GameWrapper>
    );
}
