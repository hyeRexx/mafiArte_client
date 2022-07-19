import io from 'socket.io-client';

let socket = null;

export default async () => {
    socket = await io.connect('http://localhost:3000');
    return socket;
}

export {socket};