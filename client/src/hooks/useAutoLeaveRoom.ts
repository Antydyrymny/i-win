import { useEffect } from 'react';
import { useHostLeaveMutation, useGuestLeaveMutation } from '../app/services/api';
import { getTypedStorageItem } from '../utils/typesLocalStorage';
import { userTypeKey } from '../data/localStorageKeys';
import { toast } from 'react-toastify';

export default function useAutoLeaveRoom() {
    const [guestLeave] = useGuestLeaveMutation();
    const [hostLeave] = useHostLeaveMutation();

    useEffect(() => {
        toast.dismiss();
        const userType = getTypedStorageItem(userTypeKey);
        if (!userType) return;

        if (userType === 'guest') {
            guestLeave();
        } else {
            hostLeave();
        }
    }, [guestLeave, hostLeave]);
}
