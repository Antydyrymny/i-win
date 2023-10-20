import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import Nav from './components/nav/Nav';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const LazyHome = React.lazy(() => import('./pages/home/Home'));
const LazyJoinRoom = React.lazy(() => import('./pages/joinRoom/JoinRoom'));
const LazyCreateRoom = React.lazy(() => import('./pages/createRoom/CreateRoom'));
const LazyRoomLayout = React.lazy(() => import('./pages/room/RoomLayout'));
const LazyRoom = React.lazy(() => import('./pages/room/Room'));
const LazyTicTacToe = React.lazy(() => import('./pages/ticTacToe/TicTacToe'));
const LazyBattleships = React.lazy(() => import('./pages/battleships/Battleships'));

function App() {
    return (
        <Suspense
            fallback={
                <Container className='vh-100 d-flex justify-content-center align-items-center'>
                    <Spinner variant='warning' />
                </Container>
            }
        >
            <Nav />
            <Routes>
                <Route path='/' element={<LazyHome />} />
                <Route path='/join' element={<LazyJoinRoom />} />
                <Route path='/create' element={<LazyCreateRoom />} />
                <Route path='/room/:roomId' element={<LazyRoomLayout />}>
                    <Route index element={<LazyRoom />} />
                    <Route path='ticTacToe' element={<LazyTicTacToe />} />
                    <Route path='battleships' element={<LazyBattleships />} />
                </Route>
                <Route path='*' element={<Navigate to={'/'} replace />} />
            </Routes>
        </Suspense>
    );
}

export default App;
