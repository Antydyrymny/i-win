import { Link } from 'react-router-dom';
import { useSubscribeToOnlineStatusQuery } from '../../app/services/api';
import { userTypeKey } from '../../data/localStorageKeys';
import { setTypedStorageItem } from '../../utils/typesLocalStorage';
// import styles from './homeStyles.module.scss';

function Home() {
    const { data: playingNow, isSuccess } = useSubscribeToOnlineStatusQuery();

    const handlePressJoin = () => {
        setTypedStorageItem(userTypeKey, 'guest');
    };

    const handlePressCreate = () => {
        setTypedStorageItem(userTypeKey, 'host');
    };

    return (
        <>
            <Link to={'/join'} onClick={handlePressJoin}>
                Join room
            </Link>
            <Link to={'/create'} onClick={handlePressCreate}>
                Create new room
            </Link>
            {isSuccess && <div>{`Currently playing - ${playingNow}`}</div>}
        </>
    );
}

export default Home;
