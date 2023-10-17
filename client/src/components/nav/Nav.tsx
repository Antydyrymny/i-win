import { Container, Navbar, Image } from 'react-bootstrap';
import book from '../../assets/book.png';
import group from '../../assets/group.png';
import styles from './navigationStyles.module.scss';

function Nav() {
    return (
        <Navbar className={`${styles.wrapper} `}>
            <Container className='justify-content-between'>
                <Navbar.Brand href='/'>
                    <span className={styles.I}>You</span>
                    <span className={styles.dot}>.</span>
                    <span className={styles.win}>WIN</span>
                </Navbar.Brand>
                <Navbar.Text className={`${styles.settings} d-flex`}>
                    <Image src={book} />
                    <Image src={group} />
                </Navbar.Text>
            </Container>
        </Navbar>
    );
}

export default Nav;
