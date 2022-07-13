import { Address, IMessage, MessageType } from "./Interfaces";
import * as dgram from "dgram";
export default class Client {
    private _id: number;
    private _username: string;
    private _socket: dgram.Socket; // ud4 socket
    private _server: Address; 

    constructor(id: number, username: string) 
    {
        this._id = id;
        this._username = username
    }

    connect(server?: Address): Promise<Address> 
    {
        if(this._socket === undefined) {
            this._socket = dgram.createSocket("udp4");
            this._socket.on("listening", () => 
            {
                console.log("client is listening");
            });

            this._socket.on("message", (msg, rinfo) =>
            {
                console.log(`client got: ${msg} from ${rinfo.address}:${rinfo.port}`);
            });
        }

        if(server === undefined) {
            server = {
                ip: "localhost",
                port: 8000
            }
        }
        this._server = server; 

        return new Promise<Address>((resolve, reject) => 
        {
            const message: IMessage = {
                type: MessageType.REGISTRATION,
                source: {
                    id: this._id,
                    username: this._username
                }
            }
            const payload = JSON.stringify(message);
            // resolve(this._server);
            this._socket.send(payload, 0, payload.length, this._server.port, this._server.ip, (err, _) => 
            {
                if(err)
                    reject(err);
                else 
                    resolve(this._server);
            });
        });
    }

    disconnect(): Promise<any> 
    {
        // console.log("i am disconnecting"); // DEBUG
        return new Promise<any>((resolve, reject) => 
        {
            if(this._socket === undefined) {
                // console.log("i resolved undefined"); // DEBUG
                resolve("Socket is disconneted");
            }

            const message: IMessage = {
                type: MessageType.LEAVE,
                source: {
                    id: this._id,
                    username: this._username
                }
            }

            const payload = JSON.stringify(message);
            // console.log("i am sending payload to disconnect to", this._server); // DEBUG
            this._socket.send(payload, 0, payload.length, this._server.port, this._server.ip, (err, _) => 
            {
                if(err)
                    reject(err);
                else 
                {
                    // console.log("closing socket"); // DEBUG
                    this._socket.close();
                    this._socket = undefined;
                    resolve(0);
                }
            });
        })
    }

    send(message: string, to: number): Promise <any> 
    {
        return new Promise<any>((resolve, reject) => 
        {
            const msg: IMessage = {
                type: MessageType.MESSAGE,
                source: {
                    id: this._id,
                    username: this._username
                },
                destination: to,
                payload: message
            }
            const payload = JSON.stringify(msg);

            this._socket.send(payload, 0, payload.length, to, this._server.ip, (err, _) => 
            {
                if (err)
                    reject(err);
                else
                    resolve(0);
            })
        })
    }

    broadcast(message: string): Promise<any> 
    {
        const msg: IMessage = {
            type: MessageType.BROADCAST,
            source: {
                id: this._id,
                username: this._username
            },
            payload: message
        }
        const payload = JSON.stringify(msg);
        return new Promise<any>((resolve, reject) => 
        {
            this._socket.send(payload, 0, payload.length, this._server.port, this._server.ip, (err, _) => 
            {
                if (err)
                    reject(err);
                else
                    resolve(0);
            })
        })
    }
}