import * as net from 'net';
import { app, BrowserWindow} from 'electron';
export class App {
    private _server: net.Server; 

    constructor() {
        this._server = new net.Server();
        this._server.on('close', (data) => {
            console.log(data);
        });

        this._server.on('error', (err) => {
            console.log(err);
        });

        this._server.on('connection', (socket) => { 
            console.log(socket);
        });

        this._server.on('listening', (data) => {
            console.log(`listening on some random port, ${data}`);
        });
    }

    listen() {
        const createWindow = () => {
            const win = new BrowserWindow({
              width: 800,
              height: 600
            })
            // TODO: better way to load the index.html file
            win.loadFile('../resources/index.html')
        }
        
        app.whenReady().then(() => {
            createWindow()
        })

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit()
            }
        })
        this._server.listen(3000);
    }
}