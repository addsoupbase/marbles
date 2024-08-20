import { Images } from "./img.js"
import { darkenHexColor, choose, frange, range, Colors as c } from "./utils.js"
let select = "edit",
    current = null,
    inx = 0
    , editorMode = true
    , following = null
    , options = null
    , chosenEntity = "Block1"
    , text = ""
    , smooth = 0
    , textColor = "#000000"
    , saved = "", existingCam = false;
const Del = function (num) {
    let foundyou = null
    for (let o of Entity.toSpawn) {
        if (o.id === +num) {
            foundyou = o
            break
        }
    }
    console.log(foundyou, num)
    Entity.toSpawn.deleteWithin(foundyou)
    $(`[name='${foundyou.id}']`).each(function () {
        $(this).remove()
    })
},

    spawnAllOfTheMarbles = () => {
        for (let o of Entity.toSpawn) {
            new Marble(o)
        }
    },
    killAllOfTheMarbles = () => {
        for (let o of Entity.all) {
            if (o.CREATOR === Marble) {
                o.kill()
            }
        }
    }
    , Spawn = function (num) {
        let foundyou = null
        for (let o of Entity.toSpawn) {
            if (o.id === num) {
                foundyou = o
                break
            }
        }
        new Marble(foundyou)
    },
    addMarble = function () {
        let me = new Marble({ size: 30, x: (-cam.x / cam.zoom + canvas.width / 2) + (Math.random() * 100 * choose(1, -1)), y: (-cam.y / cam.zoom + canvas.height / 2) + (Math.random() * 100 * choose(1, -1)) /*img: Entity.Images[1]*/ })
        let inp = document.createElement("input")
        inp.value = me.Name
        inp.placeholder = "Name"
        inp.name = me.id
        $(inp).on({
            focusout: function () {
                let foundYou = null
                for (let o of Entity.toSpawn) {
                    if (o.id === +this.name) {
                        foundYou = o
                        break
                    }
                }
                foundYou.Name = this.value
            }
        })
        $("#allMarbles").append(`<input name='${me.id}'type='file' id='mrbl${me.id}'>`)
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
                //showData(current)
            }
        })
        $("#allMarbles").append(inp)
        let index1 = getIndex(),
            index2 = getIndex()
        $("#allMarbles").append(`
                <button class="good" name="${me.id}" id="spawn${index1}">Spawn</button>
                <button name="${me.id}" id="Del${index2}" class="bad">🗑️</button>
            `);
        for (let [id, event] of [
            [`spawn${index1}`, () => Spawn(me.id)],
            [`Del${index2}`, () => Del(me.id)]
        ]) {
            $(`#${id}`).on({
                click: event
            })
        }
        me.kill()
        Entity.toSpawn.push({ Name: me.Name, shape: "circle", size: 30, id: me.id, img: null })
    }
function shapeToImage(ball) {
    const c = document.createElement("canvas")
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
    ball.img.src = c.toDataURL("image/png")

}
const bounds = {
    x: 3000,
    y: 3000,
    get center() {
        return { x: this.x / 2, y: this.y / 2 }
    }
}, save = function () {
    editorMode || startGame()
    let arr = []
    for (let o of a.all) {
        //console.log(o)
        arr.push([o.start, o.CREATOR.name])
    }

    console.log(JSON.stringify(arr))
}, Load = function () {
    editorMode || startGame()
    let data = JSON.parse($("#field")[0].value)
    Entity.all.length = 0
    for (let o of Matter.Composite.allBodies(world)) {
        World.remove(world, o)
    }
    for (let item of data) {
        //console.log(item)
        // console.log(item[0], item[1])
        let suize = item[0]
        console.log(suize)
        //suize.height = item[2].height ?? item[2].start.height
        //suize.width = item[2].width ?? item[2].start.width
        console.log(item[1])
        let x = new Entity[item[1]](suize)
        x.start = suize
        debugger
    }
}, menu = function (type) {
    $(".menu").each(function () { $(this).hide() })
    $("#" + type).show()
}, deleteFrom = (o) => {
    if (!editorMode) {
        return Text = "Exit play mode first!!!#ff0000"
    }
    else {
        o.kill();
        showData()
    }

}
for (let [key, id] of [["data2", "put"], ["data", "edit"], ["data3", "marble"]]) {
    $(`#${id}`).on({
        click() {
            select = id
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
    ["loadButton", Load]
]) {
    $(`#${id}`).on({
        click: event
    })
}
Object.defineProperty(window, "Text", {
    set: function (o) {
        let col = o.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)
        console.log(col)
        if (col) {
            o = o.replace(col[0], "")
            textColor = col[0]
        }
        else {
            textColor = "#000000"
        }
        text = o
        smooth = 0
    }
})
{
    let id1 = getIndex(),
        id2 = getIndex(),
        id3 = getIndex();
    $("#buttonholder").append(`<button class="good" id="block${id1}">Block</button>`)
    $("#buttonholder").append(`<button class="good" id="beam${id2}">Beam</button>`)
    $("#buttonholder").append(`<button class="good" id="motor${id3}">Motor</button>`)
    for (let [id, event] of [
        [`block${id1}`, () => chosenEntity = "Block"],
        [`beam${id2}`, () => chosenEntity = "Beam"],
        [`motor${id3}`, () => chosenEntity = "Motor"]
    ]) {
        //dis aint working but im going to sleep 
        $(`#${id}`).on({
            click: event
        })
    }



}
let sizes = ["Small", "Medium", "Big", "Large", "Huge"]
let finalSize = "Small"
for (let o of sizes) {
    let index = sizes.indexOf(o) + 1
    $("#data2").append(`<input type='radio' id="radio${index}" value='${index * 2}' name="bleh" ${index === 1 ? "checked" : ""}><label for="radio${index}">${o}</label><br>`)

}
$("#buttonholder").append(`<button class="good" onclick="chosenEntity='Cam'">Camera</button>`)
$("#buttonholder").append(`<button class="good" onclick="chosenEntity='Spawner'">Spawner</button>`)

function place(entity) {
    let modifier = +$("input[type='radio'][name='bleh']:checked")[0].value
    if (modifier === 10) {
        modifier = 15
    }
    if (entity.includes("Block")) {
        let baby = new Wall({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.gray, width: 30 * (modifier), height: 30 * (modifier), isStatic: true })
        current = baby
        showData(baby)

    }
    if (entity.includes("Beam")) {
        let baby = new Beam({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.red, height: 15, width: 70 * (modifier), isStatic: true })
        current = baby
        showData(baby)

    }
    if (entity.includes("Motor")) {
        let baby = new Blade({ frictionAir: 0, x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.yellow, size: 100 * modifier, isStatic: false })
        current = baby
        showData(baby)

    }
    if (entity.includes("Cam")) {
        let baby = new Cam({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.grey })
        current = baby
        showData(baby)

    }
    if (entity.includes("Spawner")) {
        let baby = new Spawner({ size: 30 * modifier, x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.grey, shape: "circle" })
        current = baby
        showData(baby)

    }
    console.log(entity.all)
}
const canvas = $('canvas')[0],
    ctx = canvas.getContext('2d');
const cam = {
    x: 0,
    y: 0,
    angle: 0,
    speed: 10,
    zoom: 1,
    key: {
        w: false,
        s: false,
        a: false,
        d: false
    }
}
ctx.lineWidth = 4
let darkBorders = false;
// Import or include Matter.js
const Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Body = Matter.Body,
    Collision = Matter.Collision,
    Constraint = Matter.Constraint

const engine = Engine.create();
const world = engine.world;
const click = {
    x: NaN,
    y: NaN
}, apply = () => {
    if (!editorMode) {
        //return Text = "Exit play mode first!!!#ff0000"
        startGame()
    }
    Text = "Changes applied!!!#0dff00"
    let idNames = {

    }
    for (let element of $("#data").children()) {
        let mine = $(element)[0]
        if (mine.value != null && mine.id) {
            idNames[mine.id] = mine.value
        }
    }
    for (let name in idNames) {

        if (name in current) {
            if (name === "angle") {
                Body.setAngle(current, (+(idNames[name]) * Math.PI / 180) || 0)
                current.start[name] = +(idNames[name]) * Math.PI / 180 || 0

            }
            if (name === "speed") {
                console.log(idNames)
                cam.speed = +idNames[name]
            }
            if (name === "mass") {
                Body.setMass(current, +idNames[name])
                current.start[name] = +idNames[name]

            }
            if (name === "interval") {
                current[name] = +idNames[name]
                current.start[name] = +idNames[name]

            }
            if (name === "Name") {
                current.Name = current.start.Name = idNames[name]
            }
            /*  if (name === "angularSpeed") {
                  Body.setAngularSpeed(current, (+(idNames[name])) || 0)
                  current.start[name] = +(idNames[name])
  
              }
              if (name === "angularVelocity") {
                  Body.setAngularVelocity(current, (+(idNames[name])) || 0)
                  current.start[name] = +(idNames[name])
  
              }*/
            if (name.match(/restitution|frictionAir/)) {
                current[name] = +(idNames[name])
                current.start[name] = +(idNames[name])

            }
            if (name.match(/inertia/)) {
                Body.setInertia(current, +(idNames[name]) || 0.1)
                current.start[name] = +(idNames[name]) || 0.1

            }
            if (name.match(/width|height/)) {
                if (name === "width") {
                    Body.scale(current, +(idNames[name]) || 1, 1)

                }
                else {
                    Body.scale(current, 1, +(idNames[name]) || 1)
                }

            }
            if (name === "color") {
                current.start.color = current.color = idNames[name]
                current.start.dark = current.dark = darkenHexColor(idNames[name], 40)
                if (!current.customImage) {
                    current.img = new Image()
                    showData(current)
                }

            }

        }

    }

}
let frame = 0
Matter.Runner.run(engine)
function update() {
    requestAnimationFrame(update)

  
    frame++
    smooth++
    ctx.clearRect(0, 0, canvas.width, canvas.height)
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
        Entity.all.deleteWithin(fr)

    }
    for (const o of Entity.temporarilyDead) {
        World.remove(world, o)
        Entity.all.deleteWithin(o)
        Entity.graveyard.push(o)
    }
    Entity.temporarilyDead = []
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

    let pos = {
        x: cam.x / cam.zoom,
        y: cam.y / cam.zoom
    }

    Entity.toKill = []

    for (const fr of Entity) {
        if (fr.CREATOR === Cam && !existingCam) {
            existingCam = fr
        }
        if (editorMode) {
            fr.start.x ??= fr.position.x
            fr.start.y ??= fr.position.y
            fr.isSleeping = true
            Body.setVelocity(fr, { x: 0, y: 0 })

        }
        else {
            fr.isSleeping = false
        }
        fr.draw?.(frame)
    }
    if (editorMode) {
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
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.font = "30px lexend"
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.fillStyle = textColor
    ctx.strokeStyle = darkenHexColor(textColor, 40)
    ctx.lineWidth = 1
    ctx.fillText(text, 0, Math.min(-30, -(smooth - 100) * 4))
    ctx.strokeText(text, 0, Math.min(-30, -(smooth - 100) * 4))
    ctx.restore()
    ctx.save()
    ctx.translate(cam.x, cam.y)
    ctx.scale(cam.zoom, cam.zoom)
    ctx.rotate(existingCam.angle ?? 0)
    ctx.fillStyle = c.lightblue
    ctx.globalCompositeOperation = "destination-over"
    ctx.fillRect(0, 0, bounds.x, bounds.y)
    ctx.restore()
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
    ctx.restore()
}

class Entity {

    static all = Matter.Composite.allBodies(world)
    static toKill = []
    static graveyard = []
    static temporarilyDead = []
    static Images = []
    static toSpawn = []
    static gameSpawns = []
    static {
        window.a = Entity

        for (let src of Images) {
            let x = new Image(50, 50)
            x.src = src
            this.Images.push(x)
        }
    }
    static *[Symbol.iterator]() {
        yield* this.all
    }
    constructor(opts) {

        let out
        let center = bounds.center
        if (opts.shape === "circle") {
            out = Bodies.circle(opts.x ?? center.x, opts.y ?? center.y, opts.size ?? 30, {
                friction: 0,
                isStatic: opts.isStatic ?? false,
                restitution: opts.bounce ?? opts.restitution ?? 0,
                frictionAir: opts.frictionAir ?? 0.01,
                angle: opts.angle ?? 0,
                mass: opts.mass ?? 1


            })
        }
        else if (opts.shape === "rect") {
            out = Bodies.rectangle(opts.x ?? center.x, opts.y ?? center.y, opts.width ?? 30, opts.height ?? 30, {
                friction: 0,
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

        /* else if (opts.shape === "blade") {
             let mod = opts
             mod.width = opts.size
             mod.height = opts.size / 30
             out = new MotorBlade(mod)
             out.collisionFilter.group = -1
             out.collisionFilter.group = -1
             out.CREATOR = new.target
             out.Name = opts.name || `Marble ${out.id}`
             return out
 
 
 
         }*/
        out.CREATOR = new.target
        if (new.target !== Marble) out.collisionFilter.group = -1;
        out.Name = opts.name || `${new.target.name} ${out.id}`
        out.shape = opts.shape
        out.isSleeping = true
        World.add(world, out)
        out.color = opts.color
        let colours = Object.values(c)
        out.color ||= choose(...colours)
        out.dead = false
        Body.setAngle(out, opts.angle ?? 0)
        out.img = new Image()
        out.img.src = ""
        out.dark = darkenHexColor(out.color, 40)
        out.selected = false
        out.isCustom = true
        out.toggleable = ["angle", "SIZE", "Name", "circleRadius", "restitution", "color",]
        out.start = {
            x: out.position.x,
            y: out.position.y,
            size: opts.size,
            isStatic: opts.isStatic ?? false,
            height: opts.height,
            width: opts.width,
            angle: opts.angle ?? 0,
            // angularSpeed: Body.getAngularSpeed(out),
            //  angularVelocity: Body.getAngularVelocity(out),
            frictionAir: out.frictionAir,
            restitution: out.restitution,
            mass: opts.mass,
            color: out.color,
            dark: out.dark,
            Name: out.Name
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
        out.width ?? Object.defineProperty(out, "width", { get: function () { return this.SIZE.x } })
        out.height ?? Object.defineProperty(out, "height", { get: function () { return this.SIZE.y } })

        Entity.all.push(out)
        //Defs
        out.opacity = 1
        out.reset = function () {
            this.isSleeping = true

            this.start.angle ??= this.angle
            if (this.index === -1) {
                Entity.all.push(this)
                Entity.graveyard.deleteWithin(this)
                World.add(world, this)
            }
            // console.log(this.start,this.angle)

            //  console.log(this.start)

            // Body.setInertia(this, this.start.inertia)
            Body.setAngularVelocity(this, 0)
            Body.setAngularSpeed(this, 0)
            Body.setAngle(this, this.start.angle)
            Body.setPosition(this, { x: this.start.x, y: this.start.y })
        }
        out.constructor.prototype.draw = out.draw = function (fr) {
            ctx.save()
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
            if (following) {
                cam.x = (-following.position.x * cam.zoom) + ((canvas.width * cam.zoom) / 2) / cam.zoom
                cam.y = (-following.position.y * cam.zoom) + ((canvas.height * cam.zoom) / 2) / cam.zoom
            }
            ctx.translate(cam.x, cam.y)
            ctx.scale(cam.zoom, cam.zoom)

            ctx.rotate(existingCam.angle ?? 0)
            ctx.translate(this.position.x, this.position.y)

            this.circleRadius && ctx.rotate(this.angle)

            ctx.beginPath()
            if (this.selected) {
                this.opacity &&= 0.6
            }
            else {
                this.opacity &&= 1
            }
            if (this.selected) {
                if (true/* Math.abs(mouse.x - this.start.x) > this.SIZE.x / 4 && Math.abs(mouse.y - this.start.y) > this.SIZE.y / 4 */) {
                    if (this.start.isStatic) {
                        Body.setStatic(this, false)
                    }
                    Body.setPosition(this, { x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom) })
                    this.start.x = Infinity
                    this.start.y = Infinity

                }
                this.velocity.x = 0;
                this.velocity.y = 0
            }

            if (this === current) {
                ctx.shadowBlur = 30
                ctx.shadowColor = c.green
            }
            ctx.globalAlpha = this.opacity
            this.illustrate?.(fr)
            if (editorMode && select === "edit" && ctx.isPointInPath(mouse.x, mouse.y) && click.x && click.y) {
                if (!Entity.all.some(o => o.selected)) {
                    this.onclick?.()
                    this.selected = true
                    current = this
                    menu("data")
                    showData(this)

                }

            }
            else if (editorMode && (!click.x || !click.y)) {
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
            if (ctx.isPointInPath(mouse.x, mouse.y) && click.x && click.y && !editorMode && this.isMarble) {
                following = this
            }
            ctx.restore()

        }

        out.kill = function () {
            if (this.dead) {
                return
            }
            this.dead = true;
            Entity.toKill.push(this)
        }
        out.tempKill = function () {
            Entity.temporarilyDead.push(this)


        }
        out.index ?? Object.defineProperty(out, 'index', {
            get() {
                return Entity.all.indexOf(out)
            }
        })
        return out

    }


}

class Marble extends Entity {
    constructor(opts) {
        opts.shape = "circle"
        super(opts)
        this.img = opts.img
        if (opts.img) {
            this.customImage = true
        } else {
            this.img = new Image()
            this.img.src = ""
            this.customImage = false

        }
        this.outOfBounds = this.tempKill
        this.collisionFilter.group = 0
        this.isMarble = true
        this.toggleable.push("img")
        Marble.prototype.illustrate = this.illustrate = function (frame) {
            ctx.arc(0, 0, this.circleRadius, 0, Math.PI * 2)
            ctx.clip()
            ctx.fillStyle = this.color
            ctx.strokeStyle = this.dark

            if (this.img && this.customImage) {
                let { width, height } = this.img
                this.customImage = true
                try {
                    ctx.drawImage(this.img,
                        (-this.circleRadius),
                        (-this.circleRadius),
                        this.circleRadius * 2,
                        this.circleRadius * 2)
                }
                catch (e) {
                    Text = "ERROR!!!#ff0000"
                    this.customImage = false
                }

            } else {
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
    constructor(opts) {
        opts.shape = "rect"
        opts.friction = 0
        if (new.target === Wall) {
            opts.isStatic = true

        }
        super(opts)
        this.toggleable.deleteWithin("frictionAir")
        this.toggleable.deleteWithin("restitution")

        this.illustrate = function (frame) {

            ctx.moveTo(this.vertices[0].x - this.position.x, this.vertices[0].y - this.position.y)
            for (let i = 0; i < this.vertices.length; i++) {
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
class Blade extends Wall {
    constructor(opts) {
        let mod = opts
        mod.width = opts.size * 0.9
        mod.height = opts.size * 0.1
        mod.isStatic = false
        super(mod)
        this.collisionFilter.group = -1
        this.collisionFilter.group = -1
        //this.CREATOR = new.target
        //        this.Name = opts.name || `Marble ${this.id}`
        this.toggleable.push("frictionAir", "mass")
        this.draw = function () {
            Entity.prototype.draw.call(this)
            Body.setVelocity(this, { x: 0, y: 0 })
            if (!editorMode
            ) {

                Body.setPosition(this, this.start)
            }


        }
    }
}
class Beam extends Wall {
    constructor(o) {
        super(o)
        this.CREATOR = Beam
    }
}
class MotorBlade extends Wall {
    constructor(opts) {
        let mod = opts
        mod.isStatic = false
        super(mod)
        //(this)
        this.toggleable.push("frictionAir", "mass")
        this.draw = function () {
            Entity.prototype.draw.call(this)

            Body.setVelocity(this, { x: 0, y: 0 })
            Body.setPosition(this, this.start)


        }
    }
}
class Cam extends Entity {
    constructor(opts) {
        for (let o of Entity.all) {
            if (o.CREATOR === Cam) {
                o.kill()
            }
        }
        opts.shape = "circle"
        super(opts)
        this.isSensor = true
        this.toggleable.push("speed")
        this.toggleable.deleteWithin("Name")
        this.toggleable.deleteWithin("restitution")
        this.toggleable.deleteWithin("color")
        this.illustrate = function () {
            if (!editorMode) {
                return
            }
            ctx.arc(0, 0, 30, 0, Math.PI * 2)
            ctx.stroke()
            ctx.textBaseline = "middle"
            ctx.textAlign = "center"
            ctx.font = "30px serif"
            ctx.strokeText("🎥", 0, 0)
        }

    }
}
class Spawner extends Entity {
    constructor(opts) {
        super(opts)
        this.interval = opts.interval || 50
        this.isSensor = true
        this.toggleable.push("interval")
        this.toggleable.deleteWithin("Name")
        this.toggleable.deleteWithin("Angle")
        this.toggleable.deleteWithin("restitution")
        this.toggleable.deleteWithin("color")
        this.illustrate = function (e) {

            if (!editorMode) {
                if (!(e % this.interval) && !editorMode) {
                    let op = Entity.gameSpawns.pop()

                    console.log(op)
                    if (op) {
                        op.x = this.start.x + (Math.random() * this.circleRadius / 1.2 * choose(1, -1))
                        op.y = this.start.y + (Math.random() * this.circleRadius / 1.2 * choose(1, -1))
                        let mexico = new Marble(op)
                        mexico.isTemporary = true

                    }
                }
                return
            }

            ctx.arc(0, 0, this.circleRadius, 0, Math.PI * 2)
            ctx.stroke()
            ctx.textBaseline = "middle"
            ctx.textAlign = "center"
            ctx.font = "30px serif"
            ctx.strokeText("🐣", 0, 0)

        }

    }
}

let mouse = {
    x: 0,
    y: 0
}


update()

function temp(x, y, width, height) {
    let n = Bodies.rectangle(x, y, width, height, { isStatic: true })
    World.add(world, n)
    Entity.all.push(n)
    n.draw = function () {
        ctx.beginPath()
        ctx.save()
        ctx.moveTo(this.bounds.max.x, this.bounds.max.y)
        ctx.lineTo(this.bounds.max.x, this.bounds.min.y)
        ctx.lineTo(this.bounds.min.x, this.bounds.min.y)
        ctx.lineTo(this.bounds.min.x, this.bounds.max.y)
        ctx.stroke()
        ctx.fill()
        ctx.restore()


    }
    return n
}
//temp(50, 550, canvas.width * 2, 100).passive = true
//temp(-10, 50, 20, 1000).passive = true
//temp(520, 50, 20, 1000).passive = true

$("#can").on({
    mousedown: function (e) {
        
        click.x = e.offsetX
        click.y = e.offsetY
        if (select === "pick" && editorMode) {
            place(chosenEntity)
        }
        if (select === "edit") {
            editorMode && (following = null)
        }
    },
    mousemove: function (e) {
        mouse.x = e.offsetX
        mouse.y = e.offsetY
    },
    mouseup: function () {
        click.x = click.y = NaN
    },

})
function startGame() {
    if (!editorMode) {
        frame = 0
        Entity.gameSpawns = [...Entity.toSpawn]
        for (let o of Entity.graveyard) {
            Entity.all.push(o)
            World.add(world, o)
        }
        Entity.graveyard = []
        for (let o of Entity.all) {

            if (!o.isCustom) {
                continue
            }
            if (o.isTemporary) {
                o.kill()
            }
            o.reset()
        }
    }
    else {
        Entity.gameSpawns = [...Entity.toSpawn]

        Entity.all.push(...Entity.graveyard)
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
    if (existingCam) {
        cam.x = ((-existingCam.position.x) + ((canvas.width / 2) / cam.zoom)) * (cam.zoom)
        cam.y = ((-existingCam.position.y) + ((canvas.height / 2) / cam.zoom)) * (cam.zoom)
    }


    editorMode = !editorMode
}
function showData(stats) {
    $("#data").empty()
    if (!stats) {
        return
    }
    let index1 = getIndex(),
        index2 = getIndex()
    $("#data").append(`<button class="good" id="apply${index1}">Apply Changes</button><button class="bad" id="delete${index2}">Delete</button>`)
    for (let [id, event] of [
        [index1, apply],
        [index2, () => deleteFrom(current)]
    ]) {
        $(`#${id}`).on({
            click() {
                event()
            }
        })
    }
    for (let name of stats.toggleable) {
        if ((typeof stats[name] !== "object") && !(name in stats)) {
            continue
        }

        if (name.match(/angle/)) {
            let bar = document.createElement("input")
            bar.id = name
            bar.className = "write"
            bar.value = stats[name] * 180 / Math.PI
            $("#data").append(bar)
            $("#data").append(`<label for="${name}">${name.upper()}</label>`)

        }
        if (name === "speed") {
            let bar = document.createElement("input")
            bar.id = name
            bar.className = "write"
            bar.value = +cam.speed
            $("#data").append(bar)
            $("#data").append(`<label for="${name}">${name.upper()}</label>`)

        }
        if (name.match(/restitution|mass|frictionAir|Name/)) {
            let bar = document.createElement("input")
            bar.id = name
            bar.className = "write"
            bar.value = stats[name]
            $("#data").append(bar)
            $("#data").append(`<label for="${name}">${name.upper()}</label>`)

        }
        if (name.match(/interval/)) {
            let bar = document.createElement("input")
            bar.id = name
            bar.className = "write"
            bar.value = stats[name]
            $("#data").append(bar)
            $("#data").append(`<label for="${name}">${name.upper()}</label>`)

        }
        /* if (name.match(/angularVelocity/)) {
             let bar = document.createElement("input")
             bar.id = name
             bar.className = "write"
             bar.value = Body.getAngularVelocity(stats)
             $("#data").append(bar)
             $("#data").append(`<label for="${name}">${name.upper()}</label>`)
 
         }*/
        if (name.match(/color/)) {
            let bar = document.createElement("input")
            bar.id = name
            bar.className = "color"
            bar.type = "color"
            bar.value = stats[name]
            $("#data").append(bar)
            $("#data").append(`<label for="${name}">${name.upper()}</label>`)

        }


        if (name.match(/img/)) {
            let bar = document.createElement("input")
            bar.id = name
            bar.type = "file"
            bar.style.display = "none"
            bar.accept = ".png, .jpeg, .jpg, .webp"
            bar.addEventListener(`change`, function (o) {
                let reader = new FileReader();
                reader.readAsDataURL(o.target.files[0]);
                reader.onload = (o) => {
                    debugger
                    current.img.src = o.target.result
                    current.customImage = true
                    showData(current)
                }
            })

            if (!stats.customImage) {
                shapeToImage(stats)
            }

            $("#data").append(`<div style="position: relative; display: flex; align-items:center; flex-direction: column;" id="status"><img src='${stats.img?.src}' width="50" height="50"></div>`)
            $("#status").append(bar)
            $("#status").append("<button class='good' onclick='$(`#img`)[0].click()'>Picture</button>")


        }

    }
    if (stats.CREATOR === Marble) {
        let bar = document.createElement("button")
        bar.onclick = () => {
            following = current
        }
        bar.innerHTML = "Follow"
        bar.className = "good"
        $("#status").append(bar)

    }
    options = {
        ids: [],
        values: []
    }
    for (let o of $('#data').children()) {
        if (!(o.type === "input")) {
            continue
        }
        options.values.push(o.value)
        options.ids.push(o.id)

    }
}
$(window).on({
    mousewheel: function (e) {
        cam.zoom -= (e.originalEvent.deltaY / 8000)
        cam.zoom = Math.abs(cam.zoom)
    },
    keyup: function (e) {

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
    },
    keydown: function (e) {

        following = null
        const key = e.key.toLowerCase()
        if (key === "w") {
            cam.key.w = true
            cam.key.s = false

        }
        if (key === "s") {
            cam.key.s = true
            cam.key.w = false

        }
        if (key === "a") {
            cam.key.a = true
            cam.key.d = false

        }
        if (key === "d") {
            cam.key.d = true
            cam.key.s = false

        }
    }
})

cam.x = -bounds.center.x + canvas.width / 2
cam.y = -bounds.center.y + canvas.height / 2

cam.zoom = 1
for (let className of [Entity, Wall, Marble, Blade, Cam, Beam]) {
    Entity[className]
}
function getIndex() {
    return inx++
}