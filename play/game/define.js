import { Events, engine, Runner, runner, world, Bodies, base, Body, Svg, Composite, Sleeping, Vector, bounds, } from '../game.js'
import { canvas as can, mouse, cam, marbles } from '../setup.js'
import ran from '../../../addsoupbase.github.io/random.js'
import * as math from '../../../addsoupbase.github.io/num.js'
import { on, getObjUrl } from '../../../addsoupbase.github.io/handle.js'
import color from '../../../addsoupbase.github.io/color.js'
import { game, entities, inEditor, svgs } from '../setup.js'
let ctx = can.getContext('2d')
let background = new Image
let svg = new DOMParser().parseFromString(await (await fetch('./media/test.svg')).text(), 'image/svg+xml')
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
    marbleDensity = doc.getElementById('marble-density'),
    marbleFriction = doc.getElementById('marble-friction'),
    marbleFrictionair = doc.getElementById('marble-frictionair')
const marbleStats = inEditor ? {
    radius: marbleSize?.value ?? null,
    density: marbleDensity?.value ?? null,
    restitution: marbleRestitution?.value ?? null,
    friction: marbleFriction?.value ?? null,
    frictionAir: marbleFrictionair?.value ?? null
} : {
    radius: 30,
    density: base.density,
    restitution: base.restitution,
    friction: base.friction,
    frictionAir: base.frictionAir
}
if (inEditor) {
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
    on(marbleDensity, {
        change() {
            marbleStats.density = marbleDensity.value
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
        [marbleSize, marbleRestitution, marbleDensity, marbleFriction, marbleFrictionair].forEach(o =>
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
        ({ x, y } = vect(x, y).subtract(cam.position.clone.scale(1 / cam.zoom))).scale(1 / cam.zoom)
        switch (this.willPlace) {
            case 'square': var out = new obj({ x, y, shape: 4, radius: 30 }); break
            case 'triangle': var out = new obj({ x, y, shape: 3, radius: 30 }); break
            case 'hexagon': var out = new obj({x,y,shape:6,radius:30});break
            case 'pentagon': var out = new obj({x,y,shape:5,radius:30});break
            case 'goal': {
                for (let n of entities.values()) n instanceof goal && n.remove()
                var out = new goal({ x, y, radius: 30 }); break
            }
            case 'spawn': {
                for (let n of entities.values()) n instanceof spawn && n.remove()
                var out = new spawn({ x, y, }); break
            }
            default: {
                var out = new obj({ x, y, shape: svgs.get(this.willPlace) })
                console.log(out)
            }
        }
        game.send(out)
        cam.following = out
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
// import {vect} from '../../../addsoupbase.github.io/num.js'
class obj {
    static #images = new Map
    #image = null
    filter = 'none'
    get image() {
        return this.#image
    }
    showName = false
    set image(src) {

        if (typeof src !== 'string') {
            this.#image = src
        }
        else if (typeof src == null || src === 'none') {
            this.#image = null
        }
        else if (obj.#images.has(src)) {
            this.#image = obj.#images.get(src)
        }
        else {
            let i = new Image
            i.src = src
            on(i, {
                _load: () => {
                    this.#image = i
                    obj.#images.set(src, i)
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
    get density() {
        return this.body.density
    }
    set density(val) {
        Body.setDensity(this.body, val)
    }
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
        this.nameImage = c
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
        this.density = this.spawn.density
        this.scale = this.spawn.radius
        this.angle = this.spawn.angle
        this.velocity = [0, 0]
        this.body.restitution = this.spawn.restitution
        this.color = this.spawn.color
        this.pos = [this.spawn.x, this.spawn.y]
        this.angularVelocity = this.angularSpeed = 0
    }
    clone() {
        let n = new this.constructor({ ...this.spawn, x: this.spawn.x + this.scale, y: this.spawn.y + this.scale, static: this.spawn.isStatic })
        game.send(n)
        mouse.reset()
        mouse.selectedBody =
            mouse.clickedBody = n
        game.send(n)
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
        let isSelected = false
        if (mouse.selectedBody === this) {
            ctx.setLineDash([4, 2])
            isSelected = true
            ctx.lineDashOffset = antOffset
            ctx.lineWidth = 3 / cam.zoom
            ctx.strokeStyle = color.black
        }

        if (this.body.circleRadius) {
            ctx.beginPath()
            ctx.arc(0, 0, this.body.circleRadius, 0, Math.PI * 2)
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
                const vertices = this.body.vertices
                ctx.beginPath()
                ctx.moveTo(vertices[0].x - x, vertices[0].y - y)
                for (let i = 1, { length } = vertices; i < length; ++i) {
                    ctx.lineTo(vertices[i].x - x, vertices[i].y - y)
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
            ctx.drawImage(this.nameImage, -50, (-this.scale) - 40)
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
    update() {
        if (game.isPaused) {
            this.pos = [math.clamp(this.x, 0, bounds.x), math.clamp(this.y, 0, bounds.y)]
            if (mouse.draggingBody === this && mouse.clickedBody === this && !mouse.clickedThisFrame) {
                mouse.clickedThisFrame = true
                this.pos = mouse.cursor.clone.subtract(cam.position.clone.scale(1 / cam.zoom))
                Object.assign(this.spawn, { x: this.x, y: this.y })
            }
        }
        else if (this.x > bounds.x || this.x < 0 || this.y > bounds.y || this.y < 0)
            this.outOfBounds?.()
        if (isNaN(this.x) || isNaN(this.y)) this.pos = [this.spawn.x, this.spawn.y]
        this.draw(this.x, this.y)
    }
    constructor({ x = 0, y = 0, shape = 0, opacity = 1, isSensor = false, name, color: col = color.choose(), radius = 1, static: isStatic = false,
        friction = base.friction,
        image = 'none',
        angle = 0,
        restitution = base.restitution,
        // inertia = base.inertia,
        density = base.density,
        // mass = base.mass,
        frictionAir = base.frictionAir }) {
        const options = {
            isStatic,
            friction,
            restitution,
            name,
            radius,
            image,
            frictionAir,
            angle,
            opacity,
            density,
            // mass,
            color: col,
            // inertia,
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
                    if (!correct) return Svg.pathToVertices(o,30)
                    console.assert(correct, `Vertices should be an array: `, o)
                    return correct ? { x: o[0] * radius, y: o[1] * radius, index, isInternal: false, body: undefined } : o

                }
                shape = -1
                //   Body.scale(body, radius, radius)
                Body.setDensity(body, density)
                // Body.setMass(body, mass)
                // Body.setInertia(body, inertia)
                // Body.setAngle(body, angle)
                // Body.setPosition(body, { x, y })
            }
            else {
                var body = Bodies.circle(x, y, radius, options)
            }
        this.color = col
        if (image) this.image = image
        Object.defineProperty(this, 'shape', { value: shape, enumerable: 1 })
        Object.defineProperty(this, 'body', { value: body })
        delete options.isSensor
        Object.defineProperty(this, 'spawn', {
            value: { ...options, x, y, }
        })
        Object.defineProperty(this, '__shape__', {
            value: shape
        })
        this.opacity = opacity
        this.sleeping = game.isPaused
        this.radius = radius
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
        super(opts)
    }
    clone() {
        super.clone()
        this.remove()
    }
    collisionenter(body) {
        if (!(body instanceof marble)) return
        body.kill(true)
    }
    draw(x = this.x, y = this.y) {
        let f = game.frame
        ctx.save()
        ctx.globalCompositeOperation = "destination-over"
        ctx.strokeStyle = ctx.fillStyle = this.lightColor
        ctx.translate(x, y)
        ctx.rotate(f / 100)
        for (let i = 0, arrows = 6; i < arrows; i++) {
            ctx.beginPath()
            ctx.moveTo(5, -50 + Math.abs(Math.cos(f / 20)) * 40)
            ctx.lineTo(-5, -50 + Math.abs(Math.cos(f / 20)) * 40)
            ctx.lineTo(-0, -46 + Math.abs(Math.cos(f / 20)) * 40)
            ctx.closePath()
            ctx.stroke()
            ctx.fill()
            ctx.rotate(Math.PI * 2 / arrows)
        }
        ctx.beginPath()
        ctx.lineWidth = 3
        ctx.arc(0, 0, this.scale + Math.abs(Math.cos(f / 20)) * 30, 0, Math.PI * 2)
        this.inCurrentPath()
        ctx.stroke()
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
        if (!game.isPaused && this.#deck.length && !(game.frame % 40)) {
            let m = this.#deck.pop()
            new marble({ ...m, x: this.x + ran.range(-this.scale, this.scale), y: this.y + ran.range(-this.scale, this.scale) })
        }
    }
    draw(x = this.x, y = this.y) {
        let f = game.frame
        ctx.save()
        ctx.globalCompositeOperation = "destination-over"
        ctx.strokeStyle = ctx.fillStyle = this.lightColor
        ctx.translate(x, y)
        ctx.rotate(f / 100)
        for (let i = 0, arrows = 6; i < arrows; i++) {
            ctx.beginPath()
            ctx.moveTo(5, -70 + Math.abs(Math.sin(f / 20)) * 50)
            ctx.lineTo(-5, -70 + Math.abs(Math.sin(f / 20)) * 50)
            ctx.lineTo(-0, -75 + Math.abs(Math.sin(f / 20)) * 50)
            ctx.closePath()
            ctx.stroke()
            ctx.fill()
            ctx.rotate(Math.PI * 2 / arrows)
        }
        ctx.beginPath()
        ctx.lineWidth = 3
        ctx.arc(0, 0, this.scale + Math.abs(Math.sin(f / 20)) * 30, 0, Math.PI * 2)
        this.inCurrentPath()
        ctx.stroke()
        ctx.restore()
    }
}
// new goal({})
goal.prototype.dontShow = new Set(`name restitution density image static angle scale opacity`.split(' '))
class marble extends obj {
    showName = true
    constructor(opts) {
        opts.shape = 0
        opts.static = false
        opts.isSensor = false
        o.name = 'Goal'
        Object.assign(opts, marbleStats)
        super(opts)
    }
    kill(winOrLose) {
        let o = { name: this.body.label, color: this.lightColor, image: this.image?.src ?? null }
        placements[winOrLose ? 'winners' : 'losers'].push(o)
        this.remove()
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

    ) {
        entities.get(all[i].id).update()
    }
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
Events.on(engine, 'afterUpdate', () => {
    ctx.clearRect(0, 0, can.width, can.height)
    ctx.fillStyle = 'black'
    ctx.drawImage(background, 0, 0, can.width, can.height)
    ctx.save()
    ctx.translate(cam.position.x, cam.position.y)
    ctx.scale(cam.zoom, cam.zoom)
    ctx.beginPath()
    ctx.clearRect(0, 0, bounds.x, bounds.y)
    if (game.isPaused) ctx.globalCompositeOperation = "destination-over"
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
        cam.position.lerp(vect(-x, -y).scale(cam.zoom).add(can.width / 2, can.height / 2), cam.speed / 100)
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
