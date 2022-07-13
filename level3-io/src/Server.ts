import { IClient, IMessage, MessageType } from "./Interfaces";
import * as dgram from "dgram";
export default class Server {
    private _port: number;
    private _socket: dgram.Socket; 
    private _clients: {[id: number] : IClient}; 

    constructor() 
    {
        this._clients = {};
    }

    private _createSocket(): dgram.Socket 
    {
        let socket: dgram.Socket = dgram.createSocket('udp4', (msg, rinfo) => {
            // TODO should validate messages are all well formed
            const message: IMessage = JSON.parse(msg.toString());
            console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
            switch (message.type) 
            {
                case MessageType.REGISTRATION:
                    this._registerClient(message, rinfo);
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
        });

        socket.on('error', (err) => 
        {
            console.log(`server error:\n${err.stack}`);
            socket.close();
        });

        socket.on('close', () => {
            console.log('server closed');
        })
          
        return socket;
    };

    private _registerClient(message: IMessage, rinfo: dgram.RemoteInfo): void 
    {
        const client: IClient = {
            id: message.source.id,
            username: message.source.username,
            address: {
                ip: rinfo.address,
                port: rinfo.port
            }
        }
        this._clients[client.id] = client;
    }

    private _unregisterClient(message: IMessage): void 
    {
        delete this._clients[message.source.id];
    }

    private _sendMessage(message: IMessage): void 
    {
        const client: IClient = this._clients[message.destination];
        console.log(`sending message to ${client.username}`);
        console.log(`message is ${message}`);
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
            if(Number(id) === message.source.id) // don't send to source
                continue; 

            const client = this._clients[id];
            console.log(`id: ${id}, message: ${JSON.stringify(message)}`);
            console.log(`calling broadcast with -${message.payload}-`);
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
        // this._socket = this._createSocket();
        this._socket = this._createSocket();

        this._socket.bind(this._port, () => 
        {
            if(callback !== undefined)
                callback(this._port);

        });

    }

    public shutdown(callback?: () => void) 
    {
        if (this._socket !== undefined)
            this._socket.close(); 
        this._socket = undefined; // close can't have new connections

        if (callback !== undefined) 
            callback();


        if(callback !== undefined)
            console.log("server closing");
    }
}