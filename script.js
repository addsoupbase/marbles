import { Images } from "./img.js"
import { darkenHexColor, choose, frange, range, Colors as c, sanitize, Elem, $search } from "./utils.js"
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
getIndex.inx = 0
function getIndex() {
    return getIndex.inx++
}
const elements = {
    cont: new Elem({
        _label_: 'father',

        tag: 'div', id: 'cont', children: [
            new Elem({ tag: 'canvas', width: 500, height: 500, id: 'can' }),
            new Elem({
                id: 'data', tag: 'div', class: ['menu'], children: [
                    new Elem({ tag: 'p', text: 'Nothing Selected...', _label_: 'fuck' })
                ]
            }), new Elem({
                tag: 'div', id: 'data2', class: ['menu', 'hidden'], children: [
                    new Elem({ tag: 'div', id: 'buttonholder', _label_: 'hi' })
                ]
            }),
            new Elem({ tag: 'div', id: 'data4', class: ['menu', 'hidden'] }),
            new Elem({
                tag: 'div', id: 'data3', class: ['menu', 'hidden'], children: [
                    new Elem({
                        tag: 'div', children: [
                            new Elem({ tag: 'button', id: 'marbleAdder', class: ['good'], text: 'Add Marble' }),
                            new Elem({ tag: 'button', id: 'spawnImmediately', class: ['good'], text: 'Spawn All' }),
                            new Elem({ tag: 'button', id: 'killAll', class: ['bad'], text: 'Destroy All' })

                        ]
                    }),
                    new Elem({
                        tag: 'div', class: ['separate'], children: [
                            new Elem({ tag: 'label', for: 'title', text: 'Title' }),
                            new Elem({ tag: 'input', id: 'title', class: ['write'], type: 'text', value: 'Untitled', }),
                            new Elem({ tag: 'label', for: 'author', text: 'Author' }),
                            new Elem({ tag: 'input', id: 'author', class: ['write'], type: 'text', value: 'Unknown', }),
                            new Elem({ tag: 'label', for: 'bounciness', text: 'Marble bounce' }),
                            new Elem({ tag: 'input', id: 'bounciness', class: ['write'], type: 'number', value: '0', }),
                            new Elem({ tag: 'label', for: 'camBehaviour', text: 'Camera Behaviour', }),
                            new Elem({
                                tag: 'select', id: 'camBehaviour', children: [
                                    new Elem({ tag: 'option', value: 'leader', text: 'Follow Leader' }),
                                    new Elem({ tag: 'option', value: 'loser', text: 'Follow Loser' }),
                                    new Elem({ tag: 'option', value: 'middle', text: 'Follow Middle' }),
                                    new Elem({ tag: 'option', value: 'average', text: 'Average' }),
                                    new Elem({ tag: 'option', value: 'outliers', text: 'Outliers' }),
                                    new Elem({ tag: 'option', value: 'random', text: 'Pick randomly' }),
                                    new Elem({ tag: 'option', value: 'free', text: 'Free' }),
                                ]
                            })

                        ]
                    }),
                    new Elem({ tag: 'p', class: ['danger'], text: 'If you use a link instead of uploading directly, there is a chance that the link will expire' }),
                    new Elem({ tag: 'div', id: 'allMarbles' })
                ]
            })

        ]
    }, true),
    startmenu: new Elem({
        tag: 'div', id: 'startmenu', class: ['menu', 'gameMenu'],
        children: [
            new Elem({ tag: 'h1', text: 'Untitled', class: ['gameMenu'], id: 'levelTitle' }),
            new Elem({ tag: 'cite', text: 'by Unknown', class: ['gameMenu'], id: 'authorName', parent: Elem.$('#levelTitle') }),

            new Elem({
                tag: 'button', id: 'gameStartButton', class: ['good', 'gameMenu'], text: 'Start', events: [
                    ['click', (function anonymous() {
                        this.content.parent.anim({ class: ['slide-out-blurred-top'] }, () => {
                            setTimeout(a => {
                                startGame()
                                menuClicked = true
                                startmenu.style.zIndex = -1
                            }, 200)

                        })
                    })]
                ]
            })
        ]
    }, true),
    hold: new Elem({
        class: ['hold'], tag: 'div', children: [
            new Elem({ tag: 'button', id: 'saveButton', text: 'Download', class: ['good'] }),
            new Elem({
                class: ['good'], tag: 'button', id: 'loadButton', text: 'Load from file', events: [
                    ['click', () => {
                        Elem.$('#uploadedData').content.click()
                        
                    }]
                ]
            }),
            new Elem({
                class: ['good'], tag: 'button', id: 'loadButton2', text: 'Load from text field', events: [
                    ['click', () => Load()]
                ]
            }),

            new Elem({
                class: ['good'], tag: 'button', text: 'Copy', events: [
                    ['click', () => navigator.clipboard.writeText($('#textData')[0].value)]
                ]
            }),
            new Elem({ tag: 'textArea', id: 'textData', placeholder: 'Saved Data' }),
            new Elem({ class: ['good'], tag: 'button', id: 'put', text: 'Put' }),
            new Elem({ class: ['good'], tag: 'button', id: 'edit', text: 'Edit' }),
            new Elem({ class: ['good'], tag: 'button', id: 'marble', text: 'Marbles' }),
            new Elem({ class: ['good'], tag: 'button', id: 'startButton', text: 'Start' }),
        ]
    }, true)
}
let startmenu = document.getElementById('startmenu')

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
        let params = { Name: settings?.Name, restitution: +$('#bounciness')[0].value ?? 0, size: 30, x: (-cam.x / cam.zoom + canvas.width / 2) + (Math.random() * 100 * choose(1, -1)), y: (-cam.y / cam.zoom + canvas.height / 2) + (Math.random() * 100 * choose(1, -1)) /*img: Entity.Images[1]*/ }

        let me = new Marble(params)
        me.imgSrc = settings?.imgSrc ?? ''
        me.img = new Image()
        me.img.src = me.imgSrc
        let inp = new Elem({
            tag: 'input', value: me.Name, placeholder: 'Name', id: `shh${me.id}`, name: me.id, events: [
                ['focusout', findMarble]
            ]
        })
        new Elem({ tag: 'div', class: ['separate'], id: `div${me.id}`, parent: $search('#allMarbles') })
        new Elem({
            tag: 'input',
            name: `${me.id}`,
            type: 'url',
            id: `mrbl${me.id}`,
            placeholder: 'ImageUrl or file',
            value: `${me.imgSrc ?? ''}`,
            events: [['focusout', findMarbleImage]]
        })
            .appendTo($search('#div' + me.id))
        new Elem({
            parent: Elem.$('#div' + me.id), name: me.id, tag: 'input', type: 'file', accept: ".png, .jpeg, .jpg, .webp", events: [
                ['change', function (data) {
                    let reader = new FileReader()
                    reader.readAsDataURL(data.target.files[0])
                    console.log(this)
                    reader.onload = (f) => {
                        let foundYou = null
                        for (let o of Entity.toSpawn) {
                            if (o.id === +this.name) {
                                foundYou = o
                                break
                            }
                        }
                        foundYou.img = new Image()
                        foundYou.img.src = f.target.result
                        foundYou.imgSrc = foundYou.img.src
                        foundYou.customImage = true
                        Elem.$('#mrbl' + this.name).content.value = foundYou.imgSrc
                        Text = 'Upload successful!#00FF00'
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
                   //showData(current)
               }
           })*/
        inp.appendTo($search('#allMarbles'))
        inp = inp.content
        //    $("#allMarbles").append(inp)
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
    arr.push({ bounciness: $('#bounciness')[0].value, camBehaviour: $('#camBehaviour')[0].value, title: Elem.$('#title').content.value, author: Elem.$('#authorName').content.value })
    for (let o of a.all) {
        console.warn(o)
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
    let output = JSON.stringify(arr)
    $('#textData')[0].value = output
    let blob = new Blob([output], { type: 'text/plain;' })
    const tempurl = URL.createObjectURL(blob)
    let anchor = new Elem({ tag: 'a', href: tempurl, download: Elem.$('#levelTitle').content.innerHTML })
     Elem.$('#textData').content.value=output
    anchor.content.click()
    anchor.kill()
    URL.revokeObjectURL(tempurl);
    Elem.$('#textData').value=''
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
        if (data[0].title) {
            Elem.$('#levelTitle').content.innerHTML = data[0].title
        }
        if (data[0].author) {
            Elem.$('#authorName').content.innerHTML = `by ${data[0].author}`
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
                Elem.$('#title').content.value = item.title
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
        }
        for (let o of Entity.toSpawn) {
            if (o.img.src !== o.imgSrc) {
                Entity.toSpawn.deleteWithin(o)
            }
        }
        Elem.$('#textData').content.value=''

    }
    catch (e) {
        Text = 'Check logs please :(#FF0000'
        console.warn(data)
        Elem.$('#textData').content.value=''

        throw e
    }
}, menu = function (type) {
    $(".menu").each(function () { $(this).hide() })
    $("#" + type).show()

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
]) {
    Elem.$(`#${id}`).addevent(['click', event])
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
        id6 = getIndex()
    let naMes = [`block${id1}`, `motor${id2}`, `cam${id3}`, `spawner${id4}`, `wind${id5}`, `moveableWall${id6}`]
    let gtrmnythr = Elem.$('#buttonholder')
    let events = [() => chosenEntity = 'Block', () => chosenEntity = 'Motor', () => chosenEntity = 'Cam', () => chosenEntity = 'Spawner', () => chosenEntity = 'WindZone', () => chosenEntity = 'Movable Wall']
    for (let i = 0; i < naMes.length; i++) {
        let me = new Elem({
            tag: 'button', class: ['good', 'thin'], id: naMes[i], text: naMes[i], events: [
                ['click', events[i]]
            ]
        })
        me.appendTo(gtrmnythr.content)

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
    zoomChange: 0,
    last: {
        x: 0,
        y: 0,
        zoom: 1
    },
    targetZoom: 1,
    behaviour: 'leader',
    easterEggs: {
        acidMode: false,
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
        Elem.$(`#shh${o.id}`).content.value = o.Name
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
let menuClicked = false
window.menuClicked = menuClicked
function update() {
    reqFrame(update)
    /*   if (getComputedStyle(startmenu).getPropertyValue('opacity') == 0 && !menuClicked) {
           startGame()
           menuClicked = true
           startmenu.style.zIndex = -1
       }*/
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
    if (sanitize(cam.x) && sanitize(cam.y)) {
        cam.last.x = cam.x;
        cam.last.y = cam.y
    }
    else {
        cam.x = cam.last.x
        cam.y = cam.last.y
    }

    if (Entity.all.filter(o => o.isMarble).length) {
        let outliers = false;
        if (cam.following) {
            cam.x = (-cam.following.position.x * cam.zoom) + ((canvas.width * cam.zoom) / 2) / cam.zoom
            cam.y = (-cam.following.position.y * cam.zoom) + ((canvas.height * cam.zoom) / 2) / cam.zoom
        }
        switch (cam.behaviour) {
            case 'leader': {
                if (cam.existinggoal) {
                    cam.following = (Entity.getAllMarbles.sort((a, b) => Entity.distance(a, cam.existinggoal) - Entity.distance(b, cam.existinggoal))[0])
                }
            }
                break;
            case 'loser': {
                if (cam.existinggoal) {
                    cam.following = (Entity.getAllMarbles.sort((a, b) => Entity.distance(b, cam.existinggoal) - Entity.distance(a, cam.existinggoal))[0])
                }
            }
                break;
            case 'middle': {
                if (cam.existinggoal) {
                    cam.following = (Entity.getAllMarbles.sort((a, b) => Entity.distance(b, cam.existinggoal) - Entity.distance(a, cam.existinggoal)).center())
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
                for (let o of Entity.all) {
                    if (o.isMarble) {
                        positions.x.push(o.position.x)
                        positions.y.push(o.position.y)
                    }
                }
                cam.following = null
                const avg = {
                    x: positions.x.average(outliers),
                    y: positions.y.average(outliers)
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
                    cam.following = Entity.getAllMarbles.pick()
                }
                break;
            }
        }
    }
    if (sanitize(cam.zoom)) {
        cam.last.zoom = cam.zoom
    }
    else {
        cam.zoom = cam.last.zoom
    }
    cam.zoom = lerp(cam.zoom, cam.targetZoom, 0.05)

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
        const dx = Math.abs(a.position.x - b.position.x);
        const dy = Math.abs(a.position.y - b.position.y);
        return Math.hypot(dx, dy);
    }
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
        return this.all.filter(o => o.isMarble)
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
    static all = Matter.Composite.allBodies(world)
    static toKill = []
    static allClasses = {}
    static graveyard = []
    static temporarilyDead = []
    static Images = []
    static toSpawn = []
    static gameSpawns = []
    static {
        window.a = this
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
        if (!isFinite(opts.x)) opts.x = center.x;
        if (!isFinite(opts.y)) opts.y = center.y;
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
    static defaultSize = 30;
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
            if (editorMode || cam.easterEggs.showNamesInPlayMode && cam.zoom >= 0.6) {
                ctx.save()
                ctx.rotate(-this.angle)
                ctx.font = `13px ${cam.easterEggs.gameFont}`
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
        this.toggleable.deleteWithin("angle")
        this.toggleable.deleteWithin("restitution")
        this.toggleable.deleteWithin("color")
        this.toggleable.deleteWithin("opacity")
        this.illustrate = function (e) {

            if (!editorMode) {
                if (!(e % this.interval) && !editorMode) {
                    Entity.gameSpawns = Entity.gameSpawns.shuffle()
                    let child = Entity.gameSpawns.pop()

                    if (child) {
                        child.x = this.position.x + range(-this.SIZE.x / 2, this.SIZE.x / 2)
                        child.y = this.position.y + range(-this.SIZE.y / 2, this.SIZE.y / 2)
                        child.restitution = +$search('#bounciness').value ?? 1
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
function startGame(fade) {
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

    let me = Elem.$('#data').killChildren()
    if (!stats) {
        new Elem({ tag: 'p', text: 'Nothing Selected...', parent: me })
        return
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

    for (let statName of Object.values(stats.toggleable)) {
        let val = stats[statName]
        console.warn(statName)
        if (statName === 'angle') {
            new Elem({ tag: 'label', for: statName, text: 'Angle', parent: me })
            new Elem({ tag: 'input', class: ['write'], parent: me, id: statName, value: val })
        }
        if (statName === 'color') {
            new Elem({ tag: 'label', for: statName, text: 'Color', parent: me })
            new Elem({ tag: 'input', class: ['color'], type: 'color', parent: me, id: statName, value: val })
        }
        if (statName.match(/width|height|opacity|Name|mass|frictionAir|windSpeed|interval/)) {
            new Elem({ tag: 'label', for: statName, text: statName.upper(), parent: me })
            new Elem({ tag: 'input', class: ['write'], parent: me, id: statName, value: val })
        }

    }
}
window.ctx = ctx
$(window).on({
    mousewheel: function (e) {
        cam.zoomChange = e.originalEvent.deltaY / 2000;
        cam.targetZoom = Math.max(0.1, cam.zoom - cam.zoomChange);
        cam.targetZoom = Math.abs(cam.targetZoom);
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
        if (!e.key) {
            return
        }
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


    $('body *').not('canvas').each(function () {
        $(this).hide()
    })
    $(canvas).appendTo('body')
    $(canvas).attr({
        margin: '0px',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0
    })
    $('body').css('padding', '0px');
    (async function () {
        let levelData = await fetch('/marbles/levels/' + aValue + '.txt')
        if (!levelData.ok) {
            levelData = await fetch('/levels/' + aValue + '.txt')
        }
        let text = await levelData.text()

        Load(text)
        cam.x = cam.y = NaN
        //startGame()
        Elem.$('.gameMenu').forEach(o => { o.content.style.display = 'flex' })
        Elem.$('#startmenu').anim({ class: ['slide-in-blurred-top'] })

    })()
    level = true


}

function lerp(start, end, t) {
    return start + (end - start) * t
}
/*$('#pickbutton').on('click', (function anonymous() {
    let data = localStorage.getItem('sets')
    let div = `<div class='gameMenu'>content</div>`
    let setbutton = new Elem({type: 'button', class: ['good'], text: 'Add marble', id: 'addSetButton'})
    let savebutton = new Elem({type: 'button', class: ['good'],text:'Save',id:'saveButton'})

    $(savebutton).on('click',(function anonymous(){
        for (let o of document.querySelectorAll('[name="savingsets"]')) {
            let ID = getIndex()
            let imageurl = o.children[0].value
            let name = o.children[2].value
            localStorage.setItem('sets',JSON.stringify({Name: name,img: {},imgSrc: imageurl,size: 30,id: ID, game: true}))

        }
    }))
    $(setbutton).on('click', (function anonymous() {
        $('#nosets').remove()
        let index = getIndex()
        $(this).before(`<div class='whitemenu' id='menu${index}'>
            <div class='separate' name='savingsets'>
            <input placeholder='Image Url' type='url'></input>
            <br>
            <input placeholder='Name' name='${index}' value='Marble ${index}'></input>
            <button class='bad' id='remove${index}'>🗑️</button
            </div>
            </div>`)
            $(`#remove${index}`).on('click',()=>$(`#menu${index}`).remove())
    }))
    $(startmenu).append(`<div id='setHolder' class='gameMenu' style='display:grid;'></div>`)
    $('#setHolder').append(setbutton)
    $('#setHolder').append(savebutton)

    if (!data) {
        $(setbutton).before('<h2 id="nosets">No sets</h2>')
    }
    else {
        let _data = JSON.parse(data)
  
            let index = getIndex()
            $(setbutton).before(`<div class='whitemenu' id='menu${index}'>
                <div class='separate' name='savingsets'>
                <input placeholder='Image Url' type='url' value='${_data.imgSrc}'></input>
                <br>
                <input placeholder='Name' name='${_data.Name}' value='${_data.Name}'></input>
                <button class='bad' id='remove${index}'>🗑️</button
                </div>
                </div>`)
                $(`#remove${index}`).on('click',()=>$(`#menu${index}`).remove())

        
       
    }

}))*/
Elem.$('#textData')
new Elem({
    id: 'uploadedData', type: 'file', tag: 'input', events: [
        ['change', (o) => {
            let file = o.target.files[0]
            let reader = new FileReader()
            reader.readAsText(file)
            reader.onload = (data) => { Elem.$('#textData').content.value = data.target.result; Load();    Elem.$('#textData').content.value=''
            }
        }]
    ]
}, true).hide()