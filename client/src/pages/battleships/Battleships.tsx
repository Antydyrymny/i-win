import { useState, useEffect, useRef, useCallback } from 'react';
import GameWrapper from '../../components/gameWrapper/GameWrapper';
import { useOutletContext } from 'react-router-dom';
import {
    useSubscribeToBattleShipsQuery,
    useSetBSReadyMutation,
    useMakeBSMoveMutation,
} from '../../app/services/api';
import { getTypedStorageItem } from '../../utils/typesLocalStorage';
import { userTypeKey } from '../../data/localStorageKeys';
import { ClientBattleShips, ClientRoom, Coordinates, UserType } from '../../types/types';
import { getOppositeUserType } from '../../utils/getOppositeUserType';
import { Card, CardBody, Col, Container, Row } from 'react-bootstrap';
import styles from './battleshipStyles.module.scss';

type Hits = Pick<ClientBattleShips, 'hostShips' | 'guestShips'>;
type Misses = Pick<ClientBattleShips, 'hostMisses' | 'guestMisses'>;
type Ready = Pick<ClientBattleShips, 'hostReady' | 'guestReady'>;
type BoardCell =
    | ''
    | 'm'
    | 'O'
    | 'X'
    | 'D'
    | 'HoverMain'
    | 'HoverSuccess'
    | 'HoverOverErr'
    | 'HoverMainErr'
    | 'HoverErr';
const boardStyles = {
    '': styles.empty,
    m: styles.miss,
    O: styles.ship,
    X: styles.hit,
    D: styles.destroyed,
    HoverMain: styles.hovMain,
    HoverSuccess: styles.hovS,
    HoverOverErr: styles.hovMainErr,
    HoverMainErr: styles.hovMainErr,
    HoverErr: styles.hovErr,
};
const boardSize = 10;
const shipLengths = [5, 4, 3, 3, 2];
const directions = [
    [0, 1],
    [1, 0],
];

function Battleships() {
    const [playerBoard, setPlayerBoard] = useState<BoardCell[][]>(
        Array.from(new Array(boardSize), () => Array.from(new Array(boardSize).fill('')))
    );
    const [opponentBoard, setOpponentBoard] = useState<BoardCell[][]>(
        Array.from(new Array(boardSize), () => Array.from(new Array(boardSize).fill('')))
    );
    const roomData: ClientRoom = useOutletContext();

    useEffect(() => {
        // restart the board
        if (roomData.gameState === 'playing') {
            setPlayerBoard(
                Array.from(new Array(boardSize), () =>
                    Array.from(new Array(boardSize).fill(''))
                )
            );
            setOpponentBoard(
                Array.from(new Array(boardSize), () =>
                    Array.from(new Array(boardSize).fill(''))
                )
            );
        }
    }, [roomData.gameState]);

    const player = getTypedStorageItem(userTypeKey) ?? 'guest';
    const opponent = getOppositeUserType(player);

    const { data: gameData, isSuccess: subscribed } =
        useSubscribeToBattleShipsQuery(player);

    useEffect(() => {
        if (!subscribed || !gameData.guestReady || !gameData.hostReady) return;

        const getStateUpdater = (userType: UserType) => (prevState: BoardCell[][]) =>
            prevState.map((row, y) =>
                row.map((_col, x) => {
                    for (const miss of gameData[(userType + 'Misses') as keyof Misses]) {
                        if (miss[0] === y && miss[1] === x) {
                            return 'm';
                        }
                    }
                    const ships = gameData[(userType + 'Ships') as keyof Hits];
                    if (!ships) return '';
                    for (const ship of ships) {
                        const shipHitInd = ship.coords.findIndex(
                            (shipBlock) => shipBlock[0] === y && shipBlock[1] === x
                        );
                        if (shipHitInd === -1) continue;
                        return ship.state === 'X' ? 'D' : ship.coords[shipHitInd][2];
                    }
                    return '';
                })
            );

        setPlayerBoard(getStateUpdater(player));
        setOpponentBoard(getStateUpdater(opponent));
    }, [gameData, opponent, player, subscribed]);

    const chosenCell = useRef<Coordinates | null>();
    const shipsReadyRef = useRef<Coordinates[][]>([]);
    const [boardNeedsUpdate, setBoardNeedsUpdate] = useState(false);
    type CurShip = {
        coords: Coordinates[];
        rotated: boolean;
        placementAllowed: boolean;
    };
    const curShipState = useRef<CurShip>({
        coords: [],
        rotated: false,
        placementAllowed: false,
    });
    type MyShiPState = 'idle' | 'moving' | 'set';
    const [myShips, setMyShips] = useState<MyShiPState[]>([
        'idle',
        'idle',
        'idle',
        'idle',
        'idle',
    ]);

    const clearPreview = useCallback(() => {
        setPlayerBoard((board) =>
            board.map((row) =>
                row.map((col) => (col === 'O' || col === 'HoverOverErr' ? 'O' : ''))
            )
        );
    }, []);

    useEffect(() => {
        if ((gameData?.guestReady && gameData.hostReady) || !boardNeedsUpdate) return;
        const movingShipInd = myShips.findIndex((ship) => ship === 'moving');
        if (movingShipInd === -1) return;

        const paintPreview = (y: number, x: number, length: number) => {
            const direction = curShipState.current.rotated
                ? directions[1]
                : directions[0];
            let isError = false;
            const curCoords: Coordinates[] = [];
            for (let i = 0; i < length; i++) {
                const newY = y + i * direction[0];
                const newX = x + i * direction[1];
                if (newY >= boardSize || newX >= boardSize) {
                    isError = true;
                    break;
                }
                curCoords.push([newY, newX]);
                if (playerBoard[newY][newX] === 'O') isError = true;
            }

            curShipState.current = {
                rotated: curShipState.current.rotated,
                placementAllowed: isError ? false : true,
                coords: curCoords,
            };

            setPlayerBoard((board) =>
                board.map((row, bY) =>
                    row.map((col, bX) => {
                        if (
                            curCoords.find((coord) => coord[0] === bY && coord[1] === bX)
                        ) {
                            if (col === 'O') return 'HoverOverErr';
                            else if (bY === y && bX === x)
                                return isError ? 'HoverMainErr' : 'HoverMain';
                            else return isError ? 'HoverErr' : 'HoverSuccess';
                        } else {
                            if (col === 'O' || col === 'HoverOverErr') return 'O';
                            else if (
                                col === 'HoverMain' ||
                                col === 'HoverMainErr' ||
                                col === 'HoverErr' ||
                                col === 'HoverSuccess'
                            )
                                return '';
                            else return col;
                        }
                    })
                )
            );
        };

        if (!chosenCell.current) {
            clearPreview();
            setBoardNeedsUpdate(false);
        } else {
            paintPreview(
                chosenCell.current[0],
                chosenCell.current[1],
                shipLengths[movingShipInd]
            );
            setBoardNeedsUpdate(false);
        }
    }, [
        boardNeedsUpdate,
        clearPreview,
        gameData?.guestReady,
        gameData?.hostReady,
        myShips,
        playerBoard,
    ]);

    const getShipClickHandler = (shipInd: number) => () => {
        if (myShips[shipInd] === 'set') return;
        setMyShips((oldShips) =>
            oldShips.map((ship, ind) => (ind === shipInd ? 'moving' : ship))
        );

        function onFinalize(e: MouseEvent) {
            if (e.button === 2) return;
            setMyShips((oldShips) =>
                oldShips.map((ship, ind) =>
                    ind === shipInd
                        ? curShipState.current.placementAllowed &&
                          curShipState.current.coords.length !== 0
                            ? 'set'
                            : 'idle'
                        : ship
                )
            );

            if (
                curShipState.current.placementAllowed &&
                curShipState.current.coords.length !== 0
            ) {
                shipsReadyRef.current.push(curShipState.current.coords);
                setPlayerBoard((board) =>
                    board.map((row) =>
                        row.map((col) =>
                            col === 'HoverMain' || col === 'HoverSuccess' ? 'O' : col
                        )
                    )
                );
            } else clearPreview();

            setTimeout(() => {
                curShipState.current = {
                    rotated: false,
                    placementAllowed: false,
                    coords: [],
                };
            });

            document.removeEventListener('contextmenu', onRightClick);
            document.removeEventListener('mousedown', onFinalize);
        }

        function onRightClick(e: MouseEvent) {
            e.preventDefault();
            curShipState.current.rotated = !curShipState.current.rotated;
            setBoardNeedsUpdate(true);
        }

        document.addEventListener('contextmenu', onRightClick);
        document.addEventListener('mousedown', onFinalize);
    };

    const getGridMouseOverHandler = (y: number, x: number) =>
        gameData && gameData[(player + 'Ready') as keyof Ready]
            ? undefined
            : () => {
                  chosenCell.current = [y, x];
                  setBoardNeedsUpdate(true);
              };

    const gridMouseOutHandler = () => {
        chosenCell.current = null;
        setBoardNeedsUpdate(true);
    };

    const [setReady, { isLoading: settingReady }] = useSetBSReadyMutation();
    const [makeAMove, { isLoading: makingMove }] = useMakeBSMoveMutation();

    const handleReady = () => {
        if (settingReady) return;
        setReady({
            userType: player,
            ships: shipsReadyRef.current,
        });
    };
    const getMakeAMoveHandler = (y: number, x: number) => () => {
        if (gameData?.playerToMove !== player || opponentBoard[y][x] !== '' || makingMove)
            return;
        makeAMove({ target: opponent, coordinates: [y, x] });
    };

    return (
        <GameWrapper>
            {subscribed && (
                <Container className={styles.title}>
                    {gameData.winner
                        ? gameData.winner === player
                            ? 'Congratulations, you Win!'
                            : 'You lose!'
                        : gameData.guestReady && gameData.hostReady
                        ? gameData.playerToMove === player
                            ? 'Your Move'
                            : 'Opponents move'
                        : gameData[(player + 'Ready') as keyof Ready]
                        ? 'Waiting for opponent...'
                        : 'Prepare your ships'}
                </Container>
            )}
            {subscribed && (
                <Container>
                    <Row className='justify-content-md-around'>
                        {!gameData[(player + 'Ready') as keyof Ready] && (
                            <Col xl='4' lg='5' md='6' sm='6'>
                                <div className={styles.message}>Ships to prepare</div>
                                <div className={styles.myShips}>
                                    <div>
                                        {myShips.map((ship, ind) => (
                                            <div
                                                key={ind}
                                                onClick={getShipClickHandler(ind)}
                                                className={`${styles[ship]} ${
                                                    styles['shipPictogram' + ind]
                                                } ${styles.shipPictogram}`}
                                            >
                                                {Array.from(
                                                    new Array(shipLengths[ind])
                                                ).map(() => (
                                                    <div
                                                        key={ind + 'cell'}
                                                        className={styles.cell}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleReady}
                                        disabled={shipsReadyRef.current.length < 5}
                                        className={`${styles.btn} ${styles.btnBlack}`}
                                    >
                                        ready up
                                    </button>
                                </div>
                            </Col>
                        )}
                        <Col xl='4' lg='5' md='6' sm='6' className={styles.playerBoard}>
                            <div className={`${styles.message} ${styles.player}`}>
                                My Board
                            </div>
                            <Card data-bs-theme='dark' className={styles.card}>
                                <CardBody className={styles.grid}>
                                    {playerBoard.map((row, y) =>
                                        row.map((col, x) => (
                                            <div
                                                key={`P/y:${y}/x:${x}`}
                                                onMouseOver={getGridMouseOverHandler(
                                                    y,
                                                    x
                                                )}
                                                onMouseOut={
                                                    gameData[
                                                        (player + 'Ready') as keyof Ready
                                                    ]
                                                        ? undefined
                                                        : gridMouseOutHandler
                                                }
                                                className={`${styles.cell} ${boardStyles[col]}`}
                                            />
                                        ))
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                        {gameData.hostReady && gameData.guestReady && (
                            <Col
                                xl='4'
                                lg='5'
                                md='6'
                                sm='6'
                                className={styles.opponentBoard}
                            >
                                <div className={`${styles.message} ${styles.opponent}`}>
                                    Opponent's Board
                                </div>
                                <Card data-bs-theme='dark' className={styles.card}>
                                    <CardBody className={styles.grid}>
                                        {opponentBoard.map((row, y) =>
                                            row.map((col, x) => (
                                                <div
                                                    key={`O/y:${y}/x:${x}`}
                                                    onClick={getMakeAMoveHandler(y, x)}
                                                    className={`${styles.cell} ${boardStyles[col]}`}
                                                />
                                            ))
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </Container>
            )}
        </GameWrapper>
    );
}

export default Battleships;
