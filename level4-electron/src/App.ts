import * as net from 'net';
import { app, BrowserWindow, ipcMain, ipcRenderer} from 'electron';

export class App {
    private _server: net.Server; 
    private _client: net.Socket;
    private _connections: net.Socket[] = [];
    private _win: BrowserWindow;

    constructor() {
        this._server = new net.Server();
        this._client = new net.Socket();

        this._server.on('close', (data) => {
            console.log(data);
        });

        this._server.on('error', (err) => {
            console.log(err);
        });

        this._server.on('connection', (socket) => { 
            this._connections.push(socket);
            socket.on('data', (data) => {
                this._win.webContents.send('file_received', 
                    `received data from ${socket.remoteAddress}:${socket.remotePort}`);

                // handleData(data); // :D gestisci i dati che ricevi suvvia!
            });
            console.log("got a connection")
        });

        this._server.on('listening', () => {
            var data: net.AddressInfo = this._server.address() as net.AddressInfo;
            console.log(`listening on some random port, ${data.port}`);
        });
    }

    // TODO: usa un interfaccia per il messaggio
    private _sendMessage(message): Promise<string> {
        const host: string = message.host; 
        const port: number = message.port;
        const messageToSend: Buffer = message.file;
        return new Promise((resolve, reject) => {
            if (host === undefined || port === undefined || messageToSend === undefined) {
                reject('invalid message');
            }

            this._client.connect(port, host, () => {
                this._client.write(messageToSend);
                this._client.on('data', (data) => {
                    resolve(data.toString());
                });
            });
        });
    }

    listen() {
        const createWindow = () => {
            this._win = new BrowserWindow({
                width: 800,
                height: 600,
                // TODO disable nodeIntegration later for security reasons
                // https://www.electronjs.org/docs/latest/tutorial/security
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false
                }
            })
            
            // TODO: is there better way to load the index.html file
            this._win.loadFile('../resources/index.html')
        }
        
        // TODO: aggiungi connessione client e server ad ognuna delle window
        app.whenReady().then(() => {
            createWindow()
        })

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit()
            }
        })

        ipcMain.handle("send", async (event, message) => {
            const result: string = await this._sendMessage(message);
            console.log(`Received from frontend: ${message}`)
            return result;
        })

        ipcMain.handle("get_listening_port", () => {
            console.log(`return the port number`)
            const addr = this._server.address();
            var data; 
            if(typeof addr === 'string') {
                data = addr;
            } else {
                data = addr.port;
            }
            return JSON.stringify({port: data});
        })

        this._server.listen(() => {
            console.log('server listening');
        });
    }
}