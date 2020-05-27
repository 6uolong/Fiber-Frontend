// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const fs = require('fs')
const {remote, shell} = require('electron')
const Viz = require('viz.js')
const { Module, render } = require('viz.js/full.render.js')
const { exec, execSync } = require('child_process')
const yaml = require('js-yaml')
const path = require('path')

// if(process.env.path.search('mingw64\\\\bin') == -1) {

//     mingwPath = path.join(__dirname,'backend\\mingw\\mingw64\\bin')

//     execSync('setx path \"'+ mingwPath + ';%path%\"')

// }     //Windows使用 

let inputPath = ''
let outputPath = ''
let srcFileCount = 0
let element = layui.element
let slider = layui.slider
let jcpercentage = 20
let scpercentage = 100
let sliderOne = slider.render({
    elem: '#jc-percentage',
    step: 5,
    value: 20,
    change: (value) => {
        jcpercentage = value
    }
})
let sliderTwo = slider.render({
    elem: '#sc-percentage',
    step: 5,
    value: 100,
    change: (value) => {
        scpercentage = value
    }
})

function showHappyGithub() {
    shell.openExternal('https://github.com/pcy190')
}

function showSadGithub() {
    shell.openExternal('https://github.com/sadmess')
}

function chooseFilePath(pathType) {
    if(!pathType) {
        remote.dialog.showOpenDialog({
            title: '选择C/C++源文件所在目录',
            properties: ["openDirectory"]
        }).then(result => {
            if(result.filePaths[0] != null) {
                document.getElementById('src').value = result.filePaths[0]  
                inputPath = result.filePaths[0]  
            } 
        })
    } else {
        remote.dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: '选择文件输出路径'
        }).then(result => {
            if(result.filePaths[0] != null) {
                document.getElementById('dst').value = result.filePaths[0]
                outputPath = result.filePaths[0]
            }
        })
    }
}

function seePictures(picpath = '') {
    hideOthers()
    if(picpath != '') {
        let picContenet = fs.readFileSync(picpath,{encoding: 'utf-8'})
        let viz = new Viz({ Module, render })   
        viz.renderImageElement(picContenet).then(element => {
            document.getElementById('main').appendChild(element)
            // alert('render images successfully!')
            element.setAttribute('id','dotpic')
            cW = element.width/10
            cH = element.height/10
            element.width += cW
            element.height += cH
            element.onwheel = (e) => {
                if(e.deltaY < 0) {
                    element.width -= cW
                    element.height -= cH
                } else {
                    element.width += cW
                    element.height += cH
                }
            }
            
        })
    } else {
        remote.dialog.showOpenDialog({
            title: '选择dot格式图片以进行查看',
            filters: [{name:'dotPictures',extensions:['dot']}]
        }).then(dotpic => {
            if(dotpic.filePaths[0] != null) {
                let picContenet = fs.readFileSync(dotpic.filePaths[0],'utf-8')
                let viz = new Viz({ Module, render })   
                viz.renderImageElement(picContenet).then(element => {
                    document.getElementById('main').appendChild(element)
                    // alert('render images successfully!')
                    element.setAttribute('id','dotpic')
                    cW = element.width/10
                    cH = element.height/10
                    element.width += cW
                    element.height += cH
                    element.onwheel = (e) => {
                        if(e.deltaY < 0) {
                            element.width -= cW
                            element.height -= cH
                        } else {
                            element.width += cW
                            element.height += cH
                        }
                    }
                    
                })
            }  
        })
    }    
}

function hideOthers() {
    let main = document.getElementById('main')   
    let compileConfig = document.getElementById('compile-config')
    if(compileConfig != null) {
        compileConfig.style.display = 'none'
    }
    let pic = document.getElementById('dotpic')
    if(pic != null) {
        main.removeChild(pic)
    }
    let virtdoc = document.getElementById('virt-doc')
    if(virtdoc != null) {
        virtdoc.style.display = 'none'
    }
    let obfuscatedoc = document.getElementById('obfuscate-doc')
    if(obfuscatedoc != null) {
        obfuscatedoc.style.display = 'none'
    }
    let antidebugdoc = document.getElementById('antidebug-doc')
    if(antidebugdoc != null) {
        antidebugdoc.style.display = 'none'
    }
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

function showAntidebugdoc() {
    hideOthers()
    document.getElementById('antidebug-doc').style.display = 'block'
}

function showVirtdoc() {
    hideOthers()
    document.getElementById('virt-doc').style.display = 'block'
}

function showObfuscatedoc() {
    hideOthers()
    document.getElementById('obfuscate-doc').style.display = 'block'
}


function showComplieConfig() {
    hideOthers()
    document.getElementById('compile-config').style.display = 'block'
}

function createConfigfile() { 
    let configPath = path.join(__dirname,'fiber.yaml')
    let myYaml = yaml.safeLoad(fs.readFileSync(configPath,'utf-8'))
    let whitedata = document.getElementById('WhiteFilter').value
    if(whitedata != '') {
        myYaml.WhiteFilter[0] = whitedata
    }
    let blackdata = document.getElementById('BlackFilter').value
    if(blackdata != '') {
        myYaml.BlackFilter[0] = blackdata
    }
    myYaml.FiberVirtualization.enable = document.getElementsByName('switch')[0].checked
    document.getElementsByName('mode').forEach(element => {
        if(element.checked == true) {
            myYaml.FiberVirtualization.mode = parseInt(element.value)
        }
    })
    let mySelect = document.getElementById('FiberProtectLevel')
    let myIndex = mySelect.selectedIndex
    myYaml.FiberProtectLevel = parseInt(mySelect.options[myIndex].value)
    myYaml.FiberVirtualization.encrypt = document.getElementsByName('switch')[1].checked
    myYaml.FiberVirtualization.embed = document.getElementsByName('switch')[2].checked
    myYaml.FiberVirtualization.split = document.getElementsByName('switch')[3].checked
    myYaml.FiberJunkCode = document.getElementsByName('switch')[4].checked
    myYaml.FiberExtractFunction = document.getElementsByName('switch')[5].checked
    myYaml.FiberStringConcealment.enable = document.getElementsByName('switch')[6].checked
    myYaml.FiberStringConcealment.strict = document.getElementsByName('switch')[7].checked
    myYaml.FiberIndirectGV = document.getElementsByName('others')[0].checked
    myYaml.FiberSubstitution = document.getElementsByName('others')[1].checked
    myYaml.FiberIndirectCall = document.getElementsByName('others')[2].checked
    myYaml.FiberRandCallConvention.enable = document.getElementsByName('others')[3].checked
    myYaml.AntiDebugPlugin.enable = document.getElementsByName('switch')[8].checked
    myYaml.FiberJunkCodePercentage = jcpercentage
    myYaml.FiberStringConcealment.percentage = scpercentage
    let tmp = 1
    document.getElementsByName('antidebug').forEach(element => {
        if(element.checked == true) {    
        myYaml.AntiDebugPlugin.level += tmp
        tmp *= 2
        }
    })
    let configStr = yaml.safeDump(myYaml)
    fs.writeFileSync('MyConfig.yaml',configStr)  //在源文件所在路径生成设置文件

}

function compile() {

    if(document.getElementById('src').value == '') {
        alert('请选择源文件位置')
        return
    }
    if(document.getElementById('dst').value == '') {
        alert("请选择输出文件路径")
        return
    } 
    process.chdir(inputPath)

    createConfigfile()
    document.getElementById('progress-bar').style.display = 'block'
    let progress = 0 
    let shellString = ''
    soPath = path.join(__dirname,'backend/bin')
    shellString += 'export LD_LIBRARY_PATH=' + soPath + ' && '
    let clangPath = path.join(__dirname,'backend/bin/clang-9')
    shellString += clangPath
    shellString += ' -mllvm -fiber-enable -mllvm -fiber-cfg=MyConfig.yaml'
    fs.readdirSync(inputPath).forEach(element => {
        if(element.endsWith('cpp') || element.endsWith('c')) {
            let srcCode = fs.readFileSync(element,'utf-8')
            if(document.getElementsByName('antidebug')[0].checked == true) {
                if(srcCode.search(/#define\s*__HAPPYSADPROTECTED__/) == -1 && srcCode.search(/int\s*main\(/) != -1) {
                    srcCode = srcCode.replace(/int main\(\D*?\)\s*{/,'extern "C" int antidebug(int args);\n#define __HAPPYSADPROTECTED__\nint main(int argc,char** argv){antidebug(63);')
                    fs.writeFileSync(element,srcCode,{flag: 'w'})
                }
            }
            else {
                if(srcCode.search(/#define\s*__HAPPYSADPROTECTED__/) != -1 && srcCode.search(/int\s*main\(/) != -1) {
                    srcCode = srcCode.replace(/extern\s*"C"\s*int\s*antidebug\(int\s*args\);/,'')
                    srcCode = srcCode.replace(/#define\s*__HAPPYSADPROTECTED__/,'')
                    srcCode = srcCode.replace('antidebug\(63\);','')
                    fs.writeFileSync(element,srcCode,{flag: 'w'})
                }
            }
            srcFileCount++
            shellString += ' '
            shellString += element
        }
    })
    if(document.getElementsByName('antidebug')[0].checked == true) {
        shellString += ' ' + path.join(__dirname,'antidebug.a')
    }
    shellString += ' -I '
    shellString += path.join(__dirname,'backend/include')
    shellString += ' -o '
    shellString += outputPath
    shellString += '/App'
 
    let compiler = exec(shellString)
    alert(shellString)
    compiler.stderr.on('data', info => {
        alert(info)
        if(info.search(/Running Fiber:/) != -1) {
            progress++
            element.progress('progress-bar',String(progress*100/srcFileCount)+'%')
            if(progress == srcFileCount) {
                progress = 0
                srcFileCount = 0
                document.getElementById('progress-bar').style.display = 'none'
            }
        }
    })
    compiler.stdout.on('data', info => {
        alert(info)
        if(info.search(/Running Fiber:/) != -1) {
            progress++
            element.progress('progress-bar',String(progress*100/srcFileCount)+'%')
            if(progress == srcFileCount) {
                progress = 0
                srcFileCount = 0
                document.getElementById('progress-bar').style.display = 'none'
            }
        }
    })
    compiler.on('close',() => {
        document.getElementById('progress-bar').style.display = 'none'
        seePictures('main.dot')
        alert('done')
    })
}