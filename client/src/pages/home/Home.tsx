import { Link } from 'react-router-dom';
import { useSubscribeToOnlineStatusQuery } from '../../app/services/api';
import { userTypeKey } from '../../data/localStorageKeys';
import { setTypedStorageItem } from '../../utils/typesLocalStorage';
import { Container, Image } from 'react-bootstrap';
import useAutoLeaveRoom from '../../hooks/useAutoLeave';
import bgHome from '../../assets/bgHome.png';
import styles from './homeStyles.module.scss';

function Home() {
    useAutoLeaveRoom();
    const { data: playingNow, isSuccess } = useSubscribeToOnlineStatusQuery();

    const handlePressJoin = () => {
        setTypedStorageItem(userTypeKey, 'guest');
    };

    const handlePressCreate = () => {
        setTypedStorageItem(userTypeKey, 'host');
    };

    return (
        <div className={styles.wrapper}>
            <Container className={styles.main}>
                <div className={styles.textBlock}>
                    <h1>Online games for friends!</h1>
                    <p>
                        Throw a chill online hangout with some laid-back and fun group
                        games for your pals, coworkers, or fam. Just hit that button to
                        create a room, and you're good to roll. Play directly in your
                        browser—no sign-ups or installs needed!
                    </p>
                    <div className={styles.buttons}>
                        <Link
                            className={styles.btn}
                            to={'/join'}
                            onClick={handlePressJoin}
                        >
                            Join room
                        </Link>
                        <Link
                            className={`${styles.btn} ${styles.btnBlack}`}
                            to={'/create'}
                            onClick={handlePressCreate}
                        >
                            Create new room
                        </Link>
                    </div>
                </div>
                <div className={styles.decoration}>
                    <Image className={styles.img} src={bgHome} alt='home-background' />
                </div>
            </Container>
            <Container className={styles.footerWrapper}>
                <div className={styles.footerOverlay} />
                <footer className={styles.footer}>
                    {isSuccess && (
                        <div
                            className={`${styles.btn} ${styles.btnBlack} ${styles.footerBtn}`}
                        >{`Currently playing:  ${playingNow}`}</div>
                    )}
                </footer>
            </Container>
        </div>
    );
}

export default Home;
