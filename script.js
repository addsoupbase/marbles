import { Images } from "./img.js"
import { darkenHexColor, choose, frange, range, Colors as c } from "./utils.js"
let reqFrame = requestAnimationFrame || window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame || ((func) => { setTimeout(func, 10) })
let select = "edit",
    current = null
    , editorMode = true,
    debugMode = false
    , options = null
    , chosenEntity = "Block"
    , text = ""
    , smooth = 0
    , textColor = "#000000";
let level = false
const Del = function (num) {
    let foundYou = null
    for (let o of Entity.toSpawn) {
        if (o.id === +num) {
            foundYou = o
            break
        }
    }
    Entity.toSpawn.deleteWithin(foundYou)
    $(`[name='${foundYou.id}']`).each(function () {
        $(this).remove()
    })
},

    spawnAllOfTheMarbles = () => {
        for (let o of Entity.toSpawn) {
            o.restitution = +$('#bounciness')[0].value
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
        let foundYou = null
        for (let o of Entity.toSpawn) {
            if (o.id === num) {
                foundYou = o
                break
            }
        }
        // foundYou.img = new Image()
        foundYou.img.src = foundYou.imgSrc
        foundYou.restitution = +$('#bounciness')[0].value ?? 1
        new Marble(foundYou)
    },
    addMarble = function (settings) {
        let params = { Name: settings.Name, restitution: +$('#bounciness')[0].value ?? 0, size: 30, x: (-cam.x / cam.zoom + canvas.width / 2) + (Math.random() * 100 * choose(1, -1)), y: (-cam.y / cam.zoom + canvas.height / 2) + (Math.random() * 100 * choose(1, -1)) /*img: Entity.Images[1]*/ }

        let me = new Marble(params)
        me.imgSrc = settings.imgSrc ?? ''
        me.img = new Image()
        me.img.src = me.imgSrc
        let inp = document.createElement("input")
        inp.value = me.Name
        inp.placeholder = "Name"
        inp.id = `shh${me.id}`
        inp.name = me.id
        $(inp).on({
            focusout: findMarble
        })
        $('#allMarbles').append(`<div class='separate' id='div${me.id}'></div>`)

        $('#div' + me.id).append(`<input name='${me.id}' type='url' id='mrbl${me.id}' placeholder='Image Url' value='${me.imgSrc ?? ''}'>`)
        $(`#mrbl${me.id}`).on('focusout', findMarbleImage)
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
                   //showData(current)
               }
           })*/
        $("#allMarbles").append(inp)
        let index1 = getIndex(),
            index2 = getIndex()
        $("#allMarbles").append(`
                <button class="good" name="${me.id}" id="spawn${index1}">Spawn</button>
                <button name="${me.id}" id="Del${index2}" class="bad">🗑️</button>
            `) //kill marble
        for (let [id, event] of [
            [`spawn${index1}`, spawnEvent],
            [`Del${index2}`, deleteEvent]
        ]) {
            $(`#${id}`).on({
                click() { event(me.id) }
            })
        }
        me.kill()
        Entity.toSpawn.push({ Name: me.Name, shape: "circle", size: 30, id: me.id, img: me.img, game: true, imgSrc: me.imgSrc })
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
    arr.push({ bounciness: $('#bounciness')[0].value, camBehaviour: $('#camBehaviour')[0].value })
    for (let o of a.all) {
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
            delete o.start.color
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

    for (let o of Entity.toSpawn) {
        if (o.size === Marble.defaultSize) {
            delete o.size
        }
        if (o.shape === Marble.defaultShape) {
            delete o.shape
        }
        arr.push(o)
    }

    $('#textData')[0].value = JSON.stringify(arr)
}, Load = function (information) {
    editorMode || startGame()
    console.log($("#textData")[0].value)

    try {
        let data;
        if (information) {
            data = JSON.parse(information)
        }
        else {
            data = JSON.parse($("#textData")[0].value)
        }
        Entity.all.length = Entity.toSpawn.length = Entity.graveyard.length = Entity.gameSpawns.length = Entity.temporarilyDead.length = 0
        $('#allMarbles').empty()
        for (let o of Matter.Composite.allBodies(world)) {
            World.remove(world, o)
        }
        for (let item of data) {
            //console.log(item)
            // console.log(item[0], item[1])

            if ('bounciness' in item) {
                $('#bounciness')[0].value = item.bounciness
                $('#camBehaviour')[0].value = item.camBehaviour
                continue
            }
            if ('game' in item) {
                Entity.toSpawn.push(item)
                addMarble(item)
                continue
            }
            let inputargs = item[0]

            //inputargs.height = item[2].height ?? item[2].start.height
            //inputargs.width = item[2].width ?? item[2].start.width
            inputargs.img = new Image()
            inputargs.img.src = inputargs.imgSrc

            let x = new Entity.allClasses[item[1]](inputargs)
            x.start = inputargs
            debugger
        }
        for (let o of Entity.toSpawn) {
            if (o.img.src !== o.imgSrc) {
                Entity.toSpawn.deleteWithin(o)
            }
        }
    }
    catch (e) {
        Text = 'Check logs please :(#FF0000'
        console.warn(data)
        throw e
    }
}, menu = function (type) {
    $(".menu").each(function () { $(this).hide() })
    $("#" + type).show()
    if (!$(`#${type}`).children().length) {
        $(`#${type}`).append('<p>Nothing selected...</p>')

    }
}, deleteFrom = (o) => {
    if (!editorMode) {
        return Text = "Exit play mode first!!!#ff0000"
    }
    else {
        o.kill()
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
        click(){ event()}
    })
}
Object.defineProperty(window, "Text", {
    set: function (o) {
        let col = o.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)
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
        id3 = getIndex(),
        id4 = getIndex(),
        id5 = getIndex(),
        id6 = getIndex(),
        id7 = getIndex()

    $("#buttonholder").append(`<button class="good" id="block${id1}">Block</button>`)
    //$("#buttonholder").append(`<button class="good" id="beam${id2}">Beam</button>`)
    $("#buttonholder").append(`<button class="good" id="motor${id3}">Motor</button>`)

    $("#buttonholder").append(`<button class="good" id='cam${id4}'>Camera</button>`)
    $("#buttonholder").append(`<button class="good" id='spawner${id5}'>Spawner</button>`)
    $("#buttonholder").append(`<button class="good" id='wind${id6}'>Wind Zone</button>`)
    $("#buttonholder").append(`<button class="good" id="movableWall${id7}">Movable Block</button>`)


    for (let [id, event] of [
        [`block${id1}`, () => chosenEntity = "Block"],
        //   [`beam${id2}`, () => chosenEntity = "Beam"],
        [`motor${id3}`, () => chosenEntity = "Motor"],
         [`cam${id4}`, () => chosenEntity = "Cam"],
        [`spawner${id5}`, () => chosenEntity = "Spawner"],
        [`wind${id6}`, () => chosenEntity = "WindZone"],
        [`movableWall${id7}`, () => chosenEntity = "Movable Wall"]


    ]) {
        //dis aint working but im going to sleep 
        $(`#${id}`).on({
            click() {
                event()
            }
        })
    }



}
/*let sizes = ["Small", "Medium", "Big", "Large", "Huge"]
let finalSize = "Small"
for (let o of sizes) {
    let index = sizes.indexOf(o) + 1
    $("#data2").append(`<input type='radio' id="radio${index}" value='${index * 2}' name="bleh" ${index === 1 ? "checked" : ""}><label for="radio${index}">${o}</label><br>`)

}
*/
function place(entity) {
    /*+$("input[type='radio'][name='bleh']:checked")[0].value
   if (modifier === 10) {
       modifier = 15
   }*/
    if (entity.includes("Block")) {
        let baby = new Wall({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), width: 30, height: 30, isStatic: true })
        current = baby
        showData(baby)

    }
    if (entity.includes("Movable Wall")) {
        let baby = new MoveableWall({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), width: 30, height: 30, isStatic: true })
        current = baby
        showData(baby)

    }
    /*if (entity.includes("Beam")) {
        let baby = new Beam({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.red, height: 15, width: 70 * (modifier), isStatic: true })
        current = baby
        showData(baby)

    }*/
    if (entity.includes("Motor")) {
        let baby = new Blade({ frictionAir: 0, x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.yellow, size: 100, isStatic: false })
        current = baby
        showData(baby)

    }
    if (entity.includes("Cam")) {
        let baby = new Cam({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.gray })
        current = baby
        showData(baby)

    }
    if (entity.includes("Spawner")) {
        let baby = new Spawner({ width: 100, height: 100, x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.gray, shape: "circle" })
        current = baby
        showData(baby)

    }
    if (entity.includes("WindZone")) {
        let baby = new WindZone({ height: 50, width: 50, x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), color: c.gray, shape: "circle" })
        current = baby
        showData(baby)

    }
}
const canvas = $('canvas')[0],
    ctx = canvas.getContext('2d');
const cam = {
    x: 0,
    y: 0,
    behaviour: 'leader',
    easterEggs: {
        acidMode: false,
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
    key: {
        w: false,
        s: false,
        a: false,
        d: false
    }
}
ctx.lineWidth = 4
// Import or include Matter.js
const Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Body = Matter.Body,
    Collision = Matter.Collision,
    Constraint = Matter.Constraint;

const engine = Engine.create()
const world = engine.world
const apply = () => {
    if (!editorMode) {
        //return Text = "Exit play mode first!!!#ff0000"
        startGame()
    }
    Text = "Changes applied!!!#0dff00"
    let idNames = {

    }
    for (let element of $("#data").children()) {
        let mine = $(element)[0]
        if ((mine.value != null || 'checked' in mine) && mine.id) {
            idNames[mine.id] = mine.value
        }
    }
    for (let o of Entity.toSpawn) {
        //   console.log($(`#name${o.id}`))
        $(`#shh${o.id}`)[0].value = o.Name
    }
    for (let name in idNames) {

        if (name in current) {
            if (name === "angle") {
                Body.setAngle(current, (+(idNames[name]) * Math.PI / 180) || 0)
                current.start[name] = +(idNames[name]) * Math.PI / 180 || 0

            }
            if (name === "speed") {
                cam.speed = +idNames[name]
            }

            if (name === "mass") {
                Body.setMass(current, +idNames[name])
                current.start[name] = +idNames[name]

            }
            if (name === "windSpeed") {
                current.start[name] = current[name] = +idNames[name] / 100

            }

            if (name === "interval") {
                current[name] = +idNames[name]
                current.start[name] = +idNames[name]

            }
            if (name === "Name") {
                current.Name = current.start.Name = idNames[name]
            }
            if (name === "opacity") {
                current.opacity = current.start.opacity = +idNames[name]
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
            if (name.match(/width/)) {
                let modified = current.start
                modified.width = idNames[name]
                let out = new current.CREATOR(modified)
                current.kill()
                current = out
                showData(current)
            }
            if (name.match(/height/)) {
                let modified = current.start
                modified.height = idNames[name]
                let out = new current.CREATOR(modified)
                current.kill()
                current = out
                showData(current)
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
    showData(current)
}
let frame = 0
Matter.Runner.run(engine)
function update() {
    reqFrame(update)

    if (level) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
    frame++
    smooth++

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
        Entity.all.deleteWithin(fr)

    }

    for (const o of Entity.temporarilyDead) {
        World.remove(world, o)
        Entity.all.deleteWithin(o)
        Entity.graveyard.push(o)
    }
    Entity.temporarilyDead = []

    let pos = {
        x: cam.x / cam.zoom,
        y: cam.y / cam.zoom
    }

    Entity.toKill = []
    for (let o of Entity.all) {
        if (o.dead) {
            o.dead = false
            o.kill()
        }
    }
    cam.existingcam = null
    for (const fr of Entity) {
        if (fr.CREATOR === Cam && !cam.existingcam) {
            cam.existingcam = fr
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
    if (Entity.all.filter(o => o.isMarble).length) {
        switch (cam.behaviour) {
            case 'leader': {
                if (cam.existinggoal) {
                    cam.following = (Entity.all.filter(o => o.isMarble).sort((a, b) => Entity.distance(a, cam.existinggoal) - Entity.distance(b, cam.existinggoal))[0])
                }
            }
                break;
            case 'loser': {
                if (cam.existinggoal) {
                    cam.following = (Entity.all.filter(o => o.isMarble).sort((a, b) => Entity.distance(b, cam.existinggoal) - Entity.distance(a, cam.existinggoal))[0])
                }
            }
                break;
            case 'middle': {
                if (cam.existinggoal) {
                    cam.following = (Entity.all.filter(o => o.isMarble).sort((a, b) => Entity.distance(b, cam.existinggoal) - Entity.distance(a, cam.existinggoal)).center)
                }
            }
                break;
            case 'average': {
                let positions = {
                    x: [],
                    y: []
                }
                for (let o of Entity.all) {
                    if (o.isMarble) {
                        positions.x.push(o.position.x)
                        positions.y.push(o.position.y)
                    }
                }
                cam.following = null
                cam.x = (-positions.x.average + canvas.width / cam.zoom / 2) * cam.zoom
                cam.y = (-positions.y.average + canvas.height / cam.zoom / 2) * cam.zoom
                break;
            }
            case 'random': {
                if (!(frame % 500) || !cam.following) {
                    cam.following = Entity.all.filter(o => o.isMarble).pick()
                }
                break;
            }
        }
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
    ctx.font = "30px " + cam.easterEggs.gameFont
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.fillStyle = textColor
    ctx.strokeStyle = darkenHexColor(textColor, 40)
    ctx.lineWidth = 1
    ctx.font = `30px ${cam.easterEggs.messageFont}`
    ctx.fillText(text, 0, Math.min(-30, -(smooth - 100) * 4))
    ctx.strokeText(text, 0, Math.min(-30, -(smooth - 100) * 4))
    ctx.restore()
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
    if (debugMode) {
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
        const dx = a.position.x - b.position.x;
        const dy = a.position.y - b.position.y;

        return Math.sqrt(dx * dx + dy * dy);
    }
    static all = Matter.Composite.allBodies(world)
    static toKill = []
    static allClasses = {}
    static graveyard = []
    static temporarilyDead = []
    static Images = []
    static toSpawn = []
    static gameSpawns = []
    static {
        window.a = Entity
        window.cam = cam

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
        opts.width = Math.max(opts.width, 1)
        opts.height = Math.max(opts.height, 1)
        if (!isFinite(opts.angle)) opts.angle = 0;
        if (!isFinite(opts.x)) opts.x = bounds.center.x;
        if (!isFinite(opts.y)) opts.y = bounds.center.y;
        if (opts.shape === "circle") {
            out = Bodies.circle(opts.x ?? center.x, opts.y ?? center.y, opts.size ?? 30, {
                friction: 0.02,
                //frictionStatic: 0,
                inertia: 2000,
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
        else {
            console.error(this)
            Text = 'Check logs please :(#FF0000'
            throw TypeError('No shape was provided.')
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
        if (!new.target.name.match(/Marble|MoveableWall/)) out.collisionFilter.group = -1;
        out.Name = opts.Name || `${new.target.name} ${out.id}`
        out.shape = opts.shape
        out.isSleeping = true
        World.add(world, out)
        out.color = opts.color
        let colours = Object.values(c)
        out.color ??= choose(...colours)
        out.dead = false
        Body.setAngle(out, opts.angle ?? 0)
        out.img = opts.img ?? new Image()
        if (!opts.img) { out.img.src = "" }
        out.imgSrc = out.img.src
        out.dark = darkenHexColor(out.color, 40)
        out.selected = false
        out.isCustom = true
        out.toggleable = ["angle", "Name", "circleRadius", "restitution", "color", 'opacity', 'width', 'height']
        out.opacity = opts.opacity ?? 1
        out.interval = opts.interval ?? 50
        out.restitution = opts.restitution ?? 0
        out.start = {
            x: out.position.x,
            y: out.position.y,
            size: opts.size,
            isStatic: opts.isStatic ?? false,
            height: opts.height,
            width: opts.width,
            angle: opts.angle ?? 0,
            img: out.img,
            imgSrc: out.img.src,
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

        Entity.all.push(out)
        //Defs
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
            Body.setVelocity(this, { x: 0, y: 0 })
            Body.setAngularVelocity(this, 0)
            Body.setAngularSpeed(this, 0)
            Body.setAngle(this, this.start.angle)
            Body.setPosition(this, { x: this.start.x, y: this.start.y })
        }
        out.constructor.prototype.draw = out.draw = function (fr) {
            if (isNaN(this.position.x) || isNaN(this.position.y)) {
                this.kill()
                editorMode || startGame()
                console.error('NaN: ', this)
                showData()
                Text = 'Check logs please :(#FF0000'
                this.isTemporary &&= false
                throw RangeError('NaN Position detected')

            }
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
            if (cam.following) {
                cam.x = (-cam.following.position.x * cam.zoom) + ((canvas.width * cam.zoom) / 2) / cam.zoom
                cam.y = (-cam.following.position.y * cam.zoom) + ((canvas.height * cam.zoom) / 2) / cam.zoom
            }
            ctx.translate(cam.x, cam.y)
            ctx.scale(cam.zoom, cam.zoom)

            ctx.rotate(cam.existingcam?.angle ?? 0)
            ctx.translate(this.position.x, this.position.y)

            this.circleRadius && ctx.rotate(this.angle)

            ctx.beginPath()
            if (!editorMode) {

                if (this.selected) {
                    this.opacity = 0.6
                }
                else {
                    this.opacity = this.start.opacity ?? this.opacity
                }

            }
            else {
                this.opacity = this.start.opacity ?? this.opacity
            }
            if (this.selected) {
                if (true/* Math.abs(mouse.x - this.start.x) > this.SIZE.x / 4 && Math.abs(mouse.y - this.start.y) > this.SIZE.y / 4 */) {
                    if (this.start.isStatic) {
                        Body.setStatic(this, false)
                    }
                    Body.setPosition(this, { x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom) })
                    //this.start.x = Infinity
                    //this.start.y = Infinity

                }
                this.velocity.x = 0
                this.velocity.y = 0
            }

            if (this === current) {
                ctx.shadowBlur = 15 + Math.sin(frame / 40)
                ctx.shadowColor = c.blue
            }
            for (let oj of Entity.all) {
                if (editorMode) {
                    break
                }
                if (oj === this || !oj.isSensor) {
                    continue
                }
                else if (Collision.collides(this, oj)) {
                    oj.collision?.(this)
                }
            }
            if (!editorMode) {
                ctx.globalAlpha = this.opacity
            }
            ctx.globalCompositeOperation = cam.easterEggs.compop
            this.illustrate?.(fr)
            if (editorMode && select != "put" && ctx.isPointInPath(mouse.x, mouse.y) && (cam.click.x && cam.click.y)) {
                if (!Entity.all.some(o => o.selected)) {
                    this.onclick?.()
                    this.selected = true
                    current = this
                    menu("data")
                    showData(this)

                }

            }
            else if (editorMode && (!cam.click.x || !cam.click.y)) {
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
            if (ctx.isPointInPath(mouse.x, mouse.y) && cam.click.x && cam.click.y && !editorMode && this.isMarble) {
                cam.following = this
            }
            ctx.restore()

        }

        out.kill = function () {
            if (this.dead) {
                return
            }
            this.dead = true
            Entity.toKill.push(this)
        }
        out.tempKill = function () {
            if (!editorMode) {

                Entity.temporarilyDead.push(this)
            }


        }
        out.index ?? Object.defineProperty(out, 'index', {
            get() {
                return Entity.all.indexOf(out)
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
    static defualtSize = 30;
    static defaultShape = 'circle'
    constructor(opts) {
        opts.shape ??= Marble.defaultShape
        opts.size ??= Marble.defaultSize
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
        this.toggleable.deleteWithin('angle')
        this.toggleable.deleteWithin('width')
        this.toggleable.deleteWithin('height')


        Marble.prototype.illustrate = this.illustrate = function (frame) {
            if (editorMode || cam.easterEggs.showNamesInPlayMode) {
                ctx.save()
                ctx.rotate(-this.angle)
                ctx.font = `10px ${cam.easterEggs.gameFont}`
                ctx.textBaseline = 'middle'
                ctx.textAlign = 'center'
                ctx.fillText(this.Name, 0, -50)
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
            ctx.fillStyle = this.color
            ctx.strokeStyle = this.dark
            ctx.fill()
            ctx.stroke()

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
                    // Text = 'Check logs please :(#FF0000'
                    console.error('The following "image" is broken: ', this.img)
                    this.customImage = false
                }

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
        opts.shape = "rect"
        opts.friction = 0
        opts.width ??= Wall.defaultWidth
        opts.height ??= Wall.defaultHeight
        opts.color ??= Wall.defaultColor
        if (new.target === Wall) {
            opts.isStatic = true

        }
        super(opts)
        this.toggleable.deleteWithin("frictionAir")
        this.toggleable.deleteWithin("restitution")

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
class MoveableWall extends Wall {
    static defaultColor = c.green
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {
        opts.isStatic = false
        opts.color ??= MoveableWall.defaultColor
        super(opts)
        this.toggleable.push('restitution', 'mass')

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
        let mod = opts
        opts.width ??= Blade.defaultWidth
        opts.height ??= Blade.defaultHeight
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
/*class Beam extends Wall {
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(o) {
        super(o)
        //  this.CREATOR = Beam
    }
}*/
class WindZone extends Wall {
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(o) {
        o.shape = 'rect'
        o.isStatic = true

        o.color = c.blue
        super(o)
        this.toggleable.push('windSpeed')
        this.windSpeed = this.start.windSpeed = o.windSpeed ?? 0.01
        this.isSensor = true
        this.winds = []
        for (let i = 0; i < 20; i++) {
            this.winds.push({
                x: (Math.random() * o.width) - o.width / 2,
                y: (Math.random() * o.height) - o.height / 2,
                radius: Math.random() * this.width / 20
            })
        }
        this.collision = function (coll) {
            if (!coll.isMarble) {
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

            ctx.rotate(this.angle)

            ctx.moveTo(this.vertices[0].x - this.position.x, this.vertices[0].y - this.position.y)
            for (let i = 0, len = this.vertices.length; i < len; i++) {
                ctx.lineTo(this.vertices[i].x - this.position.x, this.vertices[i].y - this.position.y)

            }
            ctx.closePath()
            ctx.clip()
            ctx.beginPath()

            ctx.shadowBlur = 0

            ctx.fillStyle = this.color

            for (let wind of this.winds) {
                wind.y -= 1 * this.windSpeed * 160
                if (Math.abs(wind.y) > this.height / 2 + 10) {
                    wind.y = this.height / 2

                }
                ctx.beginPath()
                ctx.arc(wind.x, wind.y, wind.radius, 0, Math.PI * 2)
                ctx.fill()

            }
            //     ctx.stroke()
            if (editorMode) {
                ctx.beginPath()
                ctx.moveTo(-5, 20 - 20)
                ctx.lineTo(5, 20 - 20)
                ctx.lineTo(-0, 16 - 20)
                ctx.closePath()
                ctx.stroke()
            }
            ctx.beginPath()
            ctx.moveTo(this.vertices[0].x - this.position.x, this.vertices[0].y - this.position.y)
            for (let i = 0, len = this.vertices.length; i < len; i++) {
                ctx.lineTo(this.vertices[i].x - this.position.x, this.vertices[i].y - this.position.y)

            }
            if (editorMode) {
                ctx.closePath()
                ctx.stroke()
            }

        }

    }
}
class MotorBlade extends Wall {
    static {
        Entity.allClasses[this.name] = this
    }
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
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {

        opts.shape = "circle"
        super(opts)
        for (let o of Entity.all) {
            if (o.CREATOR === Cam && o !== this) {
                o.kill()
            }
        }
        this.isSensor = true
        this.toggleable.push("speed")
        this.toggleable.deleteWithin("Name")
        this.toggleable.deleteWithin("restitution")
        this.toggleable.deleteWithin("color")
        this.toggleable.deleteWithin('width')
        this.toggleable.deleteWithin('height')

        this.illustrate = function () {
            if (!editorMode) {
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
        this.toggleable.push("interval")
        this.toggleable.deleteWithin("Name")
        this.toggleable.deleteWithin("Angle")
        this.toggleable.deleteWithin("restitution")
        this.toggleable.deleteWithin("color")
        this.illustrate = function (e) {

            if (!editorMode) {
                if (!(e % this.interval) && !editorMode) {
                    Entity.gameSpawns = Entity.gameSpawns.shuffle()
                    let child = Entity.gameSpawns.pop()

                    if (child) {
                        child.x = this.position.x + range(-this.SIZE.x / 2, this.SIZE.x / 2)
                        child.y = this.position.y + range(-this.SIZE.y / 2, this.SIZE.y / 2)
                        child.restitution = +$('#bounciness')[0].value ?? 1
                        let instance = new Marble(child)
                        instance.isTemporary = true

                    }
                }
                return
            }

            ctx.moveTo(this.vertices[0].x - this.position.x, this.vertices[0].y - this.position.y)
            for (let i = 0, len = this.vertices.length; i < len; i++) {
                ctx.lineTo(this.vertices[i].x - this.position.x, this.vertices[i].y - this.position.y)

            }
            ctx.closePath()
            ctx.stroke()
            /*      ctx.beginPath()
                  ctx.arc(range(-this.SIZE.x+30,this.SIZE.x-30), range(-this.SIZE.y+30,this.SIZE.y-30),30,0,Math.PI*2)
                  ctx.stroke()
             */
            /*     ctx.textBaseline = "middle"
                 ctx.textAlign = "center"
                 ctx.font = "30px serif"
                 ctx.strokeText("🐣", 0, 0)*/
            fill('rgb(100,0,255,0.3)')

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
        cam.click.x = e.offsetX
        cam.click.y = e.offsetY
        //      console.log(chosenEntity)
        if (select === "put" && editorMode) {
            place(chosenEntity)
        }
        if (select === "edit") {
            editorMode && (cam.following = null)
        }
    },
    mousemove: function (e) {
        mouse.x = e.offsetX
        mouse.y = e.offsetY

    },
    mouseup: function () {
        cam.click.x = cam.click.y = NaN
    },

})
function startGame() {
    if (!editorMode) {
        //    cam.following = null

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
        //Enter Play Mode
        frame = 0
        cam.behaviour = $('#camBehaviour')[0].value
        cam.following = current = null
        for (let o of Entity.all) {
            o.selected = false
        }
        select = null
        showData()
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
    if (cam.existingcam) {
        cam.x = ((-cam.existingcam.position.x) + ((canvas.width / 2) / cam.zoom)) * (cam.zoom)
        cam.y = ((-cam.existingcam.position.y) + ((canvas.height / 2) / cam.zoom)) * (cam.zoom)
    }


    editorMode = !editorMode
}
function showData(stats) {
    $('#data').children().each(function () {
        $(this).off('click', spawnEvent)
        $(this).off('click', deleteEvent)
        $(this).off('click', findMarble)
        $(this).off('click', findMarbleImage)
        $(this).off('click', fileChange)




    })
    $("#data").empty()
    if (!stats) {
        $('#data').append(`<p>Nothing selected...</p>`)
        return
    }
    let index1 = getIndex(),
        index2 = getIndex(),
        index3 = getIndex()
    $("#data").append(`<button class="good" id="apply${index1}">Apply Changes</button><button class='good' id='clone${index3}'>Clone</button><button class="bad" id="delete${index2}">Delete</button>`)
    for (let [id, event] of [
        ['apply' + index1, apply],
        ['delete' + index2, deleteFrom],
        [`clone${index3}`, clone]
    ]) {
        $(`#${id}`).on({
            click() {
                event(current)
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
            $("#data").append(`<label for="${name}">${name.upper()}</label>`)
            $("#data").append(bar)

        }
        if (name === "speed") {
            let bar = document.createElement("input")
            bar.id = name
            bar.className = "write"
            bar.value = +cam.speed
            $("#data").append(`<label for="${name}">${name.upper()}</label>`)
            $("#data").append(bar)

        }

        if (name === "windSpeed") {
            let bar = document.createElement("input")
            bar.id = name
            bar.className = "write"
            bar.value = stats[name] * 100
            $("#data").append(`<label for="${name}">${name.upper()}</label>`)
            $("#data").append(bar)

        }
        if (name.match(/opacity|restitution|mass|frictionAir|Name|interval|width|height/)) {
            let bar = document.createElement("input")
            bar.id = name
            bar.className = "write"
            bar.value = stats[name]
            $("#data").append(`<label for="${name}">${name.upper()}</label>`)
            $("#data").append(bar)

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
            bar.value = stats[name]
            bar.type = "color"
            $("#data").append(`<label for="${name}">${name.upper()}</label>`)
            $("#data").append(bar)

        }


        if (name.match(/img/)) {
            let bar = document.createElement("input")
            bar.id = name
            bar.type = "file"
            bar.style.display = "none"
            bar.accept = ".png, .jpeg, .jpg, .webp"
            bar.addEventListener(`change`, fileChange)

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
            cam.following = current
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
window.ctx = ctx
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

        cam.following = null
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

function getIndex() {
    return getIndex.inx++
}
getIndex.inx = 0
function fileChange(o) {
    let reader = new FileReader()
    reader.readAsDataURL(o.target.files[0])
    reader.onload = (o) => {

        current.img.src = o.target.result
        current.imgSrc = o.target.result
        current.start.img.src = o.target.result
        current.start.imgSrc = o.target.result
        current.customImage = true
        showData(current)
    }
}
function findMarble() {
    let foundYou = null
    for (let o of Entity.toSpawn) {
        if (o.id === +this.name) {
            foundYou = o
            break
        }
    }
    foundYou.Name = this.value
}
function findMarbleImage() {
    if (!this.value.length) {
        return
    }
    let foundYou = null
    for (let o of Entity.toSpawn) {
        if (o.id === +this.name) {
            foundYou = o
            break
        }
    }
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

    let params = { ...current.start }
    params.x += 100
    params.y += 100
    let clone = new current.CREATOR(params)
    current = select = clone
    //current.start = {...params}
    showData(clone)
    /*for (let o of Entity.all) {
        o.selected = false;
        if (o === clone) {
            o.selected = true
        }
    }*/

}
// Get the current URL
const url = new URL(window.location.href)

// Create a URLSearchParams object from the URL's query string
const params = new URLSearchParams(url.search);

// Get the value of the 'a' parameter
const aValue = params.get('level');
if (aValue) {
    (async function () {
        let levelData = await fetch('/levels/' + aValue + '.txt')
        let text = await levelData.text()

        Load(text)
        cam.x =NaN

        startGame()


    })()
    $('body *').not('canvas').each(function () {
        $(this).hide()
    })
    $(canvas).appendTo('body')
    level = true
    $(canvas).attr({
        margin: '0px',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0
    })
    $('body').css('padding', '0px');

}