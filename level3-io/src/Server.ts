import { IClient } from "./Interfaces";

export class Server {
    private _port: number;
    private _socket; 
    private _clients: {[id: number] : IClient}; 

    // TODO(angelo): chiedere che significa ((port: number) => void)
    listen(port?: number | ((port: number) => void), callback?: (port: number) => void) {
        if (port === undefined) {
            port = 8000; // default port
        }

        this._socket.bind(port, callback);
    }

    shutdown(callback?) {
        this._socket.close(callback);
    }
}