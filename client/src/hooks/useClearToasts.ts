import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function useClearToasts() {
    useEffect(() => {
        return () => toast.dismiss();
    }, []);
}
