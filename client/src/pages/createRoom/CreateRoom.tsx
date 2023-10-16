import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRoomMutation } from '../../app/services/api';
import { userNameKey } from '../../data/localStorageKeys';
import { setTypedStorageItem } from '../../utils/typesLocalStorage';
import { Container, Form, InputGroup, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
// import styles from './createRoomStyles.module.scss';

function CreateRoom() {
    const [hostName, setHostName] = useState('');
    const navigate = useNavigate();
    const [createRoom, { isLoading: isCreating, isSuccess: isCreated }] =
        useCreateRoomMutation();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHostName(e.target.value);
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const roomId = await createRoom(hostName).unwrap();
            setTypedStorageItem(userNameKey, hostName);
            navigate(`/room/${roomId}`);
        } catch (error) {
            toast.error('Error creating new room', {});
        }
    };

    return (
        <Container>
            <Form onSubmit={handleCreate}>
                <InputGroup>
                    <Form.Control
                        placeholder='Your name'
                        value={hostName}
                        onChange={handleNameChange}
                    />
                    <Button type='submit' disabled={isCreating || isCreated}>
                        OK
                    </Button>
                </InputGroup>
            </Form>
        </Container>
    );
}

export default CreateRoom;
