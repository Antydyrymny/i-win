import { io, Socket } from 'socket.io-client';

const url =
    import.meta.env.VITE_ENV === 'DEV'
        ? import.meta.env.VITE_DEV_URL
        : import.meta.env.VITE_SERVER_URL;

let socket: Socket;
export default function getSocket() {
    if (!socket) {
        socket = io(url);
    }
    return socket;
}
