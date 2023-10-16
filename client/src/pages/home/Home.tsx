import { Link } from 'react-router-dom';
// import { userTypeKey } from '../../data/localStorageKeys';
// import styles from './homeStyles.module.scss';

function Home() {
    return (
        <>
            <Link to={''}>Join room</Link>
            <Link to={''}>Create new room</Link>
            <div>Online counter</div>
        </>
    );
}

export default Home;
