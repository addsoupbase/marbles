import $ from 'https://addsoupbase.github.io/yay.js'
import color from 'https://addsoupbase.github.io/color.js'
import { on, getObjUrl as cou } from 'https://addsoupbase.github.io/handle.js'
import * as math from 'https://addsoupbase.github.io/num.js'
let leftControls = $.gid('left-controls')
leftControls.createState(0, $('div'))
$.gid('reset-cam').on({
    click() {
        game.postMessage('resetcam')
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
let files = uploadButton.after.on({
    change() {
        for (let file of this.files) {
            if (cached.has(file)) {
                //  Do something...
            }
            else {
                cached.add(file)
                game.postMessage({
                    title: file.name,
                    url: cou(file)
                })

            }
        }
        for (let el of document.getElementsByName('marbleimageselect')) {
            el = $(el)
            el.destroyChildren()
            el.$(`<option value="none">None</option>`)
            setTimeout(() =>
                el.push(...Array.from(imageCache.entries(),
                    function ([title, src]) {
                        console.log(src, title)
                        return $(`<option value="${src}">${title}</option>`)
                    })), 1000)
        }
        message({ data: 'hideData' })

    }
})
function message(e) {
    let { data } = e
    if (typeof data === 'string') switch (data) {
        case 'hideData': return leftControls.destroyChildren(), window.selected = null, leftControls.setState(0), game.postMessage("resetMouse")
        case 'showData': if (selected != null && leftControls.currentState !== selected.body.id) {
            if (!isPaused) return
            if (!leftControls.getState(selected.body.id)) {
                let { dontShow } = selected
                let theState =
                    $('<div style="display:grid;"></div>', {},
                        $(`h2`, {
                            attributes: {
                                name: "title"
                            },
                            textContent: selected.body.label
                        }),
                        $(`<label title="Color" class="stat" for="c-${selected.body.id}">Color</label>`, {
                            start() {
                                dontShow.has('color') && this.hide3()
                            }
                        }, $('input%color', {
                            attributes: {
                                id: `c-${selected.body.id}`,
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
                        $(`<label title="Bounciness" class="stat" for="r-${selected.body.id}">Bounciness</label>`, {
                            start() {
                                dontShow.has('restitution') && this.hide3()
                            }
                        },
                            $(`<input type="number" min="0" placeholder="Bounciness" value="${selected.spawn.restitution}" id="r-${selected.body.id}">`, {
                                events: {
                                    input() {
                                        selected.spawn.restitution = +this.value
                                        selected.reset()
                                    }
                                }
                            })),
                        $(`<label title="Density" class="stat" for="d-${selected.body.id}">Density</label>`, {
                            start() {
                                dontShow.has('density') && this.hide3()
                            }
                        },
                            $(`<input type="number" min="0" placeholder="Density" value="${selected.spawn.restitution}" id="d-${selected.body.id}">`, {
                                events: {
                                    input() {
                                        selected.spawn.density = +this.value || 1
                                        selected.reset()
                                    }
                                }
                            })),
                        $(`<label title="Scale" class="stat" for="S-${selected.body.id}">Scale</label>`, {
                            start() {
                                dontShow.has('scale') && this.hide3()
                            }
                        },
                            $(`<input type="number" min="0" placeholder="Restitution" value="${selected.spawn.radius}" id="S-${selected.body.id}">`, {
                                events: {
                                    input() {
                                        selected.spawn.radius = +this.value || 1
                                        selected.reset()
                                    }
                                }
                            })),
                        $(`<label title="opacity" class="stat" for="o-${selected.body.id}">Opacity</label>`, {
                            start() {
                                dontShow.has('opacity') && this.hide3()
                            }
                        },
                            $(`<input class="uhh" min="0" max="1" step="0.05" type="range" placeholder="opacity" id="o-${selected.body.id}" value="${selected.opacity}">`, {
                                events: {
                                    input() {
                                        selected.opacity = math.clamp(this.value, 0, 1)
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
                                        this.after.value = (+this.value).toPrecision(4)
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
                                        this.before.value = val.toPrecision(4)
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
                                        if (this.value === 'none') selected.image = null
                                        else selected.image = this.value
                                    }
                                }
                            }),
                            //                                $(`<div class="preview" id="img-${selected.body.id}"></div>`),
                            // $('<label></label>') $("<select>Smoothing Quality</select>")
                        ),
                        $(`<label class="stat" style="display:inline;" for="s-${selected.body.id}">Static<label>`, {
                            start() {
                                dontShow.has('static') && this.hide3()
                            }
                        },
                            $(`<input type="checkbox" id="s-${selected.body.id}">`, {
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
                if (selected.constructor.name === 'spawn') $(`<label class="stat" for="sp-${selected.body.id}">Spawn Rate</label>`, null,
                    $(`<input value="${selected.spawnRate}" type="number" id="sp-${selected.body.id}">`, {
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
                                leftControls.deleteState(selected.body.id)
                                selected.remove()
                                message({ data: 'hideData' })

                            }
                        }
                    }))
                leftControls.createState(selected.body.id, theState)
            }
            let state = leftControls.getState(selected.body.id)
            let col = $(state.querySelector('[name=color]'))
            let isStatic = $(state.getElementById(`s-${selected.body.id}`))
            isStatic.checked = selected.static
            let angleInput = $(state.getElementById('angle-alt'))
            let angleMain = $(state.getElementById('angle'))
            let opacity = $(state.getElementById(`o-${selected.body.id}`))
            opacity.value = selected.opacity
            angleMain.value = angleInput.value = math.toDeg(selected.angle)
            let select = $(state.querySelector('select'))
            let density = $(state.getElementById(`d-${selected.body.id}`))
            density.value = selected.density
            let scale = $(state.getElementById(`S-${selected.body.id}`))
            scale.value = selected.scale
            let restitution = $(state.getElementById(`r-${selected.body.id}`))
            restitution.value = selected.spawn.restitution
            select.destroyChildren()
            if (selected.constructor.name === 'spawn') $(state.getElementById(`sp-${selected.body.id}`)).value = selected.spawnRate
            select.push($(`<option value="none">None</option>`), ...Array.from(imageCache.entries(),
                function ([title, src]) {
                    console.log(src, title)
                    return $(`<option value="${src}">${title}</option>`)
                }))
            col.value = selected.spawn.color
            leftControls.setState(selected.body.id)


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
game.postMessage('Placing')
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
            if (this.value === 'svg') return uploadSvgs.click()
            game.postMessage({ select: this.value })
        }
    })
let uploadSvgs = $(`<input type="file" accept=".svg,.txt" multiple></input>`, {
    events: {
        async change() {
            for (let file of this.files) {
                if (cachedVertices.has(file)) {
                    //  Do something...
                }
                else {
                    cachedVertices.add(file)
                    file.text().then(data=> {
                        chosen.push($(`<option value="${file.name}">${file.name}</option>`))
                        chosen.value = file.name
                        game.postMessage({
                            title: file.name,
                            svg: data
                        })
                    })
                }
            }
        }
    }
})
let racers = $.gid('racer-holder')
let count = 0
let addMarbleButton = $.gid('add-marble-button')
    .on({
        click() {
            ++count
            let c = color.choose()
            marbles.set(count, {
                __proto__: null,
                name: `Marble ${count}`,
                image: 'none',
                color: c
            })
            let me = marbles.get(count)
            racers.first.hide()
            let n = racers.$(`div.racer #marble-${count}`, null,
                $('div', null,
                    $(`<input type="color" value="${c}">`, {
                        events: {
                            input() {
                                me.color = this.value
                            }
                        }
                    }),
                    $(`<input class="cute-green" placeholder="Marble name" value="Marble ${count}">`, {
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
                                console.log(src, title)
                                return $(`<option value="${src}">${title}</option>`)
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
        }
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