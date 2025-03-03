import $ from '../../yay.js'
import color from '../../color.js'
import { on, getObjUrl as cou, until, download, reqFile, getObjUrl, } from '../../handle.js'
import * as math from '../../num.js'
import { getJson } from '../../arrays.js'
let leftControls = $.gid('left-controls')
leftControls.createState(0, $('div'))
$.gid('reset-cam').on({
    click() {
        game.postMessage('resetcam')
    }
})
function clearMarbles() {
    marbles.clear()
    count = 0
    // imageCache.clear()
    racers.destroyChildren()
    racers.push($(`<h3>No marbles added :(</h3>`))
}
let mport = $.gid('import-button')
    .on({
        async click() {
            let f = await reqFile('.json')
            let url = getObjUrl(f)
            let data = await getJson(url)
            clearMarbles()
            game.getLevelFromJSON(data)
            for (let [, marble] of marbles) {
                addMarble({
                    color: marble.color,
                    image: marble.image,
                    name: marble.name
                }, true)
            }
        }
    })
let xport = $.gid('export-button')
    .on({
        async click() {
            let ctx = document.createElement('canvas').getContext('2d')
            Object.assign(ctx.canvas, {
                width: 256,
                height: 256
            })
            let obj = {
                __proto__: null, settings: Object.fromEntries(Object.entries(settings).map(([p, v]) => [p, +v])),
                racers: [...marbles.values()], map: Array.from(entities.values(), o => {
                    let spawn = { ...o.spawn }
                    if (o.constructor.name !== 'obj')
                        spawn.type = o.constructor.name
                    return spawn
                }
                )
            }
            let allImages = []
            let outShapes = []
            let seenImages = new Map
            let allShapes = []
            let seenShapes = new Map

            for (let n of obj.racers.concat(obj.map)) {
                let { image } = n
                if (image !== null && image !== 'none') {
                    if (seenImages.has(image)) {
                        n.image = seenImages.get(image)
                    } else {
                        let img = new Image()
                        img.src = imageCache.get(image).src
                        await until(img, 'load')
                        await img.decode()
                        ctx.drawImage(img, 0, 0, 256, 256)
                        let data = ctx.canvas.toDataURL('image/png', 0.5)
                        allImages.push(data)
                        seenImages.set(image, allImages.length - 1)
                        n.image = allImages.length - 1
                    }
                } else {
                    delete n.image
                }

                let { shape } = n
                if (Array.isArray(shape)) {
                    if (typeof shape[0]?.[0] === 'number') {
                        shape = JSON.stringify(shape)
                        if (seenShapes.has(shape)) {
                            n.shape = seenShapes.get(shape)
                        } else {
                            allShapes.push(shape)
                            seenShapes.set(shape, -(allShapes.length))
                            n.shape = -(allShapes.length)
                        }
                    } else {
                        let data = n.shape.map(o => o.getAttribute('d').toString()).join('|')
                        if (seenShapes.has(data)) {
                            n.shape = seenShapes.get(data)
                        } else {
                            seenShapes.set(data, -(allShapes.length + 1))
                            allShapes.push(data)
                            outShapes.push(data)
                            n.shape = -(allShapes.length)
                        }
                    }
                }

                for (let i in n) {
                    let val = n[i]
                    if (val === base[i]) {
                        delete n[i]
                    } else {
                        switch (i) {
                            case 'opacity':
                                if (val === 1) delete n[i]
                                break
                            case 'angle':
                                if (val === 0) delete n[i]
                                break
                            case 'isStatic':
                                if (val === false) delete n[i]
                                break
                            case 'type':
                                if (val === 'body') delete n[i]
                                break
                        }
                    }
                }
            }
            obj.shapes = allShapes
            obj.images = allImages
            download(new Blob([JSON.stringify(obj)]), 'data.json')
        }
    })
let cached = new WeakSet
let cachedVertices = new WeakSet
on(window, {
    load() {
        $.body.show3()
    }
})
$.gid('right-button')?.on({
    async click() {
        if (this.parent.anims.length) return
        if (this.textContent === 'Hide') {
            this.textContent = 'Show'
            await this.parent.animate([{ right: '0px', opacity: '1' }, { right: '-150px', opacity: '0.5' }], { duration: 400, easing: 'ease', }).finished
            this.parent.setStyles({ right: '-150px', opacity: '0.5' })
        }
        else {
            this.textContent = 'Hide'
            await this.parent.animate([{ right: '-150px', opacity: '0.5' }, { right: '0px', opacity: '1' }], { duration: 400, easing: 'ease', }).finished
            this.parent.setStyles({ right: '0px', opacity: '1' })
        }
    }
})
let uploadButton = $.gid('upload-images').on({
    click() {
        files.click()
    }
})
function updateImages(file) {
    if (file instanceof Image) {
        var url = file.src
    }
    else {
        var url = cou(file)
    }
    cached.add(file)
    game.postMessage({
        title: file.name,
        url
    })
    for (let el of document.getElementsByName('marbleimageselect')) {
        el = $(el)
        // el.destroyChildren()
        // el.$(`<option value="none">None</option>`)
        el.last.after = $(`<option value="${url}">${file.name || file.title}</option>`)
        // el.push(...Array.from(imageCache.entries(),
        // function ([title, src]) {
        // console.log(src, title)
        // return $(`<option value="${src}">${title}</option>`)

    }
}
let files = uploadButton.after.on({
    change() {
        for (let file of this.files) {
            if (cached.has(file)) {
                //  Do something...
            }
            else updateImages(file)
        }
        message({ data: 'hideData' })
    }
})
function message(e) {
    let { data } = e
    if (typeof data === 'string') switch (data) {
        case 'hideData': return leftControls.destroyChildren(), window.selected = null, leftControls.setState(0), game.postMessage("resetMouse")
        case 'showData': if (selected != null && leftControls.currentState !== selected.id) {
            if (!isPaused) return
            if (!leftControls.getState(selected.id)) {
                let { dontShow } = selected
                let theState =
                    $('<div style="display:grid;"></div>', {},
                        $(`h2`, {
                            attributes: {
                                name: "title"
                            },
                            textContent: selected.label
                        }),
                        $(`<label title="Color" class="stat" for="c-${selected.id}">Color</label>`, {
                            start() {
                                dontShow.has('color') && this.hide3()
                            }
                        }, $('input%color', {
                            attributes: {
                                id: `c-${selected.id}`,
                                name: 'color',
                                title: 'Color',
                                value: selected.spawn.color,
                                placeholder: selected.spawn.color
                            },
                            events: {
                                input() {
                                    selected.spawn.color = this.value
                                    selected.reset()
                                },
                            }
                        })),
                        $(`<label title="Bounciness" class="stat" for="r-${selected.id}">Bounciness</label>`, {
                            start() {
                                dontShow.has('restitution') && this.hide3()
                            }
                        },
                            $(`<input type="number" min="0" placeholder="Bounciness" value="${selected.spawn.restitution}" id="r-${selected.id}">`, {
                                events: {
                                    input() {
                                        selected.spawn.restitution = +this.value
                                        selected.reset()
                                    }
                                }
                            })),
                        $(`<label title="Density" class="stat" for="d-${selected.id}">Density</label>`, {
                            start() {
                                dontShow.has('density') && this.hide3()
                            }
                        },
                            $(`<input type="number" min="0" placeholder="Density" value="${selected.spawn.density}" id="d-${selected.id}">`, {
                                events: {
                                    input() {
                                        selected.spawn.density = +this.value || 1
                                        selected.reset()
                                    }
                                }
                            })),
                        $(`<label title="Scale" class="stat" for="S-${selected.id}">Scale</label>`, {
                            start() {
                                dontShow.has('scale') && this.hide3()
                            }
                        },
                            $(`<input type="number" max="9007199254740991" min="-9007199254740991" placeholder="Negative = Mirrored" value="${selected.spawn.radius}" id="S-${selected.id}">`, {
                                events: {
                                    input() {
                                        selected.spawn.radius = +this.value || 1
                                        selected.reset()
                                    }
                                }
                            })),
                        $(`<label title="opacity" class="stat" for="o-${selected.id}">Opacity</label>`, {
                            start() {
                                dontShow.has('opacity') && this.hide3()
                            }
                        },
                            $(`<input class="uhh" min="0" max="1" step="0.05" type="range" placeholder="opacity" id="o-${selected.id}" value="${selected.render.opacity}">`, {
                                events: {
                                    input() {
                                        selected.spawn.opacity = math.clamp(this.value, 0, 1)
                                        selected.reset()
                                    }
                                }
                            })
                        ),
                        $('<label class="stat uhh standout" title="angle in degrees" for="angle">Angle°</label>', {
                            start() {
                                dontShow.has('angle') && this.hide3()
                            }
                        },
                            $(`<input type="range" id="angle">`, {
                                events: {
                                    input() {
                                        selected.spawn.angle = math.toRad(+this.value)
                                        this.after.value = (+this.value)
                                        selected.reset()
                                    }
                                },
                                attributes: {
                                    min: -180,
                                    step: 1,
                                    max: 180,
                                    value: math.toDeg(selected.angle)
                                }
                            }), $('<input type="number" id="angle-alt" placeholder="deg">', {
                                events: {
                                    input() {
                                        let val = math.clamp(+this.value, -180, 180)
                                        selected.spawn.angle = math.toRad(val)
                                        this.before.value = val
                                        selected.reset()
                                    }
                                },
                                attributes: {
                                    min: -180,
                                    step: 1,
                                    max: 180,
                                    value: math.toDeg(selected.angle)
                                }
                            })),
                        $(`<label for="select-image" title="Image" class="stat">Image</label>`, {
                            start() {
                                dontShow.has('image') && this.hide3()
                            }
                        },
                            $('(will not animate in game)'.small().italics().small()),
                            $('<select title="select image" id="select-image"></select>', {
                                events: {
                                    change() {
                                        if (this.value === 'none') selected.setImage(null)
                                        else selected.setImage(this.value)
                                    }
                                }
                            }),
                            //                                $(`<div class="preview" id="img-${selected.id}"></div>`),
                            // $('<label></label>') $("<select>Smoothing Quality</select>")
                        ),
                        $(`<label class="stat" style="display:inline;" for="s-${selected.id}">Static<label>`, {
                            start() {
                                dontShow.has('static') && this.hide3()
                            }
                        },
                            $(`<input type="checkbox" id="s-${selected.id}">`, {
                                events: {
                                    change() {
                                        selected.spawn.isStatic = !!this.checked
                                        selected.reset()
                                    }
                                },
                                attributes: {
                                    checked: selected.static
                                }
                            })
                        ),
                    )
                if (selected.constructor.name === 'spawn') $(`<label class="stat" for="sp-${selected.id}">Spawn Rate</label>`, null,
                    $(`<input value="${selected.spawnRate}" type="number" id="sp-${selected.id}">`, {
                        events: {
                            change() {
                                selected.spawn.spawnRate = +this.value
                                selected.reset()
                            }
                        }
                    })).parent = theState
                theState.push($(`<button class="cute-green-button">Clone</button>`, {
                    events: {
                        click() {
                            selected.clone()
                        }
                    }
                }),
                    $(`<button class="red cute-green-button">Delete</button>`, {
                        events: {
                            click() {
                                leftControls.deleteState(selected.id)
                                selected.remove()
                                message({ data: 'hideData' })

                            }
                        }
                    }))
                leftControls.createState(selected.id, theState)
            }
            let state = leftControls.getState(selected.id)
            let col = $(state.querySelector('[name=color]'))
            let isStatic = $(state.getElementById(`s-${selected.id}`))
            isStatic.checked = selected.isStatic
            let angleInput = $(state.getElementById('angle-alt'))
            let angleMain = $(state.getElementById('angle'))
            let opacity = $(state.getElementById(`o-${selected.id}`))
            opacity.value = selected.render.opacity
            angleMain.value = angleInput.value = math.toDeg(selected.angle)
            let select = $(state.querySelector('select'))
            let density = $(state.getElementById(`d-${selected.id}`))
            density.value = selected.density
            let img = $(state.getElementById('select-image'))
            let scale = $(state.getElementById(`S-${selected.id}`))
            scale.value = selected.getScale()
            let restitution = $(state.getElementById(`r-${selected.id}`))
            restitution.value = selected.restitution
            select.destroyChildren()
            if (selected.constructor.name === 'spawn') $(state.getElementById(`sp-${selected.id}`)).value = selected.spawnRate
            select.push($(`<option value="none">None</option>`), ...Array.from(imageCache.entries(),
                function ([title, src]) {
                    let s = ''
                    if (src.src) src = src.src
                    if (imageCache.get(title).src === selected.spawn.image) s = 'selected'
                    return $(`<option value="${src}" ${s}>${title}</option>`)
                }))
            col.value = selected.spawn.color
            leftControls.setState(selected.id)
        } else if (selected == null) leftControls.setState(0)
            break
    }
}
on(window, {
    message
})
let { contentWindow: game } = $.qs('iframe')
let isPaused = true
let isPlacing = true
let toggle = $.gid('play-button').on({
    click() {
        isPaused = !isPaused
        this.textContent = isPaused ? (leftControls.show(), 'Play') : (leftControls.hide(), 'Pause')
        game.postMessage('Toggle')
    }
})
let placingOrMoving = $.gid('place-toggle').on({
    click() {
        isPlacing = !isPlacing
        this.styles.filter = `hue-rotate(${isPlacing ? '300' : '70'}deg) brightness(80%)`
        game.postMessage(this.textContent = isPlacing ? 'Placing' : 'Moving')
    }
})
let chosen = $.gid('place-entity')
    .on({
        change() {
            if (this.value === 'svg') return uploadSvgs.showPicker()
            game.postMessage({ select: this.value })
        }
    })
window.addSVG = addSVG
function addSVG(data, name) {
    chosen.last.before = ($(`<option value="${name}">${name}</option>`))
    chosen.value = name
    game.postMessage({ select: name })
    game.postMessage({
        title: name,
        svg: data
    })
}
let uploadSvgs = $(`<input type="file" accept=".svg,.json" multiple></input>`, {
    events: {
        async change() {
            for (let file of this.files) {
                if (cachedVertices.has(file)) {
                    //  Do something...
                }
                else {
                    if (file.type === 'application/json') {
                        file.text().then(data => {
                            data = JSON.parse(data)
                            if (!Array.isArray(data) || !data.length) {
                                throw TypeError('Bad data :(')
                            }
                            game.postMessage({ select: file.name })
                            game.postMessage({
                                title: file.name,
                                vertices: data
                            })
                            chosen.last.before = ($(`<option value="${file.name}">${file.name}</option>`))
                            chosen.value = file.name
                            cachedVertices.add(file)
                        })
                    }
                    else {
                        cachedVertices.add(file)
                        file.text().then(data => {
                            chosen.last.before = ($(`<option value="${file.name}">${file.name}</option>`))
                            chosen.value = file.name
                            game.postMessage({ select: file.name })
                            game.postMessage({
                                title: file.name,
                                svg: data
                            })
                        })
                    }
                }
            }
        }
    }
})
window.addMarble = addMarble
function addMarble({ name, image, color: col }, noadd) {
    if (!this) return addMarble.call(addMarbleButton, { name, image, color: col }, noadd)
    name ??= `Marble ${count}`
    col ??= color.choose()
    noadd ?? marbles.set(count, {
        __proto__: null,
        name: name,
        image: null,
        color: col
    })
    let me = marbles.get(count)
    racers.first.hide()
    let n = racers.$(`div.racer #marble-${count}`, null,
        $('div', null,
            $(`<input type="color" value="${col}">`, {
                events: {
                    input() {
                        me.color = this.value
                    }
                }
            }),
            $(`<input class="cute-green" placeholder="Marble name" value="${name}">`, {
                events: {
                    change() {
                        me.name = this.value
                    }
                }
            })
        ),
        $(`<label>Image: </label>`, null,
            $(`<select name="marbleimageselect"><option value="none">None</option></select>`, {
                events: {
                    change() {
                        me.image = this.value
                    }
                }
            },
                ...Array.from(imageCache.entries(),
                    function ([title, src]) {
                        let checked = ''
                        if (src.src) src = src.src
                        if (title === image) {
                            checked = 'selected'
                        }
                        return $(`<option value="${title}" ${checked}>${title}</option>`)
                    })
            )
        ),
        $(`<button class="cute-green-button red">Delete</button>`, {
            events: {
                click() {
                    marbles.delete(this.parent.flags)
                    this.parent.destroy()
                }
            }
        })
    )
    n.flags = count
    ++count
}
let racers = $.gid('racer-holder')
let count = 0
let addMarbleButton = $.gid('add-marble-button')
    .on({
        click: addMarble
    })
/*
    <div class="racer">
                            <div>
                                <input type="color" value="#FF0000">
                                <input class="cute-green" placeholder="Name">
                            </div>
                            <label>
                                Image:
                                <select>
                                    <option>None</option>
                                </select>
                            </label>
                            <button class="cute-green-button red">Delete</button>
                        </div>
*/