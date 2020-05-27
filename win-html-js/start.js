const {ipcRenderer, remote} = require('electron')

function begin() {
    ipcRenderer.send('asynchronous-message','ok')
}

function minmaxclose(operator) {
    switch(operator) {
        case 0:
            remote.getCurrentWindow().minimize()
            break
        case 1:
            if(remote.getCurrentWindow().isMaximized())
            remote.getCurrentWindow().unmaximize()
            else 
            {remote.getCurrentWindow().maximize()}
            break
        case 2: 
            remote.getCurrentWindow().close()
    }
}