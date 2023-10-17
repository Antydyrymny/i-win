import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAutoLeaveRoom from '../../hooks/useAutoLeaveRoom';
import { useSubscribeToAllRoomsQuery } from '../../app/services/api';
import { Container, Table, Button, Spinner, Modal } from 'react-bootstrap';
import NameInput from '../../components/nameInput/NameInput';
// import styles from './joinRoomStyles.module.scss';

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
        <Container>
            <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Choose a name to join with</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NameInput
                        onGuestSubmit={getSubmitHandler(chosenRoom)}
                        disabled={false}
                    />
                </Modal.Body>
            </Modal>
            <Table responsive='xl'>
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
                                        : room.gameType}
                                </td>
                                <td>{room.gameState}</td>
                                <td>{`${room.playerCount} / 2`}</td>
                                <td>
                                    <Button
                                        onClick={getOnJoinHandler(room.id)}
                                        variant='warning'
                                        disabled={room.playerCount > 1}
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
    );
}

export default JoinRoom;
