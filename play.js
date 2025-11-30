import $, { h } from '../yay.js'
import { vect, average, avg } from '../num.js'
import color from '../color.js'
import local from '../proxies.js'
import canimate from '../canimate.js'
import { parse, jason, remove } from '../arrays.js'
import { toOrdinal } from '../str.js'
const serverURL = 'http://localhost:8000/'
// onerror = onunhandledrejection = onrejectionhandled = alert
import * as m from '../num.js'
import random from '../random.js'
delete window.Matter
// bg music
let audioImported = false
const music = []
let lastmusic = null
let started = false
function startMusicLoop() {
    if (!started) {
        loopMusic()
        started = true
    }
}
function loopMusic() {
    let choice = random.chooseFrom(music)
    if (choice === lastmusic)
        for (let i = 10; i--;)choice = random.chooseFrom(music)
    console.log(`Now playing: ${new URL('audio/' + choice, location)}`)
    audio.play(lastmusic = choice).then(() => setTimeout(loopMusic, 3000))
}
async function importAudio() {
    if (audio.volume === 0 || audioImported) return
    console.log(`%c🌸 Music By: https://www.youtube.com/@SakuraGirl/ 🌸`, 'font-size: 2em;color:pink')
    audioImported = true
    let musicNames = 'beach flowers freshair garden leaves love peach rainbow spring stars'.split(' ').map(o => o + '.mp3')
    for (let name of musicNames)
        audio.load(`./audio/${name}`).then(o => {
            music.push(name)
            o.forEach(a => a.volume = volume)
        })
    audio.load(...'chime click confirm pop'.split(' ').map(o =>
        `./audio/${o}.mp3`
    )).then(o => o.forEach(a => a.volume = volume))
}
let holding = false
let touch = false
let dragging = false
// import gif from 'https://cdn.jsdelivr.net/npm/gifuct-js@2.1.2/+esm'
// import * as decomp from'https://cdn.jsdelivr.net/npm/poly-decomp-es@0.4.2/+esm'
// import sprite from '../frames/sprite.js'
import Matter from 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/+esm'
// Matter.Common.setDecomp(decomp)
const { dialog, settings, joystickCheck, mobilejoystick, fullscreen, volumeControl, spectate } = $.id
let testlevel = top.document.getElementById('testlevel')

testlevel && $(testlevel).on({
    async $click() {
        sessionStorage.setItem('importedLevel', await exportLevelJSON())
        open('./?level=_local', '_blank').audio.volume = 0
    }
})
spectate.on({
    change() {
        lstorage.spectate = this.value
    }
})
document.body.requestFullscreen && document.fullscreenEnabled ? fullscreen.debounce({
    click() {
        $.hasFullscreen ? document.exitFullscreen() : document.body.requestFullscreen()
    }
}, 300) : fullscreen.hide(3)
let namespace = 'marbles:'
const lstorage = new local(localStorage, namespace)
if (lstorage.spectate?.startsWith('racer:')) 
    lstorage.spectate = 'manual'
let spectateType = lstorage.spectate ??= 'manual'
spectate.value = spectateType
let volume = audio.volume = +(lstorage.volume ??= .6)
volumeControl.value = (volume * 100) | 0
volumeControl.debounce({
    change() {
        lstorage.volume = this.value / 100
    }
}, 100)
h.on(window, {
    storage(e) {
        if (e.storageArea === localStorage) {
            switch (e.key.replace(namespace, '')) {
                case 'volume': {
                    volume = audio.volume = +e.newValue
                    importAudio()
                }
                    break
                case 'spectate':
                    cameraFollowing = null
                    spectateType = e.newValue
                    break
                case 'joystick': {
                    let a = joystickEnabled = e.newValue === '1'
                    if (!a) {
                        canvas.style.cursor = ''
                        mobilejoystick.hide(3)
                    }
                    else {
                        mobilejoystick.show(3)
                        canvas.style.cursor = 'none'

                    }
                }
                    break
            }
        }
    }
})
lstorage.joystick ??= navigator.maxTouchPoints && 1
let joystickEnabled = joystickCheck.checked = lstorage.joystick === '1'
joystickCheck.on({
    input() {
        lstorage.joystick = +this.checked
    }
})

mobilejoystick.matchMedia({
    'orientation:portrait'(e) {
        mobilejoystick.setStyle({
            top: `${e.matches ? 70 : 45}%`,
            left: `${e.matches ? 0 : -70}%`
        })
    }
})
let joystickPos = vect(0, 0)
mobilejoystick.on({
    move() {
        joystickPos.set(this.x * 10, this.y * 10)
    },
    release() {
        joystickPos.set(0, 0)
    }
})
// const gifWorker = new Worker('gifparsing.js', { type: 'module', name: 'gifs' })
// const gifImageData = new Map
const racers = {
    queue: [],
    active: [],
    winners: [],
    losers: []
}
function getRacers() {
    return random.shuffle(...racers.queue)
}


/*async function parseGIF(src) {
    if (!gifImageData.has(src)) {
        src = new URL(src, location).toString()
        let wait = h.until(gifWorker, 'message', null, ({message: o}) => o.data.src === src)
        gifWorker.postMessage(src)
        let { imageData } = (await wait).data
        Object.defineProperty(imageData, 'index', { value: 0, writable: 1 })
        Object.defineProperty(imageData, 'currentImage', { value: imageData[0].data, writable: 1 })
        Object.defineProperty(imageData, 'src', { value: src })
        gifImageData.set(src, imageData)
        let canvas = $('canvas', {
            attr: {
                $gif: 'true'
            }
        }, $('img', { attr: { src, style: 'display:none' } })),
            ctx = canvas.getContext('2d')
        canvas = canvas.valueOf()
        advanceGIF(imageData, ctx)
        images.set(`${src}`, canvas)
        return canvas
    }
    return gifImageData.get(src)
}*/
const { canvas } = $.id
if (joystickEnabled) {
    mobilejoystick.show(3)
    canvas.style.cursor = 'none'
}
const ctx = canvas.getContext('2d',)
const cam = vect(0, 0)
let locked = false,
    key = 0,
    zoom = 1.25,
    targetZoom = zoom
let cameraFollowing = null
ctx.imageSmoothingEnabled = false
ctx.lang &&= navigator.language
const arrowUp = / /.test.bind(/^(?:w|arrowup)$/i),
    arrowDown = / /.test.bind(/^(?:s|arrowdown)$/i),
    arrowLeft = / /.test.bind(/^(?:a|arrowleft)$/i),
    arrowRight = / /.test.bind(/^(?:d|arrowright)$/i)
let bind
let constraintsToPlace = []
let mouse = {
    dragging: null,
    clickedThisFrame: false,
    rightclickedThisFrame: false,
    position: vect(0, 0),
    click: vect(0 / 0, 0 / 0),
    rightclick: vect(0 / 0, 0 / 0),
}
{
    function getPropertyDescriptor(target, prop, ignore) {
        let val
        do if (val = Object.getOwnPropertyDescriptor(target, prop)) return val
        while ((target = Object.getPrototypeOf(target)) !== ignore)
    }
    function b(target) { return new Proxy(target, bindHandler) } bind = b
    let bindHandler = {
        get(target, prop) {
            let out = target[prop]?.bind?.(target)
            if (out) return out
            let { get, set } = getPropertyDescriptor(target, prop)
            return {
                [prop](val) {
                    return arguments.length ? set?.call(target, val) : get?.call(target)
                }
            }[prop]
        }
    }
    function longpress(t) {
        touch = null
        holding = false
        mouse.rightclick.set(translateWithCamera(t.offsetX, t.offsetY))
        mouse.rightclickedThisFrame = true
        requestAnimationFrame(() => {
            mouse.rightclick.set(0 / 0, 0 / 0)
            mouse.click.set(0 / 0, 0 / 0)
            mouse.rightclickedThisFrame = false
        })
    }
    function resize() {
        this.canvas.width = (innerWidth * devicePixelRatio) | 0
        this.canvas.height = (innerHeight * devicePixelRatio) | 0
        this.canvas.style.width = `${innerWidth}px`
        this.canvas.style.height = `${innerHeight}px`
        // mouse.position.scale(1/devicePixelRatio)
    }
    resize.call(ctx)
    let click = null
    canvas.on({
        $touchmove() { },
        '^touchend'() {
            if (!holding && dragging)
                touch = null
            mouse.dragging = null
        },
        gesturechange(e) {
            Zoom((e.scale - 1) * -.3)
        },
        $contextmenu(e) {
            switch (e.pointerType) {
                case 'mouse': break
                case 'touch':
                    holding = true
                    longpress(e)
                    break
            }
        },
        pointerdown(e) {
            let { offsetX, offsetY } = e
            switch (e.pointerType) {
                case 'touch': {
                    // e.preventDefault()
                    touch = vect(e.offsetX, e.offsetY)
                    // mouse.rightclick.set(0/0,0/0)
                    // mouse.click.set(0/0,0/0)
                }
                case 'mouse': {
                    mouse.position.set(translateWithCamera(offsetX, offsetY))
                    if (e.button === 2) {
                        mouse.rightclick.set(translateWithCamera(offsetX, offsetY))
                        mouse.rightclickedThisFrame = true
                        // mouse.dragging = true
                    }
                    else if (e.button === 0) {
                        mouse.click.set(translateWithCamera(offsetX, offsetY))
                        mouse.clickedThisFrame = true
                    }
                }
            }

            canvas.setPointerCapture(e.pointerId)
        },
        touchstart(e) { },
        pointerup(e) {
            if (e.button === 2) {
                mouse.rightclick.set(0 / 0, 0 / 0)
                mouse.dragging = null
            }
            else if (e.button === 0) {
                mouse.click.set(0 / 0, 0 / 0)
            }
            canvas.releasePointerCapture(e.pointerId)
        },
        pointermove(e) {
            let { offsetX, offsetY } = e
            if (!holding && touch) {
                dragging = true
                let o = vect(e.offsetX, e.offsetY)
                let delta = o.clone.subtract(touch)
                cam.add(delta.scale(1 / zoom))
                touch = o
            }
            if (mouse.rightclick.isValid && !key && !game.editorMode && !joystickEnabled) {
                cam.add(mouse.position.clone.subtract(mouse.rightclick))
            }
            mouse.position.set(translateWithCamera(offsetX, offsetY))
            if (mouse.dragging) {
                let { offset } = mouse.dragging
                Matter.Body.setPosition(mouse.dragging.body, mouse.position.clone.subtract(offset))
                // .scale(1/zoom)
                // .scale(1 / zoom)
            }
        },
    })
    function Zoom(scale) {
        scale = Math.sign(scale) / 20
        targetZoom -= scale
        targetZoom = m.clamp(targetZoom, .1, 100)
    }
    canvas.on({
        $wheel({ deltaY: y }) {
            Zoom(y)
        }
    })
    h.on(window, {
        fullscreenerror(e) {
            console.error(e.message)
        },
        resize: resize.bind(ctx),
        '_load': start,
        keyup({ key: Key }) {
            if (Key === 'Shift') return shift = false
            if (arrowUp(Key)) return key &= ~0b1000
            if (arrowDown(Key)) return key &= ~0b0100
            if (arrowLeft(Key)) return key &= ~0b0010
            if (arrowRight(Key)) return key &= ~0b0001
        },
        keydown({ key: Key }) {
            if (Key === 'Shift') return shift = true
            if (arrowUp(Key)) return key |= 0b1000
            if (arrowDown(Key)) return key |= 0b0100
            if (arrowLeft(Key)) return key |= 0b0010
            if (arrowRight(Key)) return key |= 0b0001
        }
    })
}
let shift = false
const { rotate, beginPath, moveTo, lineTo, stroke, fill, clearRect, save, closePath, translate, scale, restore, strokeRect, strokeStyle, fillStyle, arc } = bind(ctx)
// const inPath = Reflect.apply.bind(1, ctx.isPointInPath, ctx)
const engine = Matter.Engine.create({
    // sleepThreshold: 60,
    // enableSleeping: true,
}
    // enableSleeping: true,
    // sleepThresho
    // gravity: {
    //     x: 0, y: 0,
    //     scale: 0
    // }
), { world } = engine
const base = {
    friction: 1,
    // frictionAir: 0
    density: 1,
    restitution: 1,
    slop: 0
}
function translateWithCamera(x, y) {
    x = (x - innerWidth / 2) / zoom + innerWidth / 2
    y = (y - innerHeight / 2) / zoom + innerHeight / 2
    y -= cam.y
    x -= cam.x
    return vect(x, y)
}
const runner = Matter.Runner.create()
function saveBodyAttributes(body) {
    return body.savedAttributes = {
        angle: body.angle,
        position: { ...body.position },
        restitution: body.restitution,
        friction: body.friction,
        frictionAir: body.frictionAir,
        density: body.density,
        isStatic: body.isStatic,
        isSensor: body.isSensor,
        color: body.render.fillStyle,
        scale: { ...body.scale },
        // angularSpeed: body.angularSpeed,
        // angularVelocity: body.angularVelocity,
        inertia: body.inertia,
        // label: body.label,
        // velocity: {...body.velocity },
    }
}
function setScale(body, width, height) {
    let { angle } = body
    Matter.Body.setAngle(body, 0)
    Matter.Body.scale(body, 1 / body.scale.x, 1 / body.scale.y)
    body.scale.x = +width || 1
    body.scale.y = +height || 1
    Matter.Body.scale(body, width, height)
    calculateSizeByBounds(body)
    Matter.Body.setAngle(body, angle)
}
function restoreBodyAttributes(body) {
    let attr = body.savedAttributes
    Matter.Body.setPosition(body, attr.position)
    Matter.Body.setAngle(body, attr.angle)
    Matter.Body.setAngularVelocity(body, 0)
    Matter.Body.setVelocity(body, { x: 0, y: 0 })
    Matter.Body.setInertia(body, attr.inertia)
    Matter.Body.setAngularSpeed(body, 0)
    Matter.Body.setSpeed(body, 0)
    Matter.Body.scale(body, 1 / body.scale.x, 1 / body.scale.y)
    Matter.Body.scale(body, attr.scale.x, attr.scale.y)
    // body.angularSpeed = attr.angularSpeed
}
let game = {
    goal: null,
    stop() {
        game.goal = null
        game.active = false
        for (let o of all()) {
            o.isSleeping = true
            if (o.entityType === 'marble') destroy(o)
            else restoreBodyAttributes(o)
            // o.isSleeping = true
        }
        for (let o of joints()) {
            Object.assign(o.pointA, o.savedPointA)
            Object.assign(o.pointB, o.savedPointB)
        }
        pause()
    },
    async start() {
        if (!this.editorMode) {
            let delay = 1500
            let spawner = all().find(o => o.entityType === 'spawner')
            let goal = game.goal = all().find(o => o.entityType === 'goal')
            if (spawner && goal) {
                cameraFollowing = goal
                await h.wait(delay)
                cameraFollowing = spawner
                await h.wait(delay)
            }
            else if (goal) {
                cameraFollowing = goal
                await h.wait(delay)
            }
            else if (spawner) {
                cameraFollowing = spawner
                await h.wait(delay)
            }
            cameraFollowing = null
            fullscreen.classList.add('playing')
        }
        // Time.frame = 0
        game.active = true
        racers.active = random.shuffle(...racers.queue)
        resume()
        reviveBodies()
        for (let o of all()) {
            o.isSleeping = false
            saveBodyAttributes(o)
        }
        for (let o of joints()) {
            Object.assign(o.savedPointA, o.pointA)
            Object.assign(o.savedPointB, o.pointB)
        }
    },
    showNames: true,
    editorMode: false,
    active: false,
}
function pause() {
    runner.enabled = false
}
function resume() {
    runner.enabled = true
}
function fixedUpdate() {
    setTimeout(fixedUpdate, 10)
    ++Time.fixed
    if (document.hidden) return
}
const Time = {
    tick: 0,
    fixed: 0,
    frame: 0
}
let placingPhase = 'none'
const all = Matter.Composite.allBodies.bind(Matter.Composite, world),
    joints = Matter.Composite.allConstraints.bind(Matter.Composite, world)
function showControlsForEntity(ent) {
    currentEntity = ent
    for (let n of joints()) {
        n.render.focused = false
    }
    parent.postMessage({
        name: 'showEntityControls',
        value: {
            body: {
                image: ent.render.imageSource,
                ...ent.savedAttributes, label: ent.label, constraints:
                    Array.from(ent.constraints, function (o) {
                        return {
                            // id: o.id,
                            length: o.length,
                            damping: o.damping,
                            offsetA: o.pointA,
                            offsetB: o.pointB,
                            // pointA: o.pointA,
                            // pointB: o.pointB,
                            // bodyA: o.bodyA?.id,
                            // bodyB: o.bodyB?.id,
                            stiffness: o.stiffness
                        }
                    })
            },
        }
    })
}
function collisionEnter({ pairs }) {
    for (let i = pairs.length; i--;) {
        let { bodyA, bodyB } = pairs[i]
        bodyA.onCollisionEnter?.(bodyB)
        bodyB.onCollisionEnter?.(bodyA)
    }
}
function collision() { }
let currentEntity = null
let placing = 'circle'
function start() {
    for (let i in Matter.Composite)
        Object.defineProperty(game, i, {
            value: Matter.Composite[i].bind(Matter, world)
        })
    Matter.Events.on(engine, 'beforeUpdate', beforetick)
    Matter.Events.on(engine, 'afterUpdate', aftertick)
    Matter.Events.on(engine, 'collisionStart', collisionEnter)
    Matter.Events.on(engine, 'collisionActive', collision)
    Matter.Runner.run(runner, engine)
    frameUpdate()
    fixedUpdate()
    pause()
    /* let a = shape(300, 300, 4, 20)
     let b = shape(400, 400, 4, 20)
     game.add(b)
     game.add(a)
     let c = constraint({
         bodyB: a, pointA: { x: 30, y: 300 },
         stiffness: 0.01
     })
     game.add(c)
     let turn = shape(450, 500, 4, 300, 40)
     game.add(turn)
     let thing = constraint({
         pointA: vect(450, 500),
         bodyB: turn,
         length: 0
     })
     game.add(thing)*/
    // !async function () {
    //     let a = await cacheImage('http://localhost:3000/cute-emojis/emojis/019535569799442287.gif')
    //     debugger
    //     setBodyImage(turn, a)
    // }()
    // showControlsForEntity(c)
    // setTimeout(() => disableBody(a), 1000)
    // game.add(constraint(n,n))
    // Matter.Runner.stop(runner,engine)
    // game.add(setColor(shape(0, -100, 30, 20), color.choose()),)
    // game.add(setColor(shape(0, -100, 3, 20), color.choose()),)
    // let wall = shape(0, 100, 4, 20)
    // wall.isStatic = true
    // Matter.Body.scale(wall, 10, 1)
    // setColor(wall, 'teal')
    // game.add(wall)
    try {
        if (top.location.pathname === '/marbles/edit.html') startEditorMode()
        else startPlayMode()
    }
    catch {
        startPlayMode()
    }
    function startEditorMode() {
        game.editorMode = true
        fullscreen.hide(3)
        console.log('editor mode')
        canvas.on({
            click(e) {
                if (game.active) return
                let { x, y } = mouse.position
                let dfltScale = 30
                switch (placing) {
                    default: return console.warn('Invalid entity type to place:', placing)
                    case 'bomb': {
                        var n = bomb(x, y, 25)
                    }
                        break
                    case 'marble': {
                        var n = marble(x, y, 25)
                    }
                        break
                    case 'spawner': {
                        var n = spawner(x, y)
                    }
                        break
                    case 'goal': {
                        var n = goal(x, y)
                    }
                        break
                    case 'circle': {
                        var n = ball(x, y, dfltScale)
                    }
                        break
                    case 'square': {
                        var n = shape(x, y, 4, dfltScale)
                    }
                        break
                    case 'triangle': {
                        var n = shape(x, y, 3, dfltScale)
                    }
                        break
                }
                n.isSleeping = true
                game.add(n)
                showControlsForEntity(n)
            },
        })
        h.on(window, {
            message(e) {
                let { data } = e
                switch (data.name) {
                    default: console.error('Unknown message type!', data)
                        debugger
                        break
                    case 'startAudio':
                        setTimeout(startMusicLoop, 500)
                        break
                    case 'exportLevel': exportLevel(data.title, data.author)
                        break
                    case 'importLevel':
                        importLevel(data.json)
                        break
                    case 'deleteRacer': {
                        let { index } = data
                        debugger
                        if (!racers.queue[index]) {
                            throw TypeError(`Invalid index: ${index}`)
                        }
                        remove(racers.queue, index)
                    }
                        break
                    case 'createRacer': createRacer(data.value)
                        break
                    case 'updateRacer': {
                        let { index, label, image, color } = data.value
                        let racer = racers.queue[index]
                        racer.image = images.get(image) || 'none'
                        racer.color = color
                        if (label !== 'Racer Name') {
                            racer.label = label
                        }
                    }
                        break
                    case 'focusConstraint':
                        var bool = true
                    case 'blurConstraint':
                        var bool = bool
                        let { index } = data;
                        [...currentEntity.constraints][index].render.focused = bool
                        // console.log(index)
                        break
                    case 'newImageTransfer': {
                        cacheImage(data.url)
                    }
                        break
                    // case "placeNewConstraint": {
                    // placingPhase = '1st'
                    // }
                    // break
                    case "deleteConstraint": if (!game.active) {
                        let { index } = data,
                            arr = [...currentEntity.constraints]
                        arr[index].destroy()
                    }
                        break
                    case 'resetCameraPosition': {
                        cameraFollowing = { x: 0, y: 0 }
                        targetZoom = 1.25
                        key = 0
                    }
                        break
                    case 'focusEntityFromSearchField': {
                        let { id } = data
                        let target = all().find(o => o.id === id)
                        if (target) {
                            cameraFollowing = target
                            showControlsForEntity(target)
                        }
                    }
                        break
                    case 'entityQuery': {
                        let { search } = data
                        let match = search.replace(/[\s\t\r\n]/g, '').toLowerCase()
                        let a = all().filter(o => o.label.replace(/[\s\t\r\n]/g, '').toLowerCase().includes(match)).sort((b, a) => a.hasCustomName - b.hasCustomName)
                        parent.postMessage({
                            name: 'entityQueryResult',
                            result: a.map(function (p) { return { id: p.id, label: p.label, color: p.render.fillStyle } }),
                        })
                    }
                        break
                    case 'delete': {
                        if (!game.active)
                            destroy(currentEntity)
                    }
                        break
                    case 'clone': {
                        if (!game.active)
                            clone(currentEntity)
                    }
                        break
                    case 'updateStats': {
                        if (currentEntity && !game.active) {
                            let stats = data.value
                            setScale(currentEntity, stats.scale.x, stats.scale.y)
                            setColor(currentEntity, stats.color)
                            setBodyImage(currentEntity, images.get(stats.image))
                            Matter.Body.setAngle(currentEntity, stats.angle)
                            Matter.Body.setDensity(currentEntity, stats.density)
                            currentEntity.friction = stats.friction
                            currentEntity.frictionAir = stats.frictionAir
                            currentEntity.restitution = stats.restitution
                            currentEntity.isStatic = stats.isStatic
                            currentEntity.isSensor = stats.isSensor
                            if (currentEntity.label !== stats.label) {
                                currentEntity.hasCustomName = true
                            }
                            currentEntity.label = stats.label
                            let toArray = [...currentEntity.constraints]
                            stats.constraints.forEach(function (o, i) {
                                let joint = toArray[i]
                                let { offsetA, offsetB } = o
                                Object.assign(joint.pointA, offsetA)
                                Object.assign(joint.pointB, offsetB)
                                delete o.offsetA
                                delete o.offsetB
                                for (let prop in o)
                                    joint[prop] = o[prop]
                            })
                            saveBodyAttributes(currentEntity)
                        }
                        else {
                            console.warn('Tried to update stats but no entity was selected.')
                        }
                    }
                        break
                    case 'gametoggle': {
                        data.value ? game.start() : game.stop()
                    }
                        break
                    case 'setPlacingEntity': {
                        placingPhase = 'none'
                        constraintsToPlace.length = 0
                        placing = data.value
                        console.log('Now placing:', placing)
                        if (placing === 'constraint') {
                            placingPhase = '1st'
                            constraintsToPlace.length = 0
                        }
                    }
                        break
                }
            }
        })
    }
    function levelPicker() {
        settings.hide(3)
        dialog.show(3)
        let d = $('<form autocomplete="off" writingsuggestions="false" spellcheck="false"></form>', {
            events: {
                async $submit() {
                    let level = encodeURIComponent(this.level.value)
                    levelPreview.hide(2)
                    playButton.hide(3)
                    invalidLevel.textContent = authorElement.textContent = titleElement.textContent = ''
                    try {
                        let json
                        if (level === '_local') {
                            json = parse(sessionStorage.getItem('importedLevel'))
                        }
                        else json = await jason(`./levels/${encodeURIComponent(level)}.json`)
                        // await jason(`${serverURL}?level=${encodeURIComponent(level)}`)
                        let { title, author } = json
                        levelPreview.show(2).fadeIn()
                        authorElement.textContent = author
                        titleElement.textContent = title
                        playButton.show(3)
                        playButton.setAttr({ href: `?level=${encodeURIComponent(levelInput.value)}` })
                    }
                    catch (e) {
                        console.error(e)
                        invalidLevel.textContent = 'Level not found!'
                        invalidLevel.fadeIn()
                    }
                }
            },
            attr: {
                style: 'display:grid;justify-content:center;justify-items:center'
            },
            parent: dialog.first
        })

        d.push($('<h1>Choose a level</h1>'))
        let levelInput = $('input .cute-green', {
            attr: {
                required: true,
                name: 'level',
                style: 'display:none',
                placeholder: 'Level Here...'
            },
            parent: d
        })

        let search = $('button .cute-green-button', {
            textContent: 'Search',
            attr: {
                style: 'width:fit-content;display:none'
            },
            parent: d
        })
        d.push($`<a href="edit.html" class="cute-green-button">Create Level</a>`)
        let levelUploadButton = $('button .cute-green-button', {
            textContent: 'Import Level',
            events: {
                $click() {
                    levelUpload.click()
                }
            },
            parent: d
        })
        let levelUpload = $('<input type="file" accept=".json">', {
            events: {
                async change() {
                    sessionStorage.setItem('importedLevel', await this.files[0].text())
                    // location.assign('?level=_local')
                    let { value } = levelInput
                    levelInput.value = "_local"
                    search.click()
                    levelInput.value = value
                }
            }
        })
        let levelPreview = $('div.levelpreview.grid', {
            parent: d,
        }).hide(2)
        let titleElement = $('h2', {
            parent: levelPreview
        })
        let authorElement = $("cite", {
            parent: levelPreview
        })
        let invalidLevel = $("h2 #levelerrormsg", {
            parent: d
        })
        let playButton = $('a.cute-green-button', {
            textContent: "Play!",
            parent: levelPreview,
            /*events: {
                _click() {
                    location.assign(`?level=${encodeURIComponent(levelInput.value)}`)
                }
            }*/
        }).hide(3)
    }
    async function startPlayMode() {
        dialog.show(3)
        settings.on({
            click() {
                this.after.show(3)
                this.hide(3)
            }
        })
        // console.log('play mode')
        let d = dialog.first
        dialog.valueOf()[h.safari ? 'showModal' : 'show']()
        // alert(dialog.style.display)
        let level = new URLSearchParams(location.search).get('level')
        if (level) {
            let heading = $('<h1></h1>', { parent: d })
            let author = $('cite', { parent: d })
            try {
                let start = $('<button class="cute-green-button" autofocus>Play</button>', { parent: d })
                let data
                if (level === '_local') {
                    let body = sessionStorage.getItem('importedLevel')
                    data = parse(body)
                    // sessionStorage.removeItem('importedLevel')
                }
                else data = await jason(`./levels/${encodeURIComponent(level)}.json`)
                // await jason(`${serverURL}?level=${encodeURIComponent(level)}`)
                importLevel(data)
                let { author: a, title: t } = data
                heading.textContent = t
                author.textContent = a
                start.on({
                    async _click() {
                        // let pr = dialog.until('animationend', 'animationcancel')
                        dialog.classList.add('slide-out-blurred-top')
                        await h.wait(1000)
                        dialog.close()
                        game.start()
                        startMusicLoop()
                    }
                })
                setTimeout(start.focus.bind(start), 100)
            }
            catch (e) {
                dialog.first.destroy()
                console.error(e)
                levelPicker()
            }
        }
        else if (!game.editorMode) {
            levelPicker()
        }
    }
}
function clone(body) {
    let { x, y } = body.position,
        { x: width, y: height } = body.savedAttributes.scale
    let out
    switch (body.entityType) {
        case 'marble': out = marble(x + width, y + height, Math.max(width, height))
            break
        default: out = shape(x + width, y + height, body.sides, width, height)
    }
    Matter.Body.setAngle(out, body.angle)
    out.restitution = body.restitution
    Matter.Body.setDensity(out, body.density)
    out.friction = body.friction
    out.frictionAir = body.frictionAir
    out.isStatic = body.isStatic
    out.isSensor = body.isSensor
    let n = images.get(body.render.imageSource)
    setBodyImage(out, n)
    setColor(out, body.render.fillStyle)
    saveBodyAttributes(out)
    game.add(out)
    showControlsForEntity(out)
    cameraFollowing = out
}
function init(n, width, height) {
    n.entityType = 'generic'
    n.scale = {
        x: 1,
        y: 1
    }
    setScale(n, width, height)
    n.render.image = null
    n.render.showName = false
    n.draw = draw
    setColor(n, color.choose())
    saveBodyAttributes(n)
}
const images = new Map
const defaultcanvaswidth = 700
async function cacheImage(src) {
    src = new URL(src, location).toString()
    // console.log(`Caching image ${src}`)
    if (images.has(src)) return images.get(src)
    let data = await fetch(src)
    if (data.headers.get('content-type') === 'image/gif') {
        let a = await canimate(src)
        images.set(src, a)
        return a
    }
    let img = new Image,
        wait = h.until(img, 'load', 'error')
    img.src = src
    img.loaded || await wait
    let width = Math.min(defaultcanvaswidth, img.naturalWidth),
        height = Math.min(defaultcanvaswidth, img.naturalHeight)
    let canvas = $(`<canvas width="${width}" height="${height}" data-src="${src}"></canvas>`)
    let context = canvas.getContext('2d')
    context.drawImage(img, 0, 0, width, height)
    context.imageSmoothingEnabled = false
    let out = canvas.valueOf()
    canvas.push(img)
    img.style.display = 'none'
    images.set(`${src}`, out)
    // images.set(src, await new Promise(function (resolve, reject) {
    //     canvas.toBlob(resolve, 'image/png', 1)
    // }))
    return out
}
function setBodyImage(body, image) {

    if (image == null || image === 'none') {
        return body.render.image = null
    }
    else if (image.matches('img')) return cacheImage(image.src).then(setBodyImage.bind(1, body))
    if (image.matches('canvas')) body.render.image = image
    else throw TypeError('Invalid image')
}
function shape(x, y, shape, width, height) {
    width ||= 1
    height ||= width
    let out = Matter.Bodies.polygon(x, y, shape, 1, base)
    // debugger
    queueMicrotask(Reflect.preventExtensions.bind(1, out))
    out.sides = shape
    Object.defineProperty(out.render, 'imageSource', {
        get: getImageSrc,
        enumerable: true
    })
    out.label = genName('Polygon')
    out.constraints = new Set
    out.hasCustomName = false
    init(out, width, height)
    return out
}
function getImageSrc() {
    let { image } = this
    return image?.dataset.src ?? null
}
function ball(x, y, width, height) {
    let out = shape(x, y, 25, width, height)
    return out
}
function bomb(x, y, width, height) {
    let out = ball(x, y, width, height)
    out.draw = drawBomb
    return out
}
function drawBomb() {
    drawPath.call(this)
    strokeStyle(this.render.strokeStyle)
    stroke()
    // beginPath()
    // strokeRect(this.position.x, this.position.y, 30,30)
}
const disabled = new Set
function disableBody(body) {
    disabled.add(body)
    game.remove(body)
}
function enableBody(body) {
    disabled.delete(body)
    game.add(body)
}
function reviveBodies() {
    disabled.forEach(enableBody)
    disabled.clear()
}
function marble(x, y, size) {
    let out = ball(x, y, size, size, base)
    out.friction = base.friction / 10
    out.render.showName = true
    out.entityType = 'marble'
    out.enteringGoal = false
    out.enterAnimation = marbleEnterAnimation(60, out)
    out.draw = drawMarble
    out.currentGoal = null
    return out
}
function* marbleEnterAnimation(i, o) {
    let goal = vect(o.currentGoal.position)
    let pos = vect(o.position)
    let og = pos.clone
    cameraFollowing = og
    o.render.showName = false
    while (i--) {
        pos.lerp(goal, .08)
        setScale(o, o.scale.x - .5, o.scale.y - .5)
        Matter.Body.setPosition(o, pos)
        // debugger
        Matter.Body.rotate(o, .1)
        Matter.Body.setPosition(o, pos)
        yield vect(Math.sin(Time.frame / 10) * 10, Math.cos(Time.frame / 10) * 10)
    }
    destroy(o)
}
function drawMarble() {
    if (this.enteringGoal) {
        let { done, value } = this.enterAnimation.next()
        // debugger
        if (done) this.enteringGoal = false
        else translate(value.x, value.y)
    }
    draw.call(this)
}
function spawner(x, y, spawnRate) {
    let out = ball(x, y, 15)
    out.isSensor = true
    out.isStatic = true
    out.draw = drawSpawner
    out.spawnRate = +spawnRate || 30
    out.entityType = 'spawner'
    out.label = genName('Spawner')
    out.afterupdate = spawn
    // out.onCollisionEnter = onEnteredSpawner
    return out
}
function spawn() {
    if (game.active && racers.active.length && !(Time.tick % this.spawnRate)) {
        let racer = racers.active.pop()
        if (!racer) debugger
        let { x, y } = this.position
        let { width, height } = this.cachedSize
        let marb = marble(x + random.range(-width, width), y + random.range(-height, height), 25)
        marb.label = racer.label
        setBodyImage(marb, racer.image)
        setColor(marb, racer.color)
        game.add(marb)
    }
}
function goal(x, y) {
    let out = ball(x, y, 15)
    out.isSensor = true
    out.isStatic = true
    out.entityType = 'goal'
    out.draw = drawGoal
    out.label = genName('Goal')
    out.onCollisionEnter = onEnteredGoal
    return out
}
function constraint(e) {
    let out = Matter.Constraint.create(e)
    out.render.focused = false
    e.bodyA.constraints.add(out)
    e.bodyB.constraints.add(out)
    out.destroy = removeConstraint
    out.savedPointA = { ...out.pointA }
    out.savedPointB = { ...out.pointB }
    return out
}
function removeConstraint() {
    this.bodyB.constraints.delete(this)
    this.bodyA.constraints.delete(this)
    game.remove(this)
}
function destroy(body) {
    game.remove(body)
    disabled.delete(body)
    body.constraints.forEach(o => removeConstraint.call(o))
    if (currentEntity === body) {
        currentEntity = null
        parent.postMessage({
            name: 'hideEntityControls'
        })
    }
    if (mouse.dragging === body) mouse.dragging = null
    if (cameraFollowing === body) cameraFollowing = null
    if (constraintsToPlace.includes(body)) {
        constraintsToPlace.length = 0
        placingPhase = placingPhase === 'none' ? 'none' : '1st'
    }
}
async function onEnteredGoal(e) {
    if (e.entityType === 'marble' && game.active) {
        if (game.editorMode) {
            return destroy(e)
        }
        let already = !!racers.winners.length
        racers.winners.push(e)
        if (!already) {
            pause()
            var old = cameraFollowing
            cameraFollowing = e
            var oldzoom = targetZoom
            targetZoom = 1.5
            await h.wait(1000)
        }
        e.currentGoal = this
        e.enteringGoal = true
        e.isSensor = e.isStatic = true
        e.velocity.x = e.velocity.y = 0
        if (!already) {
            await h.wait(400)
            cameraFollowing = old
            targetZoom = oldzoom
            resume()
        }
        leaderboard()
    }
}
async function leaderboard() {
    let len = racers.winners.length + racers.losers.length
    if (len === racers.queue.length) {
        settings.parent.hide(3)
        let div = dialog.first
        div.destroyChildren()
            .setStyle({
                'overflow-x': 'scroll',
                display: '-webkit-inline-box'
            })
        let results = dialog.afterbegin = ($('<h1 style="visibility:hidden">Results</h1>'))
        /*div.on({
            '^wheel'(e) {
                div.scrollLeft += e.wheelDeltaY
            }
        })*/
        function appendRacer(n, placement = 'winner', pos) {
            let { image } = n.render
            let title = `${n.label}`
            if (placement === 'loser') title += '— disqualified'
            else title += ` — ${toOrdinal(pos)} place`
            let figure = $(`figure .${placement}`, {
                attr: { title },
                parent: div
            })
            let outline = n.render.strokeStyle
            if (image) {
                // image.setAttribute('title', n.label)
                image.setAttribute('alt', n.label)
                image.dataset.placing = pos
                image.style.outlineColor = outline
                image.classList.add('avatar',)

                figure.push(image)
            }
            else figure.push($`<div data-placing="${pos}" class="avatar" style="background-color:${n.render.fillStyle};outline-color: ${outline}"></div>`)
            figure.push($`<figcaption>${n.label}</figcaption>`)
        }
        for (let [i, n] of racers.winners.entries()) {
            appendRacer(n, 'winner', i + 1)
        }
        for (let [i, n] of racers.losers.entries()) {
            appendRacer(n, 'loser', i + 1)
        }
        await h.wait(2000)
        let w = canvas.until('transitionend', 'transitioncancel')
        canvas.styles.filter = "blur(4px)"
        await w
        dialog.show()
        dialog.classList.remove('slide-out-blurred-top')
        dialog.classList.add('slide-in-blurred-top')
        setTimeout(() => { results.classList.add('results'); results.show(2) }, 1000)
    }
}
function drawArrows(c) {
    for (let i = 0, arrows = 6; i < arrows; i++) {
        ctx.beginPath()
        ctx.moveTo(5, -70 + c * 50)
        ctx.lineTo(-5, -70 + c * 50)
        ctx.lineTo(-0, -75 + c * 50)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.rotate(Math.PI * 2 / arrows)
    }
}
function drawArrowsBackwards(c) {
    for (let i = 0, arrows = 6; i < arrows; i++) {
        ctx.beginPath()
        ctx.moveTo(5, -50 + c * 40)
        ctx.lineTo(-5, -50 + c * 40)
        ctx.lineTo(-0, -46 + c * 40)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.rotate(Math.PI * 2 / arrows)
    }
}
function drawSpawner() {
    if (mouseRightClickInVertices(this)) {
        click(this, 'right')
        mouse.rightclickedThisFrame = false
    }
    let { x, y } = this.position
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    ctx.strokeStyle = this.render.strokeStyle
    ctx.fillStyle = this.render.fillStyle
    ctx.translate(x, y)
    // ctx.scale(.4, .4)
    ctx.rotate(Time.frame / 100)
    let c = Math.abs(Math.sin(Time.frame / 20))
    ctx.beginPath()
    ctx.lineWidth = 3 / zoom
    // ctx.globalCompositeOperation = "source-over"
    ctx.arc(0, 0, (this.scale.x / 4) + (c * 30), 0, Math.PI * 2)
    // this.outline()
    // this.inCurrentPath()
    ctx.stroke()
    ctx.fill()
    ctx.globalCompositeOperation = "source-over"
    drawArrows(c)
    // ctx.globalAlpha = this.render.opacity / 4
    ctx.restore()

}
function drawGoal() {
    let { x, y } = this.position
    if (mouseRightClickInVertices(this)) {
        click(this, 'right')
        mouse.rightclickedThisFrame = false
    }
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    ctx.strokeStyle = this.render.strokeStyle
    ctx.fillStyle = this.render.fillStyle
    ctx.translate(x, y)
    // ctx.scale(.4, .4)
    ctx.rotate(Time.frame / 100)
    let c = Math.abs(Math.cos(Time.frame / 20))
    ctx.beginPath()
    ctx.lineWidth = 3 / zoom
    // ctx.globalCompositeOperation = "source-over"
    ctx.arc(0, 0, (this.scale.x / 4) + (c * 30), 0, Math.PI * 2)
    // this.outline()
    // this.inCurrentPath()
    ctx.stroke()
    ctx.fill()
    ctx.globalCompositeOperation = "source-over"
    drawArrowsBackwards(c)
    // ctx.globalAlpha = this.render.opacity / 4
    ctx.restore()
}
function setColor(body, col) {
    let { render } = body
    render.strokeStyle = color.dhk(color(col), 40)
    render.fillStyle = col
    return body
}
function afterupdate() {

}
function beforetick() {
    let a = all()
    for (let i = a.length; i--;) {
        let n = a[i]
        if (!isFinite(n.position.x) || !isFinite(n.position.y)) {
            destroy(n)
        }
    }
}
function aftertick() {
    ++Time.tick
    for (let o of all()) {
        o.tick?.()
    }
}
function generalDraw(n) {
    n.draw ? n.draw() : draw.call(n)
}
// function advanceGIF(e, ctx) {
//     let { canvas } = ctx
//     let { index } = e,
//         i = e.index = (index + 1) % e.length,
//         cur = e[i]
//     let img = e.currentImage = cur.data
//     let width, height
//     ctx.clearRect(0, 0, width = canvas.width = img.width, height = canvas.height = img.height)
//     ctx.drawImage(img, 0, 0)
//     setTimeout(advanceGIF, cur.delay, e, ctx)
// }
function frameUpdate() {
    ++Time.frame
    requestAnimationFrame(frameUpdate)
    zoom = m.lerp(zoom, targetZoom, 0.07)
    if (runner.enabled) {
        if (spectateType !== 'manual') {
            let marbs = all().filter(o => o.entityType === 'marble')
            if (marbs.length) switch (spectateType) {
                default: if (spectateType.startsWith('racer:')) {
                    cameraFollowing = marbs.find(o => o.label === spectateType.slice(6)) || null
                }
                    break
                case 'averageNoOutliers':
                    debugger
                    var func = avg
                case 'average': {
                    func = average
                    let xS = []
                    let yS = []
                    for (let mar of marbs) {
                        xS.push(mar.position.x)
                        yS.push(mar.position.y)
                    }
                    cameraFollowing = vect(func(...xS), func(...yS))
                }
                    break
                case 'middle': {
                    let comparison = (a, b) => vect.distance(a.position, game.goal.position) - vect.distance(b.position, game.goal.position)
                    cameraFollowing = marbs.sort(
                        comparison
                    )[Math.floor(marbs.length / 2)]
                }
                    break
                case 'last':
                    var comparison = (a, b) => vect.distance(a.position, game.goal.position) - vect.distance(b.position, game.goal.position)
                case 'first': {
                    comparison = (b, a) => vect.distance(a.position, game.goal.position) - vect.distance(b.position, game.goal.position)
                    cameraFollowing = marbs.sort(
                        comparison
                    )[0]
                }
                    break
            }
        }
    }
    if (cameraFollowing) {
        let { x, y } = cameraFollowing.position || cameraFollowing
        cam.lerp(vect(-x, -y).add(innerWidth / 2, innerHeight / 2), .1 * Math.max(zoom, 1))
    }

    if (!locked && (!cameraFollowing || !game.active)) {
        let dis = 5 / Math.min(zoom, 1)
        if (key & 0b1000) {
            cameraFollowing = null
            cam.y += dis, mouse.position.add(0, -dis)
        }
        else if (key & 0b0100) {
            cameraFollowing = null
            cam.y -= dis, mouse.position.add(0, dis)
        }
        if (key & 0b0010) {
            cameraFollowing = null
            cam.x += dis, mouse.position.add(-dis, 0)
        }
        else if (key & 0b0001) {
            cameraFollowing = null
            cam.x -= dis, mouse.position.add(dis, 0)
        }
    }
    if (joystickEnabled) {
        cam.subtract(joystickPos)
    }
    clearRect(0, 0, innerWidth * devicePixelRatio, innerHeight * devicePixelRatio)
    ctx.lineCap = ctx.lineJoin = 'round'
    ctx.lineWidth = 1 / zoom
    save()
    scale(devicePixelRatio, devicePixelRatio)
    // Zoom around center of screen
    translate(innerWidth / 2, innerHeight / 2)
    scale(zoom, zoom)
    translate(-innerWidth / 2, -innerHeight / 2)
    // Apply camera translation
    translate(cam.x, cam.y)
    let World = all()
    let focused = null
    for (let i = World.length; i--;) {
        let a = World[i]
        // World[i].draw()
        for (let n of a.parts) {
            if (n === cameraFollowing) focused = n
            else {
                save()
                generalDraw(n)
                restore()
                n.afterupdate?.()
            }
        }
    }
    if (focused) {
        save()
        generalDraw(focused)
        restore()
        focused.afterupdate?.()
    }

    let constraints = joints()
    for (let i = constraints.length; i--;) {
        save()
        drawConstraint(constraints[i])
        restore()
    }
    // strokeRect(-5, -5, 10, 10)
    ////beginPath()
    ////arc(mouse.position.x, mouse.position.y, 6 / zoom, 0, Math.PI * 2)
    ////stroke()
    ////beginPath()
    ////arc(mouse.click.x, mouse.click.y, 3 / zoom, 0, Math.PI * 2)
    ////strokeStyle('red')
    ////stroke()
    ////beginPath()
    ////arc(mouse.rightclick.x, mouse.rightclick.y, 2 / zoom, 0, Math.PI * 2)
    ////strokeStyle('blue')
    ////stroke()
    restore()
    if (!game.active) {
        //  Pause icon
        ctx.lineWidth = 1
        ctx.fillStyle = color.gray
        ctx.strokeStyle = color.black
        ctx.fillRect(10, 10, 7, 20)
        ctx.fillRect(21, 10, 7, 20)
        ctx.strokeRect(10, 10, 7, 20)
        ctx.strokeRect(21, 10, 7, 20)
        if (placingPhase === '1st' && mouse.clickedThisFrame && !constraintsToPlace[0]) {
            constraintsToPlace[0] = { x: mouse.click.x, y: mouse.click.y }
            placingPhase = '2nd'
        }
        else if (placingPhase === '2nd' && mouse.clickedThisFrame && !constraintsToPlace[1]) {
            constraintsToPlace[1] = { x: mouse.click.x, y: mouse.click.y }
            placeConstraint()
        }
        if (placingPhase !== 'none') {
            ctx.font = `20px monospace`
            fillStyle('black')
            ctx.fillText(`Click to place point${placingPhase === '1st' ? 'A' : 'B'} of joint`, 50, 50)
        }
    }
    mouse.clickedThisFrame = mouse.rightclickedThisFrame = false

}
function drawConstraint(e) {
    let { bodyA, bodyB, pointA, pointB } = e
    if ((!bodyA || disabled.has(bodyA)) && (!bodyB || disabled.has(bodyB))) return
    let x1 = bodyA?.position.x ?? pointA.x
    let y1 = bodyA?.position.y ?? pointA.y
    let x2 = bodyB?.position.x ?? pointB.x
    let y2 = bodyB?.position.y ?? pointB.y
    if (bodyA) {
        x1 += pointA.x
        y1 += pointA.y
    }
    if (bodyB) {
        x2 += pointB.x
        y2 += pointB.y
    }
    beginPath()
    ctx.globalCompositeOperation = 'destination-over'
    // ctx.setLineDash([5,5])
    arc(x1, y1, 3, 0, 7)
    strokeStyle(e.render.focused ? 'red' : 'black')
    stroke()
    fill()
    beginPath()
    if (game.active)
        ctx.globalAlpha = 1 / (e.length && Matter.Constraint.currentLength(e) / e.length)
    // console.log(e.length && Matter.Constraint.currentLength(e) / e.length)
    let a = 1000
    let pos1 = vect(x1, y1),
        pos2 = vect(x2, y2)
    moveTo(x1, y1)
    while (a-- && vect.distance(pos1, pos2) > 10) {
        pos1.lerp(pos2, .01)
        lineTo(pos1.x + Math.sin(a), pos1.y + Math.cos(a))
    }
    stroke()
    /*   if (mouseInVertices(e)) {
         click(e)
         mouse.rightclickedThisFrame = false
     }*/
}
/*
async function svgShape(x, y) {
    let n = new DOMParser().parseFromString(await (await fetch('./puzzle.svg')).text(), 'image/svg+xml').querySelector('path')
    let out = Matter.Bodies.fromVertices(x, y, Matter.Vertices.scale(Matter.Svg.pathToVertices(n,30), .4, .4))
    init(out, 10)
    debugger
    game.add(out)
}
    */
const entityNameCount = { __proto__: null }
function genName(type) {
    if (!Reflect.has(entityNameCount, type)) {
        entityNameCount[type] = 0
    }
    return `${type} ${++entityNameCount[type]}`
}
const SHRINK_MULT = .995
function drawPath() {
    let { x, y } = this.position
    save()
    // translate(x, y)
    // scale(SHRINK_MULT, SHRINK_MULT)
    // translate(-x, -y)
    beginPath()
    if (this.circleRadius) arc(0, 0, this.circleRadius * .2, 0, Math.PI * 2)
    else {
        let { vertices } = this
        moveTo(vertices[0].x, vertices[0].y)
        for (let i = vertices.length; --i;) {
            let v = vertices[i]
            lineTo(v.x, v.y)
        }
    }
    // arc(mouse.position.x, mouse.position.y, 6, 0, Math.PI * 2)
    // stroke()
    closePath()
    // translate(x,y)
    // console.log(x,mouse.position.x)
    if (mouseRightClickInVertices(this)) {
        click(this, 'right')
        mouse.rightclickedThisFrame = false
    }
    if (mouseLeftClickInVertices(this)) {
        click(this, 'left')
    }
    restore()
}
function mouseRightClickInVertices(o) {
    return mouse.rightclickedThisFrame && Matter.Vertices.contains(o.vertices, mouse.rightclick)
}
function mouseLeftClickInVertices(o) {
    return mouse.clickedThisFrame && Matter.Vertices.contains(o.vertices, mouse.click)
}
function click(body, which) {
    if (game.active) { }
    else if (game.editorMode) {
        if (which === 'right') {
            mouse.dragging = { body, offset: mouse.position.clone.subtract(body.position) }
            cameraFollowing = null
            showControlsForEntity(body)
        }
        else {
            if (placing === 'constraint') {
                mouse.clickedThisFrame = false
                if (placingPhase === '1st') {
                    placingPhase = '2nd'
                    constraintsToPlace.push(body)
                }
                else if (constraintsToPlace[0] !== body) {
                    constraintsToPlace.push(body)
                    placeConstraint()
                }
            }
        }
    }
    else {

    }
}
function placeConstraint() {
    let { 0: first, 1: second } = constraintsToPlace,
        settings = { stiffness: .01, }
    constraintsToPlace.length = 0
    if (!first.constraints) settings.pointA = first
    else settings.bodyA = first
    if (!second.constraints) settings.pointA = second
    else settings.bodyB = second
    if (!first.entityType && !second.entityType) return placingPhase = '1st', mouse.clickedThisFrame = false
    settings.pointA ??= { x: 0, y: 0 }
    settings.pointB ??= { x: 0, y: 0 }
    let n = constraint(settings)
    game.add(n)
    placingPhase = '1st'
    mouse.clickedThisFrame = false
    if (second.type)
        showControlsForEntity(second)
    parent.postMessage({
        name: 'scrollJointsIntoView'
    })
}
function calculateSizeByBounds(body) {
    // let old = body.angle
    // Matter.Body.setAngle(body, 0)
    const { min, max } = body.bounds
        , width = max.x - min.x
        , height = max.y - min.y
    // Matter.Body.setAngle(body, old)
    return body.cachedSize = { width, height }
}
function draw() {
    let { render } = this
    drawPath.call(this)
    if (!render.visible) return
    let { x, y } = this.position
    // ctx.globalCompositeOperation = 'destination-over'
    strokeStyle(render.strokeStyle)
    fillStyle(render.fillStyle)
    // let { x, y } = this.position
    let { image } = render
    if (image) {
        image = image.currentImage || image
        ctx.save()
        ctx.translate(x, y)
        rotate(this.angle)
        ctx.clip()
        const { width, height } = this.cachedSize
        ctx.drawImage(image, -width / 2, -height / 2, width, height)
        // console.log(width,height)
        ctx.restore()
    }
    else //if (this.collisionFilter.mask !== 0) 
        fill()
    if (currentEntity === this && !game.active) {
        ctx.setLineDash([2, 2])
        ctx.lineDashOffset = Time.fixed / 10
        ctx.lineWidth = 3 / zoom
        ctx.strokeStyle = 'black'
    }
    stroke()
    if (game.showNames && this.render.showName && zoom > .77 && this.label) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.font = `${12 / zoom}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.textRendering = 'optimizeSpeed'
        ctx.fillStyle = 'black'
        const { min, max } = this.bounds
        // ctx.globalAlpha= .7
        ctx.fillText(this.label, x, y - (max.y - min.y) + 5)
        // ctx.globalAlpha=1
        save()
        beginPath()
        strokeStyle('black')
        // fillStyle('black')
        translate(x, y - 11)
        translate(0, -this.cachedSize.height / 2)
        moveTo(-6, 0)
        lineTo(6, 0)
        lineTo(0, 4)
        closePath()
        stroke()
        // fill()
        restore()
    }
}
function deleteProps(target, ...props) {
    props.forEach(prop => delete target[prop])
}
async function exportLevelJSON(title, author) {
    debugger
    title = String(title).slice(0, 30)
    author = String(author).slice(0, 20)
    game.stop()
    let data = {
        author,
        title,
        racers: [],
        world: [],
        images: [],
        joints: []
    }
    let seenJoints = new Set
    let dataURLS = new Map
    let seenImages = new Map
    async function parseEntity(o) {
        let entity = {
            image: o.render.image,
            x: o.position.x,
            y: o.position.y,
            restitution: o.restitution,
            angle: o.angle,
            label: o.label,
            width: o.scale.x,
            height: o.scale.y,
            sides: o.sides,
            density: o.density,
            friction: o.friction,
            frictionAir: o.frictionAir,
            color: o.render.fillStyle,
            type: o.entityType,
            isStatic: o.isStatic,
            isSensor: o.isSensor,
            id: o.id
        }
        if (!o.isStatic) delete entity.isStatic
        if (!o.isSensor) delete entity.isSensor
        if (o.angle === 0) delete entity.angle
        if (o.restitution === 0) delete entity.restitution
        if (!o.hasCustomName) delete entity.label
        if (o.friction === base.friction) delete entity.friction
        if (entity.width === 30) delete entity.width
        if (entity.height === 30) delete entity.height
        if (entity.restitution === base.restitution) delete entity.restitution
        switch (entity.type) {
            case 'spawner':
                entity.spawnRate = o.spawnRate
            case 'goal':
                deleteProps(entity, 'density', 'friction', 'frictionAir', 'height', 'width', 'sides', 'joints')
                break
        }
        [...o.constraints].forEach(function (a) {
            if (seenJoints.has(a)) return
            let out = {
                pointA: a.pointA,
                pointB: a.pointB,
                bodyA: a.bodyA,
                bodyB: a.bodyB,
                damping: a.damping,
                stiffness: a.stiffness
            }
            // out.bodyA &&= out.bodyA.id
            // out.bodyB &&= out.bodyB.id
            if (out.damping === 0) delete out.damping
            if (!out.pointA) delete out.pointA
            if (!out.pointB) delete out.pointB
            if (!out.bodyA) delete out.bodyA
            if (!out.bodyB) delete out.bodyB
            data.joints.push(out)
            seenJoints.add(a)
        })
        await setImageDataURL(entity)
        return entity
    }
    async function setImageDataURL(entity) {
        if (entity.image === 'none' || !entity.image) delete entity.image
        else {
            let canvas = entity.image
            if (seenImages.has(canvas)) entity.image = seenImages.get(canvas)
            else if (canvas.getAttribute('data-gif') === 'true') {
                let reader = new FileReader
                let n = await fetch(canvas.dataset.src)
                let a = await n.blob()
                let load = h.until(reader, 'load')
                reader.readAsDataURL(a)
                await load
                let { result } = reader
                dataURLS.set(result, dataURLS.size)
                seenImages.set(canvas, result)
                entity.image = result
                data.images.push(result)
            }
            else {
                let dataURL = canvas.toDataURL('image/png', 1)
                entity.image = dataURL
                dataURLS.set(dataURL, dataURLS.size)
                seenImages.set(canvas, dataURL)
                data.images.push(dataURL)
            }
            entity.image = dataURLS.get(entity.image)
        }
        return entity
    }
    for (let entity of racers.queue) data.racers.push(await setImageDataURL({ ...entity }))
    for (let entity of all()) data.world.push(await parseEntity(entity))
    for (let a of data.joints) {
        a.bodyA &&= data.world.findIndex(o => o.id === a.bodyA.id)
        a.bodyB &&= data.world.findIndex(o => o.id === a.bodyB.id)
    }
    for (let a of data.world) delete a.id
    return JSON.stringify(data)
}
async function exportLevel(title, author) {
    h.download(new Blob((await exportLevelJSON(title, author)).split()), `${title}.json`)
}
async function importLevel(json) {
    let data = typeof json === 'string' ? parse(json) : json
    // console.debug(json)
    game.stop()
    all().forEach(destroy)
    joints().forEach(removeConstraint)
    racers.queue.length =
        racers.active.length = 0
    let { racers: marbles, images: imgs, world, joints: cnstr } = data
    for (let racer of marbles) {
        spectate.push($`<option value="racer:${racer.label}">${racer.label}</option>`)
    }
    for (let obj of marbles.concat(world)) {
        if ('image' in obj) {
            if (obj.image === 'none') delete obj.image
            else {
                obj.image = await cacheImage(imgs[obj.image])
                parent.postMessage({
                    name: 'importImage',
                    url: obj.image.dataset.src
                })
            }
        }
    }
    for (let n of world) {
        let out
        switch (n.type) {
            case 'goal': {
                out = goal(n.x, n.y)
            }
                break
            case 'spawner': {
                out = spawner(n.x, n.y)
            }
                break
            default: {
                out = shape(n.x, n.y, n.sides, n.width || 30, n.height || 30)
                out.isStatic = n.isStatic
                out.isSensor = n.isSensor
                Matter.Body.setAngle(out, n.angle || 0)
            }
                break
        }
        for (let stat of 'restitution'.split(' ')) {
            if (n[stat]) out[stat] = n[stat]
        }
        if (n.color) setColor(out, n.color)
        setBodyImage(out, n.image)
        game.add(out)
    }
    let a = all()
    for (let joint of cnstr) {
        joint.bodyA = a[joint.bodyA]
        joint.bodyB = a[joint.bodyB]
        game.add(constraint(joint))
    }
    // console.log(all())
    marbles.forEach((o, index) => createRacer({ ...o, index }))
}
function createRacer(obj) {
    let { index, color, image = 'none', label = 'Racer Name' } = obj
    let racer = { label, color, image }
    racers.queue.push(racer)
    let r = {
        label,
        color
    }
    if (racer.image && racer.image !== 'none') r.image = racer.image.dataset.src
    parent.postMessage({
        name: 'addRacerNodes',
        racer: r
    })
}
volume && importAudio()
