import $ from '../../yay.js'
import * as h from '../../handle.js'
import * as math from '../../num.js'
import * as arr from '../../arrays.js'
import {lstorage} from '../../proxies.js'
import * as str from '../../str.js'
import ran from '../../random.js'

lstorage.music ??= 1
lstorage.sound ??= 1
const {vect} = math
export const canvas = $.gid('can-vas')
let main = $.qs('main')
export const images = new Map
export const customVertices = new Map
export const marbles = new Map

class AudioThing {
    #map = null

    get all() {
        return new Set(this.#map.values())
    }

    constructor(map) {
        this.#map = map
    }

    set volume(val) {
        for (let n of this.all) {
            n.volume = val
        }
    }

    add(music) {
        this.#map.set(music.attr.$name, music)
    }

    play(id) {
        this.#map.get(id)?.play()
    }

    pause(id) {
        this.#map.get(id)?.pause()
    }

    reset(id) {
        let a = this.#map.get(id)
        a && (a.currentTime = 0)
    }
}

const sounds = new AudioThing(new Map)
const music = new AudioThing(new Map)

function error() {
    this.destroy()
}

function playRandomMusic() {
    let {all} = music
    let pick = ran.choose(...all)
    if (this && all.size > 1) while (pick === this) pick = ran.choose(...all)
    pick.currentTime = 0
    pick.play()
    console.log(`🎵 Currently playing: %c${pick.attr.$name}.mp3 %cby %cSakuraGirl`, "color:lightblue;", '', "color:pink;")
}

console.log('%chttps://www.youtube.com/@SakuraGirl/', 'color: blue; text-decoration: underline; cursor: pointer;')
'beach flowers freshair garden leaves love peach rainbow spring'.split(' ').map(src => {
        let out = $(`<audio src="../audio/${src}.mp3" data-name="${src}" preload="auto"></audio>`)
        .on({
            '#canplaythrough'() {
                music.add(this)
            },
            '#error': error
        }, false, new AbortController).on({
            ended() {
                setTimeout(playRandomMusic.bind(this), 3000)
            },
        })
        out.volume = lstorage.music
        return out
    }
)
let doplay = setInterval(() => {
    if (navigator.userActivation.hasBeenActive) {
        clearInterval(doplay)
        playRandomMusic()
    }
}, 2000)
'click confirm pop'.split(' ').map(src => {
        let out = $(`<audio src="../audio/${src}.mp3" data-name="${src}" preload="auto"></audio>`)
        .on({
            '#canplaythrough'() {
                sounds.add(this)
            },
            '#error': error
        }, false, new AbortController)
        out.volume = lstorage.sound
    }
)
export const game = {
    isPaused: true,
    frame: 0,
    realFrame: 0,
    frozen: false,
    joints: new Set,
    end() {
    },
    send() {
        console.debug(`Message ignored since not in editor mode`)
    },
    toggle(state) {
        switch (state) {
            case 'pause':
            case false:
                return this.pause()
            case 'play':
            case true:
                return this.play()
            default:
                throw TypeError(`Bad state: ${state}`)
        }
    },
    goal: null,
    toggleDOM() {
    },
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
        this.pauseEngine()
        this.isPaused = true
        for (let body of this.all) {
            body.ontoggle?.('pause')
            // body.setStatic(true)
            body.reset()
        }
        this.toggleDOM(false)
    },
    async play() {
        if (!inEditor) {
            let delay = 1500
            let spawn = this.all.find(o => o.constructor.name === 'spawn'),
                goal = cam.goal = this.all.find(o => o.constructor.name === 'goal')
            if (goal) {
                //  Intro cutscene thingy
                cam.following = goal
                await h.wait(delay)
                if (spawn) {
                    cam.following = spawn
                    await h.wait(delay)
                }
            } else {
                cam.following = spawn
                await h.wait(delay)
            }
        } else top.postMessage('hideData')
        this.frame = 0
        mouse.reset()
        this.playEngine()
        this.isPaused = false
        for (let body of this.all) {
            // if (this.werentStatic.has(body)) body.setStatic(false)
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
    position: vect(-2000, -2000),
    zoom: 1,
    behaviour: lstorage.cam ??= 'default',
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
        for (let [key, val] of this.waiting)
            val.next().done && this.waiting.delete(key)
    }
}
canvas.on({
    wheel({deltaY}) {
        cam.targetZoom -= Math.sign(deltaY) / 80
        cam.targetZoom = math.clamp(cam.targetZoom, 0.01, 10)
    },
    pointerdown(event) {
        let {offsetX: x, offsetY: y, button, pointerId} = event
        let pos = vect(x, y).scale(1 / cam.zoom)
        canvas.setPointerCapture(pointerId)
        switch (button) {
            case 0: {   // Left Click
                mouse.reset()
                mouse.click.set(pos)
                if (mouse.isPlacing) {
                    let {x, y} = mouse.click
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
    pointerup({button}) {
        switch (button) {
            case 0: {
                mouse.clickedBody = null
                mouse.click.set(NaN, NaN);
            }
                break
            case 2:
                mouse.leftClick.set(NaN, NaN);
                break
        }
    },
    pointermove({offsetX: x, offsetY: y, clientX, clientY}) {
        let pos = vect(x, y).scale(1 / cam.zoom)
        mouse.cursor.set(pos)
        //  'movementX' and 'movementY' are, like, 
        //  really unreliable so: 
        mouse.movement.set(vect(clientX, clientY).subtract(mouse.lastmovement))
        mouse.lastmovement.set(clientX, clientY)
        if (mouse.leftClicking)
            cam.position.add(mouse.movement)
    },
    $contextmenu() {
    }    //  Prevent the menu from showing up ($ calls preventDefault())
})

function resize() {
    canvas.setAttributes({
        width: innerWidth,
        height: innerHeight
    })
}

h.on(window, resize)
h.on(window, {
    storage(e) {
        switch (e.key) {
            case 'music':
                return music.volume = e.newValue
            case 'sound':
                return sounds.volume = e.newValue
        }
    }
})
resize()
let url = new URL(location)
export let levelName = url.searchParams.get('level')

export function msg(e) {
    let {data} = e
    if (typeof data === 'string') switch (data) {
        case 'resetMouse':
            return mouse.reset()
        case 'Toggle':
            return game.toggle(game.isPaused)
        case 'Moving':
            return mouse.isPlacing = false
        case 'resetcam': {
            cam.position.set(-2000, -2000)
            cam.targetZoom = 1
            cam.zoom ||= 1
            return
        }
        case 'Placing': {
            mouse.reset()
            return mouse.isPlacing = true
        }
        default:
            return console.warn('Unknown message event: ', e)
    } else {
        // This is really bad i know.
        if ('select' in data) {
            // Select that!
            mouse.willPlace = data.select
        } else if ('title' in data && 'url' in data) {
            // It's an image!
            let n = new Image
            n.src = data.url
            images.set(data.title, n)
        } else if ('title' in data && 'svg' in data) {
            // It's an SVG!
            let doc = new DOMParser().parseFromString(data.svg, 'image/svg+xml')
            customVertices.set(data.title, [...doc.getElementsByTagName('path')])
        } else if ('vertices' in data && 'title' in data) {
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
            h.on(window, {
                message: msg
            })
        } catch {
            return start(true)
        }
    } else if (!levelName) {
        document.title = 'Choose a level - Marbles'
        let pick = $(`<div id="pick-level">
            <h1>Choose your level</h1>
            </div>`, {parent: main})
        let id
        let firstdiv = $('form #form', {
            parent: pick,
            events: {
                async $submit() {
                    try {
                        id = this.first.value
                        message.hide(3)
                        author.hide(3)
                        anchor.hide(3)
                        delete message.styles.color
                        loader.fadeIn()
                        debugger
                        let {
                            title,
                            author: authorName
                        } = await arr.getJson(`levels/${this.levelid.value.match(/\w+/)}.json`)
                        message.textContent = str.shorten(title || 'Level', 32),
                            author.textContent = str.shorten(authorName || 'Unknown', 16),
                            message.fadeIn()
                        author.fadeIn()
                        anchor.fadeIn()
                        anchor.setAttributes({href: `?level=${id}`})
                    } catch (e) {
                        reportError(e)
                        message.textContent = 'Level invalid or not found!'
                        message.setStyles({color: 'darkred'})
                        message.fadeIn()
                    } finally {
                        loader.hide(3)
                    }
                }
            }
        })
        $('<input placeholder="Enter Level Id..." class="cute-green" name="levelid" required>', {
            parent: firstdiv
        })
        $('<button class="cute-green-button">Enter</button>', {
            parent: firstdiv,
        })
        let loader = $('<div class="loader"></div>', {
            parent: pick
        }).hide(3)
        let message = $('<h2>Level Title</h2>', {
            parent: pick
        }).hide(3)
        let author = $('<cite>By Author</cite>', {
            parent: pick
        }).hide(3)
        let anchor = $(`<a id="play" class="cute-green-button">Play!</a>`, {parent: pick}).hide(3)
    } else {
        init()
    }
}()

function init() {
    import('./define.js')
}

// Audio stuff later
let inEditor
try {
    if (RegExp(/\/marbles\/edit/).test(top.location + ''))
        inEditor = top !== window
    else inEditor = false
} catch {
    inEditor = false
}
export {inEditor}