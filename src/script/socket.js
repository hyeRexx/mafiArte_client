import io from 'socket.io-client';
import { paddr } from '../proxyAddr';

let socket = null;

export default async () => {
    socket = await io.connect(paddr, {
        withCredentials: true,
        extraHeaders: {
          "access-control-allow-origin": "https://d2wm85v592lxtd.cloudfront.net",
          "access-control-allow-credentials": true,
          "access-control-request-headers": "access-control-allow-credentials,access-control-allow-origin",
            "access-control-request-method": "POST"
        }
      });
    return socket;
}

export {socket};