import { useEffect } from 'react';
import { useHostLeaveMutation, useGuestLeaveMutation } from '../app/services/api';
import { getTypedStorageItem, setTypedStorageItem } from '../utils/typesLocalStorage';
import { userTypeKey, wasInRoomKey } from '../data/localStorageKeys';

export default function useAutoLeaveRoom() {
    const [guestLeave] = useGuestLeaveMutation();
    const [hostLeave] = useHostLeaveMutation();

    useEffect(() => {
        const needsHandlingLeave = getTypedStorageItem(wasInRoomKey) === true;
        if (!needsHandlingLeave) return;
        setTypedStorageItem(wasInRoomKey, false);

        const userType = getTypedStorageItem(userTypeKey);
        if (!userType) return;

        if (userType === 'guest') {
            guestLeave();
        } else {
            hostLeave();
        }
    }, [guestLeave, hostLeave]);
}
