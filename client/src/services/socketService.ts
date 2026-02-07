
import { io } from 'socket.io-client';

// Use same URL as your API (or env var)
const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
    autoConnect: false, // Wait for login
    withCredentials: true,
});

export const connectSocket = (userId: string) => {
    if (!socket.connected) {
        socket.connect();
        socket.emit('join_user_room', userId);
        console.log("Socket connected for user:", userId);
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
