import { IClient, IMessage, MessageType } from "./Interfaces";
import * as dgram from "dgram";
export default class Server {
    private _port: number;
    private _socket: dgram.Socket; 
    private _clients: {[id: number] : IClient}; 

    private _createSocket(): dgram.Socket 
    {
        let socket: dgram.Socket = dgram.createSocket('udp4');

        socket.on('error', (err) => 
        {
            console.log(`server error:\n${err.stack}`);
            socket.close();
        });

        socket.on('listening', () => {
            let address = socket.address();
            console.log(`server listening ${address.address}:${address.port}`);
        })

        socket.on('close', () => {
            console.log('server closed');
        })
          
        socket.on('message', (msg, rinfo) => {
            // TODO should validate messages are all well formed
            const message: IMessage = JSON.parse(msg.toString());
            switch (message.type) 
            {
                case MessageType.REGISTRATION:
                    this._registerClient(message);
                    break; 
                case MessageType.LEAVE:
                    this._unregisterClient(message);
                    break;
                case MessageType.MESSAGE:
                    this._sendMessage(message);
                    break;
                case MessageType.BROADCAST:
                    this._broadcastMessage(message);
                    break;
                default:
                    break;
            }
            console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        });

        return socket;
    };


    private _registerClient(message: IMessage): void 
    {
        const client: IClient = JSON.parse(message.payload);
        this._clients[client.id] = client;
    }

    private _unregisterClient(message: IMessage): void 
    {
        delete this._clients[message.source.id];
    }

    private _sendMessage(message: IMessage): void 
    {
        const client: IClient = this._clients[message.destination];
        const payload = JSON.stringify(message);
        this._socket.send(payload, client.address.port, client.address.ip, (err, bytes) => 
        {
            if (err) 
                console.log(err);
        });
    }

    private _broadcastMessage(message: IMessage): void 
    {
        for(const id of Object.keys(this._clients)) 
        {
            if(Number(id) === message.source.id)// don't send to source
                continue; 

            const client = this._clients[id];
            this._socket.send(message.payload, client.address.port, client.address.ip);
        }
    }

    public listen(port?: number | ((port: number) => void), callback?: (port: number) => void) 
    {
        const defaultPort = 8000;
        if(port === undefined && callback === undefined) 
            port = defaultPort;
        else if(callback === undefined) // only port (callback) defined 
        { 
            callback = port as ((port: number) => void);
            port = defaultPort;
        } // else they are both defined
        this._port = port as number;
        this._socket = this._createSocket();
        
        this._socket.bind(this._port, () => 
        {
            if(callback !== undefined)
                callback(this._port);
        });

    }

    public shutdown(callback?: () => void) 
    {
        this._socket.close(); // close can't have new connections
        if (callback !== undefined) 
            callback();
    }
}