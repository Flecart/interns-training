let { ipcRenderer } = require("electron");
let { ipcMain } = require("electron");
var fs = require("fs");

async function setListeningPort() {
    let listening_port = document.getElementById("listening_port");
    let ans = await ipcRenderer.invoke("get_listening_port");
    ans = JSON.parse(ans);
    if (ans["port"] !== undefined) {
        listening_port.textContent = ans["port"];
    }

    console.log('DOM fully loaded and parsed', ans);
}

async function setSubmitHandler() {
    let submitButton = document.getElementById("submit_button")
    submitButton.onclick = async () => {
        let host = document.getElementById("host")
        let input = document.getElementById("port")
        let file = document.getElementById("file_input")
        let response = document.getElementById("response")
        
        if (file.files.length !== 1) {
            console.log(`cant upload ${file.files.length} files, just one please`)
            return; 
        }

        let host_value = host.value;
        host.value = "";
        let input_value = input.value;
        input.value = "";
        const payload = {
            "host": host_value,
            "port": input_value,
            "file": fs.readFileSync(file.files[0].path)
        }
        let responseText = await ipcRenderer.invoke("send", payload);
        response.textContent = responseText;
    }
}

function setFilesHandler() {
    const fileSelector = document.getElementById('file_input');
    fileSelector.addEventListener('change', (event) => {
        const fileList = event.target.files;
        console.log(fileList);
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    setListeningPort();
    setSubmitHandler();
    setFilesHandler();

    ipcRenderer.on("file_received", (event, arg) => {
        let response = document.getElementById("response")
        response.textContent = arg;
    })
});

// form.addEventListener("submit", async (e) => {
//     e.preventDefault()
// })