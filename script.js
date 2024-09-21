'use strict';
const あ = Elem;
const c = color;
/*Elem.logLevels = {
    debug: true,
    warn: true,
    error: true,
    info: true,
    success: true,
}*/
Elem.logLevels.error = true
let max = {
    title: '20',
    author: '16'
}
let reqFrame = requestAnimationFrame || window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame || (func => setTimeout(func, 10))
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
let gameEnded = false
function getIndex() {
    return getIndex.inx++
}
function waitForFrames(callback, frames, label, pauseDuringCutscene) {
    if (!(frames === Math.round(frames))) {
        Elem.error('Expected int, instead got float')
        return
    }
    let out = {
        time: frames,
        label: label,
        execute: callback,
        pauseDuringCutscene: pauseDuringCutscene
    }
    if (!callback) {
        Elem.warn('No callback provided')
    }
    if (cam.delays.every(o => o.label !== out.label)) {
        cam.delays.push(out)
    }
}
const elements = {
    cont: new Elem({
        _label_: 'father',

        tag: 'div', id: 'cont', children: [
            new Elem({ tag: 'canvas', width: 500, height: 500, id: 'can' }),
            new Elem({
                id: 'data', tag: 'div', class: ['menu'], children: [
                    new Elem({ tag: 'p', text: 'Nothing Selected...' })
                ]
            }), new Elem({
                tag: 'div', id: 'data2', class: ['menu', 'hidden'], children: [
                    new Elem({ tag: 'div', id: 'buttonholder' })
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
                            new Elem({ tag: 'label', for: 'title', text: 'Title'}),
                            new Elem({ tag: 'input', id: 'title', class: ['write'], type: 'text', value: 'Untitled', maxLength:max.title  }),
                            new Elem({ tag: 'label', for: 'author', text: 'Author' }),
                            new Elem({ tag: 'input', id: 'author', class: ['write'], type: 'text', value: 'Unknown', maxLength:max.author }),
                            new Elem({ tag: 'label', for: 'bounciness', text: 'Marble bounce' }),
                            new Elem({ tag: 'input', id: 'bounciness', class: ['write'], type: 'number', value: '1', }),
                            new Elem({ tag: 'label', for: 'camBehaviour', text: 'Camera Behaviour',class:['hidden'] }),
                            new Elem({
                                tag: 'select', id: 'camBehaviour', style: 'display: hidden;',class:['hidden'], value: 'leader', children: [
                                    new Elem({ tag: 'option', value: 'leader', text: 'Follow Leader' }),
                                    new Elem({ tag: 'option', value: 'loser', text: 'Follow Loser' }),
                                    new Elem({ tag: 'option', value: 'middle', text: 'Follow Middle' }),
                                    new Elem({ tag: 'option', value: 'average', text: 'Average' }),
                                    new Elem({ tag: 'option', value: 'outliers', text: 'Outliers' }),
                                    new Elem({ tag: 'option', value: 'random', text: 'Pick randomly' }),
                                    new Elem({ tag: 'option', value: 'free', text: 'Free' }),
                                    new あ({tag:'optgroup', label:'Contestants'})
                                ]
                            }),


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
                tag: 'button', id: 'gameStartButton', class: ['good', 'gameMenu'], text: 'Play',
            }),
            new Elem({
                tag: 'div', class: ['gameMenu'], id: 'secondMenu', children: [
                    new Elem({ tag: 'label', text: 'Play Cutscenes', for: 'cutscenes' }),
                    new Elem({ tag: 'input', type: 'checkbox', id: 'cutscenes', checked: true, }),
                    new Elem({ tag: 'label', for: 'camSpeed', text: 'Camera Speed', }),
                    new Elem({ tag: 'input', id: 'camSpeed', value: 0.1, placeholder: 'Default: 0.1' }),
                    new Elem({ tag: 'label', text: 'Camera Behaviour', for: 'camBehaviour' }),


                ]
            }),
            new Elem({
                tag: 'div', class: ['gameMenu'], children: [
                    new Elem({
                        tag: 'button', id: 'gameSettings', class: ['neutral', 'gameMenu'], text: 'Settings', events: [
                            ['click', turnToSettingsMenu]
                        ]
                    })
                ]
            }),

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
    let foundYou = Entity.toSpawn.find(o => o.id === +num)

    /*for (let o of Entity.toSpawn) {
        if (o.id === +num) {
            foundYou = o
            break
        }
    }*/
    Entity.toSpawn.deleteWithin(foundYou)
    あ.elements.forEach(o=>{
        if (o.name === foundYou.id) {
            this.kill()
        }
    })
  
},

    spawnAllOfTheMarbles = () => {
        for (let o of Entity.toSpawn) {
            o.restitution= +あ['#bounciness'].value
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
    , Spawn = function (mx) {
        console.log(mx)
        let foundYou = Entity.toSpawn.find(o => o.id === +mx)
        /*for (let o of Entity.toSpawn) {
            if (o.id === num) {
                foundYou = o
                break
            }
        }*/
        // foundYou.img = new Image()
        foundYou.img.src = foundYou.imgSrc
        foundYou.restitution = +あ['#bounciness'].value
        new Marble(foundYou)
    },
    addMarble = function (settings) {
        let params = { Name: settings?.Name, restitution: +あ['#bounciness'].value, size: 30, x: (-cam.x / cam.zoom + canvas.width / 2) + (Math.random() * 100 * ran.choose(1, -1)), y: (-cam.y / cam.zoom + canvas.height / 2) + (Math.random() * 100 * ran.choose(1, -1)) /*img: Entity.Images[1]*/ }

        let me = new Marble(params)
        me.imgSrc = settings?.imgSrc ?? ''
        me.img = new Image()
        me.img.src = me.imgSrc
        new Elem({ tag: 'div', id: 'brb' + me.id, style: 'border: 5px solid #28a745; border-radius: 10px;' }).appendTo('allMarbles')

        new Elem({ tag: 'div', style: 'display:inline-flex;margin: 10px;', id: `top${me.id}` }).appendTo('brb' + me.id)
        let inp = new Elem({
            tag: 'input', value: me.Name, placeholder: 'Name', id: `shh${me.id}`, name: me.id, events: [
                ['focusout', findMarble]
            ]
        })
        //  new Elem({ tag: 'div', class: ['separate'], id: `div${me.id}`, parent: $search('#allMarbles') })

        new Elem({
            parent: Elem.$('#div' + me.id), name: me.id, tag: 'input', type: 'file', accept: ".png, .jpeg, .jpg, .webp", events: [
                ['change', function (data) {
                    let reader = new FileReader()
                    reader.readAsDataURL(data.target.files[0])
                    console.log(this)
                    reader.onload = (f) => {
                        let foundYou = Entity.toSpawn.find(o => o.id === +this.name)
                        /*for (let o of Entity.toSpawn) {
                            if (o.id === +this.name) {
                                foundYou = o
                                break
                            }
                        }*/
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
        inp.appendTo('top' + me.id)
        new Elem({ tag: 'div', style: 'display:inline-flex;margin: 10px;', id: `bottom${me.id}` }).appendTo('brb' + me.id)
        new Elem({
            tag: 'input',
            name: `${me.id}`,
            type: 'url',
            id: `mrbl${me.id}`,
            placeholder: 'ImageUrl or file',
            value: `${me.imgSrc ?? ''}`,
            events: [['focusout', findMarbleImage]]
        })
            .appendTo('bottom' + me.id)
        inp = inp.content
        //    $("#allMarbles").append(inp)
        let index1 = getIndex(),
            index2 = getIndex()
        new Elem({
            tag: 'button', name: `${me.id}`, id: `spawn${index1}`, events: [
                ['click', () => spawnEvent(me.id)]
            ], text: 'Spawn', class: ['good', 'thin']
        }).appendTo(`top${me.id}`)
        new Elem({
            tag: 'button', name: `${me.id}`, id: `Del${index2}`, events: [
                ['click', function () { deleteEvent(me.id); Elem.$('#brb' + me.id).killChildren().kill(); }]
            ], text: '🗑️', class: ['bad', 'thin']
        }).appendTo(`bottom${me.id}`)


let change = new あ({parent: `top${me.id}`,tag:'input',type:'file', accept: ".png, .jpeg, .jpg, .webp", events: {
    change(o) {
        let reader = new FileReader()
        reader.readAsDataURL(o.target.files[0])
        let my = Entity.toSpawn.find(o=>o.id === +me.id)
        reader.onload = (o) => {
            my.img = new Image()
            my.img.src = o.target.result
            my.imgSrc = o.target.result
            あ['#mrbl'+me.id].content.value = my.img.src
        }  }
}}).hide()


new あ({tag:'button',class:['good','thin'], parent: `top${me.id}`,text:'Upload', events: {
    click() {
change.content.click()
    }
}})
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
    arr.push({
        bounciness: あ['#bounciness'].value,
        /*camBehaviour: $('#camBehaviour')[0].value,*/
        title: Elem.$('#title').content.value.shorten(max.title), author: Elem.$('#authorName').content.value.shorten(max.author)
    })
    for (let o of a.all) {
        if (!o.canBeSaved) {
            continue
        }
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
        if (!o.start.imgSrc) {
            delete o.start.imgSrc
            delete o.start.img
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
      //      delete o.start.color
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
    あ['#textData'].content.value = output
    let blob = new Blob([output], { type: 'text/plain;' })
    const tempurl = URL.createObjectURL(blob)
    const regex = /[^a-z0-9_]/gi;
    let anchor = new Elem({ tag: 'a', href: tempurl, download: Elem.$('#title').content.value.replace(regex, '').replaceAll(' ', '_') })
    Elem.$('#textData').content.value = output
    anchor.content.click()
    anchor.kill()
    URL.revokeObjectURL(tempurl);
    Elem.$('#textData').value = ''
}, Load = function (information) {
    editorMode || startGame()

    try {
        let data;
        if (information) {
            data = JSON.parse(information)
        }
        else {
            data = JSON.parse(あ["#textData"].content.value)
        }
        if (data[0].title) {
            Elem.$('#levelTitle').content.innerHTML = data[0].title.shorten(max.title)
            document.title = `${data[0].title.shorten(max.title)} - Marbles`
        }
        if (data[0].author) {
            Elem.$('#authorName').content.innerHTML = `by ${data[0].author.shorten(max.author)}`
        }
        Entity.all.length = Entity.toSpawn.length = Entity.graveyard.length = Entity.gameSpawns.length = Entity.temporarilyDead.length = 0
        あ['#allMarbles'].killChildren()
        for (let o of Matter.Composite.allBodies(world)) {
            World.remove(world, o)
        }
        for (let item of data) {
            //console.log(item)
            // console.log(item[0], item[1])

            if ('bounciness' in item) {
                あ['#bounciness'].value = item['bounciness']
                //$('#camBehaviour')[0].value = item.camBehaviour
                Elem.$('#title').content.value = item.title
                continue
            }
            if ('game' in item) {
                Entity.toSpawn.push(item)
            new あ({parent: 'camBehaviour', tag:'option', value:item.Name,text:item.Name})
                addMarble(item)
                continue
            }
            let inputargs = item[0]

            //inputargs.height = item[2].height ?? item[2].start.height
            //inputargs.width = item[2].width ?? item[2].start.width
            inputargs.img = new Image()
            inputargs.img.src = inputargs.imgSrc
            try {
                let x = new Entity.allClasses[item[1]](inputargs)
                x.start = inputargs
            }
            catch (e) {
                console.log(item[1])
            }
        }
        for (let o of Entity.toSpawn) {
            if (o.img.src !== o.imgSrc) {
                Entity.toSpawn.deleteWithin(o)
            }
        }
        Elem.$('#textData').content.value = ''

    }
    catch (e) {
        Text = 'Check logs please :(#FF0000'
        console.warn(data)
        Elem.$('#textData').content.value = ''

        throw e
    }
}, menu = function (type) {
  [あ['#data'],あ['#data2'],あ['#data3'],あ['#data4'],].forEach(o=>o.addClass('hidden'))
    あ[`#${type}`].removeClass('hidden')

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
    あ[`#${id}`].addevent({
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
        id6 = getIndex(),
        id7 = getIndex(),
        id8 = getIndex(),
        id9 = getIndex(),
        id10 = getIndex();
    let naMes = [`block${id1}`, `motor${id2}`, `spawner${id4}`, `wind${id5}`, `moveableWall${id6}`, `circle${id7}`, `ball${id8}`, `goal${id9}`, `portal${id10}`]
    let gtrmnythr = Elem.$('#buttonholder')
    let events = [() => chosenEntity = 'Block', () => chosenEntity = 'Motor', () => chosenEntity = 'Spawner', () => chosenEntity = 'WindZone', () => chosenEntity = 'Movable Wall', () => chosenEntity = 'Circle', () => chosenEntity = 'Ball', () => chosenEntity = 'Goal', () => chosenEntity = 'Portal']
    for (let i = 0; i < naMes.length; i++) {
        let me = new Elem({
            tag: 'button', class: ['good', 'thin'], id: naMes[i], text: naMes[i], events: [
                ['click', events[i]]
            ]
        })
        me.appendTo(gtrmnythr.content)

    }





}

function place(entity) {

    if (entity.includes("Block")) {
        let baby = new Wall({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), width: 30, height: 30, isStatic: true })
        current = baby
        showData(baby)

    }
    if (entity.includes("Goal")) {
        let baby = new Goal({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), width: 30, height: 30, isStatic: true })
        current = baby
        showData(baby)

    }
    if (entity.includes("Movable Wall")) {
        let baby = new MoveableWall({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), width: 30, height: 30, isStatic: false })
        current = baby
        showData(baby)
    }
    if (entity.includes("Circle")) {
        let baby = new Circle({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), size: 30, isStatic: true })
        current = baby
        showData(baby)
    }
    if (entity.includes("Ball")) {
        let baby = new Ball({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom), size: 30, isStatic: false })
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
    if (entity.includes("Portal")) {
        let baby = new Portal({ x: (mouse.x / cam.zoom) - (cam.x / cam.zoom), y: (mouse.y / cam.zoom) - (cam.y / cam.zoom) })
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
const canvas = Elem.$('#can'),
    ctx = canvas.content.getContext('2d');
canvas.width = canvas.content.width
canvas.height = canvas.content.height
const cam = {
    x: 0,
    y: 0,
    firstPlace: null,
    frozen: false,
    cutscene: {
        enabled: true,
        firstPlace: false,
    },

    freeze() {
        this.frozen = true;
        let lastFollowing = this.following
        this.following = this.firstPlace
        let lastzoom = cam.targetZoom
        cam.targetZoom = 1.2
        let bodiesToFreeze = []
        let lastx = cam.x,
            lasty = cam.y
        Entity.all.forEach(o => {
            if (!o.isStatic) {
                bodiesToFreeze.push(o)
            }
        })
        bodiesToFreeze.forEach(o => {
            let あ = Body.getVelocity(o)
            o.temp = {
                vx: あ.x,
                vy: あ.y,
                av: Body.getAngularVelocity(o)
            }
            Body.setStatic(o, true);
        })
        waitForFrames(() => {
            cam.cutscene.firstPlace = cam.following
            cam.cutscene.firstPlace.victory()
            waitForFrames(() => {
                if (!Entity.all.filter(o => o.isMarble).length) {
                    return
                }
                this.frozen = false

                if (cam.behaviour !== 'free') {
                    this.following = lastFollowing
                } else {
                    cam.x = lastx
                    cam.y = lasty
                }
                cam.targetZoom = lastzoom
                bodiesToFreeze.forEach(o => {
                    Body.setStatic(o, false);
                    Body.setVelocity(o, { x: o.temp.vx, y: o.temp.vy })
                })
            }, 100, 'backToPlayModeFromVictoryDance')
        }, 100, 'victorydance')
    },
    delays: [],
    behaviour: 'leader',
    endGame: () => {
        if (!level) {
            return
        }
        waitForFrames(o => {
            Elem.$('#can').anim({ class: ['blur-element'] }, () => {
                let testsubject = Elem.$('#startmenu')
                testsubject.show().content.style.display = 'flex'
                testsubject.removeClass('slide-in-blurred-top', 'slide-out-blurred-top')
                testsubject.content.style.zIndex = 2
                testsubject.killChildren()
                testsubject.anim({ class: ['slide-in-blurred-top'] })
                new Elem({ tag: 'div', id: 'winners', }).appendTo(testsubject)
                for (let placement of Entity.placements) {
                    let index = Entity.placements.indexOf(placement)
                    let medal
                    if (index === 0) {
                        medal = '#f0ff21'
                    }
                    else if (index === 1) {
                        medal = '#a3a3a0'
                    }
                    else {
                        medal = '#704c21'
                    }
                    Elem.$('#winners').appendInto(new Elem({ tag: 'p', style: `color: ${medal}`, text: `#${index + 1}` }),
                    )
                    Elem.$('#winners').appendInto(new Elem({
                        tag: 'div', id: `place${index}`, style: `width:50px; height: 50px; background-color: ${placement.color}; border-color: ${placement.dark}`, children: [
                            new Elem({
                                tag: 'img',
                                src: placement.imgSrc,
                                events: [
                                    ['error', (function anonymous() { Elem.$(`#place${index}`).content.style['border-style'] = 'solid'; this.content.kill() })]
                                ],
                                width: 50,
                                height: 50
                            })
                        ]
                    }))
                }
            }, true)
        }, 50, 'gameEnd')
    },
    playing: false,
    zoomChange: 0,
    last: {
        x: 0,
        y: 0,
        zoom: 1
    },
    targetZoom: 1,
    easterEggs: {
        acidMode: false,
        filter: '',
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
    existingspawn: null,
    key: {
        w: false,
        s: false,
        a: false,
        d: false
    }
}
cam.behaviour = localStorage.getItem('cambehaviour')
cam.easterEggs.lerp = +localStorage.getItem('camspeed')
if (localStorage.getItem('cutscenes') === 'false') {
    cam.cutscene.enabled = false
}
else {
    cam.cutscene.enabled = true
}
if (!cam.easterEggs.lerp) {
    localStorage.setItem('camspeed', Elem.$('#camSpeed').content.value)
    cam.easterEggs.lerp = +Elem.$('#camSpeed').content.value
}
if (cam.cutscene.enabled == null) {
    localStorage.setItem('cutscenes', Elem.$('#cutscenes').content.checked)
}
if (!cam.behaviour || !(['leader','loser','middle','outliers','average','ramdom','free'].some(o=>o===cam.behaviour))) {
    localStorage.setItem('cambehaviour', Elem.$('#camBehaviour').content.value)
    cam.behaviour = Elem.$('#cambehaviour')?.content?.value ?? 'free'
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
    for (let element of あ["#data"].children) {
        let mine = element.content
        if ((mine.value != null || 'checked' in mine) && mine.id) {
            idNames[mine.id] = mine.value
        }
    }
    for (let o of Entity.toSpawn) {
        //   console.log($(`#name${o.id}`))
        Elem.$(`#shh${o.id}`).content.value = o.Name
    }
    for (let name in idNames) {
        console.log(idNames)
        if (name in current) {
            if (name === "angle") {
                Body.setAngle(current, +idNames[name] * Math.PI / 180)
                current.start[name] = +idNames[name] * Math.PI / 180

            }
            if (name === "speed") {
                cam.speed = +idNames[name]
            }

            if (name === "mass") {
                Body.setMass(current, +idNames[name])
                current.start[name] = +idNames[name]

            }
            if (name === "windSpeed") {
                current.start[name] = current[name] = +idNames[name]

            }

            if (name === "interval") {
                current[name] = Math.floor(+idNames[name])
                current.start[name] = Math.floor(+idNames[name])

            }
            if (name.match(/ignoreWind|respawn/)) {
                current[name] = idNames[name]
                current.start[name] = idNames[name]

            }
            if (name === "Name") {
                current.Name = current.start.Name = idNames[name]
            }
            if (name.match(/opacity|restitution/)) {
                current[name] = current.start[name] = +idNames[name]
            }
            if (name.match(/size/)) {
                let modified = current.start
                modified.size = +idNames[name]
                let out = new current.CREATOR(modified)
                current.kill()
                current = out
                showData(current)
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
                current.start.dark = current.dark = c.dhk(idNames[name], 40)
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
    if (level) {

        resize()
    }
    /*   if (getComputedStyle(startmenu).getPropertyValue('opacity') == 0 && !menuClicked) {
           startGame()
           menuClicked = true
           startmenu.style.zIndex = -1
       }*/

    if (!cam.frozen) {

        frame++
    }
    if (!Entity.all.includes(cam.following) && cam.following) {
        waitForFrames(() => cam.following = null, 10, 'resetCam')
    }
    smooth++
    for (let delays of cam.delays) {
        if (delays.pauseDuringCutscene && cam.frozen) {
            continue
        }
        if (!(delays.time--)) {
            delays.execute()
            Elem.debug(`Delay ${delays.label} executed`)
            cam.delays.deleteWithin(delays)
        }
    }
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
    ctx.filter = cam.easterEggs.filter

    for (const fr of Entity) {
        if (fr.CREATOR === Cam && !cam.existingcam) {
            cam.existingcam = fr
        }
        if (fr.CREATOR === Goal && !cam.existinggoal) {
            cam.existinggoal = fr
        }
        if (fr.CREATOR === Spawner && !cam.existingspawn) {
            cam.existingspawn = fr
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
    if (sane.sanitize(cam.x) && sane.sanitize(cam.y)) {
        cam.last.x = cam.x;
        cam.last.y = cam.y
    }
    else {
        cam.x = cam.last.x
        cam.y = cam.last.y
    }
    if (cam.following) {
        cam.x = lerp(cam.x, -cam.following.position.x * cam.zoom + canvas.width / 2, cam.easterEggs.lerp / cam.zoom)
        cam.y = lerp(cam.y, -cam.following.position.y * cam.zoom + canvas.height / 2, cam.easterEggs.lerp / cam.zoom)
        if (cam.easterEggs.lerp > 1.2) {
            cam.x = -cam.following.position.x * cam.zoom + canvas.width / 2
            cam.y = -cam.following.position.y * cam.zoom + canvas.height / 2

        }

    }
    let eve = Entity.getAllMarbles

    if (eve.length) {
        let outliers = false;

        switch (!editorMode && !cam.frozen && cam.behaviour) {
            default: {
                cam.following??= Entity.getAllMarbles.find(o=>o.Name===cam.behaviour)
            }
            break
            case 'leader': {
                if (cam.existinggoal) {
                    let raa = (eve.sort((a, b) => Entity.distance(a, cam.existinggoal) - Entity.distance(b, cam.existinggoal))[0])
                    cam.following = raa
                }
            }
                break;
            case 'loser': {
                if (cam.existinggoal) {
                    let raa = (eve.sort((a, b) => Entity.distance(b, cam.existinggoal) - Entity.distance(a, cam.existinggoal))[0])
                    cam.following = raa
                }
            }
                break;
            case 'middle': {
                if (cam.existinggoal) {
                    let raa = (eve.sort((a, b) => Entity.distance(a, cam.existinggoal) - Entity.distance(b, cam.existinggoal)).center())
                    cam.following = raa
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

                eve.forEach(o => {
                    positions.x.push(o.position.x)
                    positions.y.push(o.position.y)
                })

                const avg = {
                    x: positions.x.average(outliers),
                    y: positions.y.average(outliers)
                }
                console.log(cam)
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
                    cam.following = eve.pick()

                }
                break;
            }
        }
    }
    if (sane.sanitize(cam.zoom)) {
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
    // Step 1: Draw your normal content
    // (Insert your code to draw any content here, e.g., images, shapes, text, etc.)

    // Step 2: Save the current canvas state

    /* if (cam.cutscene.focus) {
         if (!cam.following) {
             return
         }
         ctx.save();
         ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black
         ctx.fillRect(0, 0, canvas.width, canvas.height); // Cover the entire canvas with dark color
         ctx.globalCompositeOperation = 'destination-out';
         const focusX = 150;
         const focusY = 150;
         const focusRadius = 50;
         ctx.beginPath();
         ctx.arc((cam.following.position.x*cam.zoom + cam.x*cam.zoom), (cam.following.position.y*cam.zoom + cam.y*cam.zoom), cam.following.position.circleRadius|| 100, 0, Math.PI * 2);
         ctx.fill();
         ctx.restore();
         cam.following.draw()
     }*/

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.font = "30px " + cam.easterEggs.gameFont
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.fillStyle = textColor
    ctx.strokeStyle = c.dhk(textColor, 40)
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
    static placements = [];
    static losers = []
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
    //static Images = []
    static toSpawn = []
    static gameSpawns = []
    static {
        window.a = this
        window.cam = cam

        /* for (let src of Images) {
             let x = new Image(50, 50)
             x.src = src
             this.Images.push(x)
         }*/
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
                restitution: opts.bounce ?? opts.restitution ?? 1,
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
        out.CREATOR = new.target
        if (!new.target.name.match(/Marble|MoveableWall/)) out.collisionFilter.group = -1;
        out.Name = opts.Name || `${new.target.name} ${out.id}`
        out.shape = opts.shape
        out.isSleeping = true
        World.add(world, out)
        out.color = opts.color
        let colours = Object.values(c)
        out.color ??= ran.choose(...colours)
        out.dead = false
        Body.setAngle(out, opts.angle ?? 0)
        out.img = opts.img ?? new Image()
        if (!opts.img) { out.img.src = "" }
        out.imgSrc = out.img.src
        out.dark = c.dhk(out.color, 40)
        out.selected = false
        out.canBeSaved = true
        out.isCustom = true
        out.toggleable = ["angle", "Name", "circleRadius", "restitution", "color", 'opacity', 'width', 'height']
        out.opacity = opts.opacity ?? 1
        out.interval = opts.interval ?? 50
        out.restitution = opts.restitution ?? 0
        out.size = opts.size
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
            if (editorMode) {

                if (this.selected) {
                    this.opacity = 0.6
                }
                else {
                    this.opacity = this.start.opacity ?? this.opacity
                }

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
            if (editorMode && !level && select != "put" && ctx.isPointInPath(mouse.x, mouse.y) && (cam.click.x && cam.click.y)) {
                if (!Entity.all.some(o => o.selected)) {
                    this.onclick?.()
                    this.selected = true
                    current = this
                    menu("data")
                    showData(this)

                }

            }
            else if (editorMode && !level && (!cam.click.x || !cam.click.y)) {
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

        Entity.prototype.kill = out.kill = function (isWinner) {
            if (this.dead) {
                return
            }
            if (cam.following === this) {
                waitForFrames(o => cam.following = null, 50, 'follow')
            }
            if (!Entity.all.filter(o => o.isMarble).length && !gameEnded) {
                gameEnded = true;
                cam.endGame()
            }
            this.dead = true
            Entity.toKill.push(this)
            if (this.isMarble && !isWinner) {
                Entity.losers.push(this)
            }
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
        this.finished = false
        this.img = opts.img
        if (opts.img) {
            this.customImage = true
        } else {
            this.img = new Image()
            this.img.src = ""
            this.customImage = false

        }
        this.outOfBounds = () => {
            for (let i = 10; i--;) {
                if (Entity.all.length > 100) {
                    break
                }
                let p = new DeathParticle({ x: this.position.x, y: this.position.y, })
                p.isTemporary = true
            }
            this.tempKill()
        }
        this.collisionFilter.group = 0
        this.isMarble = true
        this.toggleable.push("img")
        this.toggleable.deleteWithin('angle')
        this.toggleable.deleteWithin('width')
        this.toggleable.deleteWithin('height')

        this.victory = function () {
            if (this.finished) {
                return
            }

            this.finished = true
            for (let i = 10; i--;) {
                if (Entity.all.length > 100) {
                    break
                }
                let p = new Confetti({ x: this.position.x, y: this.position.y, })
                p.isTemporary = true
            }
            if (this.isMarble) {
                Entity.placements.push(this)
            }
            this.kill(true)
        }
        Marble.prototype.illustrate = this.illustrate = function (frame) {
            if (!editorMode && !cam.frozen && this.isSleeping) {
                this.outOfBounds()
            }
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
        if (opts.shape !== 'circle') opts.shape = "rect"
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
class Circle extends Wall {
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {
        opts.shape = 'circle'
        super(opts)
        this.toggleable.deleteWithin('width')
        this.toggleable.deleteWithin('height')
        this.toggleable.push('size')
    }
}
class Ball extends Circle {
    static defaultColor = c.green
    static defaultSize = 20

    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {
        opts.isStatic = false
        opts.color ??= Ball.defaultColor

        super(opts)
        this.start.ignoreWind = this.ignoreWind = opts.ignoreWind ?? 0;
        this.start.respawn = this.respawn = opts.respawn ?? 0
        this.collisionFilter.group = 0
        this.toggleable.push('mass', 'restitution', 'ignoreWind', 'respawn')
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
        this.toggleable.push('restitution', 'mass', 'ignoreWind', 'respawn')

        this.start.ignoreWind = this.ignoreWind = opts.ignoreWind ?? false;
        this.start.respawn = this.respawn = opts.respawn ?? false
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
        opts.width ??= Blade.defaultWidth
        opts.height ??= Blade.defaultHeight
        opts.isStatic = false
        super(opts)
        this.collisionFilter.group = -1
        this.toggleable.push("frictionAir", "mass")
        this.draw = function () {
            Entity.prototype.draw.call(this)
            Body.setVelocity(this, { x: 0, y: 0 })
            if (!editorMode) {
                Body.setPosition(this, this.start)
            }
        }
    }
}
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
            if (!coll.isMarble && coll.ignoreWind == false || coll.isParticle) {
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


            ctx.moveTo(this.vertices[0].x - this.position.x, this.vertices[0].y - this.position.y)
            for (let i = 0, len = this.vertices.length; i < len; i++) {
                ctx.lineTo(this.vertices[i].x - this.position.x, this.vertices[i].y - this.position.y)

            }
            ctx.closePath()
            ctx.clip()
            ctx.beginPath()

            ctx.shadowBlur = 0

            ctx.fillStyle = this.color
            ctx.rotate(this.angle)
            for (let wind of this.winds) {
           if (!cam.frozen) {     wind.y -= 1 * this.windSpeed * 160
                if (Math.abs(wind.y) > this.height / 2 + 10) {
                    wind.y = this.height / 2

                }}
                ctx.beginPath()
                ctx.arc(wind.x, wind.y, 10, 0, Math.PI * 2)
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
            ctx.rotate(-this.angle)
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
class Portal extends Entity {
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {
        opts.isStatic = true
        opts.shape = 'circle'

        super(opts)
        this.hint = 'Press clone to copy changes between portals'
        this.interval = opts.interval || 50
        this.size = this.circleRadius
        this.pair = null
        this.active = true
        this.isSensor = true
        this.toggleable.push("interval")

        this.onenterplaymode = function () {
            this.active = true
        }
        this.kill = function () {
            Entity.all.forEach(o => {
                if (o.pair === this) {
                    o.pair = null
                    o.kill()
                }

            }
            )
            Entity.prototype.kill.call(this)
        }
        if (!this.pair) {
            for (let o of Entity.all) {
                if (o.CREATOR === Portal && !o.pair && o !== this) {
                    o.pair = this
                    this.pair = o
                    break
                }
            }
        }
        this.toggleable.push('size')
        this.toggleable.deleteWithin('width')
        this.toggleable.deleteWithin('height')
        this.toggleable.deleteWithin('angle')
        this.toggleable.deleteWithin('restitution')
        this.toggleable.deleteWithin('opacity')
        this.collision = function (coll) {
            if (coll === this?.pair || coll.isParticle || !this.pair || coll.isSensor) {
                return
            }
            if (this.active) {
                    for (let i = 10; i--;) {
                        if (Entity.all.length > 100) {
                            break
                        }
                        new PortalParticle({ x: coll.position.x, y: coll.position.y, })
                    }
                
                waitForFrames(() => (!editorMode) && (this.active = this.pair.active = true), this.interval, 'portal' + Math.max(this.id, this.pair.id), true)
                this.active = this.pair.active = false
                Body.setPosition(coll, this.pair.position)
                Body.setVelocity(coll, { x: -coll.velocity.x, y: -coll.velocity.y })
                Body.setAngularVelocity(coll, -Body.getAngularVelocity(coll) + 0.1)
            }
        }
        this.illustrate = function (f) {
            let mod = Math.sin(f / 40) * 3
            let scaleFactor = (this.circleRadius + mod) / 3
            let b = 0.3
            if (!this.active) {
                this.opacity = 0.3
            } else if (this.opacity !== 1 && !editorMode) {
                this.opacity += 0.1
            } else {
                this.opacity = 1
            }
            if (this.pair) {
                for (let o of Entity.all) {
                    if (o.pair === this && editorMode) {
                        ctx.beginPath()
                        ctx.moveTo(0, 0)
                        ctx.lineTo((o.position.x - this.position.x) / 2, (o.position.y - this.position.y) / 2)
                        let old = ctx.lineWidth
                        ctx.lineWidth = 4
                        stroke(this.color)
                        ctx.lineWidth = old
                        break
                    }
                }
            }
            ctx.beginPath()
            ctx.rotate(f / 100)
            ctx.arc(0, 0, this.circleRadius + mod, 0, Math.PI * 2)
            ctx.setLineDash([b * scaleFactor, b * scaleFactor, b * scaleFactor, b * scaleFactor, b * scaleFactor, b * scaleFactor]);
            fill(this.color)
            stroke(this.color)
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
class Goal extends Entity {
    static {
        Entity.allClasses[this.name] = this
    }
    constructor(opts) {
        opts.isStatic = true;
        opts.shape = 'rect'
        opts.width = 20;
        opts.height = 20
        super(opts)
        this.toggleable.deleteWithin('width')
        this.toggleable.deleteWithin('height')
        this.toggleable.deleteWithin('Name')
        this.toggleable.deleteWithin('angle')
        this.toggleable.deleteWithin('restitution')
        this.color = c.red
        for (let o of Entity.all) {
            if (o.CREATOR === Goal && o !== this) {
                o.kill()
            }
        }
        this.isSensor = true
        this.illustrate = function (f) {
            ctx.rotate(f / 100)

            ctx.save()
            ctx.lineWidth = 3

            for (let i = 0, arrows = 6; i < arrows; i++) {
                ctx.beginPath()
                ctx.moveTo(5, -50 + Math.abs(Math.cos(f / 20)) * 30)
                ctx.lineTo(-5, -50 + Math.abs(Math.cos(f / 20)) * 30)
                ctx.lineTo(-0, -46 + Math.abs(Math.cos(f / 20)) * 30)
                ctx.closePath()
                stroke(this.color)
                ctx.rotate(Math.PI * 2 / arrows)
            }
            ctx.restore()
            ctx.beginPath()
            ctx.lineWidth = 3
            ctx.arc(0, 0, 30 + Math.abs(Math.cos(f / 20)) * 30, 0, Math.PI * 2)
            stroke(this.color)
        }
        this.collision = function (coll) {
            if (!cam.firstPlace && coll.isMarble && !cam.frozen) {
                cam.firstPlace = coll;
                if (cam.cutscene.enabled) {
                    cam.freeze()
                    return
                }

            }
            if (coll.isMarble && !cam.frozen) {
                cam.firstPlace ??= coll
                coll.victory()
            }
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
        this.toggleable.deleteWithin('width')
        this.toggleable.deleteWithin('height')
        this.illustrate = function (e) {

            if (!editorMode) {
                if (!(e % this.interval) && !editorMode && !cam.frozen) {
                    Entity.gameSpawns = Entity.gameSpawns.shuffle()
                    let child = Entity.gameSpawns.pop()

                    if (child) {
                        child.x = this.position.x + ran.range(-this.SIZE.x / 2, this.SIZE.x / 2)
                        child.y = this.position.y + ran.range(-this.SIZE.y / 2, this.SIZE.y / 2)
                        child.restitution = +あ['#bounciness'].value
                        if (aValue) {
                            child.restitution *= 3
                            //i dont know but This is required for some reason and im so fucking confused literally kill
                            //me it makes no sense 😭 ive been trying to fix it for like an hour now i give up
                        }
                        let instance = new Marble(child)
                        instance.isTemporary = true

                    }
                }

            }


            ctx.rotate(e / 100)
            ctx.save()
            ctx.lineWidth = 3
            for (let i = 0, arrows = 6; i < arrows; i++) {
                ctx.beginPath()
                ctx.moveTo(5, -70 + Math.abs(Math.sin(e / 20)) * 50)
                ctx.lineTo(-5, -70 + Math.abs(Math.sin(e / 20)) * 50)
                ctx.lineTo(-0, -75 + Math.abs(Math.sin(e / 20)) * 50)
                ctx.closePath()
                stroke(this.color)
                ctx.rotate(Math.PI * 2 / arrows)
            }
            ctx.restore()
            ctx.beginPath()
            ctx.lineWidth = 3
            ctx.arc(0, 0, 30 + Math.abs(Math.sin(e / 20)) * 50, 0, Math.PI * 2)
            stroke(this.color)
        }

    }
}
class Particle extends Entity {
    constructor(opts) {
        if (new.target === Particle) {
            throw TypeError(`Abstract class ${new.target.name} not directly constructable`)
        }
        opts.isStatic = false;
        opts.shape = 'circle'
        super(opts)
        this.isParticle = true
        Body.setAngle(this, Math.random() * Math.PI * 2)
        this.isSensor = true;
        this.canBeSaved = false
        this.lifetime = opts.lifetime ?? -1
        this.illustrate = function (fr) {
            if (!(this.lifetime--) || this.opacity <= 0) {
                this.kill()
            }
            else this.particleDraw?.(smooth)
        }
    }
}
class Confetti extends Particle {
    constructor(opts) {
        super(opts)
        this.size = 10 + Math.random() * 20
        Body.setVelocity(this, { x: Math.random() * 5 * ran.choose(1, -1), y: Math.random() * 5 * ran.choose(1, -1) })
        this.text = ran.choose(...'⭐️✨️💯✅️💖')
        this.particleDraw = function (f) {
            if (this.opacity <= 0) {
                this.kill()
                return
            }
            Body.applyForce(this, this.position, { x: 0, y: -engine.gravity.y / 1000 })
            ctx.rotate(f / 20)
            this.opacity -= 0.02
            ctx.font = `${this.size}px ` + cam.easterEggs.gameFont
            ctx.textBaseline = "middle"
            ctx.textAlign = "center"
            ctx.fillStyle = this.color
            ctx.fillText(this.text, 0, 0)
        }
    }
}
class DeathParticle extends Confetti {
    constructor(opts) {
        super(opts)
        this.color = c.red
        this.text = ran.choose(...'⛔❌🚫💀👻')
    }
}
class PortalParticle extends Confetti {
    constructor(opts) {
        super(opts)
        this.color = c.red
        this.text = ran.choose(...'🌀🪄')
    }
}
let mouse = {
    x: 0,
    y: 0
}


update()

あ['#can'].addevent({
    mousemove(e) {
        mouse.x = e.offsetX
        mouse.y = e.offsetY
    },
    mouseup(e) {
        cam.click.x = cam.click.y = NaN

    },
    mousedown(e) {
        if (cam.frozen) {
            return
        }
        cam.click.x = e.offsetX
        cam.click.y = e.offsetY
        //      console.log(chosenEntity)
        if (select === "put" && editorMode && !level) {
            place(chosenEntity)
        }
        if (select === "edit" && !level) {
            editorMode && (cam.following = null)
        }
    }
})

function startGame(fade) {
    if (!editorMode) {
        cam.following = current = null

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
        for (let o of Entity.all) {
            o.onexitplaymode?.()
        }
    }
    else {
        //Enter Play Mode
        frame = 0
        for (let o of Entity.all) {
            o.onenterplaymode?.()
        }
        Entity.placements = []
        Entity.losers = []
        cam.behaviour = localStorage.getItem('cambehaviour') ?? 'leader'
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
    if (stats.hint) {
        new Elem({ tag: 'p', class: ['hint'], text: `Hint: ${stats.hint}`, parent: me })
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

        if (statName === 'angle') {
            new Elem({ tag: 'label', for: statName, text: 'Angle', parent: me })
            new Elem({ tag: 'input', class: ['write'], parent: me, id: statName, value: val * 180 / Math.PI })
        }

        if (statName === 'color') {
            new Elem({ tag: 'label', for: statName, text: 'Color', parent: me })
            new Elem({ tag: 'input', class: ['color'], type: 'color', parent: me, id: statName, value: val })
        }
        if (statName.match(/width|height|opacity|Name|mass|frictionAir|windSpeed|interval|size|ignoreWind|respawn|restitution/)) {
            new Elem({ tag: 'label', for: statName, text: statName.upper(), parent: me })
            new Elem({ tag: 'input', class: ['write'], parent: me, id: statName, value: val })
        }


    }

}
window.ctx = ctx
addEventListener('mousewheel', function (e) {
    //resize()
    cam.zoomChange = e.deltaY / 2000;
    cam.targetZoom = Math.max(0.1, cam.zoom - cam.zoomChange);
    cam.targetZoom = Math.abs(cam.targetZoom);
},)

addEventListener('keyup', function (e) {
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
},)
addEventListener('keydown', function (e) {
    if (!e.key) {
        return
    }
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
    let foundYou = Entity.toSpawn.find(o => o.id === +this.name)
    /*for (let o of Entity.toSpawn) {
        if (o.id === +this.name) {
            foundYou = o
            break
        }
    }*/

    foundYou.Name = this.value
}
function findMarbleImage() {
    if (!this.value.length) {
        return
    }
    let foundYou = Entity.toSpawn.find(o => o.id === +this.name)
    /*  for (let o of Entity.toSpawn) {
          if (o.id === +this.name) {
              foundYou = o
              break
          }
      }*/

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
    clone.Name = `${clone.CREATOR.name} ${clone.id}`
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



    Elem.elements.forEach(o => {
        if (o !== canvas) {
            o.content.classList.contains('hidden') &&  o.hide()
        }
    })
    canvas.appendIntoBody()
    document.body.style.padding = '0px';
    document.body.style.overflow='hidden';
    (async function () {
        let url = new URL('./levels/'+aValue+'.txt',location.href)
        let levelData = await fetch(url.href)
        /*if (!levelData.ok) {
            levelData = await fetch('/levels/' + aValue + '.txt')
        }*/
        let text = await levelData.text()
        あ.elements.forEach(o=>o.hide())
        canvas.show()
        Elem.$('#secondMenu').appendInto(Elem.$('#camBehaviour'))
        Elem.$('#camBehaviour').children.forEach(o => o.content.style.display = 'flex')
        
        Load(text)
        cam.x = cam.y = NaN
        //startGame()
        Elem.$('#camBehaviour').content.value = cam.behaviour
        Elem.$('#camSpeed').content.value = cam.easterEggs.lerp
        if (cam.cutscene.enabled) {
            Elem.$('#cutscenes').content.checked = true
        } else {
            Elem.$('#cutscenes').content.checked = false

        }
        Elem.$('.gameMenu').forEach(o => {
            if (o.content.id !== 'secondMenu') {
                o.content.style.display = 'flex'
            } else {
                o.content.style.display = 'grid'
            }
        })
        Elem.$('#startmenu').anim({ class: ['slide-in-blurred-top'] }, () => {
            Elem.$('#gameStartButton').addevent(['click', (function anonymous() {
                this.content.noevent('click')
                this.content.parent.anim({ class: ['slide-out-blurred-top'] }, () => {
                    let checked = Elem.$('#cutscenes').content.checked
                    localStorage.setItem('cutscenes', checked)
                    if (checked + '' === 'true') {
                        cam.cutscene.enabled = true
                    } else {
                        cam.cutscene.enabled = false
                    }
                    let bhv = Elem.$('#camBehaviour').content.value
                    cam.behaviour = bhv
                    if ((['leader','loser','middle','outliers','average','random','free'].some(o=>o===cam.behaviour))) {
                        localStorage.setItem('cambehaviour', bhv)
                    }
                    localStorage.setItem('camspeed', Elem.$('#camSpeed').content.value)

                    cam.easterEggs.lerp = +localStorage.getItem('camspeed') ?? 0.1

                    Elem.$('#startmenu').hide()
                    waitForFrames(a => {
                        cam.following = cam.existinggoal ?? cam.existingspawn
                        if (!cam.cutscene.enabled) {
                            cam.x = cam.existingspawn?.x ?? cam.x
                            cam.y = cam.existingspawn?.y ?? cam.y
                            cam.following = null
                            return startGame()
                        }
                        waitForFrames(a => { cam.following = cam.existingspawn; waitForFrames(startGame, 100, 'start') }, 100, 'outro')
                    }, 30, 'intro')

                },true)
            })])
            Elem.$('#startmenu').removeClass('slide-in-blurred-top');
            Elem.$('#gameStartButton').content.focus()
        })

    })()
    level = true


}

function lerp(start, end, t) {
    return start + (end - start) * t
}
new Elem({
    id: 'uploadedData', type: 'file', tag: 'input', events: [
        ['change', (o) => {
            let file = o.target.files[0]
            let reader = new FileReader()
            reader.readAsText(file)
            reader.onload = (data) => {
                Elem.$('#textData').content.value = data.target.result; Load(); Elem.$('#textData').content.value = ''
            }
        }]
    ]
}, true).hide()

function turnToSettingsMenu() {
    Elem.$('#secondMenu').children.forEach(o =>
        o.show()

    )
    あ['#gameSettings'].kill()
}
/*addEventListener('resize',o=>{
    if (level) {
       resize
    }
})*/
function resize() {
    let {innerWidth,innerHeight} = window
    if (canvas.height !== innerHeight) canvas.height = innerHeight
    if (canvas.width !== innerWidth) canvas.width = innerWidth
}
