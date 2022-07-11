import { Address } from "./Interfaces";

export class Client {
    private _id: number;
    private _username: string;
    private _socket; // ud4 socket // TODO: is there a type? put it there
    private _server: Address; 

    Client(id: number, username: string) {
        this._id = id;
        this._username = username
    }

    connect(server?: Address): Promise<Address> {
        if (server === undefined) {
            server = {
                ip: "localhost",
                port: 8000
            }
        }

        return new Promise<Address>((resolve, reject) => {
            this._socket.connect(server.port, server.ip)
                .then((obj) => resolve(obj))
                .catch((err) => reject(err));
        });
    }

    disconnect(): Promise <any> {
        return new Promise<any>((resolve, reject) => {
            this._socket.disconnect()
                .then(res => resolve(res))
                .catch(err => reject(err));
        })
    }

    send(message: string, to: number): Promise <any> {
        return new Promise<any>((resolve, reject) => {
            resolve("ok")
        })

    }

    broadcast(message: string): Promise <any> {
        return new Promise<any>((resolve, reject) => {
            resolve("ok")
        })
    }
}