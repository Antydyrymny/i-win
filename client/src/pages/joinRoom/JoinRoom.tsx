import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lastRoomKey } from '../../data/localStorageKeys';
import { getTypedStorageItem } from '../../utils/typesLocalStorage';
import { useSubscribeToAllRoomsQuery } from '../../app/services/api';
import { Container, Table, Button, Spinner, Modal } from 'react-bootstrap';
import NameInput from '../../components/nameInput/NameInput';
import useAutoLeaveRoom from '../../hooks/useAutoLeave';
import styles from './joinRoomStyles.module.scss';

function JoinRoom() {
    useAutoLeaveRoom();
    const { data: allRooms, isSuccess, isFetching } = useSubscribeToAllRoomsQuery();
    const [modalShow, setModalShow] = useState(false);
    const [chosenRoom, setChosenRoom] = useState('');
    const navigate = useNavigate();

    const getOnJoinHandler = (roomId: string) => () => {
        setModalShow(true);
        setChosenRoom(roomId);
    };

    const getSubmitHandler = (roomId: string) => () => {
        if (!roomId) return;
        navigate(`/room/${roomId}`);
    };

    return (
        <div className={styles.wrapper}>
            <Container className={styles.main}>
                <Modal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    centered
                    contentClassName={styles.modalWrapper}
                >
                    <Modal.Header
                        closeButton
                        closeVariant='white'
                        className={styles.modal}
                    >
                        <Modal.Title className={styles.title}>
                            Choose a name to join with
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={styles.modal}>
                        <NameInput
                            onGuestSubmit={getSubmitHandler(chosenRoom)}
                            disabled={false}
                        />
                    </Modal.Body>
                </Modal>
                <h1 className={styles.heading}>Rooms List</h1>
                <Table variant='dark' className={styles.table} responsive='xl'>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Game</th>
                            <th>Status</th>
                            <th>Players</th>
                            <th>Join</th>
                        </tr>
                    </thead>
                    {isSuccess && (
                        <tbody>
                            {allRooms.map((room) => (
                                <tr key={room.id}>
                                    <td>{room.name}</td>
                                    <td>
                                        {room.gameType === 'choosing'
                                            ? 'choosing game'
                                            : room.gameType === 'ticTacToe'
                                            ? 'Tic-Tac-Toe'
                                            : 'Battleships'}
                                    </td>
                                    <td>
                                        {room.waitingForHost
                                            ? 'waiting for host'
                                            : room.gameState}
                                    </td>
                                    <td>{`${room.playerCount} / 2`}</td>
                                    <td>
                                        <Button
                                            onClick={getOnJoinHandler(room.id)}
                                            variant='warning'
                                            disabled={
                                                room.playerCount > 1 ||
                                                (room.waitingForHost &&
                                                    (!getTypedStorageItem(lastRoomKey) ||
                                                        getTypedStorageItem(lastRoomKey)
                                                            ?.roomId !== room.id ||
                                                        getTypedStorageItem(lastRoomKey)
                                                            ?.userType === 'guest'))
                                            }
                                        >
                                            {room.playerCount < 2 ? 'Join' : 'Full'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </Table>
                {isFetching && <Spinner variant='warning' />}
            </Container>
        </div>
    );
}

export default JoinRoom;
