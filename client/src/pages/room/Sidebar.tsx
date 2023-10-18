import { Button, Offcanvas } from 'react-bootstrap';
import styles from './roomStyles.module.scss';
import { GameType } from '../../types/types';

type SidebarProps = {
    show: boolean;
    handleClose: () => void;
    game: Exclude<GameType, 'choosing'>;
    chooseGame: (game: Exclude<GameType, 'choosing'>) => void;
    allowChange: boolean;
    disabled: boolean;
};

function Sidebar({
    show,
    handleClose,
    game,
    chooseGame,
    allowChange,
    disabled,
}: SidebarProps) {
    const handleChangeClick = () => {
        chooseGame(game);
        handleClose();
    };

    return (
        <Offcanvas
            show={show}
            onHide={handleClose}
            placement='end'
            className={styles.offcanvas}
        >
            <Offcanvas.Header closeButton closeVariant='white'>
                <Offcanvas.Title>
                    {game === 'ticTacToe' ? 'Tic-Tac-Toe Rules:' : 'Battleships Rules:'}
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <ul className={styles.list}>
                    {game === 'ticTacToe' ? (
                        <>
                            <li>
                                <b>Alternating Moves</b>: Players take turns placing their
                                respective X or O on an empty square of the 10x10 grid.
                            </li>
                            <li>
                                <b>Four-in-a-Row Victory</b>: The goal is to be the first
                                to align four of your symbols horizontally, vertically, or
                                diagonally.
                            </li>
                            <li>
                                <b>Occupied Squares</b>: Once a square is claimed, it
                                cannot be reused, forcing players to strategize and block
                                their opponent's moves.
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <b>Fleet Placement</b>: Each player secretly arranges
                                their fleet of ships on their 10x10 grid, hiding their
                                battleships from their opponent.
                            </li>
                            <li>
                                <b>Coordinate Attacks</b>: Players take turns calling out
                                coordinates to locate and attack their opponent's fleet.
                            </li>
                            <li>
                                <b>Sinking Ships</b>: A ship is sunk when all its squares
                                are hit. The first player to sink the entire enemy fleet
                                emerges victorious.
                            </li>
                        </>
                    )}
                </ul>
                {allowChange && (
                    <Button
                        onClick={handleChangeClick}
                        className={`${styles.btn} ${styles.btnBottom}`}
                        variant='warning'
                        disabled={disabled}
                    >
                        Choose
                    </Button>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default Sidebar;
