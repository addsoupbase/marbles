import $ from 'https://addsoupbase.github.io/yay.js'
import { on, wait } from 'https://addsoupbase.github.io/handle.js'
// import { getJson } from 'https://addsoupbase.github.io/arrays.js'
import * as math from 'https://addsoupbase.github.io/num.js'
const { vect } = math
export const canvas = $.gid('can-vas')
let main = $.qs('main')
export const images = new Map
export const customVertices = new Map
export const marbles = new Map
export const game = {
    isPaused: true,
    frame: 0,
    realFrame: 0,
    frozen: false,
    end() {

    },
    send() {
        console.debug(`Message ignored since not in editor mode`)
    },
    toggle(state) {
        switch (state) {
            case 'pause': case false: return this.pause()
            case 'play': case true: return this.play()
            default: throw TypeError(`Bad state: ${state}`)
        }
    },
    toggleDOM() { },
    werentSleeping: [],
    thaw() {
        this.frozen = false
        for (let body of this.werentSleeping) {
            body.restore()
        }
    },
    freeze() {
        this.frozen = true
        for (let body of this.all)
            if (!body.isSleeping)
                this.werentSleeping.push(body),
                    body.save()
    },
    pause() {
        this.frame = 0
        mouse.reset()
        this.isPaused = true
        for (let body of this.all) {
            body.ontoggle?.('pause')
            body.setSleeping(true)
            body.reset()
        }
        this.toggleDOM(false)
    },
    async play() {
        if (!inEditor) {
            let delay = 1500
            let spawn = this.all.find(o => o.constructor.name === 'spawn'),
                goal = this.all.find(o => o.constructor.name === 'goal')
            if (goal) {
                //  Intro cutscene thingy
                cam.following = goal
                await wait(delay)
                if (spawn) {
                    cam.following = spawn
                    await wait(delay)
                }
            } else {
                cam.following = spawn
                await wait(delay)
            }
        }
        else top.postMessage('hideData')
        this.frame = 0
        mouse.reset()
        this.isPaused = false
        for (let body of this.all) {
            body.ontoggle?.('play')
            body.setSleeping(false)
        }
        this.toggleDOM(true)
    }
}
export const mouse = {
    click: vect(NaN, NaN),
    leftClick: vect(NaN, NaN),
    cursor: vect(0, 0),
    selectedBody: null,
    willPlace: 'square',
    clickedThisFrame: false,
    movement: vect(0, 0),
    lastmovement: vect(0, 0),
    draggingBody: null,
    clickedBody: null,
    isPlacing: true,
    reset() {
        this.draggingBody = this.clickedBody = this.selectedBody = null
        game.send(null)
    },
    get clicking() {
        return this.click.isValid
    },
    get leftClicking() {
        return this.leftClick.isValid
    }
}
export const cam = {
    position: vect(0, 0),
    zoom: 1,
    alreadyDidTheWinnerCutsceneThingy: false,
    targetZoom: 1,
    id: 0,
    showOutlinesForImage: true,
    following: null,
    speed: 9,
    waiting: new Map,
    async waitForFrames(frames, id = cam.id++) {
        //  i haven't used this yet i don't think,
        //  but it's useful
        frames = Math.abs(+frames | 0)
        return new Promise((resolve, reject) => {
            if (cam.waiting.has(id)) return reject()
            cam.waiting.set(id,
                function* () {
                    while (frames) yield frames--
                    return resolve()
                }()
            )
        })
    },
    iterate() {
        for (let [key, val] of this.waiting) {
            let { done } = val.next()
            done && this.waiting.delete(key)
        }
    }
}
canvas.on({
    wheel({ deltaY }) {
        cam.targetZoom -= Math.sign(deltaY) / 80
        cam.targetZoom = math.clamp(cam.targetZoom, 0.01, 10)
    },
    pointerdown(event) {
        let { offsetX: x, offsetY: y, button, pointerId } = event
        let pos = vect(x, y).scale(1 / cam.zoom)
        canvas.setPointerCapture(pointerId)
        switch (button) {
            case 0: {   // Left Click
                mouse.reset()
                mouse.click.set(pos)
                if (mouse.isPlacing) {
                    let { x, y } = mouse.click
                    inEditor && mouse.place(x, y)
                    /* switch(mouse.willPlace) {
                         default: return reportError(Error(`Unknown placement: '${mouse.willPlace}'`))
                         case 'square': {
                             new obj({x,y,shape:4,radius:30})
                         }
                     }*/
                }
            }
                break
            case 2: { // Right Click
                // mouse.reset()
                cam.following = null
                mouse.leftClick.set(pos)
            }
                break
        }
    },
    pointerup({ button }) {
        switch (button) {
            case 0: {
                mouse.clickedBody = null
                mouse.click.set(NaN, NaN);
            }
                break
            case 2: mouse.leftClick.set(NaN, NaN); break
        }
    },
    pointermove({ offsetX: x, offsetY: y, clientX, clientY }) {
        let pos = vect(x, y).scale(1 / cam.zoom)
        mouse.cursor.set(pos)
        //  'movementX' and 'movementY' are, like, 
        //  really unreliable so: 
        mouse.movement.set(vect(clientX, clientY).subtract(mouse.lastmovement))
        mouse.lastmovement.set(clientX, clientY)
        if (mouse.leftClicking)
            cam.position.add(mouse.movement)
    },
    $contextmenu() { }    //  Prevent the menu from showing up ($ = preventDefault)
})
function resize() {
    canvas.setAttributes({
        width: innerWidth,
        height: innerHeight
    })
}
on(window, resize)
resize()
let url = new URL(location)
export let levelName = url.searchParams.get('level')
export function msg(e) {
    let { data } = e
    if (typeof data === 'string') switch (data) {
        case 'resetMouse': return mouse.reset()
        case 'Toggle': return game.toggle(game.isPaused)
        case 'Moving': return mouse.isPlacing = false
        case 'resetcam': {
            cam.position.set(0, 0)
            cam.targetZoom = 1
            cam.zoom ||= 1
            return
        }
        case 'Placing': {
            mouse.reset()
            return mouse.isPlacing = true
        }
        default: return console.warn('Unknown message event: ', e)
    } else {
        if ('select' in data) {
            // Select that!
            mouse.willPlace = data.select
        }
        else if ('title' in data && 'url' in data) {
            // It's an image!
            let n = new Image
            n.src = data.url
            images.set(data.title, n)
        }
        else if ('title' in data && 'svg' in data) {
            // It's an SVG!
            let doc = new DOMParser().parseFromString(data.svg, 'image/svg+xml')
            customVertices.set(data.title, [...doc.getElementsByTagName('path')])
        }
        else if ('vertices' in data && 'title' in data) {
            //  It's a vertices array thing!
            customVertices.set(data.title, data.vertices)
        }
    }
} 
void function start(ignore) {
    if (!ignore && top !== window) {
        try {
            init()
            top.marbles = marbles
            top.imageCache = images
            Object.defineProperty(top, 'entities', {
                get() {
                    return game.all
                }
            })
            on(window, {
                message: msg
            })
        }
        catch {
            return start(true)
        }
    }
    else if (!levelName) {
        document.title = 'Choose a level - Marbles'
        let pick = $(`<div id="pick-level">
            <h1>Choose your level</h1>
            </div>`, { parent: main })
        let id
        let firstdiv = $('form #form', {
            parent: pick,
            events: {
                async $submit() {
                    id = this.first.value
                    message.hide3()
                    author.hide3()
                    anchor.hide3()
                    delete message.styles.color
                    await loader.fadeIn()
                    message.fadeIn()
                    try {
                        // let json = await getJson(`./${id}`)
                        //doSomethingWithJSON(json)
                        author.fadeIn()
                        anchor.fadeIn()
                        anchor.setAttributes({ href: `?level=${id}` })
                    }
                    catch (e) {
                        message.textContent = 'Error'
                        message.setStyles({ color: 'darkred' })
                        message.fadeIn()
                    }
                    finally {
                        loader.hide3()
                    }
                }
            }
        })
        $('<input placeholder="Enter Level Id..." class="cute-green" required>', {
            parent: firstdiv
        })
        $('<button class="cute-green-button">Enter</button>', {
            parent: firstdiv,
        })
        let loader = $('<div class="loader"></div>', {
            parent: pick
        }).hide3()
        let message = $('<h2>Level Title</h2>', {
            parent: pick
        }).hide3()
        let author = $('<cite>By Author</cite>', {
            parent: pick
        }).hide3()
        let anchor = $(`<a id="play" class="cute-green-button">Play!</a>`, { parent: pick }).hide3()
    }
    else {
        init()
    }
}()
function init() {
    import('./define.js')
}
// Audio stuff later

try {
    top.a
    var inEditor = top !== window
}
catch {
    inEditor = false
}
export {inEditor}