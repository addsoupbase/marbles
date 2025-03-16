import { Events, engine, Runner, runner, world, Bodies, base, Body, Svg, Composite, Sleeping, Vector, bounds, Constraint, getAllBodies, getAllConstraints } from './game.js'
import { canvas as can, mouse, cam, marbles, levelName, images, game, inEditor, customVertices, msg } from './setup.js'
import { lstorage } from '../../proxies.js'
import ran from '../../random.js'
import str from '../../strings.js'
import *as math from '../../num.js'
import { on, until, wait } from '../../handle.js'
import $ from '../../yay.js'
import { getJson } from '../../arrays.js'
import color from '../../color.js'
// function defineFuncs(obj, funcs) {
// return Object.defineProperties(obj, Object.getOwnPropertyDescriptors(funcs))
// }
function implement({ prototype }, paste) {
    //  lazy
    return Object.defineProperties(paste, Object.getOwnPropertyDescriptors(prototype))
}
game.playEngine = () => runner.enabled = true
game.pauseEngine = () => runner.enabled = false
let ctx = can.getContext('2d')
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
        if (o.image != null) {
            // n.transferFromImageBitmap(o.image)
            // n.canvas.convertToBlob().then(blob => {
            out.push($(`img.prev`, {
                attributes: {
                    src: o.image.src
                }
            }))
            // })
        }
        return out
    }), ...placements.losers.map((o) => {
        let out = $(`div.place.loser`, {
            styles: {
                'background-color': o.color
            },
            attributes: {
                title: o.name
            }
        },)
        if (o.image != null) {
            // n.transferFromImageBitmap(o.image)
            // n.canvas.convertToBlob().then(blob => {
            out.push($(`img.prev`, {
                attributes: {
                    src: o.image.src
                }
            }))
            // })
        }
        return out
    })))
    runner.enabled = false
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
const { vect, lerp } = math
if (inEditor) {
    var doc = top.document
    var marbleSize = doc.getElementById("marble-size"),
        marbleRestitution = doc.getElementById('marble-rest'),
        marbleDensity = doc.getElementById('marble-density'),
        marbleFriction = doc.getElementById('marble-friction'),
        marbleFrictionair = doc.getElementById('marble-frictionair')
}
const marbleStats = inEditor ? {
    radius: +(marbleSize?.value),
    density: +(marbleDensity?.value),
    restitution: +(marbleRestitution?.value),
    friction: +(marbleFriction?.value),
    frictionAir: +(marbleFrictionair?.value)
} : {
    radius: 25,
    density: 1,
    restitution: 6.25,
    friction: base.friction,
    frictionAir: 0.02
}
Object.defineProperty(game, 'all', {
    get: getAllBodies
})
Object.defineProperty(game, 'allConstraints', {
    get: getAllConstraints
})
if (inEditor) {
    top.base = base
    top.settings = marbleStats
    on(marbleSize, {
        change() {
            marbleStats.radius = +this.value
        }
    })
    on(marbleRestitution, {
        change() {
            marbleStats.restitution = +this.value
        }
    })
    on(marbleDensity, {
        change() {
            marbleStats.density = +this.value
        }
    })
    on(marbleFriction, {
        change() {
            marbleStats.friction = +this.value
        }
    })
    on(marbleFrictionair, {
        change() {
            marbleStats.frictionAir = +this.value
        }
    })
    game.toggleDOM = function (state) {
        [marbleSize, marbleRestitution, marbleDensity, marbleFriction, marbleFrictionair].forEach(o =>
            o.toggleAttribute('disabled', state)
        )
    }

    game.send = function (data) {
        if (data && top.selected !== data) {
            top.selected = data
            top.postMessage('showData')
        } else if (!top.selected && !data) top.postMessage(null)
    }
    mouse.place = function (xx, yy) {
        if (!game.isPaused) return
        let { x, y } = vect(xx, yy).subtract(...cam.position.clone.scale(1 / cam.zoom))
        switch (this.willPlace) {
            case 'circle': var out = body({ x, y, shape: 0, radius: 30, scaleX: 30, scaleY: 30, }); break
            case 'triangle': var out = body({ x, y, shape: 3, scaleX: 30, scaleY: 30, }); break
            case 'square': var out = body({ x, y, shape: 4, scaleX: 30, scaleY: 30, }); break
            case 'pentagon': var out = body({ x, y, shape: 5, scaleX: 30, scaleY: 30, }); break
            case 'hexagon': var out = body({ x, y, shape: 6, scaleX: 30, scaleY: 30, }); break
            case 'goal': {
                //  Only 1 allowed
                for (let n of getAllBodies()) n.constructor === goal && n.remove()
                var out = new goal({ x, y, scaleX: 30, scaleY: 30 })
                break
            }
            case 'spawn': {
                //  Only 1 allowed
                for (let n of getAllBodies()) n.constructor === spawn && n.remove()
                var out = new spawn({ x, y, scaleX: 30, scaleY: 30, name: 'Spawner' })
                break
            }
            default: {
                var out = body({ x, y, shape: customVertices.get(this.willPlace) })
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
    font: '10px system-ui, monospace',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    lineCap: 'butt',
    lineJoin: 'round'
})
let outlineOffsetThingy = 0
// import {vect} from '../../../num.js'
// function joint({ bodyA, bodyB, stiffness = 1, damping = 0.05, length = 50 }) {
// let out = Constraint.create({ bodyA, bodyB, stiffness, damping, length })
// joints.add(out)
// Object.defineProperties(out, Object.getOwnPropertyDescriptors(joint.prototype))
// return out
// }
// defineFuncs(joint.prototype, {
// disable() {
// Composite.remove(world, this)
// },
// enable() {
// Composite.add(world, this)
// }
// })

//  So at first i was just gonna use
//  a normal class based thingy
//  but i then decided do just use the base object thingy
//  and just assign to that
function obj() {
    throw TypeError('Abstract class cannot be instantiated directly')
}
obj.prototype = {
    constraints: new Set,
    get radius() {
        return Math.max(this.scaleX, this.scaleY, this.circleRadius)
    },
    scaleX: 1,
    scaleY: 1,
    ontoggle(state) {
        if (state === 'play') this.constraints.forEach(o => o.add())
        else this.constraints.forEach(o => o.remove())
    },
    add() {
        Composite.add(world, this)
    },
    remove() {
        Composite.remove(world, this)
    },
    setColor(val) {
        this.render.fillStyle = val
        this.render.strokeStyle = color.dhk(val)
    },
    getColor() {
        return {
            __proto__: null,
            dark: this.render.strokeStyle,
            light: this.render.fillStyle
        }
    },
}
function joint({ bodyA, bodyB, pointA, pointB, stiffness = 1, damping = 0.05, length }) {
    let out = Constraint.create({ bodyA, bodyB, pointA, pointB, stiffness, damping, length })
    implement(obj, out)
    implement(joint, out)
    out.add()
    // bodyA?.constraints.add(out)
    // bodyB?.constraints.add(out)
    return out
}
let JOINT_SYMBOL = Symbol('joint')
joint.prototype = {
    __proto__: obj.prototype,
    [JOINT_SYMBOL]: true,
    constructor: joint,
    update() {
        // this.draw()
    },
    draw() {
        let firstX = this.bodyA?.x ?? this.pointA.x
        let firstY = this.bodyA?.y || this.pointA.y
        let secondX = this.bodyB?.x ?? this.pointB.x
        let secondY = this.bodyB?.y || this.pointB.y
        ctx.save()
        ctx.beginPath()
        ctx.translate(secondX, secondY)
        ctx.arc(0, 0, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    },
    kill() {
        this.bodyA?.constraints.delete(this)
        this.bodyB?.constraints.delete(this)
        this.remove()
    }
}
function body({
    x = 0,
    y = 0,
    radius,
    angle = 0,
    shape = 0,
    opacity = 1,
    name = null,
    isSensor = false,
    color: col = color.choose(),
    scaleX = 1,
    scaleY = 1,
    isStatic = false,
    friction = base.friction,
    image = null,
    restitution = base.restitution,
    inertia = base.inertia,
    density = base.density,
    frictionAir = base.frictionAir
}) {
    if (!new.target) return new body(...arguments)
    if (radius) scaleX = scaleY = radius
    const startingOptions = {
        scaleX,
        scaleY,
        isStatic,
        isSensor,
        friction,
        restitution,
        // inertia,
        density,
        frictionAir,
        angle
    }
    let out
    if (typeof shape === 'number') {
        if (shape === 0) {
            out = Bodies.circle(x, y, radius || scaleX || scaleY, startingOptions)
            console.log(startingOptions)
        } else {
            out = Bodies.polygon(x, y, shape, 1, startingOptions)
        }
    }
    else if (Array.isArray(shape)) {
        let vertices = shape.map(map)
        out = Bodies.fromVertices(x, y, vertices, { ...startingOptions, radius: 1 })
        if (!out) {
            inEditor && prompt(`Bad Vertices!🙁\n(try not to make them cave in too much)`, JSON.stringify(shape))
            throw TypeError("Vertices are probably broken")
        }
        function map(o, index) {
            let correct = Array.isArray(o)
            if (!correct) return Svg.pathToVertices(o)
            console.assert(correct, `Vertices should be an array or .svg: `, o)
            return correct ? { x: o[0], y: o[1], index, isInternal: false, body: undefined } : o
        }
    }
    implement(obj, out)
    implement(body, out)
    Object.assign(out.render, {
        opacity,
        name,
        image,
        filter: ''
    })
    out.shape = shape
    out.showName = out.isEnteringGoal = false
    out.animation = null
    Object.defineProperty(out, 'spawn', {
        value: {
            ...startingOptions,
            opacity, shape,
            x, y,
            image,
            color: col
        }
    })
    name && out.setName(name)
    image && out.setImage(image)
    out.setColor(col)
    out.add()
    out.reset()
    return out
}
let BODY_SYMBOL = Symbol("body")
Object.defineProperty(body, Symbol.hasInstance, {
    value: instance => instance[BODY_SYMBOL] === true
})
body.prototype = {
    [BODY_SYMBOL]: true,
    constructor: body,
    setSleeping(val) {
        Sleeping.set(this, val)
    },
    enterGoal({ position: { x, y } }) {
        this.setStatic(this.isSensor = true)
        this.isEnteringGoal = true
        this.animation = vect(x, y)
    },
    *animateEnteredGoal() {
        //  The suck into portal animation thing
        this.showName = false
        let s = this.radius / 100
        for (let i = 0; i < 99; ++i) {
            this.setPos(...vect(this.position.x, this.position.y).lerp(this.animation, .1))
            //  this.filter = `invert(${i / 100})`
            //    filter causes big lag :(
            this.setScale(this.radius - s)
            this.rotate(0.1)
            yield i
        }
        this.animation = null
        this.kill(true)
    },
    restore() {
        this.setSleeping(false)
        const { saved } = this
        this.av = saved.angularVelocity
        this.as = saved.angularSpeed
        this.setRotation(saved.angle)
        this.setVelocity(saved.velocity.x, saved.velocity.y)
        this.setPos(saved.position.x, saved.position.y)
    },
    setInertia(inertia) {
        Body.setInertia(this, inertia)
    },
    outOfBounds() {
        this.reset()
    },
    outline() {
        if (inEditor && top.selected === this) {
            ctx.setLineDash([this.radius / 10, 2])
            ctx.lineDashOffset = outlineOffsetThingy
            ctx.lineWidth = 3 / cam.zoom
            ctx.strokeStyle = color.black
            return true
        }
        return false
    },
    save() {
        this.saved = {
            __proto__: null,
            velocity: { ...this.velocity },
            angularSpeed: this.as,
            angularVelocity: this.av,
            angle: this.angle,
            position: { ...this.position }
        }
        this.setSleeping(true)
    },
    clone() {
        let n = new this.constructor({
            ...this.spawn,
            x: (-cam.position.x + can.width / 2) * 1 / cam.zoom, y: (-cam.position.y + can.height / 2) * 1 / cam.zoom,
        })
        game.send(n)
        mouse.reset()
        mouse.selectedBody =
            mouse.clickedBody = n
        game.send(n)
    },
    setImage(src) {
        if (src && typeof src !== 'string') {
            this.render.image = src
            this.spawn.image = src.src
        }
        else if (src == null || src === 'none') {
            this.render.image =
                this.spawn.image = null
        }
        else if (images.has(src)) {
            this.spawn.image = src
            this.render.image = images.get(src)
        }
        else {
            let i = new Image
            i.src = src
            on(i, {
                _load: async () => {
                    //  i think bitmaps are slower

                    // let bitmap = await createImageBitmap(i)
                    // this.spawn.image = src
                    // this.render.image = i
                    let context = new OffscreenCanvas(256, 256).getContext('2d')
                    context.drawImage(i, 0, 0, 256, 256)
                    context.canvas.convertToBlob().then(o => this.spawn.image = context.canvas.src = URL.createObjectURL(o))
                    this.render.image = context.canvas
                    // images.set(o.image, context.canvas)
                    // images.set(src, i)
                }
            })
        }
    },
    setName(name) {
        this.label = name
        if (this.dontShow.has('name')) return
        let c = (typeof OffscreenCanvas === 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(100, 50)),
            cx = c.getContext('2d')
        Object.assign(cx, {
            textAlign: 'center',
            font: '12px system-ui, monospace',
            textBaseline: 'middle',
            textRendering: 'optimizeLegibility',
            lineCap: 'round',
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
        this.render.nameImage = c//.transferToImageBitmap()
    },

    reset() {
        this.setStatic(this.spawn.isStatic)
        this.setPos(this.spawn.x, this.spawn.y)
        this.setDensity(this.spawn.density)
        this.setVelocity(0, 0)
        this.setRotation(this.spawn.angle)
        this.setColor(this.spawn.color)
        this.restitution = this.spawn.restitution
        this.setScaleX(this.spawn.scaleX)
        this.setScaleY(this.spawn.scaleY)
        this.render.opacity = this.spawn.opacity
        this.av = this.as = 0
    },
    update() {
        if (game.isPaused) this.setSleeping(true)
    },
    draw(x = this.position.x, y = this.position.y, scale) {
        if (typeof this.render.image === 'string') {
            let n = this.render.image
            this.setImage(n)
            this.render.image = null
        }
        if (game.isPaused) {
            this.setPos(math.clamp(x, 0, bounds.x), math.clamp(y, 0, bounds.y))
            if (mouse.draggingBody === this && mouse.clickedBody === this && !mouse.clickedThisFrame) {
                mouse.clickedThisFrame = true
                let { x, y } = mouse.cursor.clone.subtract(cam.position.clone.iScale(cam.zoom))
                this.spawn.pos = { x, y }
                this.reset()
                Object.assign(this.spawn, { x, y })
            }
        }
        else if (x > bounds.x || x < 0 || y > bounds.y || y < 0)
            this.outOfBounds?.()
        if (isNaN(x) || isNaN(y)) this.setPos(this.spawn.x, this.spawn.y)
        if (this.isEnteringGoal) {
            if (!this.__animation__) this.__animation__ = this.animateEnteredGoal()
            else {
                let { value } = this.__animation__.next()
                x += Math.cos(game.frame / 10) * (value / 4)
                y += Math.sin(game.frame / 10) * (value / 4)
            }
        }
        // if (mouse.selectedBody === this) return
        ctx.save()
        ctx.translate(x, y)
        scale && ctx.scale(scale)
        ctx.globalAlpha = this.render.opacity
        ctx.fillStyle = this.render.fillStyle
        ctx.strokeStyle = this.render.strokeStyle
        ctx.filter = this.render.filter
        if (game.isPaused) ctx.globalAlpha = math.clamp(this.render.opacity, 0.25, 1)
        let isSelected = this.outline()
        if (this.circleRadius) {
            ctx.beginPath()
            ctx.arc(0, 0, Math.abs(this.radius), 0, Math.PI * 2)
        }
        else if (this.shape !== 0) {
            //  Totally didnt use ai for this part
            if (this.parts && this.parts.length > 1) {
                for (let i = 1, { length } = this.parts; i < length; ++i) {
                    const { [i]: part } = this.parts
                    ctx.beginPath()
                    const partVertices = part.vertices
                    ctx.moveTo(partVertices[0].x - x, partVertices[0].y - y)
                    for (let j = 1, { length } = partVertices; j < length; ++j) {
                        let { x: partX, y: partY } = partVertices[j]
                        ctx.lineTo(partX - x, partY - y)
                    }
                    this.inCurrentPath()
                    ctx.stroke()
                    if (this.render.image) {
                        ctx.save()
                        ctx.clip()
                        ctx.drawImage(this.render.image, -width / 2, -height / 2, width, height)
                        ctx.restore()
                    }
                    else {
                        ctx.fill()
                    }
                }
            }
            else {
                const { vertices } = this
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
            const { vertices } = this
            var width = Vector.magnitude(Vector.sub(vertices[0], vertices[1]))
            var height = Vector.magnitude(Vector.sub(vertices[1], vertices[2]))
        }
        else var height = this.circleRadius * 2, width = this.circleRadius * 2
        let old = ctx.globalAlpha
        if (isSelected) ctx.globalAlpha = 1
        ctx.stroke()
        ctx.globalAlpha = old
        if (this.render.image) {
            ctx.save()
            ctx.clip()
            ctx.rotate(this.angle)
            ctx.drawImage(this.render.image, -width / 2, -height / 2, width, height)
            ctx.restore()
        }
        else {
            ctx.fill()
        }
        if (this.showName && this.render.nameImage && cam.zoom > 0.75) {
            ctx.imageSmoothingEnabled = true
            ctx.globalAlpha = 1
            ctx.imageSmoothingQuality = 'high'
            height = -height * (this.shape === 0 ? 1.5 : 1)
            ctx.drawImage(this.render.nameImage, -50, -Math.abs(this.radius) - 40)
        }
        ctx.restore()
    },
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
    },
    get av() {
        return Body.getAngularVelocity(this)
    },
    get as() {
        return Body.getAngularSpeed(this)
    },
    set av(val) {
        Body.setAngularVelocity(this, val)
    },
    set as(val) {
        Body.setAngularSpeed(this, val)
    },
    setDensity(val) {
        Body.setDensity(this, val)
    },
    setSpeed(val) {
        Body.setSpeed(this, val)
    },
    setRotation(angle, updateVelocity) {
        Body.setAngle(this, angle, updateVelocity)
    },
    rotate(rotation, updateVelocity) {
        Body.rotate(this, rotation, updateVelocity)
    },
    scaleBy(scale) {
        Body.scale(this, scale, scale)
    },
    setScale(scale) {
        if (this.shape === 0) return this.circleRadius = this.scaleX = this.scaleY = scale
        let { angle } = this
        this.setRotation(0)
        Body.scale(this, 1 / this.scaleX, 1 / this.scaleY)
        Body.scale(this, scale, scale)
        this.scaleX = this.scaleY = scale
        this.setRotation(angle)
    },
    setScaleX(scale) {
        if (this.shape === 0) return this.circleRadius = this.scaleX = this.scaleY = scale
        let { angle } = this
        this.setRotation(0)
        Body.scale(this, 1 / this.scaleX, 1)
        Body.scale(this, scale, 1)
        this.scaleX = scale
        this.setRotation(angle)
    },
    setScaleY(scale) {
        if (this.shape === 0) return this.circleRadius = this.scaleX = this.scaleY = scale
        let { angle } = this
        this.setRotation(0)
        Body.scale(this, 1, 1 / this.scaleY)
        Body.scale(this, 1, scale)
        this.scaleY = scale
        this.setRotation(angle)
    },
    setStatic(val) {
        Body.setStatic(this, val)
    },
    setPos(x = this.position.x, y = this.position.y, updateVelocity) {
        Body.setPosition(this, { x, y }, updateVelocity)
    },
    translate(x = 0, y = 0, updateVelocity) {
        Body.translate(this, { x, y }, updateVelocity)
    },
    setVelocity(x = 0, y = 0) {
        Body.setVelocity(this, { x, y })
    },
    applyForce(x = 0, y = 0, position = this.position) {
        Body.applyForce(this, position, { x, y })
    },
    getScale() {
        return this.spawn.radius
    },
    set(prop, value) {
        Body.set(this, prop, value)
    },
    dontShow: new Set
}
function goal(args) {
    args.shape = 0
    args.radius = 30
    args.isStatic =
        args.isSensor = true
    let out = new body(args)
    implement(new.target, out)
    return out
}
const GOAL_SYMBOL = Symbol('goal')
Object.defineProperty(goal, Symbol.hasInstance, {
    value: instance => instance[GOAL_SYMBOL] === true
})
goal.prototype = {
    [GOAL_SYMBOL]: true,
    __proto__: body.prototype,
    constructor: goal,
    dontShow: new Set(`name restitution density image static angle scale opacity`.split(' ')),
    clone() {
        super.clone()
        this.remove()
    },
    async collisionenter(body) {
        if (!(MARBLE_SYMBOL in body)) return
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
    },
    draw(x = this.position.x, y = this.position.y) {
        let f = game.realFrame
        ctx.save()
        if (game.isPaused) {
            this.setPos(math.clamp(x, 0, bounds.x), math.clamp(y, 0, bounds.y))
            if (mouse.draggingBody === this && mouse.clickedBody === this && !mouse.clickedThisFrame) {
                mouse.clickedThisFrame = true
                let { x, y } = mouse.cursor.clone.subtract(cam.position.clone.iScale(cam.zoom))
                this.spawn.pos = { x, y }
                this.reset()
                Object.assign(this.spawn, { x, y })
            }
        }
        else if (x > bounds.x || x < 0 || y > bounds.y || y < 0)
            this.outOfBounds?.()
        if (isNaN(x) || isNaN(y)) this.setPos(this.spawn.x, this.spawn.y)
        // ctx.globalCompositeOperation = "source-out"
        ctx.strokeStyle = this.render.strokeStyle
        ctx.fillStyle = this.render.fillStyle
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
        ctx.arc(0, 0, (this.radius / 4) + (c * 30), 0, Math.PI * 2)
        this.outline()
        ctx.stroke()
        ctx.globalAlpha = this.render.opacity / 4
        ctx.fill()
        game.isPaused&&ctx.beginPath(),
        ctx.arc(0, 0, 60, 0, Math.PI * 2),
        this.inCurrentPath(),
        ctx.restore()
    }
}
function spawn(args) {
    let out = new goal(args)
    out.name = 'Spawner'
    out.deck = null
    out.spawnRate = out.spawn.spawnRate = args.spawnRate ?? 40
    implement(new.target, out)
    return out
}
const SPAWN_SYMBOL = Symbol('spawn')
Object.defineProperty(spawn, Symbol.hasInstance, {
    value: instance => instance[SPAWN_SYMBOL] === true
})
spawn.prototype = {
    [SPAWN_SYMBOL]: true,
    __proto__: goal.prototype,
    constructor: spawn,
    update() {
        super.update()
        if (!game.isPaused && !game.frozen && this.deck?.length && !(game.frame % this.spawnRate)) {
            let m = this.deck.pop()
            let mm = new marble({

                ...m, x: this.position.x + ran.range(-this.radius, this.radius) / 2, y: this.position.y + ran.range(-this.radius, this.radius) / 2
            })

        }
    },
    collisionenter() { },
    draw(x = this.position.x, y = this.position.y) {
        let f = game.realFrame

        if (game.isPaused) {
            this.setPos(math.clamp(x, 0, bounds.x), math.clamp(y, 0, bounds.y))
            if (mouse.draggingBody === this && mouse.clickedBody === this && !mouse.clickedThisFrame) {
                mouse.clickedThisFrame = true
                let { x, y } = mouse.cursor.clone.subtract(cam.position.clone.iScale(cam.zoom))
                this.spawn.pos = { x, y }
                this.reset()
                Object.assign(this.spawn, { x, y })
            }
        }
        else if (x > bounds.x || x < 0 || y > bounds.y || y < 0)
            this.outOfBounds?.()
        if (isNaN(x) || isNaN(y)) this.setPos(this.spawn.x, this.spawn.y)
        if (this.isEnteringGoal) {
            if (!this.__animation__) this.__animation__ = this.animateEnteredGoal()
            else {
                let { value } = this.__animation__.next()
                x += Math.cos(game.frame / 10) * (value / 4)
                y += Math.sin(game.frame / 10) * (value / 4)
            }
        }
        ctx.save()
        // ctx.globalCompositeOperation = "source-out"
        ctx.strokeStyle = this.render.strokeStyle
        ctx.fillStyle = this.render.fillStyle
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
        ctx.arc(0, 0, (this.radius / 4) + (c * 30), 0, Math.PI * 2)
        this.outline()
        this.inCurrentPath()
        ctx.stroke()
        // ctx.globalAlpha = this.render.opacity / 4
        ctx.fill()
        ctx.restore()
    },
    ontoggle(state) {
        switch (state) {
            case 'play': this.deck = ran.shuffle(...marbles.values())
        }
    },
    reset() {
        super.reset()
        this.spawnRate = this.spawn.spawnRate
    }
}
function marble(args) {
    args.shape = 0
    args.radius = marbleStats.radius
    args.isStatic =
        args.isSensor = false
    Object.assign(args, marbleStats)
    let out = new body(args)
    out.showName = true
    implement(marble, out)
    return out
}
const MARBLE_SYMBOL = Symbol('marble')
Object.defineProperty(marble, Symbol.hasInstance, {
    value: instance => instance[MARBLE_SYMBOL] === true
})
marble.prototype = {
    [MARBLE_SYMBOL]: true,
    __proto__: body.prototype,
    constructor: marble,
    draw(...o) {
        ctx.globalCompositeOperation = 'source-over'
        super.draw(...o)
    },
    outOfBounds() {
        this.kill(false)
    },
    kill(winOrLose = true) {
        let o = { name: this.label, color: this.render.fillStyle, image: this.render.image ?? null }
        placements[winOrLose ? 'winners' : 'losers'].push(o)
        this.remove()
        if (!inEditor && placements.winners.length + placements.losers.length === marbles.size) {
            game.end()
        }
    },
    ontoggle(state) {
        state === 'pause' && this.remove()
    }
}
function afterUpdate() {
    let all = getAllBodies()
    for (let { length } = all
        , i = 0; i < length; ++i
        //; length--;
    )
        all[i].update()
    /*let allConstraints = getAllConstraints()
    for (let { length } = allConstraints
        , i = 0; i < length; ++i
        //; length--;
    )
        allConstraints[i].update()*/
    if (mouse.selectedBody) {
        let { globalCompositeOperation } = ctx
        ctx.globalCompositeOperation = 'source-over'
        // mouse.selectedBody.draw()
        ctx.globalCompositeOperation = globalCompositeOperation
    }
    cam.iterate()
}
function nextFrame() {
    requestAnimationFrame(nextFrame)
    mouse.clickedThisFrame = false

    ++game.realFrame
    if ((outlineOffsetThingy += .2) === 5) outlineOffsetThingy = 0
    ctx.clearRect(0, 0, can.width, can.height)
    ctx.fillStyle = '#7998a3'
    //ctx.drawImage(background, 0, 0, can.width, can.height)
    ctx.fillRect(0, 0, can.width, can.height)
    ctx.save()
    ctx.translate(cam.position.x, cam.position.y)
    cam.zoom = lerp(cam.zoom, cam.targetZoom, 0.07)
    ctx.scale(cam.zoom, cam.zoom)
    ctx.clearRect(0, 0, bounds.x, bounds.y)
    //if (game.isPaused)
    ctx.globalCompositeOperation = "destination-over"

    if (cam.following && !mouse.leftClicking) {
        let { x, y } = cam.following.position
        cam.position.lerp(vect(-x, -y).scale(cam.zoom).add(can.width / 2, can.height / 2), (cam.speed / 100) / cam.zoom)
    }
    let closestToGoal
    let furthestFromGoal
    let all = getAllBodies()
    let avgPosX = []
    let avgPosY = []
    for (let { length } = all
        , i = 0; i < length; ++i
        //; length--;
    ) {
        all[i].draw()
        if (all[i] instanceof marble) {
            avgPosX.push(all[i].position.x)
            avgPosY.push(all[i].position.y)
            closestToGoal ??= furthestFromGoal ??= all[i]
            if (cam.goal && vect.distance(closestToGoal.position, cam.goal?.position) > vect.distance(all[i].position, cam.goal?.position)) {
                closestToGoal = all[i]
            }
            if (cam.goal && vect.distance(furthestFromGoal.position, cam.goal?.position) < vect.distance(all[i].position, cam.goal?.position)) {
                furthestFromGoal = all[i]
            }
        }
    }
    let allC = getAllConstraints()
    for (let { length } = allC
        , i = 0; i < length; ++i
        //; length--;
    )
        allC[i].draw()
    ctx.restore()
    if (game.isPaused) {
        //  Pause icon
        ctx.lineWidth = 1
        ctx.fillStyle = color.gray
        ctx.strokeStyle = color.black
        ctx.fillRect(10, 10, 7, 20)
        ctx.fillRect(21, 10, 7, 20)
        ctx.strokeRect(10, 10, 7, 20)
        ctx.strokeRect(21, 10, 7, 20)
    }
    if (!game.isPaused && !game.frozen) 
    switch (cam.behaviour) {
        case 'first': cam.following = closestToGoal; break
        case 'last': cam.following = furthestFromGoal; break
        case 'avg': if (closestToGoal && furthestFromGoal){
            let avgX = math.average(...avgPosX)
            let avgY = math.average(...avgPosY)
            cam.following = {
                position: {
                    x: avgX,
                    y: avgY
                }
            }
        }
        break
    }
}
nextFrame()
function beforeUpdate() {
}
function afterRemove() {
}
function beforeRemove() {
}
Runner.run(runner, engine)
game.pauseEngine()
Events.on(world, 'afterRemove', afterRemove)
Events.on(world, 'beforeRemove', beforeRemove)
Events.on(engine, 'afterUpdate', () => {
    afterUpdate(++game.frame)
    // ctx.beginPath()
    // let r = 20
    // mouse.clicking && (r = 15)
    // ctx.arc(...mouse.cursor.clone.subtract(...cam.position.clone.scale(1 / cam.zoom)), r, 0, Math.PI * 2)
    // ctx.stroke()
})
Events.on(engine, 'beforeUpdate', beforeUpdate)
Events.on(engine, 'collisionStart', collisionStart)
Events.on(engine, 'collisionActive', collisionActive)
Events.on(engine, 'collisionEnd', collisionEnd)
function collisionStart({ pairs }) {

    pairs.forEach(pair => {
        let { bodyA: a, bodyB: b } = pair
        if (a && b)
            b.collisionenter?.(a),
                a.collisionenter?.(b)
    })
}
function collisionEnd({ pairs }) {
    pairs.forEach(pair => {
        let { bodyA: a, bodyB: b } = pair
        if (a && b)
            b.collisionout?.(a),
                a.collisionout?.(b)
    })
}
function collisionActive({ pairs }) {
    pairs.forEach(pair => {
        let { bodyA: a, bodyB: b } = pair
        if (a && b)
            b.collision?.(a),
                a.collision?.(b)
    })
}
let overlay = $.gid('overlay')
top.m = marbleStats
window.getLevelFromJSON =
    function getLevelFromJSON(json) {
        if (inEditor) {
            marbleDensity.value = json.settings.density
            marbleFriction.value = json.settings.friction
            marbleFrictionair.value = json.settings.frictionAir
            marbleRestitution.value = json.settings.restitution
            marbleSize.value = json.settings.radius
        }
        else {
            document.title = `${$.gid('title').textContent = str.shorten(json.title || 'Level', 32)} - Marbles`
            $.gid('author').textContent = str.shorten(json.author || 'Unknown', 16)
        }
        marbles.clear()
        Composite.clear(world, false, true)
        let { images: imgs, map, racers, settings, shapes } = json
        Object.assign(marbleStats, settings)
        console.log(marbleStats)
        racers.forEach(async (o, i) => {
            if ('image' in o && o.image != null) {
                let url = imgs[o.image]
                o.image = `${o.image}`
                if (images.has(o.image)) {
                    return o.image = images.get(o.image)
                }
                let n = new Image
                n.src = url
                await until(n, 'load')
                let context = new OffscreenCanvas(256, 256).getContext('2d')
                context.drawImage(n, 0, 0, 256, 256)
                images.set(o.image, context.canvas)
                context.canvas.convertToBlob().then(data => o.image = context.canvas.src = URL.createObjectURL(data))
                let { name, color, image } = o
                inEditor && top.addMarble({ name, color, image })
            }
            marbles.set(i, o)
        })
        map.forEach(async o => {
            if ('image' in o && o.image != null) {
                let url = imgs[o.image]
                o.image = `${o.image}`
                if (images.has(o.image)) {
                    return o.image = images.get(o.image)
                }
                let n = new Image
                n.src = url
                await until(n, 'load')
                let context = new OffscreenCanvas(256, 256).getContext('2d')
                context.drawImage(n, 0, 0, 256, 256)
                images.set(o.image, context.canvas)
                context.canvas.convertToBlob().then(data => o.image = context.canvas.src = URL.createObjectURL(data))
            }
            let digit = Math.abs(o.shape + 1)
            if (o.shape < 0) {
                try {
                    let shape = JSON.parse(shapes[digit])
                    msg({
                        data: {
                            vertices: shape,
                            title: digit
                        }
                    })
                }
                catch {
                    msg({
                        data: {
                            svg: `<svg xmlns="http://www.w3.org/2000/svg">
                           ${json.shapes[digit].split('|').map(o => `<path d="${o}"></path>`).join('')}
                           </svg>`, title: digit
                        }
                    })
                }
                o.shape = customVertices.get(Math.abs(o.shape + 1))
            }
            switch (o.type) {
                default: return body(o)
                case 'spawn': return new spawn(o)
                case 'goal': return new goal(o)
            }
        })
    }
if (levelName) {
    overlay.style.display = ''
    $.body.on({
        keydown2({ key }) {
            if (key === 'Enter')
                play.click()
        }
    })
    overlay.classList.add('slide-in-blurred-top')
    let play
    overlay.push(
        $('<h1 id="title">Level</h1>'),
        $('<cite id="author">Unknown</cite>'),
        $("<div></div>", null,
            play = $('<button class="cute-green-button" autofocus>Play</button>', {
                events: {
                    async _click2(o, abort) {
                        abort()
                        overlay.classList.add('slide-out-blurred-top')
                        await until(overlay.anims[0], 'finish')
                        await wait(500)
                        game.play()
                    }
                }
            })
        )
    )
    let settings = $(`<div><button class="cute-green-button settingsbutton">Settings</button></div>`)
    let settingsmenu = $(`<div>
        <label for="camb">Cam Behaviour
        <select id="camb">
        <option value="default">None</option>
        <option value="first">Follow First</option>
        <option value="last">Follow Last</option>
        <option value="middle">Follow Middle</option>
        <option value="avg">Average Position</option>
        <option value="avgnooutliers">Average Position (no outliers)</option>
        </select>
        </label>
        </div>`)
    settingsmenu.hide()
    for (let n of settingsmenu.first) {
        if (n.value === lstorage.cam) {
            n.setAttributes({ selected: true })
            break
        }
    }
    overlay.push(settingsmenu)
    settings.on({
        _click() {
            let camb = $.gid('camb')
                .on({
                    change() {
                        lstorage.cam = cam.behaviour = this.value || 'default'
                    }
                })
            settingsmenu.show()
            this.destroy()
        }
    })
    overlay.push(settings)
    getLevelFromJSON(await getJson(`./levels/${levelName}.json`))
}
/* function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    // create a view into the buffer
    var ia = new Uint8Array(ab);
    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], { type: mimeString });
    return blob;
} */
// let a = body({ x: 400, y: 300, scaleX: 30, scaleY: 30, shape: 4 })
// joint({ bodyA: a, pointB: { ...a.position } })
