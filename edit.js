const serverURL = 'http://localhost:8000/'

import $, { h } from '../yay.js'
import C from '../color.js'
import * as m from '../num.js'
let { placing, startgame, container, left, right,
    entityname,
    dialog,
    imageholder,
    addracer,
    racerholder,
    exportlevel,
    view,
    selectimage,
    testlevel,
    color,
    uploadimages,
    angleAsDegrees,
    angleSlider,
    restitution,
    clonebutton,
    deletebutton,
    resetcamera,
    density,
    friction,
    subleft,
    constraintholder,
    frictionAir,
    scaleX,
    scaleY,
    isStatic,
    isSensor,
    searchform,
    // entitysearchfield,
    searchresults,
    importlevel,
    publishlevel,
    // addconstraint,
    newconstraint
} = $.id
let savedWork = false
publishlevel.on({
    async click() {
        let a = JSON.parse(await (await h.reqFile('.json')).text())
        try {
            let res = await fetch(serverURL, { method: "POST", body: JSON.stringify(a), mode: 'cors' })
            if (!res.ok) throw res.status
            if (confirm("Level published! Would you like to play it?")) {
                location.assign(new URL(`./?level=${encodeURIComponent(await res.text())}`, location))
            }
        }
        catch (e) {
            if (typeof e === 'number') {
                switch (e) {
                    case 422: alert('Malformed Request')
                        break
                    case 409: alert('Level title taken')
                        break
                    default: alert("Unknown Error Occurred")
                }
            }
            else alert(e)
        }
    }
})
exportlevel.on({
    click: exportTheLevel
})
importlevel.on({
    click: importTheLevel
})
function exportTheLevel() {
    let title = prompt('Enter a level title', 'My level 1')
    if (!title?.trim()) return
    let author = prompt("Enter Author", 'Unknown')
    if (!author.trim()) return
    game.postMessage({
        name: 'exportLevel',
        title,
        author
    })
    savedWork = true
}
async function importTheLevel() {
    let n = await h.requestFile('application/json')
    let json = await n.text()
    index = 0
    racersDiv.destroyChildren()
    game.postMessage({
        name: 'importLevel',
        json
    })
}
let index = 0
let button
dialog.on({
    close() {
        this.hide(3)
    }
})
let racersDiv
dialog.push($("div", {},
    $("<h1>Add Racer</h1>"),
    racersDiv = $(`<div class="inputholder" style="max-height:200px;overflow-y:auto"></div>`, {},
    ),
    button = $`<button class="cute-green-button">Add Racer</button>`.on({
        click() {
            let col = C.choose()
            game.postMessage({
                name: 'createRacer',
                value: { index: racersDiv.childElementCount, color: col }
            })
        }
    }),
    $("button .cute-green-button", {
        textContent: "Close",
        events: {
            click() {
                dialog.close()
            }
        }
    })
))
clonebutton.on({
    click() {
        game.postMessage({
            name: 'clone'
        })
    }
})
deletebutton.on({
    click() {
        game.postMessage({
            name: 'delete'
        })
        subleft.hide(3)
    }
})
let searchCount = 0
// entitysearchfield.on({
//     search() {
//         alert(13)
//     }
// })
resetcamera.on({
    click() {
        game.postMessage({
            name: 'resetCameraPosition'
        })
        view.focus()
    }
})
searchresults.delegate({
    click() {
        game.postMessage({
            name: 'focusEntityFromSearchField',
            id: +this.attr.$id
        })
        view.focus()
    }
}, o => o.matches('samp'))
async function queryFromGame(search = '') {
    let a = h.until(window, 'message', 'messageerror', ({ message }) =>
        message.data.name === 'entityQueryResult'
    )
    game.postMessage({
        name: 'entityQuery',
        search
    })
    return await a
}
searchform.debounce({
    async $submit() {
        searchresults.destroyChildren()
        let queue = searchCount
        let a = await queryFromGame(this.search.value)
        if (queue !== searchCount) return
        ++searchCount
        let { data } = a
        searchresults.destroyChildren().fadeIn()
        if (data.result.length)
            for (let { id, label, color } of data.result) {
                let col = C(color)
                col.opacity = .18
                searchresults.push($`<samp data-id="${id}" title="Click to focus ${label}" role="link" style="text-decoration-color: ${color}; --tap-highlight-color: ${col.toString('rgba')}">${label}</samp>`)
            }
        else searchresults.push($('<p class="none">No results</p>'))
    }
}, 300)
left.delegate({
    input: updateStats
})
/*  entitysearch.on({
      blur() {
          selectFieldOpened=false
      },
      async click() {
          // alert(123)
          selectFieldOpened=true
          let a = await h.until(window, 'message')
          while(true) {
              if (!selectFieldOpened)return
              console.log('Loop')
              let {data} = a
              if (data.type === 'entityQuery') break
              else a = await h.until(window, 'message')
          }
          console.log('Loop done')
      }
  })*/
/*left.on({
    focusout() {
        view.focus()
    }
})*/
function updateStats() {
    entityname.styles.textDecorationColor = color.value
    game.postMessage({
        name: 'updateStats',
        value: {
            scale: {
                x: m.clamp(+scaleX.value || 1, -9999, 9999),
                y: m.clamp(+scaleY.value || 1, -9999, 9999)
            },
            color: color.value,
            friction: +friction.value || 1,
            frictionAir: m.clamp(+frictionAir.value || 1, -1, 1),
            isStatic: isStatic.checked,
            isSensor: isSensor.checked,
            density: +density.value || 1,
            restitution: m.clamp(+restitution.value || 1, 0, 999),
            angle: +angleSlider.angle || 0,
            label: entityname.textContent,
            image: selectimage.value,
            constraints: Array.from(constraintholder.children, function (o, i) {
                let inputs = o.querySelectorAll('input')
                let index = 0
                return {
                    length: +inputs[index++].value || 0,
                    damping: +inputs[index++].value || 0,
                    stiffness: +inputs[index++].value || 0,
                    offsetA: {
                        x: +inputs[index++].value || 0,
                        y: +inputs[index++].value || 0
                    },
                    offsetB: {
                        x: +inputs[index++].value || 0,
                        y: +inputs[index++].value || 0
                    }
                }
            })
        }
    })
}
let game = frames[0]
let active = false
h.on(window, {
    message(e) {
        let { data } = e
        switch (data.name) {
            default:
                console.warn(`Unknown message type!`, data.name)
                debugger
                break
            case 'importImage': {
                importImage(data.url)
            }
            case 'scrollJointsIntoView':
                constraintholder.last?.first.focus()
                break
            case 'showEntityControls': showEntityControls(data.value)
                break
            case 'hideEntityControls': {
                subleft.hide(3)
            }
                break
            case 'addRacerNodes': {
                let { color: col, index, label, image = 'none' } = data.racer
                let thing = button.before
                let a = $`<div class="hiii">
                <div>
                <h2 contenteditable="plaintext-only" spellcheck="false" class="editable" style="width:fit-content;place-self:center" autofocus>${label}</h2>
                </div>
                 <div>
                <label>Image
                <select><option>None</option></select>
                </label>
                </div>
                <div>
                <label>Color
                <input type="color" value="${col.toString('hex')}"></label>
                <button class="del bad">Delete</button>
                </div>
                </div>`
                // ++index
                let { select } = a.fromQuery

                for (let o of selectimage) {
                    let clone = o.clone
                    if (clone.value === image) {
                        clone.attr.selected = true
                    }
                    select.push(clone)
                }
                thing.push(a)
                let heading = a.querySelector('h2').valueOf()
                // heading.focus()
                const selection = window.getSelection()
                    , range = document.createRange()
                range.selectNodeContents(heading)
                selection.removeAllRanges()
                selection.addRange(range)
                heading.scrollIntoView()
            }
                break
        }
    }
})
function showEntityControls(e) {
    subleft.show(3)
    let { body } = e
    isStatic.indeterminate = isSensor.indeterminate = false
    angleSlider.setAngle(body.angle)
    angleAsDegrees.value = m.toDeg(body.angle) % 360
    restitution.value = body.restitution
    friction.value = body.friction
    frictionAir.value = body.frictionAir
    density.value = body.density
    scaleX.value = body.scale.x
    scaleY.value = body.scale.y
    color.value = body.color
    isStatic.checked = body.isStatic
    isSensor.checked = body.isSensor
    entityname.styles.textDecorationColor = body.color
    entityname.textContent = body.label
    selectimage.value = body.image || 'none'
    constraintholder.clear()
    if (body.constraints.length)
        body.constraints.forEach(function (n, i) {
            constraintholder.push($
                `<div class="inputholder constraints">
                    <label>Length <input value="${n.length}"></label>
                    <label>Damping <input value="${n.damping}"></label>
                    <label>Stiffness <input value="${n.stiffness}"></label>
                    <label>Start X <input value="${n.offsetA.x}"></label>
                    <label>Start Y <input value="${n.offsetA.y}"></label>
                    <label>End X <input value="${n.offsetB.x}" disabled title="There's a bug right now"></label>
                    <label>End Y <input value="${n.offsetB.y}" disabled title="There's a bug right now"></label>
                    <button class="del bad">Delete</button>
                    </div>`)
        })
    // entityname.scrollIntoView({behavior:'smooth', block:'end',inline:'start'})
}
constraintholder.delegate({
    click() {
        let { index } = this.parent
        this.parent.destroy()
        game.postMessage({
            name: 'deleteConstraint',
            index
        })
    }
}, o => o.matches('.del'))
    .delegate({
        focusin() {
            let { index } = this.parent.parent
            game.postMessage({
                name: 'focusConstraint',
                index
            })
        },
        focusout() {
            let { index } = this.parent.parent
            game.postMessage({
                name: 'blurConstraint',
                index
            })
        }
    }, o => o.matches('input'))
placing.on({
    change() {
        setPlacingEntity(this.value)
        view.focus()
    },
})
startgame.debounce({
    click() {
        view.focus()
        let a = active = !active
        toggleGame(a);
        [color,
            angleAsDegrees,
            angleSlider,
            restitution,
            deletebutton, clonebutton,
            ...constraintholder,
            density,
            friction,
            frictionAir,
            scaleX,
            scaleY,
            isStatic].forEach(o => o.attr.disabled = a)
        entityname.attr.contenteditable = a ? '' : 'plaintext-only'
    }
}, 200)
function toggleGame(value) {
    game.postMessage({
        name: 'gametoggle',
        value: !!value
    })
}
function setPlacingEntity(value) {
    game.postMessage({
        name: 'setPlacingEntity',
        value
    })
}
angleAsDegrees.on({
    input() {
        let val = (parseFloat(this.value) || 0) % 180
        angleSlider.setAngleDeg(val)
    }
})
angleSlider.on({
    move() {
        angleAsDegrees.value = m.toDeg(this.angle)
        updateStats()
    }
})
const uploadedImages = new WeakSet
uploadimages.on({
    change() {
        for (let o of this.files)
            if (!uploadedImages.has(o)) {
                uploadedImages.add(o)
                transferImage(o)
            }
    }
})
function importImage(url, name = `${selectimage.childElementCount}`) {
    let node = $`<figure><img src="${url}" width="50" height="50" alt="${name}" title="${name}"><figcaption class="imagetitle">${name}</figcaption></figure>`
    imageholder.push(node)
    node.fadeIn()
    selectimage.push($`<option value="${url}">${name}</option>`)
    return url
}
function transferImage(file) {
    let url = URL.createObjectURL(file, file.type)
    importImage(url, file.name)
    game.postMessage({
        name: 'newImageTransfer',
        url
    })
}
let i = 0
addracer.on({
    click() {
        dialog.showModal()
        dialog.show(3)
    }
})

dialog.delegate({
    focusin() {
        if (this.matches('select')) {
            let { value } = this
            this.clear()
            let a = selectimage.clonedChildren
            this.appendChild(a)
            this.value = value
        }
    },
    input() {
        let parent = $(this.closest('.hiii'))
        let index = parent.index
        game.postMessage({
            name: 'updateRacer',
            value: {
                index,
                label: parent.querySelector('h2').textContent,
                image: parent.querySelector('select').value,
                color: parent.querySelector('input[type="color"]').value
            }
        })
    }
})
    .delegate({
        click() {
            let parent = $(this.closest('.hiii'))
            let index = parent.index
            game.postMessage({
                name: 'deleteRacer',
                index
            })
            parent.destroy()
        }
    }, o => o.matches('button.bad'))
h.on(game, {
    '#load'() {
        let dialog = $(frames[0].document.querySelector('dialog'))
        dialog.style.display = ''
        dialog.showModal()
        dialog.destroyChildren()
        dialog.push(
            $`<div style="display:grid"></div>`.push($('button .cute-green-button', {
                textContent: 'Start',
                events: {
                    _click() {
                        dialog.close()
                        dialog.style.display = 'none'
                        game.postMessage({ name: 'startAudio' })
                    }
                }
            }))
        )
    }
}, new AbortController)
setTimeout(() => { 
    h.on(window, {
        beforeunload(e) {
            savedWork || e.preventDefault()
        }
    })
}, 60000)