import { Container, Carousel, Image } from 'react-bootstrap';
import ticTacToeImg from '../../assets/ticTacToe.jpg';
import battleshipsImg from '../../assets/battleships.jpg';
import styles from './roomStyles.module.scss';

type GameCarouselProps = {
    show: boolean;
    showTicTacToe: () => void;
    showBattleships: () => void;
};

function GameCarousel({ show, showTicTacToe, showBattleships }: GameCarouselProps) {
    return (
        <Container className={styles.carouselWrapper}>
            <Carousel
                fade
                indicators={false}
                interval={show ? null : 4000}
                className={styles.carousel}
            >
                <Carousel.Item className={styles.carouselItem}>
                    <Container className='d-flex justify-content-around'>
                        <Image
                            onClick={showTicTacToe}
                            className={styles.img}
                            src={ticTacToeImg}
                            alt='tic-tac-toe'
                        />
                        <div className={styles.description} onClick={showTicTacToe}>
                            <h4>
                                <strong>Tic-Tac-Toe!</strong>
                            </h4>
                            <p>
                                Enter the arena of strategic supremacy in Tic-Tac-Toe,
                                where every X and O is a move in the ultimate battle for
                                all-in-a-row dominance. Plot your cunning strategy, outwit
                                your opponent, and claim victory in this timeless clash of
                                wit and tactics!
                            </p>
                        </div>
                    </Container>
                </Carousel.Item>
                <Carousel.Item className={styles.carouselItem}>
                    <Container className='d-flex justify-content-around'>
                        <Image
                            onClick={showBattleships}
                            className={styles.img}
                            src={battleshipsImg}
                            alt='tic-tac-toe'
                        />
                        <div className={styles.description} onClick={showBattleships}>
                            <h4>
                                <strong>Battleships!</strong>
                            </h4>
                            <p>
                                Embark on a naval odyssey in Battleships, where the seas
                                are your battlefield and hidden fleets await discovery.
                                Deploy your armada, navigate the unknown waters, and
                                unleash precision strikes to rule the waves!
                            </p>
                        </div>
                    </Container>
                </Carousel.Item>
            </Carousel>
        </Container>
    );
}

export default GameCarousel;
