import {
    Engine, World, Bodies, Events, Collision, Constraint, engine, Body, world,
    config, global, worker, drawingWorker, cachedImages,
    audio,
    playAudio
} from './setup.js'
import elements, { max, あ } from './dom.js'

const c = color;
window.loaded = false
window.d = drawingWorker
drawingWorker.addEventListener('message', imagerecieved)
window.n = cachedImages
Elem.logLevels.error = true
if (window.OffscreenCanvas) {
    global.supportsOffscreenCanvas = true
    worker.addEventListener('message', msg => {
        let oldData = msg.data.old
        let newData = msg.data.new
        let improved = URL.createObjectURL(newData)
        Entity.toSpawn.get(oldData).imgSrc = improved
    })
}

function waitForFrames(callback, frames, label, pauseDuringCutscene) {
    if (frames !== Math.round(frames)) throw TypeError('Expected int, instead got float')
    let out = {
        time: frames,
        label: label,
        execute: callback,
        pauseDuringCutscene: pauseDuringCutscene
    }
    if (!callback) {
        console.warn('No callback provided')
    }
    cam.delays.add(out)

}

let startmenu = document.getElementById('startmenu')

const Del = function (num) {
    let foundYou = Entity.toSpawn.get(+num)

    /*for (let o of Entity.toSpawn) {
        if (o.id === +num) {
            foundYou = o
            break
        }
    }*/
    Entity.toSpawn.delete(foundYou.id)
    あ.allElements.forEach(o => {
        if (o.name === foundYou.id) {
            this.kill()
        }
    })

},

    spawnAllOfTheMarbles = () => {
        for (let o of Entity.toSpawn.values()) {
            o.restitution = +あ.$('#bounciness').value
            new Marble(o)
        }
    },
    killAllOfTheMarbles = () => {
        for (let o of Entity.all.values()) {
            if (o.CREATOR === Marble) {
                o.kill()
            }
        }
    }
    , Spawn = function (mx) {
        let foundYou = Entity.toSpawn.get(+mx)
        /*for (let o of Entity.toSpawn) {
            if (o.id === num) {
                foundYou = o
                break
            }
        }*/
        // foundYou.img = new Image()
        foundYou.img.src = foundYou.imgSrc
        foundYou.restitution = +あ.$('#bounciness').value
        new Marble(foundYou)
    },
    addMarble = function (settings) {
        let params = { Name: settings?.Name, restitution: +あ.$('#bounciness').value, size: 30, x: (-cam.x / cam.zoom + canvas.width / 2) + (Math.random() * 100 * ran.choose(1, -1)), y: (-cam.y / cam.zoom + canvas.height / 2) + (Math.random() * 100 * ran.choose(1, -1)) /*img: Entity.Images[1]*/ }

        let me = new Marble(params)
        me.imgSrc = settings?.imgSrc ?? ''
        me.img = new Image()
        me.img.src = me.imgSrc
        new Elem({ tag: 'div', id: 'brb' + me.id, style: 'border: 5px solid #28a745; border-radius: 10px;' }).append(Elem.$('#allMarbles'))

        new Elem({ tag: 'div', style: 'display:inline-flex;margin: 10px;', id: `top${me.id}`, parent: 'brb' + me.id })
        let inp = new Elem({
            parent: 'top' + me.id,
            tag: 'input', value: me.Name, placeholder: 'Name', id: `shh${me.id}`, name: me.id, events: [
                ['focusout', findMarble]
            ]
        })
        //  new Elem({ tag: 'div', class: ['separate'], id: `div${me.id}`, parent: $search('#allMarbles') })

        new Elem({
            name: me.id, tag: 'input', type: 'file', accept: ".png, .jpeg, .jpg, .webp", events: [
                ['change', function (data) {
                    let reader = new FileReader()
                    reader.readAsDataURL(data.target.files[0])
                    reader.onload = (f) => {
                        let foundYou = Entity.toSpawn.get(+this.name)
                        /*for (let o of Entity.toSpawn) {
                            if (o.id === +this.name) {
                                foundYou = o
                                break
                            }
                        }*/
                        foundYou.img = new Image()
                        foundYou.img.src = f.target.result
                        foundYou.imgSrc = foundYou.img.src
                        foundYou.customImage = true
                        Elem.$('#mrbl' + this.name).content.value = foundYou.imgSrc
                        cam.sendmessage('Upload successful!#00FF00')
                    }
                }]
            ]
        })
        /*   $("#allMarbles").append(`<input name='${me.id}'type='file' id='mrbl${me.id}'>`)
           $(`#mrbl${me.id}`)[0].addEventListener("change", function (o) {
               let reader = new FileReader();
               reader.readAsDataURL(o.target.files[0]);
               reader.onload = (f) => {
   
                   let foundYou = null
                   console.log(this)
                   for (let o of Entity.toSpawn) {
                       if (o.id === +this.name) {
                           foundYou = o
                           break
                       }
                   }
                   foundYou.img = new Image()
                   foundYou.img.src = f.target.result
                   foundYou.customImage = true
                   //showData(global.current)
               }
           })*/
        new Elem({ tag: 'div', style: 'display:inline-flex;margin: 10px;', parent: 'brb' + me.id, id: `bottom${me.id}` })
        new Elem({
            tag: 'input',
            name: `${me.id}`,
            type: 'url',
            id: `mrbl${me.id}`,
            placeholder: 'ImageUrl or file',
            value: `${me.imgSrc ?? ''}`,
            events: [['focusout', findMarbleImage]],
            parent: 'bottom' + me.id
        }).hide()
        inp = inp.content
        //    $("#allMarbles").append(inp)
        let random = new ran.Randomizer
        new Elem({
            parent: `top${me.id}`,
            tag: 'button', name: `${me.id}`, id: `spawn${random[0]}`, events: [
                ['click', () => spawnEvent(me.id)]
            ], text: 'Spawn', class: ['good', 'thin']
        })
        new Elem({
            parent: `bottom${me.id}`,
            tag: 'button', name: `${me.id}`, id: `Del${random[1]}`, events: [
                ['click', function () { deleteEvent(me.id); Elem.$('#brb' + me.id).killChildren().kill(); }]
            ], text: 'Delete', class: ['bad', 'thin']
        })


        let change = new あ({
            parent: あ.$(`#top${me.id}`), tag: 'input', type: 'file', accept: ".png, .jpeg, .jpg, .webp", events: {
                change(o) {
                    let reader = new FileReader()
                    reader.readAsDataURL(o.target.files[0])
                    let my = Entity.toSpawn.get(+me.id)
                    reader.onload = (o) => {
                        my.img = new Image()
                        my.img.src = o.target.result
                        my.imgSrc = o.target.result
                        あ.$('#mrbl' + me.id).content.value = my.img.src
                    }
                }
            }
        })
        change.hide()


        new あ({
            tag: 'button', class: ['good', 'thin'], parent: あ.$(`#top${me.id}`), text: 'Upload Image', events: {
                click() {
                    change.content.click()
                }
            }
        })
        me.kill()
        Entity.toSpawn.set(me.id, { Name: me.Name, shape: "circle", size: 30, id: me.id, img: me.img, game: true, imgSrc: me.imgSrc })
    }
function fill(color) {
    let old = ctx.fillStyle
    ctx.fillStyle = color ?? old
    ctx.fill()
    ctx.fillStyle = old
}
function stroke(color) {
    let old = ctx.strokeStyle
    ctx.strokeStyle = color ?? old
    ctx.stroke()
    ctx.strokeStyle = old
}
function shapeToImage(ball) {
    const c = new Elem({ tag: 'canvas' }).content
    c.width = 200
    c.height = 200
    const cc = c.getContext("2d")
    cc.fillStyle = ball.color
    cc.strokeStyle = ball.dark
    cc.lineWidth = ctx.lineWidth
    cc.beginPath()
    cc.arc(c.width / 2, c.height / 2, c.width / 2.05, 0, Math.PI * 2)
    cc.fill()
    cc.stroke()
    ball.img ??= new Image()
    ball.img.src = ball.imgSrc = c.toDataURL("image/png")
    ball.customImage = true
}
const bounds = {
    x: 3000,
    y: 3000,
    get center() {
        return { x: this.x / 2, y: this.y / 2 }
    }
}, save = function () {
    global.editorMode || startGame()
    let arr = []
    let images = new Set
    arr.push({
        bounciness: あ.$('#bounciness').value,
        title: utilString.shorten(_('title').value, max.title), 
        author: utilString.shorten(_('author').value, max.author)
        /*camBehaviour: $('#camBehaviour')[0].value,*/
    })
    for (let o of Entity.all.values()) {
        if (!o.canBeSaved) {
            continue
        }
        switch (o.CREATOR.name) {
            case 'Wall':
            case 'Blade': {
                delete o.start.interval
            }
        }
        delete o.start.dark
        if (o.start.opacity === 1) {
            delete o.start.opacity
        }
        delete o.start.img

        if (!o.start.imgSrc && o.start.imgSrc!=='0' || !o.start.imgSrc.startsWith('data')) {
            delete o.start.imgSrc
        } 
        if (o.start.Name?.includes?.(o.CREATOR.name)) {
            delete o.start.Name
        }
        if (o.start.restitution === 0) {
            delete o.start.restitution
        }
        if (o.start.size === o.CREATOR.defaultSize) {
            delete o.start.size
        }
        if (o.start.width === o.CREATOR.defaultWidth || o.start.width == null) {
            delete o.start.width
        }
        if (o.start.height === o.CREATOR.defaultHeight || o.start.height == null) {
            delete o.start.height
        }
        if (o.start.color === o.CREATOR.defaultColor) {
            //      delete o.start.color
        }
        //console.log(o)
        //    o.start.imgSrc = o.start.img.src
        //     delete o.start.img 
        if (o.CREATOR.name === 'Marble') {
            continue
        }
        let info = o.start
        for (let o in info) {
            if (info[o] == undefined || /*(o.match(/restitution|friction/)) ||*/ o === 'img' || o == null || (o === 'imgSrc' && info[o] === location.href || info[o] === location.href + 'undefined' || info[o] === '')) {
                delete info[o]
            }
        }
        arr.push([info, o.CREATOR.name])
    }

    for (let o of Entity.toSpawn.values()) {
        if ('restitution'in o) continue
        if (o.size === Marble.defaultSize) {
            delete o.size
        }
        if (o.shape === Marble.defaultShape) {
            delete o.shape
        }
        if (o.imgSrc) {
           images.add(o.imgSrc)
        o.imgSrc = images.size
        }
        delete o.img
        arr.push(o)
    }
    arr[0].images = [...images]
    let output = JSON.stringify(arr)
    あ.$('#textData').content.value = output
    let blob = new Blob([output], { type: 'text/plain;' })
    const tempurl = URL.createObjectURL(blob)
    const regex = /[^a-z0-9_]/gi;
    let anchor = new Elem({ tag: 'a', href: tempurl, download: Elem.$('#title').content.value.replace(regex, '').replaceAll(' ', '_') })
    Elem.$('#textData').content.value = output
    anchor.content.click()
    anchor.kill()
    URL.revokeObjectURL(tempurl);
    Elem.$('#textData').value = ''
}, Load = function (information) {
    global.editorMode || startGame()

    try {
        let data;
        if (information) {
            if (typeof information == 'string') {
                data = JSON.parse(information)
            }
            else data = information
        }
        else {
            data = JSON.parse(あ.$("#textData").content.value)

        }
        Entity.toSpawn.clear()
        if (data[0].title) {
            Elem.$('#levelTitle').textContent = utilString.shorten(data[0].title, max.title)
            document.title = `${data[0].title} - Marbles`
        }
        if (data[0].author) {
            console.log(data)
            Elem.$('#authorName').textContent = `by ${utilString.shorten(data[0].author, max.author)}`
        }
        ;[Entity.all, Entity.toSpawn, Entity.graveyard, Entity.gameSpawns, Entity.temporarilyDead].forEach(o => o.clear())
        あ.$('#allMarbles').killChildren()
        for (let o of Matter.Composite.allBodies(world)) {
            World.remove(world, o)
        }
        for (let item of data) {
            //console.log(item)
            // console.log(item[0], item[1])

            if ('bounciness' in item) {
                あ.$('#bounciness').value = item['bounciness']
                //$('#camBehaviour')[0].value = item.camBehaviour
                Elem.$('#title').content.value = item.title

                continue
            }
          
            if ('game' in item) {
                if (!item.imgSrc) {
                    delete item.img
                    delete item.imgSrc
                } else {
                    if (!isNaN(+item.imgSrc)) {
                        item.imgSrc = data[0].images[item.imgSrc-1]
                    }
                }
                if (item.imgSrc && global.supportsOffscreenCanvas) {
                    worker.postMessage({ image: item.imgSrc, id: item.id })
                }
                new あ({ parent: あ.$('#camBehaviour'), tag: 'option', value: item.Name, text: item.Name })
                addMarble(item)
                continue
            }
            let inputargs = item[0]
            //inputargs.height = item[2].height ?? item[2].start.height
            //inputargs.width = item[2].width ?? item[2].start.width
            inputargs.img = new Image()
            // inputargs.img.src = inputargs.imgSrc
            try {
                let x = new Entity.allClasses[item[1]](inputargs)
                x.start = inputargs
            }
            catch (e) {
                console.log(item[1])
            }
        }
        for (let o of Entity.toSpawn.values()) {
            if (o.imgSrc && o.img?.src !== o.imgSrc) {
                Entity.toSpawn.delete(o.id)
            }
        }
        Elem.$('#textData').content.value = ''

    }
    catch (e) {
        cam.sendmessage('Check logs please :(#FF0000')
        Elem.$('#textData').content.value = ''
        if (global.playingLevel) {
            _('levelTitle').textContent = 'Error'
            _('levelTitle').styleMe({ color: 'darkred' })
            _('authorName').kill()
            let n = _('gameStartButton');
            _('gameSettings').kill()
            n.addevent({ click() { location.reload() } })
            n.textContent = 'Reload?'
        }
        throw e
    }
}, menu = function (type) {
    [あ.$('#data'), あ.$('#data2'), あ.$('#data3'), あ.$('#data4')].forEach(o => o.addClass('hidden'))
    あ.$(`#${type}`).removeClass('hidden')

}, deleteFrom = (o) => {
    if (!global.editorMode) {
        return cam.sendmessage("Exit play mode first!!!#ff0000")
    }
    else {
        playAudio({ src: 'pop.mp3' })
        o.kill()
        showData()
    }

}
for (let [key, id] of [["data2", "put"], ["data", "edit"], ["data3", "marble"]]) {
    あ.$(`#${id}`).addevent({
        click() {
            global.select = id
            menu(key)
        }
    })

}
for (let [id, event] of [
    ["marbleAdder", addMarble],
    ["spawnImmediately", spawnAllOfTheMarbles],
    ["killAll", killAllOfTheMarbles],
    ["startButton", startGame],
    ["saveButton", save],
]) {
    Elem.$(`#${id}`).addevent(['click', event])
}

{
    let r = new ran.Randomizer
    let naMes = [`block:${r[1]}`, `motor:${r[2]}`, `spawner:${r[4]}`, `wind:${r[5]}`, `moveableWall:${r[6]}`, `circle:${r[7]}`, `ball:${r[8]}`, `goal:${r[9]}`, `portal:${r[10]}`]
    let gtrmnythr = Elem.$('#buttonholder')
    let events = [() => global.chosenEntity = 'Block', () => global.chosenEntity = 'Motor', () => global.chosenEntity = 'Spawner', () => global.chosenEntity = 'WindZone', () => global.chosenEntity = 'Movable Wall', () => global.chosenEntity = 'Circle', () => global.chosenEntity = 'Ball', () => global.chosenEntity = 'Goal', () => global.chosenEntity = 'Portal']
    for (let i = 0, {length} = naMes; i < length; ++i) {
        let me = new Elem({
            tag: 'button', class: ['good', 'thin'], id: naMes[i].replace(':',''), text: utilString.upper(naMes[i].split(':')[0]), events: [
                ['click', function(){
                    events[i]()
                    naMes.forEach(o=>{
                        _('buttonholder').children.forEach(o=>{
                            o.styleMe({color:'grey'})
                        })
                    })
                    this.styleMe({color:'white'})
                }]
            ]
        })
        me.append(gtrmnythr)
    }
    _(`block${r[1]}`).content.click()
}

function place(entity) {
    let baby;
    if (entity.includes("Block")) {
        baby = new Wall({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), width: 30, height: 30, isStatic: true })
    }
    if (entity.includes("Goal")) {
        baby = new Goal({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), width: 30, height: 30, isStatic: true })
    }
    if (entity.includes("Movable Wall")) {
        baby = new MoveableWall({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), width: 30, height: 30, isStatic: false })
    }
    if (entity.includes("Circle")) {
        baby = new Circle({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), size: 30, isStatic: true })
    }
    if (entity.includes("Ball")) {
        baby = new Ball({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), size: 30, isStatic: false })
    }

    /*if (entity.includes("Beam")) {
        let baby = new Beam({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.red, height: 15, width: 70 * (modifier), isStatic: true })
        global.current = baby
        showData(baby)

    }*/
    if (entity.includes("Motor")) {
        baby = new Blade({ frictionAir: 0, x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.yellow, size: 100, isStatic: false })
    }
    if (entity.includes("Cam")) {
        baby = new Cam({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.gray })
    }
    if (entity.includes("Portal")) {
        baby = new Portal({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom) })
    }
    if (entity.includes("Spawner")) {
        baby = new Spawner({ width: 100, height: 100, x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.gray, shape: "circle" })
    }
    if (entity.includes("WindZone")) {
        baby = new WindZone({ height: 50, width: 50, x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.gray, shape: "circle" })
    }
    if (baby) {
        playAudio({ src: 'click.mp3' })
        global.current = baby
        showData(baby)
    }
}
const canvas = Elem.$('#can'),
    ctx = canvas.content.getContext('2d');
canvas.width = canvas.content.width
canvas.height = canvas.content.height
const cam = {
    x: 0,
    y: 0,
    sendmessage(o) {
        let m = _('message')
        m.anim({ class: ['fade-in-top'] }, () => m.anim({ class: ['fade-out-top'] }))
        let col = o.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)
        if (col) {
            o = o.replace(col[0], "")
            m.styleMe({ 'background-color': col[0] })

        }

        m.children[0].textContent = o
    },
    firstPlace: null,
    frozen: false,
    cutscene: {
        enabled: true,
        firstPlace: false,
    },

    freeze() {
        this.frozen = true;
        let lastFollowing = this.following
        this.following = this.firstPlace
        let lastzoom = cam.targetZoom
        cam.targetZoom = 1.2
        let bodiesToFreeze = new Set
        let lastx = cam.x,
            lasty = cam.y;
        [...Entity.all.values()].forEach(o => {
            if (!o.isStatic) {
                bodiesToFreeze.add(o)
            }
        })
        bodiesToFreeze.forEach(o => {
            let あ = Body.getVelocity(o)
            o.temp = {
                vx: あ.x,
                vy: あ.y,
                av: Body.getAngularVelocity(o)
            }
            Body.setStatic(o, true);
        })
        waitForFrames(() => {
            cam.cutscene.firstPlace = cam.following
            cam.cutscene.firstPlace.victory()
            waitForFrames(() => {
                if (!Entity.getAllMarbles.length && !Entity.gameSpawns.size) {
                    return
                }
                this.frozen = false

                if (cam.behaviour !== 'free') {
                    this.following = lastFollowing
                } else {
                    cam.x = lastx
                    cam.y = lasty
                }
                cam.targetZoom = lastzoom
                bodiesToFreeze.forEach(o => {
                    Body.setStatic(o, false);
                    Body.setVelocity(o, { x: o.temp.vx, y: o.temp.vy })
                })
            }, 100, 'backToPlayModeFromVictoryDance')
        }, 100, 'victorydance')
    },
    delays: new Set,
    behaviour: 'leader',
    endGame: () => {
        if (!global.playingLevel) {
            return
        }
        waitForFrames(o => {
            Elem.$('#can').anim({
                'keep class': true,
                class: ['blur-element']
            }, () => {
                let testsubject = Elem.$('#startmenu')
                testsubject.show()
                testsubject.styleMe({ display: 'flex', 'z-index': 2 })
                testsubject.removeClass('slide-in-blurred-top', 'slide-out-blurred-top')
                testsubject.killChildren()
                testsubject.anim({ class: ['slide-in-blurred-top'] }, () => {
                    engine.enabled = false
                })
                new Elem({ tag: 'h1', text: 'Results', parent: testsubject, class: ['focus-in-contract'] })

                let winning = new Elem({

                    tag: 'div', styles: {
                        'overflow-x': 'scroll',
                        'max-width': 'inherit',
                    }, id: 'winners', parent: testsubject
                })
                let col = color.yellow
                let shadow = `0px 0px 4px ${col}`
                let win = ball => {
                    let p
                    new Elem({
                        tag: 'div', parent: winning, children: [
                            p = new Elem({
                                tag: 'p', styles: {
                                    color: col,
                                }, message: utilString.shorten(ball.Name, 10),
                            }),
                            new Elem({
                                tag: 'img',
                                title: ball.Name, alt: ball.Name,
                                styles: {
                                    'border-radius': '100%',
                                    width: '100px',
                                    height: '100px',
                                    margin: '5px',
                                    filter: `drop-shadow(${shadow})`
                                }, src: ball.imgSrc, events: {
                                    error() {
                                        shapeToImage(ball)
                                        this.content.src = ball.imgSrc
                                    }
                                }
                            })
                        ]
                    })
                    switch (col) {
                        case color.yellow:
                            col = color.silver
                            shadow = `0px 0px 3px ${col}`
                            break;
                        case color.silver:
                            col = color.brown;
                            shadow = `0px 0px 2px ${col}`
                            break;
                        default:
                            col = color.black
                            shadow = ``
                            break;
                    }
                }

                Entity.placements.forEach(win);
                //losers
                let imsobadatthis = ball => {
                    new Elem({
                        tag: 'div', parent: winning, children: [
                            new Elem({
                                tag: 'p', styles: {
                                    opacity: ' 0.9'
                                }, message: utilString.shorten(ball.Name, 10),
                            }),
                            new Elem({
                                tag: 'img',
                                title: ball.Name, alt: ball.Name,
                                styles: {
                                    'border-radius': '100%',
                                    width: '100px',
                                    height: '100px',
                                    margin: '5px',
                                    opacity: '0.2'
                                }, src: ball.imgSrc, events: {
                                    error() {
                                        shapeToImage(ball)
                                        this.content.src = ball.imgSrc
                                    }
                                }
                            })
                        ]
                    })

                }
                [...Entity.losers].toReversed().forEach(imsobadatthis)




            },)
        }, 50, 'gameEnd')
    },
    playing: false,
    zoomChange: 0,
    last: {
        x: 0,
        y: 0,
        zoom: 1
    },
    targetZoom: 1,
    easterEggs: {
        acidMode: false,
        filter: '',
        lerp: 0.1,
        zoomLerp: 0, //broken
        compop: 'source-over',
        showNamesInPlayMode: true,
        gameFont: 'Courier New',
        messageFont: 'Verdana,monospace'
    },
    click: {
        x: NaN,
        y: NaN
    },
    angle: 0,
    speed: 10,
    zoom: 1,
    following: null,
    existingcam: null,
    existinggoal: null,
    existingspawn: null,
    key: {
        w: false,
        s: false,
        a: false,
        d: false
    }
}
cam.behaviour = localStorage.getItem('cambehaviour')
cam.easterEggs.lerp = +localStorage.getItem('camspeed')
if (localStorage.getItem('cutscenes') === 'false') {
    cam.cutscene.enabled = false
}
else {
    cam.cutscene.enabled = true
}
if (!cam.easterEggs.lerp) {
    localStorage.setItem('camspeed', Elem.$('#camSpeed').content.value)
    cam.easterEggs.lerp = +Elem.$('#camSpeed').content.value
}
if (cam.cutscene.enabled == null) {
    localStorage.setItem('cutscenes', Elem.$('#cutscenes').content.checked)
}
if (!cam.behaviour || !(['leader', 'loser', 'middle', 'outliers', 'average', 'ramdom', 'free'].some(o => o === cam.behaviour))) {
    localStorage.setItem('cambehaviour', Elem.$('#camBehaviour').content.value)
}
if (Elem.elements.has('cambehaviour')) {
    cam.behaviour = Elem.$('#cambehaviour').content.value
}
else {
    cam.behaviour = 'free'

}
ctx.lineWidth = 4
// Import or include Matter.js

const apply = () => {
    if (!global.editorMode) {
        //return cam.sendmessage( "Exit play mode first!!!#ff0000"
        startGame()
    }
    cam.sendmessage("Changes applied!!!#0dff00")
    let idNames = {

    }
    playAudio({src:'confirm.mp3'})
    for (let element of あ.$("#data").children) {
        let mine = element
        if ((mine.value != null || 'checked' in mine) && mine.id) {
            idNames[mine.id] = mine.value
        }
    }
    for (let o of Entity.toSpawn.values()) {
        //   console.log($(`#name${o.id}`))
        Elem.$(`#shh${o.id}`).content.value = o.Name
    }
    for (let name in idNames) {
        if (name in global.current) {
            if (name === "angle") {
                Body.setAngle(global.current, +idNames[name] * Math.PI / 180)
                global.current.start[name] = +idNames[name] * Math.PI / 180

            }
            if (name === "speed") {
                cam.speed = +idNames[name]
            }

            if (name === "mass") {
                Body.setMass(global.current, +idNames[name])
                global.current.start[name] = +idNames[name]

            }
            if (name === "windSpeed") {
                global.current.start[name] = global.current[name] = +idNames[name]

            }

            if (name === "interval") {
                global.current[name] = Math.floor(+idNames[name])
                global.current.start[name] = Math.floor(+idNames[name])

            }
            if (name.match(/ignoreWind|respawn/)) {
                global.current[name] = idNames[name]
                global.current.start[name] = idNames[name]

            }
            if (name === "Name") {
                global.current.Name = global.current.start.Name = idNames[name]
            }
            if (name.match(/opacity|restitution/)) {
                global.current[name] = global.current.start[name] = +idNames[name]
            }
            if (name.match(/size/)) {
                let modified = global.current.start
                modified.size = +idNames[name]
                let out = new global.current.CREATOR(modified)
                global.current.kill()
                global.current = out
                showData(global.current)
            }
            /*  if (name === "angularSpeed") {
                  Body.setAngularSpeed(global.current, (+(idNames[name])) || 0)
                  global.current.start[name] = +(idNames[name])
  
              }
              if (name === "angularVelocity") {
                  Body.setAngularVelocity(global.current, (+(idNames[name])) || 0)
                  global.current.start[name] = +(idNames[name])
  
              }*/
            if (name.match(/restitution|frictionAir/)) {
                global.current[name] = +(idNames[name])
                global.current.start[name] = +(idNames[name])

            }
            if (name.match(/inertia/)) {
                Body.setInertia(global.current, +(idNames[name]) || 0.1)
                global.current.start[name] = +(idNames[name]) || 0.1

            }
            if (name.match(/width/)) {
                let modified = global.current.start
                modified.width = idNames[name]
                let out = new global.current.CREATOR(modified)
                global.current.kill()
                global.current = out
                showData(global.current)
            }
            if (name.match(/height/)) {
                let modified = global.current.start
                modified.height = idNames[name]
                let out = new global.current.CREATOR(modified)
                global.current.kill()
                global.current = out
                showData(global.current)
            }
            if (name === "color") {
                global.current.start.color = global.current.color = idNames[name]
                global.current.start.dark = global.current.dark = c.dhk(idNames[name], 40)
                if (!global.current.customImage) {
                    global.current.img = new Image()
                    showData(global.current)
                }

            }

        }

    }
    showData(global.current)
}
let frame = 0
Matter.Runner.run(engine)
let menuClicked = false
window.menuClicked = menuClicked
Events.on(engine, 'afterUpdate', update)
function update() {
    if (global.playingLevel) {
        resize()
    }
    if (!loaded) return

    /*   if (getComputedStyle(startmenu).getPropertyValue('opacity') == 0 && !menuClicked) {
           startGame()
           menuClicked = true
           startmenu.style.zIndex = -1
       }*/

    if (!cam.frozen) {

        frame++
    }
    if (!Entity.all.has(cam.following?.id) && cam.following) {
        waitForFrames(() => cam.following = null, 10, 'resetCam')
    }
    for (let delays of cam.delays) {
        if (delays.pauseDuringCutscene && cam.frozen) {
            continue
        }
        if (!(delays.time--)) {
            delays.execute()
            Elem.debug(`Delay ${delays.label} executed`)
            cam.delays.delete(delays)
        }
    }
    if (!cam.easterEggs.acidMode) ctx.clearRect(0, 0, canvas.width, canvas.height);
    //   ctx.fillRect(0,0,1e301,1e301)

    /*
        for (let gridSize = 200, i = ((canvas.width / cam.zoom) - cam.x / 2) % gridSize; i < canvas.width / cam.zoom; i += gridSize) {
            ctx.beginPath()
            ctx.moveTo(i * cam.zoom, 0)
            ctx.lineTo(i * cam.zoom, canvas.height)
            ctx.stroke()
        }
        for (let gridSize = 200, i = ((canvas.height / cam.zoom) - cam.x / 2) % gridSize; i < canvas.height / cam.zoom; i += gridSize) {
            ctx.beginPath()
            ctx.moveTo(0, i * cam.zoom)
            ctx.lineTo(canvas.width, i * cam.zoom,)
            ctx.stroke()
        }*/

    for (const fr of Entity.toKill) {
        World.remove(world, fr)
        Entity.all.delete(fr.id)
        Entity.toKill.delete(fr)
    }

    for (const o of Entity.temporarilyDead) {
        World.remove(world, o)
        Entity.all.delete(o.id)
        Entity.graveyard.add(o)
    }
    Entity.temporarilyDead = new Set

    let pos = {
        x: cam.x / cam.zoom,
        y: cam.y / cam.zoom
    }

    Entity.toKill = new Set
    for (let o of Entity.all.values()) {
        if (o.dead) {
            o.dead = false
            o.kill()
        }
    }
    cam.existingcam = null
    ctx.filter = cam.easterEggs.filter

    for (const fr of Entity.all.values()) {
        if (fr.CREATOR === Cam && !cam.existingcam) {
            cam.existingcam = fr
        }
        if (fr.CREATOR === Goal && !cam.existinggoal) {
            cam.existinggoal = fr
        }
        if (fr.CREATOR === Spawner && !cam.existingspawn) {
            cam.existingspawn = fr
        }
        if (global.editorMode) {
            fr.start.x ??= fr.position.x
            fr.start.y ??= fr.position.y
            fr.isSleeping = true
            Body.setVelocity(fr, { x: 0, y: 0 })

        }
        else {
            fr.isSleeping = false
        }
        fr.update?.(frame)
    }

    if (cam.key.w) {
        cam.y += cam.speed

    }
    if (cam.key.s) {
        cam.y -= cam.speed
    }
    if (cam.key.a) {
        cam.x += cam.speed
    }
    if (cam.key.d) {
        cam.x -= cam.speed
    }
    if (utilMath.sanitize(cam.x) && utilMath.sanitize(cam.y)) {
        cam.last.x = cam.x;
        cam.last.y = cam.y
    }
    else {
        cam.x = cam.last.x
        cam.y = cam.last.y
    }
    if (cam.following) {
        cam.x = lerp(cam.x, -cam.following.position.x * cam.zoom + canvas.width / 2, cam.easterEggs.lerp / cam.zoom)
        cam.y = lerp(cam.y, -cam.following.position.y * cam.zoom + canvas.height / 2, cam.easterEggs.lerp / cam.zoom)
        if (cam.easterEggs.lerp > 1.2) {
            cam.x = -cam.following.position.x * cam.zoom + canvas.width / 2
            cam.y = -cam.following.position.y * cam.zoom + canvas.height / 2

        }

    }
    let eve = Entity.getAllMarbles

    if (eve.length) {
        let outliers = false;

        switch (!global.editorMode && !cam.frozen && cam.behaviour) {
            default: {
                cam.following ??= Entity.getAllMarbles.find(o => o.Name === cam.behaviour)
            }
                break
            case 'leader': {
                if (cam.existinggoal) {
                    let raa = (eve.sort((a, b) => Entity.distance(a, cam.existinggoal) - Entity.distance(b, cam.existinggoal))[0])
                    cam.following = raa
                }
            }
                break;
            case 'loser': {
                if (cam.existinggoal) {
                    let raa = (eve.sort((a, b) => Entity.distance(b, cam.existinggoal) - Entity.distance(a, cam.existinggoal))[0])
                    cam.following = raa
                }
            }
                break;
            case 'middle': {
                if (cam.existinggoal) {
                    let raa = (eve.sort((a, b) => Entity.distance(a, cam.existinggoal) - Entity.distance(b, cam.existinggoal)).center())
                    cam.following = raa
                }
            }
                break;
            case 'outliers':
                outliers = true
            case 'average': {
                let positions = {
                    x: [],
                    y: []
                }

                eve.forEach(o => {
                    positions.x.push(o.position.x)
                    positions.y.push(o.position.y)
                })

                const avg = {
                    x: utilArray.avg(positions.x, outliers),
                    y: utilArray.avg(positions.y, outliers)
                }
                let pos = {
                    x: -avg.x + canvas.width / 2 / cam.zoom,
                    y: -avg.y + canvas.height / 2 / cam.zoom
                }


                if (cam.easterEggs.lerp && cam.zoom === cam.last.zoom) {

                    cam.x = lerp(cam.x, pos.x * cam.zoom, cam.easterEggs.lerp)
                    cam.y = lerp(cam.y, pos.y * cam.zoom, cam.easterEggs.lerp)

                }

                else {
                    cam.x = pos.x * cam.zoom
                    cam.y = pos.y * cam.zoom
                }
                /*   if (cam.easterEggs.zoomLerp) {
                       const bbox = Entity.boundingBox(positions)
                       const targetZoom = Entity.calculateZoomForBoundingBox(bbox, canvas.width, canvas.height)
                       cam.zoom = lerp(cam.zoom, targetZoom, cam.easterEggs.zoomLerp);
                   }*/

                break;
            }
            case 'random': {
                if (!(frame % 500) || !cam.following) {
                    cam.following = ran.choose(...eve)

                }
                break;
            }
        }
    }
    if (utilMath.sanitize(cam.zoom)) {
        cam.last.zoom = cam.zoom
    }
    else {
        cam.zoom = cam.last.zoom
    }
    cam.zoom = lerp(cam.zoom, cam.targetZoom, 0.05)

    if (global.editorMode) {
        ctx.save()
        ctx.lineWidth = 1
        ctx.fillStyle = c.gray
        ctx.strokeStyle = c.black
        ctx.fillRect(10, 10, 7, 20)
        ctx.fillRect(21, 10, 7, 20)
        ctx.strokeRect(10, 10, 7, 20)
        ctx.strokeRect(21, 10, 7, 20)
        ctx.restore()
    }
    // Step 1: Draw your normal content
    // (Insert your code to draw any content here, e.g., images, shapes, text, etc.)

    // Step 2: Save the global.current canvas state

    /* if (cam.cutscene.focus) {
         if (!cam.following) {
             return
         }
         ctx.save();
         ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black
         ctx.fillRect(0, 0, canvas.width, canvas.height); // Cover the entire canvas with dark color
         ctx.globalCompositeOperation = 'destination-out';
         const focusX = 150;
         const focusY = 150;
         const focusRadius = 50;
         ctx.beginPath();
         ctx.arc((cam.following.position.x*cam.zoom + cam.x*cam.zoom), (cam.following.position.y*cam.zoom + cam.y*cam.zoom), cam.following.position.circleRadius|| 100, 0, Math.PI * 2);
         ctx.fill();
         ctx.restore();
         cam.following.draw()
     }*/

    /*ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.font = "30px " + cam.easterEggs.gameFont
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.fillStyle = textColor
    ctx.strokeStyle = c.dhk(textColor, 40)
    ctx.lineWidth = 1
    ctx.font = `30px ${cam.easterEggs.messageFont}`
    ctx.fillText(text, 0, Math.min(-30, -(smooth - 100) * 4))
    ctx.strokeText(text, 0, Math.min(-30, -(smooth - 100) * 4))
    ctx.restore()*/
    ctx.save()
    ctx.translate(cam.x, cam.y)
    ctx.scale(cam.zoom, cam.zoom)
    ctx.rotate(cam.existingcam?.angle ?? 0)
    ctx.fillStyle = c.lightblue
    ctx.globalCompositeOperation = "destination-over"
    ctx.fillRect(0, 0, bounds.x, bounds.y)
    ctx.restore()
    /*
    ctx.save()
    let width = canvas.width / cam.zoom / 5
    ctx.translate(canvas.width - 110, canvas.height - 110)
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, (canvas.width * cam.zoom) / 5, (canvas.width * cam.zoom) / 5)
    ctx.scale(.2, .2)
    ctx.fillRect((-cam.x * cam.zoom) / (5 * cam.zoom), (-cam.y * cam.zoom) / (5 * cam.zoom), 20 / cam.zoom, 20 / cam.zoom)
    for (let o of Entity.all) {
        if (!o.isMarble || o.collisionFilter === -1) {
            continue
        }
        ctx.beginPath()
        ctx.arc((o.position.x / 5) - 35, (o.position.y / 5) - 35, o.circleRadius / 5, 0, Math.PI * 2)
        ctx.fillStyle = o.color
        ctx.fill()
        ctx.strokeStyle = c.black
        ctx.lineWidth = 0.1
        ctx.stroke()
    }
    ctx.restore()*/

    if (global.debugMode) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(cam.click.x, cam.click.y, 15, 0, Math.PI * 2)
        ctx.strokeStyle = c.red
        ctx.stroke()
        ctx.fillText(`x: ${mouse.x} y: ${mouse.y}`, mouse.x, mouse.y - 30)
        ctx.fillStyle = c.red
        ctx.fillText(`x: ${cam.click.x} y: ${cam.click.y}`, cam.click.x - 70, cam.click.y + 30)
        ctx.restore()
    }

}

class Entity {
    static distance = function (a, b) {
        const dx = Math.abs(a.position.x - b.position.x);
        const dy = Math.abs(a.position.y - b.position.y);
        return Math.hypot(dx, dy);
    }
    static placements = new Set;
    static losers = new Set
    static calculateZoomForBoundingBox = function (bbox, canvasWidth, canvasHeight) {
        const bboxWidth = bbox.width;
        const bboxHeight = bbox.height;
        const canvasRatio = canvasWidth / canvasHeight;
        const bboxRatio = bboxWidth / bboxHeight;

        let zoom;

        if (bboxRatio > canvasRatio) {
            // Bounding box is wider relative to the canvas
            zoom = canvasWidth / bboxWidth;
        } else {
            // Bounding box is taller relative to the canvas
            zoom = canvasHeight / bboxHeight;
        }

        return zoom;
    }
    static get getAllMarbles() {
        return [...this.all.values()].filter(o => o.isMarble)
    }
    static boundingBox = (function anonymous(positions) {
        /*     let positions = {
                 x: [],
                 y: []
             }
             for (let o of Entity.getAllMarbles) {
                 positions.x.push(o.position.x)
                 positions.y.push(o.position.y)
             }*/
        const minX = Math.min(...positions.x);
        const maxX = Math.max(...positions.x);
        const minY = Math.min(...positions.y);
        const maxY = Math.max(...positions.y);
        return {
            minX,
            maxX,
            minY,
            maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    })
    static all = new Map()
    static {
        Matter.Composite.allBodies(world).forEach(o => this.all.set(o.id, o))
    }
    static toKill = new Set
    static allClasses = {}
    static graveyard = new Set
    static temporarilyDead = new Set
    //static Images = []
    static toSpawn = new Map
    static gameSpawns = new Set
    static {
        window.a = this
        window.cam = cam

        /* for (let src of Images) {
             let x = new Image(50, 50)
             x.src = src
             this.Images.push(x)
         }*/
    }
    static *[Symbol.iterator]() {
        yield* this.all
    }
    static kill(isWinner) {
        if (this.dead) {
            return
        }
        if (cam.following === this) {
            waitForFrames(o => cam.following = null, 50, 'follow')
        }
        if (Entity.getAllMarbles.length === 0 && !Entity.gameSpawns.size && !global.gameEnded) {
            global.gameEnded = true;
            cam.endGame()
        }
        this.dead = true
        Entity.toKill.add(this)
        if (this.isMarble && !isWinner) {
            Entity.losers.add(this)
        }
    }
    static update(fr) {
        if (isNaN(this.position.x) || isNaN(this.position.y)) {
            this.kill()
            global.editorMode || startGame()
            console.error('NaN: ', this)
            showData()
            cam.sendmessage('Check logs please :(#FF0000')
            this.isTemporary &&= false
            throw RangeError('NaN Position detected')

        }
        if (this.position.x > bounds.x) {
            Body.setPosition(this, { x: bounds.x, y: this.position.y })
            this.outOfBounds?.()
        }
        if (this.position.x < 0) {
            Body.setPosition(this, { x: 0, y: this.position.y })
            this.outOfBounds?.()
        }
        if (this.position.y > bounds.y) {
            Body.setPosition(this, { y: bounds.y, x: this.position.x })
            this.outOfBounds?.()
        }
        if (this.position.y < 0) {
            Body.setPosition(this, { y: 0, x: this.position.x })
            this.outOfBounds?.()
        }
        for (let oj of Entity.all.values()) {
            if (global.editorMode) {
                break
            }
            if (oj === this || !oj.isSensor) {
                continue
            }
            else if (Collision.collides(this, oj)) {
                oj.collision?.(this)
            }
        }

        this.draw(fr)

    }
    static draw(fr = frame, { x, y } = this.position) {

        ctx.save()


        ctx.translate(cam.x, cam.y)
        ctx.scale(cam.zoom, cam.zoom)

        ctx.rotate(cam.existingcam?.angle ?? 0)
        ctx.translate(x, y)

        this.circleRadius && ctx.rotate(this.angle)

        ctx.beginPath()
        if (global.editorMode) {

            if (this.selected) {
                this.opacity = 0.6
            }
            else {
                this.opacity = this.start.opacity ?? this.opacity
            }

        }

        if (this.selected && !isNaN(mouse.x) && !isNaN(mouse.y) && global.editorMode) {
            if (true/* Math.abs(mouse.x - this.start.x) > this.SIZE.x / 4 && Math.abs(mouse.y - this.start.y) > this.SIZE.y / 4 */) {
                if (this.start.isStatic) {
                    Body.setStatic(this, false)
                }
                let c = new Vector2(cam.click.x,cam.click.y),
                cc = new Vector2(mouse.x,mouse.y)
                if (Vector2.distance(cc,c) / cam.zoom > 10) {
                    cam.click.x = this.position.x
                    cam.click.y = this.position.y
                    Body.setPosition(this, { x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom) })
                }
                //this.start.x = Infinity
                //this.start.y = Infinity

            }
            this.velocity.x = 0
            this.velocity.y = 0
        }

        if (this === global.current) {
            ctx.shadowBlur = 15 + Math.sin(frame / 40)
            ctx.shadowColor = c.blue
        }

        if (!global.editorMode) {
            ctx.globalAlpha = this.opacity
        }
        ctx.globalCompositeOperation = cam.easterEggs.compop
        this.illustrate?.(fr)
        if (global.editorMode && !global.playingLevel && global.select != "put" && ctx.isPointInPath(mouse.x, mouse.y) && (cam.click.x && cam.click.y)) {
            if (![...Entity.all.values()].some(o => o.selected)) {
                this.onclick?.()
                playAudio({ src: 'click.mp3' })

                this.selected = true
                global.current = this
                menu("data")
                showData(this)

            }

        }
        else if (global.editorMode && !global.playingLevel && (!cam.click.x || !cam.click.y)) {
            if (this.selected) {
                this.velocity.x = this.velocity.y = 0
                this.start.x = this.position.x
                this.start.y = this.position.y
            }
            this.selected = false
            if (this.start.isStatic) {
                Body.setStatic(this, true)

            }

        }
        if (ctx.isPointInPath(mouse.x, mouse.y) && cam.click.x && cam.click.y && !global.editorMode && this.isMarble) {
            cam.following = this
        }
        ctx.restore()



    }
    constructor(opts) {

        let out
        let center = bounds.center
        opts.width = Math.max(opts.width, 1)
        opts.height = Math.max(opts.height, 1)
        if (!isFinite(opts.angle)) opts.angle = 0;
        if (!isFinite(opts.x)) opts.x = center.x;
        if (!isFinite(opts.y)) opts.y = center.y;
        if (opts.shape === "circle") {
            out = Bodies.circle(opts.x ?? center.x, opts.y ?? center.y, opts.size ?? 30, {
                friction: 0.02,
                sleepThreshold: config.sleepThreshold,
                //frictionStatic: 0,
                inertia: 2000,
                isStatic: opts.isStatic ?? false,
                restitution: opts.bounce ?? opts.restitution ?? 1,
                frictionAir: opts.frictionAir ?? 0.01,
                angle: opts.angle ?? 0,
                mass: opts.mass ?? 1


            })
        }
        else if (opts.shape === "rect") {
            out = Bodies.rectangle(opts.x ?? center.x, opts.y ?? center.y, opts.width ?? 30, opts.height ?? 30, {
                friction: 0,
                sleepThreshold: config.sleepThreshold,
                mass: opts.mass ?? 2.799984164,
                isStatic: opts.isStatic ?? false,
                restitution: opts.bounce ?? opts.restitution ?? 0,
                frictionAir: opts.frictionAir ?? 0.01,
                angle: opts.angle ?? 0,
                mass: opts.mass ?? 1,
                //   width: opts.width,
                //  height: opts.height
            })
        }
        else {
            console.error(this)
            cam.sendmessage('Check logs please :(#FF0000')
            throw TypeError('No shape was provided.')
        }
        out.CREATOR = new.target
        if (!new.target.name.match(/Marble|MoveableWall/)) out.collisionFilter.group = -1;
        out.Name = opts.Name || `${new.target.name} ${out.id}`
        out.shape = opts.shape
        out.isSleeping = true
        World.add(world, out)
        out.color = opts.color
        out.color ??= ran.choose(...Object.values(c))
        out.dead = false
        Body.setAngle(out, opts.angle ?? 0)
        if (opts.imgSrc) {
            out.imgSrc = opts.imgSrc
            out.img = new Image()
            out.img.src = out.imgSrc
            out.customImage = true
        }


        out.dark = c.dhk(out.color, 40)
        out.selected = false
        out.canBeSaved = true
        out.isCustom = true
        out.toggleable = new Set(["angle", "Name", "circleRadius", "restitution", "color", 'opacity', 'width', 'height'])
        out.opacity = opts.opacity ?? 1
        out.interval = opts.interval ?? 50
        out.restitution = opts.restitution ?? 0
        out.size = opts.size
        out.start = {
            x: out.position.x,
            y: out.position.y,
            size: opts.size,
            isStatic: opts.isStatic ?? false,
            height: opts.height,
            width: opts.width,
            angle: opts.angle ?? 0,
            imgSrc: out.imgSrc,
            // angularSpeed: Body.getAngularSpeed(out),
            //  angularVelocity: Body.getAngularVelocity(out),
            frictionAir: out.frictionAir,
            restitution: out.restitution,
            mass: opts.mass,
            color: out.color,
            dark: out.dark,
            Name: out.Name,
            opacity: out.opacity ?? opts.opacity ?? 1,
            windSpeed: out.windSpeed,
            interval: opts.interval ?? 50
        }
        // opts;
        out.SIZE ?? Object.defineProperty(out, "SIZE", {
            get: function () {
                if (this.circleRadius) {
                    return { x: this.circleRadius, y: this.circleRadius }
                }
                else {
                    let n = {
                        x: Math.abs(this.bounds.max.x - this.bounds.min.x),
                        y: Math.abs(this.bounds.max.y - this.bounds.min.y),

                    }
                    return n
                }
            }
        })
        out.width ?? Object.defineProperty(out, "width", { get: function () { return this.start.width } })
        out.height ?? Object.defineProperty(out, "height", { get: function () { return this.start.height } })

        Entity.all.set(out.id, out)
        //Defs
        out.reset = function () {
            this.isSleeping = true

            this.start.angle ??= this.angle
            if (!Entity.all.has(this.id)) {
                Entity.all.set(this.id, this)
                Entity.graveyard.delete(this)
                World.add(world, this)
            }
            // console.log(this.start,this.angle)

            //  console.log(this.start)

            // Body.setInertia(this, this.start.inertia)
            Body.setVelocity(this, { x: 0, y: 0 })
            Body.setAngularVelocity(this, 0)
            Body.setAngularSpeed(this, 0)
            Body.setAngle(this, this.start.angle)
            Body.setPosition(this, { x: this.start.x, y: this.start.y })
        }
        out.update = Entity.update.bind(out)
        out.draw = Entity.draw.bind(out)
        out.kill = Entity.kill.bind(out)
        out.tempKill = function () {
            if (!global.editorMode) {

                Entity.temporarilyDead.add(this)
                if (this.isLoser) Entity.losers.add(this)
                if (cam.behaviour === this.Name) {
                    cam.behaviour = ran.choose(...Entity.getAllMarbles).Name
                }
            }


        }
        out.index ?? Object.defineProperty(out, 'index', {
            get() {
                return Entity.all.values().indexOf(out)
            }
        })
        return out

    }


}
window.a = Entity
class Marble extends Entity {
    static {
        Entity.allClasses[this.name] = this
    }
    static defaultSize = 30;
    static defaultShape = 'circle'
    constructor(opts) {
        opts.shape ??= Marble.defaultShape
        opts.size ??= Marble.defaultSize
        super(opts)
        this.isLoser = false
        this.finished = false
        this.img = opts.img

        this.outOfBounds = () => {
            this.isLoser = true
            for (let i = 10; i--;) {
                if (Entity.all.size > 100) {
                    break
                }
                let p = new DeathParticle({ x: this.position.x, y: this.position.y, })
                p.isTemporary = true
            }
            this.tempKill()

        }
        this.collisionFilter.group = 0
        this.isMarble = true
        this.toggleable.add("img")
            ;['angle', 'width', 'height'].forEach(o => this.toggleable.delete(o))
        this.victory = function () {
            if (this.finished) {
                return
            }

            this.finished = true
            for (let i = 10; i--;) {
                if (Entity.all.size > 100) {
                    break
                }
                let p = new Confetti({ x: this.position.x, y: this.position.y, })
                p.isTemporary = true
            }
            if (this.isMarble) {
                Entity.placements.add(this)
            }
            this.kill(true)
        }
        Marble.prototype.illustrate = this.illustrate = function (frame) {
            if (!global.editorMode && !cam.frozen && this.isSleeping) {
                this.outOfBounds()
            }
            if (global.editorMode || cam.easterEggs.showNamesInPlayMode && cam.zoom >= 0.6) {
                ctx.save()
                ctx.rotate(-this.angle)
                ctx.font = `13px ${cam.easterEggs.gameFont}`
                ctx.textBaseline = 'middle'
                ctx.textAlign = 'center'
                ctx.fillText(this.Name, 0, -50)
                d.postMessage({ state: JSON.stringify(getStateOfCanvas(ctx)), operation: 'fillText' })
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(5, -40)
                ctx.lineTo(-5, -40)
                ctx.lineTo(-0, -36)
                ctx.closePath()
                ctx.stroke()
                ctx.restore()
            }
            ctx.beginPath()
            ctx.arc(0, 0, this.circleRadius, 0, Math.PI * 2)
            ctx.clip()


            if (this.img && this.customImage) {
                this.customImage = true
                try {
                    ctx.drawImage(this.img,
                        (-this.circleRadius),
                        (-this.circleRadius),
                        this.circleRadius * 2,
                        this.circleRadius * 2)
                }
                catch (e) {
                    // cam.sendmessage( 'Check logs please :(#FF0000'
                    console.error('The following "image" is broken: ', this.img)
                    this.customImage = false
                }

            } else {
                ctx.fillStyle = this.color
                ctx.strokeStyle = this.dark
                ctx.fill()
                ctx.stroke()
            }




        }
        this.onclick = function () {
            if (this.selected) {
                this.selected = !this.selected
            }
        }
    }

}

class Wall extends Entity {
    static {
        Entity.allClasses[this.name] = this
    }
    static defaultWidth = 30;
    static defaultHeight = 30
    static defaultColor = c.gray
    constructor(opts) {
        if (opts.shape !== 'circle') opts.shape = "rect"
        opts.friction = 0
        opts.width ??= Wall.defaultWidth
        opts.height ??= Wall.defaultHeight
        opts.color ??= Wall.defaultColor
        if (new.target === Wall) {
            opts.isStatic = true
        }
        super(opts)
        this.toggleable.delete("frictionAir")
        this.toggleable.delete("restitution")

        this.illustrate = function (frame) {

            ctx.moveTo(this.vertices[0].x - this.position.x, this.vertices[0].y - this.position.y)
            for (let i = 0, len = this.vertices.length; i < len; i++) {
                ctx.lineTo(this.vertices[i].x - this.position.x, this.vertices[i].y - this.position.y)

            }

            ctx.strokeStyle = this.dark
            ctx.fillStyle = this.color
            ctx.closePath()
            ctx.stroke()
            ctx.fill()
        }

    }
}
class Circle extends Wall {
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {
        opts.shape = 'circle'
        super(opts)
        this.toggleable.delete('width')
        this.toggleable.delete('height')
        this.toggleable.add('size')
    }
}
class Ball extends Circle {
    static defaultColor = c.green
    static defaultSize = 20

    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {
        opts.isStatic = false
        opts.color ??= Ball.defaultColor

        super(opts)
        this.start.ignoreWind = this.ignoreWind = opts.ignoreWind ?? 0;
        this.start.respawn = this.respawn = opts.respawn ?? 0
        this.collisionFilter.group = 0
            ;['mass', 'restitution', 'ignoreWind', 'respawn'].forEach(o => this.toggleable.add(o))
    }
}
class MoveableWall extends Wall {
    static defaultColor = c.green
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {
        opts.isStatic = false
        opts.color ??= MoveableWall.defaultColor
        super(opts)
            ;['restitution', 'mass', 'ignoreWind', 'respawn'].forEach(o => this.toggleable.add(o))

        this.start.ignoreWind = this.ignoreWind = opts.ignoreWind ?? false;
        this.start.respawn = this.respawn = opts.respawn ?? false
        this.collisionFilter.group = 0

    }
}
class Blade extends Wall {
    static {
        Entity.allClasses[this.name] = this
    }
    static defaultWidth = 90
    static defaultHeight = 10
    static defaultColor = c.yellow
    constructor(opts) {
        opts.width ??= Blade.defaultWidth
        opts.height ??= Blade.defaultHeight
        opts.isStatic = false
        super(opts)
        this.collisionFilter.group = -1
        this.toggleable.add("frictionAir")
        this.toggleable.add("mass")
        this.update = function () {
            Entity.update.call(this)
            Body.setVelocity(this, { x: 0, y: 0 })
            if (!global.editorMode) {
                Body.setPosition(this, this.start)
            }
        }
    }
}
class WindZone extends Wall {
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(o) {
        o.shape = 'rect'
        o.isStatic = true

        o.color = c.blue
        super(o)
        this.toggleable.add('windSpeed')
        this.windSpeed = this.start.windSpeed = o.windSpeed ?? 0.01
        this.isSensor = true
        this.winds = new Set
        for (let i = 0; i < 20; i++) {
            this.winds.add({
                x: (Math.random() * o.width) - o.width / 2,
                y: (Math.random() * o.height) - o.height / 2,
                radius: Math.random() * this.width / 20
            })
        }
        this.collision = function (coll) {
            if (!coll.isMarble && coll.ignoreWind == false || coll.isParticle) {
                return
            }
            const angleRadians = this.angle - Math.PI / 2

            // Define the magnitude of the force
            const forceMagnitude = this.windSpeed // Adjust as needed

            // Calculate the force components
            const forceX = forceMagnitude * Math.cos(angleRadians)
            const forceY = forceMagnitude * Math.sin(angleRadians)

            Body.applyForce(coll, coll.position,
                { x: forceX, y: forceY }
            )
        }
        this.illustrate = function (fr) {


            ctx.moveTo(this.vertices[0].x - this.position.x, this.vertices[0].y - this.position.y)
            for (let i = 0, len = this.vertices.length; i < len; i++) {
                ctx.lineTo(this.vertices[i].x - this.position.x, this.vertices[i].y - this.position.y)

            }
            ctx.closePath()
            ctx.clip()
            ctx.beginPath()

            ctx.shadowBlur = 0

            ctx.fillStyle = this.color
            ctx.rotate(this.angle)
            for (let wind of this.winds) {
                if (!cam.frozen) {
                    wind.y -= 1 * this.windSpeed * 160
                    if (Math.abs(wind.y) > this.height / 2 + 10) {
                        wind.y = this.height / 2

                    }
                }
                ctx.beginPath()
                ctx.arc(wind.x, wind.y, 10, 0, Math.PI * 2)
                ctx.fill()

            }
            //     ctx.stroke()
            if (global.editorMode) {
                ctx.beginPath()
                ctx.moveTo(-5, 20 - 20)
                ctx.lineTo(5, 20 - 20)
                ctx.lineTo(-0, 16 - 20)
                ctx.closePath()
                ctx.stroke()
            }
            ctx.beginPath()
            ctx.rotate(-this.angle)
            ctx.moveTo(this.vertices[0].x - this.position.x, this.vertices[0].y - this.position.y)
            for (let i = 0, len = this.vertices.length; i < len; i++) {
                ctx.lineTo(this.vertices[i].x - this.position.x, this.vertices[i].y - this.position.y)

            }
            if (global.editorMode) {
                ctx.closePath()
                ctx.stroke()
            }

        }

    }
}
class Portal extends Entity {
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {
        opts.isStatic = true
        opts.shape = 'circle'

        super(opts)
        this.hint = 'Press clone to copy changes between portals'
        this.interval = opts.interval || 50
        this.size = this.circleRadius
        this.pair = null
        this.active = true
        this.isSensor = true
        this.toggleable.add("interval")

        this.onenterplaymode = function () {
            this.active = true
        }
        this.kill = function () {
            [...Entity.all.values()].forEach(o => {
                if (o.pair === this) {
                    o.pair = null
                    o.kill()
                }

            }
            )
            Entity.prototype.kill.call(this)
        }
        if (!this.pair) {
            for (let o of Entity.all.values()) {
                if (o.CREATOR === Portal && !o.pair && o !== this) {
                    o.pair = this
                    this.pair = o
                    break
                }
            }
        }
        this.toggleable.add('size')
            ;['width', 'height', 'angle', 'restitution', 'opacity'].forEach(o => this.toggleable.delete(o))
        this.collision = function (coll) {
            if (coll === this?.pair || coll.isParticle || !this.pair || coll.isSensor) {
                return
            }
            if (this.active) {
                for (let i = 10; i--;) {
                    if (Entity.all.size > 100) {
                        break
                    }
                    new PortalParticle({ x: coll.position.x, y: coll.position.y, })
                }

                waitForFrames(() => (!global.editorMode) && (this.active = this.pair.active = true), this.interval, 'portal' + Math.max(this.id, this.pair.id), true)
                this.active = this.pair.active = false
                Body.setPosition(coll, this.pair.position)
                Body.setVelocity(coll, { x: -coll.velocity.x, y: -coll.velocity.y })
                Body.setAngularVelocity(coll, -Body.getAngularVelocity(coll) + 0.1)
            }
        }
        this.illustrate = function (f) {
            let mod = Math.sin(f / 40) * 3
            let scaleFactor = (this.circleRadius + mod) / 3
            let b = 0.3
            if (!this.active) {
                this.opacity = 0.3
            } else if (this.opacity !== 1 && !global.editorMode) {
                this.opacity += 0.1
            } else {
                this.opacity = 1
            }
            if (this.pair) {
                for (let o of Entity.all.values()) {
                    if (o.pair === this && global.editorMode) {
                        ctx.beginPath()
                        ctx.moveTo(0, 0)
                        ctx.lineTo((o.position.x - this.position.x) / 2, (o.position.y - this.position.y) / 2)
                        let old = ctx.lineWidth
                        ctx.lineWidth = 4
                        stroke(this.color)
                        ctx.lineWidth = old
                        break
                    }
                }
            }
            ctx.beginPath()
            ctx.rotate(f / 100)
            ctx.arc(0, 0, this.circleRadius + mod, 0, Math.PI * 2)
            ctx.setLineDash([b * scaleFactor, b * scaleFactor, b * scaleFactor, b * scaleFactor, b * scaleFactor, b * scaleFactor]);
            fill(this.color)
            stroke(this.color)
        }
    }
}
class Cam extends Entity {
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {

        opts.shape = "circle"
        super(opts)
        for (let o of Entity.all.values()) {
            if (o.CREATOR === Cam && o !== this) {
                o.kill()
            }
        }
        this.isSensor = true
        this.toggleable.add("speed")
            ;['Name', 'restitution', 'color', 'width', 'height'].forEach(o => this.toggleable.delete(o))
        this.illustrate = function () {
            if (!global.editorMode) {
                return
            }
            ctx.arc(0, 0, 30, 0, Math.PI * 2)
            ctx.stroke()
            ctx.textBaseline = "middle"
            ctx.textAlign = "center"
            ctx.font = "30px " + cam.easterEggs.gameFont
            ctx.strokeText("🎥", 0, 0)
        }

    }
}
class Goal extends Entity {
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {
        opts.isStatic = true;
        opts.shape = 'rect'
        opts.width = 20;
        opts.height = 20
        super(opts)
            ;['width', 'height', 'Name', 'angle', 'restitution'].forEach(o => this.toggleable.delete(o))
        this.color = c.red
        for (let o of Entity.all.values()) {
            if (o.CREATOR === Goal && o !== this) {
                o.kill()
            }
        }
        this.isSensor = true
        this.illustrate = function (f) {
            ctx.rotate(f / 100)

            ctx.save()
            ctx.lineWidth = 3

            for (let i = 0, arrows = 6; i < arrows; i++) {
                ctx.beginPath()
                ctx.moveTo(5, -50 + Math.abs(Math.cos(f / 20)) * 30)
                ctx.lineTo(-5, -50 + Math.abs(Math.cos(f / 20)) * 30)
                ctx.lineTo(-0, -46 + Math.abs(Math.cos(f / 20)) * 30)
                ctx.closePath()
                stroke(this.color)
                ctx.rotate(Math.PI * 2 / arrows)
            }
            ctx.restore()
            ctx.beginPath()
            ctx.lineWidth = 3
            ctx.arc(0, 0, 30 + Math.abs(Math.cos(f / 20)) * 30, 0, Math.PI * 2)
            stroke(this.color)
        }
        this.collision = function (coll) {
            if (!cam.firstPlace && coll.isMarble && !cam.frozen) {
                cam.firstPlace = coll;
                if (cam.cutscene.enabled) {
                    cam.freeze()
                    return
                }

            }
            if (coll.isMarble && !cam.frozen) {
                cam.firstPlace ??= coll
                coll.victory()
            }
        }
    }
}
class Spawner extends Entity {
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {
        opts.shape = 'rect'
        opts.isStatic = true
        super(opts)
        this.interval = opts.interval || 50
        this.isSensor = true
        this.toggleable.add("interval")
            ;['Name', 'angle', 'restitution', 'width', 'height'].forEach(o => this.toggleable.delete(o))
        this.illustrate = function (e) {

            if (!global.editorMode) {
                if (!(e % this.interval) && !global.editorMode && !cam.frozen) {
                    let child = ran.choose([...Entity.gameSpawns]).pop()
                    if (child) {
                        Entity.gameSpawns.delete(child)
                        child.x = this.position.x + ran.range(-this.SIZE.x / 2, this.SIZE.x / 2)
                        child.y = this.position.y + ran.range(-this.SIZE.y / 2, this.SIZE.y / 2)
                        child.restitution = +あ.$('#bounciness').value
                        if (levelvalue) {
                            child.restitution *= 3
                            //i dont know but This is required for some reason and im so fucking confused literally kill
                            //me it makes no sense 😭 ive been trying to fix it for like an hour now i give up
                        }
                        let instance = new Marble(child)
                        instance.isTemporary = true

                    }
                }

            }


            ctx.rotate(e / 100)
            ctx.save()
            ctx.lineWidth = 3
            for (let i = 0, arrows = 6; i < arrows; i++) {
                ctx.beginPath()
                ctx.moveTo(5, -70 + Math.abs(Math.sin(e / 20)) * 50)
                ctx.lineTo(-5, -70 + Math.abs(Math.sin(e / 20)) * 50)
                ctx.lineTo(-0, -75 + Math.abs(Math.sin(e / 20)) * 50)
                ctx.closePath()
                stroke(this.color)
                ctx.rotate(Math.PI * 2 / arrows)
            }
            ctx.restore()
            ctx.beginPath()
            ctx.lineWidth = 3
            ctx.arc(0, 0, 30 + Math.abs(Math.sin(e / 20)) * 50, 0, Math.PI * 2)
            stroke(this.color)
        }

    }
}
class Particle extends Entity {
    constructor(opts) {
        if (new.target === Particle) {
            throw TypeError(`Abstract class ${new.target.name} not directly constructable`)
        }
        opts.isStatic = false;
        opts.shape = 'circle'
        super(opts)
        this.isParticle = true
        Body.setAngle(this, Math.random() * Math.PI * 2)
        this.isSensor = true;
        this.canBeSaved = false
        this.lifetime = opts.lifetime ?? -1
        this.illustrate = function (fr) {
            if (!(this.lifetime--) || this.opacity <= 0) {
                this.kill()
            }
            else this.particleDraw?.(fr)
        }
    }
}
class Confetti extends Particle {
    constructor(opts) {
        super(opts)
        this.size = 10 + Math.random() * 20
        Body.setVelocity(this, { x: Math.random() * 5 * ran.choose(1, -1), y: Math.random() * 5 * ran.choose(1, -1) })
        this.text = ran.choose(...'⭐️✨️💯✅️💖')
        this.particleDraw = function (f) {
            if (this.opacity <= 0) {
                this.kill()
                return
            }
            Body.applyForce(this, this.position, { x: 0, y: -engine.gravity.y / 1000 })
            ctx.rotate(f / 20)
            this.opacity -= 0.02
            ctx.font = `${this.size}px ` + cam.easterEggs.gameFont
            ctx.textBaseline = "middle"
            ctx.textAlign = "center"
            ctx.fillStyle = this.color
            ctx.fillText(this.text, 0, 0)
        }
    }
}
class DeathParticle extends Confetti {
    constructor(opts) {
        super(opts)
        this.color = c.red
        this.text = ran.choose(...'⛔❌🚫💀👻')
    }
}
class PortalParticle extends Confetti {
    constructor(opts) {
        super(opts)
        this.color = c.red
        this.text = ran.choose(...'🌀🪄')
    }
}
let mouse = {
    x: NaN,
    y: NaN
}


update()

canvas.addevent({ 
    mouseup(e) {
        cam.click.x = cam.click.y = NaN
    },
    mouseout(){
        for (let [,m]of Entity.all) {
            m.selected=false
        } 
        mouse.x=mouse.y=NaN
    },
    mousemove(e) {
        mouse.x = e.offsetX
        mouse.y = e.offsetY
    },
   
    mousedown(e) {
    if (cam.frozen) {
        return
    }
    cam.click.x = e.offsetX
    cam.click.y = e.offsetY
    //      console.log(global.chosenEntity)
    if (global.select === "put" && global.editorMode && !global.playingLevel) {
        place(global.chosenEntity)
    }
    if (global.select === "edit" && !global.playingLevel) {
        global.editorMode && (cam.following = null)
    }
}})
function startGame(fade) {
    if (!global.editorMode) {
        cam.following = global.current = null

        Entity.gameSpawns = new Set([...Entity.toSpawn.values()])
        for (let o of Entity.graveyard) {
            Entity.all.set(o.id, o)
            World.add(world, o)
        }
        Entity.graveyard = new Set
        for (let o of Entity.all.values()) {

            if (!o.isCustom) {
                continue
            }
            if (o.isTemporary) {
                o.kill()
            }
            o.reset()
        }
        for (let o of Entity.all.values()) {
            o.onexitplaymode?.()
        }
    }
    else {
        //Enter Play Mode
        frame = 0
        for (let o of Entity.all.values()) {
Matter.Sleeping.set(o,false)    
        o.onenterplaymode?.()
        }
        Entity.placements = new Set
        Entity.losers = new Set
        //    cam.behaviour = localStorage.getItem('cambehaviour') ?? 'leader'
        cam.following = global.current = null
        for (let o of Entity.all.values()) {
            o.selected = false
        }
      //  global.select = null
        showData()
        Entity.gameSpawns = new Set(ran.shuffle(...[...Entity.toSpawn.values(), ...Entity.gameSpawns]))

        Entity.graveyard.forEach(o => Entity.all.set(o.id, o))

    }
    /* let average = {
         x: [],
         y: []
     }
     for (let o of Entity.all) {
         if (o.isMarble) {
             average.x.push(o.position.x)
             average.y.push(o.position.y)
         }
             cam.x = average.x.average
     cam.y = average.y.average
   
     }*/
    if (cam.existingcam) {
        cam.x = ((-cam.existingcam.position.x) + ((canvas.width / 2) / cam.zoom)) * (cam.zoom)
        cam.y = ((-cam.existingcam.position.y) + ((canvas.height / 2) / cam.zoom)) * (cam.zoom)
    }


    global.editorMode = !global.editorMode
}
function showData(stats) {

    let me = Elem.$('#data').killChildren()
    if (!stats) {
        new Elem({ tag: 'p', text: 'Nothing selected...', parent: me })
        return
    }
    if (stats.hint) {
        new Elem({ tag: 'p', class: ['hint'], text: `Hint: ${stats.hint}`, parent: me })
    }
    new Elem({
        tag: 'button', class: ['good', 'thin'], text: 'Apply', parent: me, events: [
            ['click', () => apply(stats)]
        ]
    })
    new Elem({
        tag: 'button', class: ['good', 'thin'], text: 'Clone', parent: me, events: [
            ['click', () => clone(stats)]

        ]
    })
    new Elem({
        tag: 'button', class: ['bad', 'thin'], text: 'Delete', parent: me, events: [
            ['click', () => deleteFrom(stats)]

        ]
    })

    for (let statName of stats.toggleable) {
        let val = stats[statName]
        if (statName === 'angle') {
            new Elem({ tag: 'label', for: statName, text: 'Angle', parent: me })
            new Elem({ tag: 'input', class: ['write'], parent: me, id: statName, value: val * 180 / Math.PI })
        }

        if (statName === 'color') {
            new Elem({ tag: 'label', for: statName, text: 'Color', parent: me })
            new Elem({ tag: 'input', class: ['color'], type: 'color', parent: me, id: statName, value: val })
        }
        if (statName.match(/width|height|opacity|Name|mass|frictionAir|windSpeed|interval|size|ignoreWind|respawn|restitution/)) {
            new Elem({ tag: 'label', for: statName, text: utilString.upper(statName), parent: me })
            new Elem({ tag: 'input', class: ['write'], parent: me, id: statName, value: val })
        }


    }

}
window.ctx = ctx
addEventListener('mousewheel', function (e) {
    //resize()
    ctx.beginPath()
    ctx.rect(0, 0, canvas.width, canvas.height)
    if (ctx.isPointInPath(mouse.x, mouse.y)) {
        e.preventDefault()
        cam.zoomChange = e.deltaY / 2000;
        cam.targetZoom = Math.max(0.1, cam.zoom - cam.zoomChange);
        cam.targetZoom = Math.abs(cam.targetZoom);
    }
}, { passive: false })

addEventListener('keyup', function (e) {
    const key = e.key.toLowerCase()
    if (key === "w") {
        cam.key.w = false
    }
    if (key === "s") {
        cam.key.s = false
    }
    if (key === "a") {
        cam.key.a = false
    }
    if (key === "d") {
        cam.key.d = false
    }
},)
addEventListener('keydown', function (e) {
    if (!e.key || cam.frozen) {
        return
    }
    ctx.beginPath()
    ctx.rect(0, 0, canvas.width, canvas.height)
    if (!ctx.isPointInPath(mouse.x, mouse.y)) {
        return
    }
    const key = e.key.toLowerCase()
    if (key === "w") {
        cam.key.w = true
        cam.key.s = false
        cam.following = null
    }
    if (key === "s") {
        cam.key.s = true
        cam.key.w = false
        cam.following = null
    }
    if (key === "a") {
        cam.key.a = true
        cam.key.d = false
        cam.following = null
    }
    if (key === "d") {
        cam.key.d = true
        cam.key.a = false
        cam.following = null
    }
})

cam.x = -bounds.center.x + canvas.width / 2
cam.y = -bounds.center.y + canvas.height / 2

cam.zoom = 1


function fileChange(o) {
    let reader = new FileReader()
    reader.readAsDataURL(o.target.files[0])
    reader.onload = (o) => {

        global.current.img.src = o.target.result
        global.current.imgSrc = o.target.result
        global.current.start.img.src = o.target.result
        global.current.start.imgSrc = o.target.result
        global.current.customImage = true
        showData(global.current)
    }
}
function findMarble() {
    let foundYou = Entity.toSpawn.get(+this.name)
    /*for (let o of Entity.toSpawn) {
        if (o.id === +this.name) {
            foundYou = o
            break
        }
    }*/

    foundYou.Name = this.value
}
function findMarbleImage() {
    if (!this.value.length) {
        return
    }
    let foundYou = Entity.toSpawn.get(+this.name)
    /*  for (let o of Entity.toSpawn) {
          if (o.id === +this.name) {
              foundYou = o
              break
          }
      }*/

    foundYou.img = new Image()
    foundYou.img.src = this.value
    foundYou.imgSrc = this.value
    foundYou.customImage = true
}
function spawnEvent(id) {
    Spawn(id)
}
function deleteEvent(id) {
    Del(id)
}
function clone() {

    let params = { ...global.current.start }
    params.x += 100
    params.y += 100
    let clone = new global.current.CREATOR(params)
    clone.Name = `${clone.CREATOR.name} ${clone.id}`
    global.current = global.select = clone
    //global.current.start = {...params}
    showData(clone)
    playAudio({src:'click.mp3',interrupt:true})
    /*for (let o of Entity.all) {
        o.selected = false;
        if (o === clone) {
            o.selected = true
        }
    }*/

}
// Get the global.current URL
const url = new URL(window.location.href)

// Create a URLSearchParams object from the URL's query string
const params = new URLSearchParams(url.search);

// Get the value of the 'a' parameter
const levelvalue = params.get('level');
if (levelvalue) {



    Elem.allElements.forEach(o => {
        if (o === canvas) {
            o.content.classList.contains('hidden') && o.hide()
        }
    })
    canvas.append(body)
    document.body.style.padding = '0px';
    document.body.style.overflow = 'hidden';
    try {
        void async function () {
            //     let url = new URL('./levels/' + levelvalue + '.txt', location.hostname)
            let levelData = await fetch(`./levels/${levelvalue}.txt`)
            let text = await levelData.text()
            あ.allElements.forEach(o => o !== canvas && o !== body && o.hide())
            あ.$('#hideme').styleMe({ display: 'none' })
            Elem.$('#camBehaviour').parent = Elem.$('#secondMenu')
            Elem.$('#camBehaviour').children.forEach(o => o.content.style.display = 'flex')
            try {

                Load(text)
            }
            catch {
            }
            finally {

            }

            cam.x = cam.y = NaN
            //startGame()
            Elem.$('#camBehaviour').value = localStorage.getItem('cambehaviour')
            Elem.$('#camSpeed').content.value = cam.easterEggs.lerp
            if (cam.cutscene.enabled) {
                Elem.$('#cutscenes').content.checked = true
            } else {
                Elem.$('#cutscenes').content.checked = false

            }
            Elem.allElements.forEach((o) => {

                if (!o.content.classList.contains('gameMenu')|| o.id==='o') return
                if (o.content.id !== 'secondMenu') {
                    o.content.style.display = 'flex'
                } else {
                    o.content.style.display = 'grid'
                }
            })
            canvas.styleMe({ 'border-radius': '0px' })
            Elem.$('#secondMenu').styleMe({ display: 'none' })
            Elem.$('#startmenu').anim({ class: ['slide-in-blurred-top'] }, () => {
                Elem.$('#gameStartButton').addevent(['click', (function anonymous() {
                    this.noevent('click')
                    this.parent.anim({ class: ['slide-out-blurred-top'] }, function () {
                        this.content.style.zIndex = -1
                        let checked = Elem.$('#cutscenes').content.checked
                        localStorage.setItem('cutscenes', checked)
                        if (checked + '' === 'true') {
                            cam.cutscene.enabled = true
                        } else {
                            cam.cutscene.enabled = false
                        }
                        let bhv = Elem.$('#camBehaviour').value
                        cam.behaviour = bhv
                        if ((['leader', 'loser', 'middle', 'outliers', 'average', 'random', 'free'].some(o => o === bhv))) {
                            localStorage.setItem('cambehaviour', bhv)

                        }
                        localStorage.setItem('camspeed', Elem.$('#camSpeed').value)

                        cam.easterEggs.lerp = +localStorage.getItem('camspeed') ?? 0.1

                        Elem.$('#startmenu').hide()
                        waitForFrames(a => {
                            cam.following = cam.existinggoal ?? cam.existingspawn
                            if (!cam.cutscene.enabled) {
                                cam.x = cam.existingspawn?.x ?? cam.x
                                cam.y = cam.existingspawn?.y ?? cam.y
                                cam.following = null
                                return startGame()
                            }
                            waitForFrames(a => { cam.following = cam.existingspawn; waitForFrames(startGame, 100, 'start') }, 100, 'outro')
                        }, 30, 'intro')

                    }, true)
                })])
                Elem.$('#startmenu').removeClass('slide-in-blurred-top');
                Elem.$('#gameStartButton').content.focus()
            },)
            body.style.display = ''
        }()
    }

    finally {
        global.playingLevel = true;
        setTimeout(() => loaded = true, 10, 'afgrt')

    }


}
else {
    loaded = true
    document.body.style.display = ''
}
function lerp(start, end, t) {
    return start + (end - start) * t
}
new Elem({
    id: 'uploadedData', type: 'file', tag: 'input', events: [
        ['change', (o) => {
            let file = o.target.files[0]
            let reader = new FileReader()
            reader.readAsText(file)
            reader.onload = (data) => {
                Elem.$('#textData').content.value = data.target.result; Load(); Elem.$('#textData').content.value = ''
            }
        }]
    ]
}, true).style.display = 'none'


/*addEventListener('resize',o=>{
    if global.playingLevel {
       resize
    }
})*/
function resize() {
    let { innerWidth, innerHeight } = window
    if (canvas.height !== innerHeight) canvas.height = innerHeight
    if (canvas.width !== innerWidth) canvas.width = innerWidth
}
function getStateOfCanvas(context) {
    let obj = {}
    for (let prop of ["direction", "fillStyle", "filter", "font", "fontKerning", "fontStretch", "fontVariantCaps", "globalAlpha", "globalCompositeOperation", "imageSmoothingEnabled", "imageSmoothingQuality", "letterSpacing", "lineCap", "lineDashOffset", "lineJoin", "lineWidth", "miterLimit", "shadowBlur", "shadowColor", "shadowOffsetX", "shadowOffsetY", "strokeStyle", "textAlign", "textBaseline", "textRendering", "wordSpacing"]) {
        obj[prop] = context[prop]
    }
    return obj
}
function requestImage(input) {
    if (!cachedImages.has(JSON.stringify(input.state))) {
        d.postMessage({ state: getStateOfCanvas(ctx), value: input.value })
    }
    else {
        let bit = cachedImages.get({ ...getStateOfCanvas(ctx) }).deref()
    }
}
function imagerecieved({ data }) {
    cachedImages.set(JSON.stringify({ ...data.state, value: data.value }), data.image)
}
requestImage({ state: ctx, value: '1234' })
