import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSubsctibeToRejoinQuery } from '../../app/services/api';
import { lastRoomKey } from '../../data/localStorageKeys';
import { getTypedStorageItem } from '../../utils/typesLocalStorage';
import { Container, Navbar, Image, Button } from 'react-bootstrap';
import book from '../../assets/book.png';
import group from '../../assets/group.png';
import styles from './navigationStyles.module.scss';

function Nav() {
    const location = useLocation();
    const navigate = useNavigate();
    const rejoinRequest = getTypedStorageItem(lastRoomKey);
    const rejoinCondition = rejoinRequest && !location.pathname.includes('room');
    const { data: rejoinAllowed } = useSubsctibeToRejoinQuery(rejoinRequest!, {
        skip: !rejoinCondition,
    });

    return (
        <Navbar className={`${styles.wrapper} `}>
            <Container className='justify-content-between'>
                <Navbar.Brand>
                    <Link to={'/'}>
                        <span className={styles.I}>You</span>
                        <span className={styles.dot}>.</span>
                        <span className={styles.win}>WIN</span>
                    </Link>
                </Navbar.Brand>
                {rejoinAllowed && rejoinCondition && (
                    <Button
                        onClick={() => navigate(`/room/${rejoinRequest.roomId}`)}
                        variant='warning'
                    >
                        Rejoin
                    </Button>
                )}
                <Navbar.Text className={`${styles.settings} d-flex`}>
                    <Image src={book} />
                    <Image src={group} />
                </Navbar.Text>
            </Container>
        </Navbar>
    );
}

export default Nav;
