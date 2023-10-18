import { Container, Stack, Image } from 'react-bootstrap';
import vs from '../../assets/vs.png';
import styles from './roomStyles.module.scss';

type VsProps = {
    playerName: string | undefined;
    opponentName: string | undefined;
    playerScore: number;
    opponentScore: number;
    showScore: boolean;
};

function Vs({
    playerName,
    opponentName,
    playerScore,
    opponentScore,
    showScore,
}: VsProps) {
    return (
        <Stack>
            {opponentName && (
                <Container className={styles.vsBlock}>
                    <Image className={styles.vs} src={vs} alt='vs' />
                </Container>
            )}
            <div className={styles.main}>
                <div className={styles.player}>
                    <div className={styles.name}>{playerName}</div>
                    {showScore && <div className={styles.score}>{playerScore}</div>}
                </div>
                <div className={styles.opponent}>
                    {showScore && <div className={styles.score}>{opponentScore}</div>}
                    <div className={styles.name}>
                        {opponentName || 'Waiting for opponent...'}
                    </div>
                </div>
            </div>
        </Stack>
    );
}

export default Vs;
