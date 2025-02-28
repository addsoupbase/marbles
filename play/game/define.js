import { Events, engine, Runner, runner, world, Bodies, base, Body, Svg, Composite, Sleeping, Vector, bounds, } from 'https://addsoupbase.github.io/marbles/play/game.js'
import { canvas as can, mouse, cam, marbles, levelName } from 'https://addsoupbase.github.io/marbles/play/setup.js'
import ran from 'https://addsoupbase.github.io/random.js'
import * as math from 'https://addsoupbase.github.io/num.js'
import { getObjUrl, on, until, wait } from 'https://addsoupbase.github.io/handle.js'
import $ from 'https://addsoupbase.github.io/yay.js'
import { getJson } from 'https://addsoupbase.github.io/arrays.js'
import color from 'https://addsoupbase.github.io/color.js'
import { game, entities, inEditor, svgs } from 'https://addsoupbase.github.io/marbles/play/setup.js'
let ctx = can.getContext('2d')
let background = new Image
game.end = async () => {
    overlay.destroyChildren()
    await can.animate([{ filter: '', }, { filter: 'blur(5px)' }], { duration: 500, fill: 'forwards', endDelay: 300 })
    overlay.classList.remove('slide-out-blurred-top')
    overlay.classList.add('slide-in-blurred-top')
    overlay.push($(`<div class="holdthis"></div>`, null, ...placements.winners.map((o, index) => {
        let out = $(`div.place`, {
            styles: {
                'background-color': o.color
            },
            start() {
                index || this.classList.add('first')
            },
            attributes: {
                title: o.name
            }
        },)
        console.log(o)
        if (o.image != null) {
            let n = new OffscreenCanvas(o.image.width, o.image.height).getContext("bitmaprenderer")
            n.transferFromImageBitmap(o.image)
            n.canvas.convertToBlob().then(blob=>{
                out.push($(`img.prev`, {
                    attributes: {
                        src: getObjUrl(blob)
                    }
                }))
            })
        }
        return out
    })))
}
const placements = {
    winners: [],
    losers: [],
    get first() {
        return this.winners[0]
    },
    get last() {
        return this.losers[0]
    },
    reset() {
        this.winners.length = this.losers.length = 0
    }
}
background.src = './media/background.png'
const { vect } = math
let doc = top.document
let marbleSize = doc.getElementById("marble-size"),
    marbleRestitution = doc.getElementById('marble-rest'),
    marbleMass = doc.getElementById('marble-mass'),
    marbleFriction = doc.getElementById('marble-friction'),
    marbleFrictionair = doc.getElementById('marble-frictionair')
const marbleStats = inEditor ? {
    radius: marbleSize?.value ?? null,
    mass: marbleMass?.value ?? null,
    restitution: marbleRestitution?.value ?? null,
    friction: marbleFriction?.value ?? null,
    frictionAir: marbleFrictionair?.value ?? null
} : {
    radius: 30,
    mass: base.mass,
    restitution: base.restitution,
    friction: base.friction,
    frictionAir: base.frictionAir
}
if (inEditor) {
    top.base = base
    top.settings = marbleStats
    on(marbleSize, {
        change() {
            marbleStats.radius = marbleSize.value
        }
    })
    on(marbleRestitution, {
        change() {
            marbleStats.restitution = marbleRestitution.value
        }
    })
    on(marbleMass, {
        change() {
            marbleStats.mass = marbleMass.value
        }
    })
    on(marbleFriction, {
        change() {
            marbleStats.friction = marbleFriction.value
        }
    })
    on(marbleFrictionair, {
        change() {
            marbleStats.frictionAir = marbleFrictionair.value
        }
    })
    game.toggleDOM = function (state) {
        [marbleSize, marbleRestitution, marbleMass, marbleFriction, marbleFrictionair].forEach(o =>
            o.toggleAttribute('disabled', state)
        )
    }
    game.send = function (data) {
        if (top.selected !== data) {
            top.selected = data
            top.postMessage('showData')
        } else if (!top.selected && !data) top.postMessage(null)
    }
    mouse.place = function (x, y) {
        ({ x, y } = vect(x, y).subtract(cam.position.clone.iScale(cam.zoom))).iScale(cam.zoom)
        switch (this.willPlace) {
            case 'square': var out = new obj({ x, y, shape: 4, radius: 30, restitution: 1.5, mass: 1 }); break
            case 'triangle': var out = new obj({ x, y, shape: 3, radius: 30, restitution: 1.5, mass: 1 }); break
            case 'hexagon': var out = new obj({ x, y, shape: 6, radius: 30, restitution: 1.5, mass: 1 }); break
            case 'pentagon': var out = new obj({ x, y, shape: 5, radius: 30, restitution: 1.5, mass: 1 }); break
            case 'goal': {
                for (let n of entities.values()) n.constructor === goal && n.remove()
                var out = new goal({ x, y, radius: 30 }); break
            }
            case 'spawn': {
                for (let n of entities.values()) n.constructor === spawn && n.remove()
                var out = new spawn({ x, y, }); break
            }
            default: {
                var out = new obj({ x, y, shape: svgs.get(this.willPlace) })
                console.log(out)
            }
        }
        game.send(out)
        //cam.following = out
        mouse.selectedBody = out
    }
}
Object.assign(ctx, {
    textAlign: 'center',
    textBaseline: 'middle',
    font: '10px Choco cooky, monospace',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    lineCap: 'butt',
    lineJoin: 'round'
})
let antOffset = 0
// import {vect} from '../../../num.js'
class obj {
    static images = new Map
    #image = null
    filter = 'none'
    isEnteringGoal = false
    get image() {
        return this.#image
    }
    #t = null
    enterGoal({ x, y }) {
        this.static = this.body.isSensor = true
        this.isEnteringGoal = true
        this.#t = vect(x, y)
    }
    *animateEnteredGoal() {
        let { scale } = this
        this.showName = false
        for (let i = 0; i < 100; ++i) {
            this.pos = this.pos.lerp(this.#t, .1)
            //  this.filter = `invert(${i / 100})`
            //    filter causes big lag :(
            this.scale -= scale / 100
            this.angle += 0.1
            yield i
        }
        this.#anim = null
        this.kill(true)
    }
    showName = false
    set image(src) {
        if (typeof src !== 'string') {
            this.#image = src
            this.spawn.image = src.src
        }
        else if (typeof src == null || src === 'none') {
            this.#image = null
            this.spawn.image = null
        }
        else if (obj.images.has(src)) {
            this.spawn.image = src
            this.#image = obj.images.get(src)
        }
        else {
            let i = new Image
            i.src = src
            on(i, {
                _load: async () => {
                    let bitmap = await createImageBitmap(i)
                    this.spawn.image = src
                    this.#image = bitmap
                    obj.images.set(src, bitmap)
                }
            })
        }
    }
    get pos() {
        return vect(this.x, this.y)
    }
    shape = 0
    get x() {
        return this.body.position.x
    }
    /*get mass() {
        return this.body.mass
    }
    set mass(val) {
        Body.setMass(this.body, val)
    }*/
    get y() {
        return this.body.position.y
    }
    addPos(x = 0, y = 0) {
        Body.setPosition(this.body, this.pos.add(x, y))
    }
    set pos([x, y]) {
        Body.setPosition(this.body, { x: x ?? this.x, y: y ?? this.y })
    }
    darkColor
    lightColor
    set color(val) {
        this.darkColor = color.dhk(this.lightColor = val)
    }
    get sleeping() {
        return this.body.isSleeping
    }
    get static() {
        return this.body.isStatic
    }
    set static(bool) {
        Body.setStatic(this.body, bool)
    }
    get name() {
        return this.body.label
    }
    nameImage = null
    get name() {
        return this.body.label
    }
    set name(name) {
        this.body.label = name
        if (this.dontShow.has('name')) return
        let c = (typeof OffscreenCanvas === 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(100, 50)),
            cx = c.getContext('2d')
        Object.assign(cx, {
            textAlign: 'center',
            font: '12px Choco cooky, monospace',
            textBaseline: 'middle',
            textRendering: 'optimizeLegibility',
            lineCap: 'butt',
            lineJoin: 'round'
        })
        cx.fillText(name, 50, 25, 80)
        cx.beginPath()
        cx.translate(50, 32)
        cx.moveTo(-6, 0)
        cx.lineTo(6, 0)
        cx.lineTo(0, 4)
        cx.closePath()
        cx.stroke()
        // createImageBitmap(c).then(data => this.nameImage = data)
        this.nameImage = c.transferToImageBitmap()
    }
    set sleeping(state) {
        Sleeping.set(this.body, state)
    }
    get scale() {
        return this.radius
    }
    set scale(val) {
        Body.scale(this.body, 1 / this.scale, 1 / this.scale)
        Body.scale(this.body, val, val)
        this.radius = val
    }
    kill() {
        this.sleeping = true
    }
    remove() {
        if (mouse.selectedBody === this) mouse.selectedBody = null
        if (mouse.clickedBody === this) mouse.clickedBody = null
        if (mouse.draggingBody === this) mouse.draggingBody = null
        entities.delete(this.body.id)
        Composite.remove(world, this.body)
    }
    reset() {
        this.static = this.spawn.isStatic
        this.mass = this.spawn.mass
        this.scale = this.spawn.radius
        this.angle = this.spawn.angle
        this.velocity = [0, 0]
        this.body.restitution = this.spawn.restitution
        this.color = this.spawn.color
        this.pos = [this.spawn.x, this.spawn.y]
        this.angularVelocity = this.angularSpeed = 0
    }
    clone() {
        let n = new this.constructor({
            ...this.spawn,
            x: (-cam.position.x + can.width / 2) * 1 / cam.zoom, y: (-cam.position.y + can.height / 2) * 1 / cam.zoom, static: this.spawn.isStatic
        })
        game.send(n)
        mouse.reset()
        mouse.selectedBody =
            mouse.clickedBody = n
        game.send(n)
    }
    antThing() {
        if (mouse.selectedBody === this) {
            ctx.setLineDash([4, 2])
            ctx.lineDashOffset = antOffset
            ctx.lineWidth = 3 / cam.zoom
            ctx.strokeStyle = color.black
            return true
        }
        return false
    }
    draw(x = this.x, y = this.y, scale) {
        ctx.save()
        ctx.translate(x, y)
        scale && ctx.scale(scale)
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = this.lightColor
        ctx.strokeStyle = this.darkColor
        ctx.filter = this.filter
        if (game.isPaused) ctx.globalAlpha = math.clamp(this.opacity, 0.25, 1)
        let isSelected = this.antThing()
        if (this.body.circleRadius) {
            ctx.beginPath()
            ctx.arc(0, 0, Math.abs(this.body.circleRadius), 0, Math.PI * 2)
        }
        else if (this.shape) {
            //  Totally didnt use ai for this part
            if (this.body.parts && this.body.parts.length > 1) {
                for (let i = 1, { length } = this.body.parts; i < length; ++i) {
                    const part = this.body.parts[i]
                    ctx.beginPath()
                    const partVertices = part.vertices
                    ctx.moveTo(partVertices[0].x - x, partVertices[0].y - y)
                    for (let j = 1, { length } = partVertices; j < length; ++j) {
                        let { x: partX, y: partY } = partVertices[j]
                        ctx.lineTo(partX - x, partY - y)
                    }
                    this.inCurrentPath()
                    ctx.stroke()
                    if (this.image) {
                        ctx.save()
                        ctx.clip()
                        ctx.rotate(this.angle)
                        ctx.drawImage(this.image, -width / 2, -height / 2, width, height)
                        ctx.restore()
                    }
                    else {
                        ctx.fill()
                    }
                }
            }
            else {
                const { vertices } = this.body
                ctx.beginPath()
                ctx.moveTo(vertices[0].x - x, vertices[0].y - y)
                for (let i = 1, { length } = vertices; i < length; ++i) {
                    let v = vertices[i]
                    ctx.lineTo(v.x - x, v.y - y)
                }
            }
        }
        ctx.closePath()
        this.inCurrentPath()
        if (this.shape !== 0) {
            const vertices = this.body.vertices
            var width = Vector.magnitude(Vector.sub(vertices[0], vertices[1]))
            var height = Vector.magnitude(Vector.sub(vertices[1], vertices[2]))
        }
        else var height = this.body.circleRadius * 2, width = this.body.circleRadius * 2
        let old = ctx.globalAlpha
        if (isSelected) ctx.globalAlpha = 1
        ctx.stroke()
        ctx.globalAlpha = old
        if (this.image) {
            ctx.save()
            ctx.clip()
            ctx.rotate(this.angle)
            ctx.drawImage(this.image, -width / 2, -height / 2, width, height)
            ctx.restore()
        }
        else {
            ctx.fill()
        }
        if (this.showName && this.nameImage && cam.zoom > 0.75) {
            ctx.imageSmoothingEnabled = true
            ctx.globalAlpha = 1
            ctx.imageSmoothingQuality = 'high'
            height = -height * (this.shape === 0 ? 1.5 : 1)
            ctx.drawImage(this.nameImage, -50, -Math.abs(this.scale) - 40)
        }
        ctx.restore()
    }
    inCurrentPath(x, y) {
        x ??= mouse.click.x * cam.zoom
        y ??= mouse.click.y * cam.zoom
        if (game.isPaused && !mouse.isPlacing) {
            if (ctx.isPointInPath(x, y)) {
                if (mouse.clickedBody !== this && !mouse.clickedThisFrame) {
                    game.send(this)
                }
                if (mouse.selectedBody !== this && !mouse.clickedThisFrame) {
                    mouse.selectedBody = this
                    mouse.clickedBody = this
                }
                let cursor = mouse.cursor.clone
                let click = mouse.click.clone
                if (vect.distance(cursor, click) > 20 && !mouse.clickedThisFrame) {
                    mouse.draggingBody = this
                }
                mouse.clickedThisFrame = true
            }
        }
    }
    get angle() {
        return this.body.angle
    }
    set angle(angle) {
        Body.setAngle(this.body, angle)
    }
    get angularVelocity() {
        return Body.getAngularVelocity(this.body)
    }
    set angularVelocity(v) {
        Body.setAngularVelocity(this.body, v)
    }
    get angularSpeed() {
        return Body.getAngularSpeed(this.body)
    }
    set angularSpeed(speed) {
        Body.setAngularSpeed(this.body, speed)
    }
    get velocity() {
        let { x, y } = Body.getVelocity(this.body)
        return vect(x, y)
    }
    set velocity([x, y]) {
        Body.setVelocity(this.body, { x, y })
    }
    get mass() {
        return this.body.mass
    }
    set mass(val) {
        Body.setMass(this.body, val)
    }
    get speed() {
        return Body.getSpeed(this.body)
    }
    set speed(speed) {
        Body.setSpeed(this.body, speed)
    }
    #anim
    update() {
        let { x, y } = this.pos
        if (game.isPaused) {
            this.pos = [math.clamp(x, 0, bounds.x), math.clamp(y, 0, bounds.y)]
            if (mouse.draggingBody === this && mouse.clickedBody === this && !mouse.clickedThisFrame) {
                mouse.clickedThisFrame = true
                this.pos = mouse.cursor.clone.subtract(cam.position.clone.iScale(cam.zoom))
                Object.assign(this.spawn, { x, y })
            }
        }
        else if (x > bounds.x || x < 0 || y > bounds.y || y < 0)
            this.outOfBounds?.()
        if (isNaN(x) || isNaN(y)) this.pos = [this.spawn.x, this.spawn.y]
        if (this.isEnteringGoal) {
            if (!this.#anim) this.#anim = this.animateEnteredGoal()
            else {
                let { value } = this.#anim.next()
                x += Math.cos(game.frame / 10) * (value / 4)
                y += Math.sin(game.frame / 10) * (value / 4)
            }
        }
        this.draw(x, y)
    }
    constructor({ x = 0, y = 0, shape = 0, opacity = 1, isSensor = false, name, color: col = color.choose(), radius = 1, static: isStatic = false,
        friction = base.friction,
        image = 'none',
        angle = 0,
        restitution = base.restitution,
        inertia = base.inertia,
        //    density = base.density,
        mass = base.mass,
        frictionAir = base.frictionAir }) {
        const options = {
            isStatic,
            friction,
            restitution,
            radius,
            image,
            frictionAir,
            angle,
            opacity,
            // density,
            mass,
            color: col,
            inertia,
            isSensor,
            shape
        }
        // Svg.pathToVertices(path, 30)
        /*if (true) {
             console.log(svg)
             top.s=svg
 
             var body = Bodies.fromVertices(x, y, Svg.pathToVertices(svg.querySelector('path')), 30)
         } else*/
        if (shape && +shape) {
            var body = Bodies.polygon(x, y, shape, radius, options)
        }
        else if (Array.isArray(shape)) {
            let vertices = shape.map(map)
            var body = Bodies.fromVertices(x, y, vertices, options)
            if (!body) throw TypeError("Vertices are probably broken")
            function map(o, index) {
                let correct = Array.isArray(o)
                console.log(o)
                if (!correct) return Svg.pathToVertices(o,
                    //Idk what this param does
                )
                console.assert(correct, `Vertices should be an array or .svg: `, o)
                return correct ? { x: o[0], y: o[1], index, isInternal: false, body: undefined } : o
            }
            shape = -1

            // Body.setPosition(body, { x, y })
        }
        else
            var body = Bodies.circle(x, y, radius, options)
        this.color = col
        Object.defineProperty(this, 'spawn', {
            value: { ...options, x, y, }
        })
        Object.defineProperty(this, '__shape__', {
            value: shape
        })
        if (image) this.image = image
        else this.image = 'none'
        Object.defineProperty(this, 'shape', { value: shape, enumerable: 1 })
        Object.defineProperty(this, 'body', { value: body })
        delete options.isSensor

        this.opacity = opacity
        this.sleeping = game.isPaused
        this.radius = radius
        // Body.scale(body, radius, radius)
        // Body.setDensity(body, density)
        // body.restitution = restitution
        // Body.setMass(body, mass)
        // Body.setInertia(body, inertia)
        // Body.setAngle(body, angle)
        Composite.add(world, body)
        entities.set(body.id, this)
        if (name) this.name = name
        else name = this.name = body.label
        this.reset()
    }
}
obj.prototype.dontShow = new Set
class goal extends obj {
    constructor(opts) {
        opts.shape = 0
        opts.radius = 30
        opts.static = true
        opts.isSensor = true
        opts.name = 'Goal'
        super(opts)
    }
    clone() {
        super.clone()
        this.remove()
    }


    async collisionenter(body) {
        if (!(body instanceof marble)) return
        if (!inEditor && !placements.winners.length && !cam.alreadyDidTheWinnerCutsceneThingy) {
            cam.alreadyDidTheWinnerCutsceneThingy = true
            game.freeze()
            let { x, y } = cam.position
            let old = cam.following
            cam.following = this
            let { zoom, targetZoom } = cam
            cam.targetZoom = 1.2
            await wait(1300)
            body.enterGoal(this)
            await wait(1000)
            game.thaw()
            cam.targetZoom = targetZoom
            cam.zoom = zoom
            cam.following = old
            cam.position.set(x, y)
        }
        else if (!inEditor) {
            body.enterGoal(this)
        }
        else body.remove()
    }
    draw(x = this.x, y = this.y) {
        let f = game.frame
        ctx.save()
        // ctx.globalCompositeOperation = "source-out"
        ctx.strokeStyle = this.darkColor
        ctx.fillStyle = this.lightColor
        ctx.translate(x, y)
        ctx.rotate(f / 100)
        let c = Math.abs(Math.cos(f / 20))
        for (let i = 0, arrows = 6; i < arrows; i++) {
            ctx.beginPath()
            ctx.moveTo(5, -50 + c * 40)
            ctx.lineTo(-5, -50 + c * 40)
            ctx.lineTo(-0, -46 + c * 40)
            ctx.closePath()
            ctx.stroke()
            ctx.fill()
            ctx.rotate(Math.PI * 2 / arrows)
        }
        ctx.beginPath()
        ctx.lineWidth = 3
        ctx.arc(0, 0, (this.scale / 4) + (c * 30), 0, Math.PI * 2)
        this.inCurrentPath()
        this.antThing()
        ctx.stroke()
        ctx.globalAlpha = this.opacity / 4
        ctx.fill()
        ctx.restore()
    }
}
class spawn extends goal {
    spawnRate = 40
    #deck = null
    constructor(o) {
        o.name = 'Spawner'
        super(o)
        this.spawn.spawnRate = this.spawnRate
    }
    collisionenter() { }
    ontoggle(state) {
        switch (state) {
            case 'play': this.#deck = ran.shuffle(...marbles.values())
        }
    }
    reset() {
        super.reset()
        this.spawnRate = this.spawn.spawnRate
    }
    update() {
        super.update()
        if (!game.isPaused && !game.frozen && this.#deck.length && !(game.frame % this.spawnRate)) {
            let m = this.#deck.pop()
            new marble({ ...m, x: this.x + ran.range(-this.scale, this.scale) / 2, y: this.y + ran.range(-this.scale, this.scale) / 2 })
        }
    }
    draw(x = this.x, y = this.y) {
        let f = game.frame
        ctx.save()
        // ctx.globalCompositeOperation = "source-out"
        ctx.strokeStyle = this.darkColor
        ctx.fillStyle = this.lightColor
        ctx.translate(x, y)
        ctx.rotate(f / 100)
        let c = Math.abs(Math.sin(f / 20))
        for (let i = 0, arrows = 6; i < arrows; i++) {
            ctx.beginPath()
            ctx.moveTo(5, -70 + c * 50)
            ctx.lineTo(-5, -70 + c * 50)
            ctx.lineTo(-0, -75 + c * 50)
            ctx.closePath()
            ctx.stroke()
            ctx.fill()
            ctx.rotate(Math.PI * 2 / arrows)
        }
        ctx.beginPath()
        ctx.lineWidth = 3
        ctx.arc(0, 0, (this.scale / 4) + (c * 30), 0, Math.PI * 2)
        this.inCurrentPath()
        this.antThing()
        ctx.stroke()
        ctx.globalAlpha = this.opacity / 4
        ctx.fill()
        ctx.restore()
    }
}
// new goal({})
goal.prototype.dontShow = new Set(`name restitution mass image static angle scale opacity`.split(' '))
class marble extends obj {
    showName = true
    constructor(opts) {
        opts.shape = 0
        opts.static = false
        opts.isSensor = false
        Object.assign(opts, marbleStats)
        super(opts)
    }
    draw(...o) {
        ctx.globalCompositeOperation = 'source-over'
        super.draw(...o)
    }
    kill(winOrLose) {
        let o = { name: this.body.label, color: this.lightColor, image: this.image ?? null }
        placements[winOrLose ? 'winners' : 'losers'].push(o)
        this.remove()
        if (placements.winners.length + placements.losers.length === marbles.size) {
            game.end()
        }
    }
    ontoggle(state) {
        state === 'pause' && this.remove()
    }
}
function afterUpdate() {
    mouse.clickedThisFrame = false
    if ((antOffset += .2) === 5) antOffset = 0
    let all = Composite.allBodies(world)
    for (let { length } = all
        , i = 0; i < length; ++i
        //; length--;
    )
        entities.get(all[i].id).update()
    if (mouse.selectedBody) {
        let { globalCompositeOperation } = ctx
        ctx.globalCompositeOperation = 'source-over'
        mouse.selectedBody?.draw()
        ctx.globalCompositeOperation = globalCompositeOperation
    }
    cam.iterate()
}
function beforeUpdate() {
}
function afterRemove() {
}
function beforeRemove() {
}
Runner.run(runner, engine)
Events.on(world, 'afterRemove', afterRemove)
Events.on(world, 'beforeRemove', beforeRemove)
function lerp(start, end, t) {
    return start + (end - start) * t
}
Events.on(engine, 'afterUpdate', () => {
    ctx.clearRect(0, 0, can.width, can.height)
    ctx.fillStyle = 'black'
    // ctx.drawImage(background, 0, 0, can.width, can.height)
    ctx.save()
    ctx.translate(cam.position.x, cam.position.y)
    cam.zoom = lerp(cam.zoom, cam.targetZoom, 0.07)
    ctx.scale(cam.zoom, cam.zoom)

    // ctx.clearRect(0, 0, bounds.x, bounds.y)
    //if (game.isPaused)
    ctx.globalCompositeOperation = "destination-over"
    afterUpdate(game.frame++)
    // ctx.beginPath()
    // let r = 20
    // mouse.clicking && (r = 15)
    // ctx.arc(...mouse.cursor.clone.subtract(...cam.position.clone.scale(1 / cam.zoom)), r, 0, Math.PI * 2)
    // ctx.stroke()
    ctx.restore()
    if (game.isPaused) {
        ctx.lineWidth = 1
        ctx.fillStyle = color.gray
        ctx.strokeStyle = color.black
        ctx.fillRect(10, 10, 7, 20)
        ctx.fillRect(21, 10, 7, 20)
        ctx.strokeRect(10, 10, 7, 20)
        ctx.strokeRect(21, 10, 7, 20)
    }
    if (cam.following && !mouse.leftClicking) {
        let { x, y } = cam.following.body.position
        cam.position.lerp(vect(-x, -y).scale(cam.zoom).add(can.width / 2, can.height / 2), (cam.speed / 100) / cam.zoom)
    }
})
Events.on(engine, 'beforeUpdate', beforeUpdate)
Events.on(engine, 'collisionStart', collisionStart)
Events.on(engine, 'collisionActive', collisionActive)
Events.on(engine, 'collisionEnd', collisionEnd)
function collisionStart({ pairs }) {
    pairs.forEach(pair => {
        let { bodyA, bodyB } = pair
        let a = entities.get(bodyA.id)
        let b = entities.get(bodyB.id)
        if (a && b)
            b.collisionenter?.(a),
                a.collisionenter?.(b)
    })
}
function collisionEnd({ pairs }) {
    pairs.forEach(pair => {
        let { bodyA, bodyB } = pair
        let a = entities.get(bodyA.id)
        let b = entities.get(bodyB.id)
        if (a && b)
            b.collisionout?.(a),
                a.collisionout?.(b)
    })
}
function collisionActive({ pairs }) {
    pairs.forEach(pair => {
        let { bodyA, bodyB } = pair
        let a = entities.get(bodyA.id)
        let b = entities.get(bodyB.id)
        if (a && b)
            b.collision?.(a),
                a.collision?.(b)
    })
}

let overlay = $.gid('overlay')
if (levelName) {
    overlay.style.display = ''
    overlay.classList.add('slide-in-blurred-top')
    overlay.push(
        $('<h1>Title</h1>'),
        $('<cite>By author</cite>'),
        $("<div></div>", null,
            $('<button class="cute-green-button">Play</button>', {
                events: {
                    async _click() {
                        overlay.classList.add('slide-out-blurred-top')
                        await until(overlay.anims[0], 'finish')
                        await wait(500)
                        game.play()
                    }
                }
            })
        )
    )
    let { images, map, racers, settings } = await getJson(`./levels/${levelName}.json`)
    Object.assign(marbleStats, settings)
    racers.forEach((o, i) => {
        if ('image' in o) {
            o.image = images[o.image]
        }
        marbles.set(i, o)
        console.log(o)
    })
    map.forEach(o => {
        switch (o.type) {
            default: return new obj({ ...o, static: o.isStatic })
            case 'spawn': return new spawn(o)
            case 'goal': return new goal(o)
        }
    })
}
window.placements = placements