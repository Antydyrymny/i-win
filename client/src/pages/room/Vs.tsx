import { Container, Stack, Image } from 'react-bootstrap';
import vs from '../../assets/vs.png';
import styles from './roomStyles.module.scss';

type VsProps = {
    playerName: string | undefined;
    opponentName: string | undefined;
    playerIsHost: boolean;
    playerScore: number;
    opponentScore: number;
    showScore: boolean;
    showVs?: boolean;
};

function Vs({
    playerName,
    opponentName,
    playerIsHost,
    playerScore,
    opponentScore,
    showScore,
    showVs = true,
}: VsProps) {
    const opponentLabel = opponentName
        ? opponentName
        : playerIsHost
        ? 'Waiting for opponent...'
        : 'Waiting for host...';

    return (
        <Stack>
            <Container
                style={{ display: showVs && opponentName ? 'block' : 'none' }}
                className={styles.vsBlock}
            >
                <Image className={styles.vs} src={vs} alt='vs' />
            </Container>

            <div className={styles.main}>
                <div className={styles.player}>
                    <div className={styles.name}>
                        <span>{playerName}</span>
                        <div className={styles.host}>{playerIsHost && 'host'}</div>
                    </div>
                    {showScore && <div className={styles.score}>{playerScore}</div>}
                </div>
                <div className={styles.opponent}>
                    {showScore && <div className={styles.score}>{opponentScore}</div>}
                    <div className={styles.name}>
                        <span>{opponentLabel}</span>
                        <div className={styles.host}>{!playerIsHost && 'host'}</div>
                    </div>
                </div>
            </div>
        </Stack>
    );
}

export default Vs;
