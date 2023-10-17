import { useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    useVerifyUsersNumberQuery,
    useHostJoinRoomMutation,
    useGuestJoinRoomMutation,
    useSubscribeToRoomEventsQuery,
} from '../../app/services/api';
import useRedirect from '../../hooks/useRedirect';
import { getTypedStorageItem, setTypedStorageItem } from '../../utils/typesLocalStorage';
import { roomDoNotExistErr } from '../../data/roomDoNotExistErr';
import { userNameKey, userTypeKey } from '../../data/localStorageKeys';
import { Container, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
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
            skip: !hostJoined && !guestJoined,
        }
    );
    const { data: usersNumber, isSuccess: usersNumberVerified } =
        useVerifyUsersNumberQuery(roomId!, { skip: !roomId || subscribed });

    useRedirect(
        '/',
        validatedHostName === roomDoNotExistErr ||
            validatedGuestName === roomDoNotExistErr
    );

    useRedirect(
        `/room/${roomId}`,
        location.pathname !== `/room/${roomId}` &&
            !!roomData &&
            roomData.readyStatus === false
    );

    useRedirect(
        `/room/${roomId}/${roomData?.gameType}`,
        !!roomData && roomData.gameType !== 'choosing'
    );

    useRedirect('/', roomData?.deleted === true);

    useEffect(() => {
        if (!usersNumberVerified) return;

        const userName = getTypedStorageItem(userNameKey) ?? '';
        const userType: UserType = usersNumber === 0 ? 'host' : 'guest';
        setTypedStorageItem(userTypeKey, userType);

        const join = async () => {
            if (!roomId) return;
            try {
                const validatedName =
                    userType === 'guest'
                        ? await guestJoins({ roomId, userName }).unwrap()
                        : await hostJoins({ roomId, userName }).unwrap();

                if (validatedName === roomDoNotExistErr) return;
                setTypedStorageItem(userNameKey, validatedName);
            } catch {
                toast.error('Error joining room');
            }
        };
        join();
    }, [guestJoins, hostJoins, navigate, roomId, usersNumber, usersNumberVerified]);

    return subscribed && roomData ? (
        <Outlet context={roomData} />
    ) : (
        <Container className='vh-100 d-flex justify-content-center align-items-center'>
            <Spinner variant='warning' />
        </Container>
    );
}

export default RoomLayout;
