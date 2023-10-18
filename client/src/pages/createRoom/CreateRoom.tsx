import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRoomMutation } from '../../app/services/api';
import { lastRoomKey } from '../../data/localStorageKeys';
import { setTypedStorageItem } from '../../utils/typesLocalStorage';
import { Col, Container, Row } from 'react-bootstrap';
import NameInput from '../../components/nameInput/NameInput';
import { toast } from 'react-toastify';
import styles from './createRoomStyles.module.scss';

function CreateRoom() {
    const navigate = useNavigate();
    const [createRoom, { isLoading: isCreating, isSuccess: isCreated }] =
        useCreateRoomMutation();

    const handleCreate = useCallback(
        async (name: string) => {
            try {
                const roomId = await createRoom(name).unwrap();
                setTypedStorageItem(lastRoomKey, { roomId, userType: 'host' });
                navigate(`/room/${roomId}`);
            } catch (error) {
                toast.error('Error creating new room', {});
            }
        },
        [createRoom, navigate]
    );

    return (
        <div className={styles.wrapper}>
            <Container>
                <Row className='justify-content-md-center'>
                    <Col lg='5' className={styles.content}>
                        <h1 className={styles.heading}>Create new room!</h1>
                        <ul className={styles.list}>
                            <li>
                                <span className={styles.litem}>{`1.  `}</span> Enter your
                                name to create a room
                            </li>
                            <li>
                                <span className={styles.litem}>{`2.  `}</span>Your friends
                                can find it in the room list
                            </li>
                            <li>
                                <span className={styles.litem}>{`3.  `}</span>Play!
                            </li>
                        </ul>
                    </Col>
                </Row>
                <footer className={styles.footerWrapper}>
                    <div className={styles.footerOverlay} />
                    <Row className='justify-content-md-center'>
                        <Col lg='5'>
                            <NameInput
                                onHostSubmit={handleCreate}
                                disabled={isCreating || isCreated}
                            />
                        </Col>
                    </Row>
                </footer>
            </Container>
        </div>
    );
}

export default CreateRoom;
