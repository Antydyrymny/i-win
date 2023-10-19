import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function useInformOfHostLeave(hostLeft: boolean) {
    useEffect(() => {
        if (hostLeft) {
            toast.warn('Host left, lobby will be closed soon...', {
                autoClose: 10000,
                pauseOnHover: false,
                progress: undefined,
                theme: 'dark',
            });
        } else toast.dismiss();
    }, [hostLeft]);
}
