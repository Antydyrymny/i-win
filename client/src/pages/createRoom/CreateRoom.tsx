import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRoomMutation } from '../../app/services/api';
import useAutoLeaveRoom from '../../hooks/useAutoLeaveRoom';
import { Container } from 'react-bootstrap';
import NameInput from '../../components/nameInput/NameInput';
import { toast } from 'react-toastify';
// import styles from './createRoomStyles.module.scss';

function CreateRoom() {
    useAutoLeaveRoom();
    const navigate = useNavigate();
    const [createRoom, { isLoading: isCreating, isSuccess: isCreated }] =
        useCreateRoomMutation();

    const handleCreate = useCallback(
        async (name: string) => {
            try {
                const roomId = await createRoom(name).unwrap();
                navigate(`/room/${roomId}`);
            } catch (error) {
                toast.error('Error creating new room', {});
            }
        },
        [createRoom, navigate]
    );

    return (
        <Container>
            <NameInput onHostSubmit={handleCreate} disabled={isCreating || isCreated} />
        </Container>
    );
}

export default CreateRoom;
