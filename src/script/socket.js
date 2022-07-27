import io from 'socket.io-client';
import { paddr } from '../proxyAddr';

let socket = null;

export default async () => {
    // socket = await io.connect("http://localhost:3000");
    socket = await io.connect(paddr, {
        withCredentials: true,
        extraHeaders: {
          "access-control-allow-origin": "https://d2bxvfgokknit.cloudfront.net",
          "access-control-allow-credentials": true,
        }
      });
    return socket;
}

export {socket};