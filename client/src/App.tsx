import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <Suspense fallback={<Spinner />}>
            <Routes>
                <Route path='/' element={<></>} />
                <Route path='/room/:roomId' element={<></>} />
                <Route path='*' element={<Navigate to={'/'} replace />} />
            </Routes>
        </Suspense>
    );
}

export default App;
