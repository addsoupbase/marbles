import $ from '../../addsoupbase.github.io/yay.js'
import { on } from '../../addsoupbase.github.io/handle.js'
import { getJson } from '../../addsoupbase.github.io/arrays.js'
import * as math from '../../addsoupbase.github.io/num.js'
const { vect } = math
export const canvas = $.gid('can-vas')
let main = $.qs('main')
const images = new Map
export const svgs = new Map
export const marbles = new Map
export const game = {
    isPaused: true,
    frame: 0,
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
        for (let body of this.werentSleeping) body.sleeping = false
    },
    freeze() {
        for (let body of entities.values())
            if (!body.sleeping)
                body.sleeping = true,
                    this.werentSleeping.push(body)
    },
    pause() {
        this.frame = 0
        mouse.reset()
        for (let body of entities.values()) {
            body.sleeping = true
            body.reset()
            body.ontoggle?.('pause')
        }
        this.isPaused = true
        this.toggleDOM(false)
    },
    play() {
        this.frame = 0
        top.postMessage('hideData')
        mouse.reset()
        for (let body of entities.values()) {
            body.sleeping = false
            body.ontoggle?.('play')
        }
        this.isPaused = false
        this.toggleDOM(true)
    }
}
export const entities = new Map
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
    isPlacing: false,
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
    id: 0,
    following: null,
    speed: 30,
    waiting: new Map,
    async waitForFrames(frames, id = cam.id++) {
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
window.cam = cam
canvas.on({
    wheel({ deltaY }) {
        cam.zoom -= Math.sign(deltaY) / 80
        cam.zoom = math.clamp(cam.zoom, 0.01, 10)
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
                    mouse.place(x, y)
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
        mouse.movement.set(vect(clientX, clientY).subtract(mouse.lastmovement))
        mouse.lastmovement.set(clientX, clientY)
        if (mouse.leftClicking)
            cam.position.add(mouse.movement)
    },
    $contextmenu() { }    //  Prevent it from coming up
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
let levelName = url.searchParams.get('level')
if (top !== window) {
    init()
    top.marbles = marbles
    top.imageCache = images
    on(window, {
        message(e) {
            let { data } = e
            if (typeof data === 'string') switch (data) {
                case 'resetMouse': return mouse.reset()
                case 'Toggle': return game.toggle(game.isPaused)
                case 'Moving': return mouse.isPlacing = false
                case 'resetcam': {
                    cam.position.set(0, 0)
                    cam.zoom = 1
                    return
                }
                case 'Placing': {
                    mouse.reset()
                    return mouse.isPlacing = true
                }
                default: return console.warn('Unknown message event: ', e)
            } else {
                if ('select' in data) {
                    mouse.willPlace = data.select
                }
                else if ('title' in data && 'url' in data) {
                    images.set(data.title, data.url)
                }
                else if ('title'in data && 'svg' in data) {
                    let doc = new DOMParser().parseFromString(data.svg,'image/svg+xml')
                    svgs.set(data.title,[...doc.querySelectorAll('path')])
                }
            }
        }
    })
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
function init() {
    import('./game/define.js')
}
// Audio stuff later
export const inEditor = top !== window