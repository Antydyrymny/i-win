import { useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    useHostJoinRoomMutation,
    useGuestJoinRoomMutation,
    useSubscribeToRoomEventsQuery,
    useHostLeaveMutation,
    useGuestLeaveMutation,
} from '../../app/services/api';
import useRedirect from '../../hooks/useRedirect';
import { getTypedStorageItem, setTypedStorageItem } from '../../utils/typesLocalStorage';
import { accessDeniedErr } from '../../data/accessDeniedErr';
import {
    userNameKey,
    userTypeKey,
    lastRoomKey,
    wasInRoomKey,
} from '../../data/localStorageKeys';
import { Container, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import useClearToasts from '../../hooks/useClearToasts';
import { UserType } from '../../types/types';

function RoomLayout() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [hostJoins, { isSuccess: hostJoined, data: validatedHostName }] =
        useHostJoinRoomMutation();
    const [guestJoins, { isSuccess: guestJoined, data: validatedGuestName }] =
        useGuestJoinRoomMutation();
    const { data: roomData, isSuccess: subscribed } = useSubscribeToRoomEventsQuery(
        undefined,
        {
            skip:
                (!hostJoined && !guestJoined) ||
                validatedHostName === accessDeniedErr ||
                validatedGuestName === accessDeniedErr,
        }
    );

    const [guestLeave] = useGuestLeaveMutation();
    const [hostLeave] = useHostLeaveMutation();

    useRedirect(
        '/',
        validatedHostName === accessDeniedErr || validatedGuestName === accessDeniedErr
    );

    useRedirect(
        `/room/${roomId}`,
        location.pathname !== `/room/${roomId}` &&
            !!roomData &&
            roomData.gameType === 'choosing' &&
            roomData.gameState !== 'playing'
    );

    useRedirect(
        `/room/${roomId}/${roomData?.gameType}`,
        !!roomData &&
            roomData.gameType !== 'choosing' &&
            roomData.gameState !== 'in lobby'
    );

    useRedirect('/', roomData?.deleted === true);

    useEffect(() => {
        const userName = getTypedStorageItem(userNameKey) ?? '';
        let userType: UserType;
        const lastRoom = getTypedStorageItem(lastRoomKey);
        if (lastRoom && lastRoom.roomId === roomId) {
            userType = lastRoom.userType;
        } else userType = 'guest';
        setTypedStorageItem(userTypeKey, userType);

        const join = async () => {
            if (!roomId) return;
            try {
                const validatedName =
                    userType === 'guest'
                        ? await guestJoins({ roomId, userName }).unwrap()
                        : await hostJoins({ roomId, userName }).unwrap();

                if (validatedName === accessDeniedErr) return;
                setTypedStorageItem(userNameKey, validatedName);
                setTypedStorageItem(lastRoomKey, { roomId, userType });
            } catch {
                toast.error('Error joining room');
            }
        };
        join();

        setTypedStorageItem(wasInRoomKey, true);
    }, [guestJoins, guestLeave, hostJoins, hostLeave, navigate, roomId]);

    useClearToasts();

    return subscribed && roomData ? (
        <Outlet context={roomData} />
    ) : (
        <Container className='vh-100 d-flex justify-content-center align-items-center'>
            <Spinner variant='warning' />
        </Container>
    );
}

export default RoomLayout;
