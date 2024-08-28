export const darkenHexColor = function (hex, percent) {
    hex = hex.replace(/^#/, '');
    let r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16);
    r = Math.round(r * (1 - percent / 100));
    g = Math.round(g * (1 - percent / 100));
    b = Math.round(b * (1 - percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return '#' + [r, g, b].map(c => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}
export const choose = (...a) => a[Math.floor(Math.random() * a.length)]
export const range = function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}
export const frange = (min, max) => Math.floor(range(min, max))
Object.defineProperty(Array.prototype, "last", { get: function () { return this[this.length - 1] } })
Array.prototype.center = function () {
    return this[Math.floor(this.length / 2)]

}
export const sanitize = function (num) {
    return (num === num) && isFinite(num)
}
Array.prototype.average = function (type) {
    let output = []
    if (type) {
        let arr = this.sort((a, b) => a - b),
            index = arr.indexOf(arr.center())
            , q1 = arr.slice(0, index), q3 = arr.slice(arr.indexOf(index + 1, arr.length))
            , c = q1.center(), e = q3.center()
            , IQR = Math.max(c, e) - Math.min(c, e)
            , upperfence = e + (1.5 * IQR), lowerfence = c - (1.5 * IQR);

        this.forEach(o => (o > lowerfence && o < upperfence) && output.push(o))
    } else {
        output = this
    }
    return (output.reduce((a, b) => a + b, 0) / output.length)
}

Object.defineProperty(String.prototype, "last", { get: function () { return this[this.length - 1] } })
String.prototype.reverse = function () {
    return [...this].reverse().join("")
}

String.prototype.upper = function () {
    return this[0].toUpperCase() + this.slice(1)
}



Array.prototype.swap = function (a, b) {

    let temp = this[a]
    this[a] = this[b]
    this[b] = temp
    return this
}
Array.prototype.swapWithin = function (a, b) {
    let slot = this.indexOf(index)
    if (slot === -1) {
        return this
    }
    this.swap(this.indexOf(a), this.indexOf(b))
    return this
}
Array.prototype.delete = function (index) {
    this.splice(index, 1)
    return this
}
Array.prototype.deleteWithin = function (index) {
    let slot = this.indexOf(index)
    if (slot === -1) {
        return this
    }
    this.delete(slot)
    return this
}
Array.prototype.shuffle = function () {
    let n = this.length;
    let ammo = [...Array(n).keys()]; // Create an array with indices [0, 1, 2, ..., n-1]
    let out = [];

    while (ammo.length > 0) {
        let randIndex = Math.floor(Math.random() * ammo.length);
        let chosenIndex = ammo[randIndex];
        out.push(this[chosenIndex]);
        ammo.splice(randIndex, 1); // Remove the used index from the ammo array
    }

    return out;
};
Array.prototype.pick = function () {
    return choose(...this)
}
export const Colors = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    grey: '#808080',
    green: "#008000",
    greenyellow: "#adff2f",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgray: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370db",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#db7093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
};
export class Elem {
    static textStyle(message, options) {
        console.log(`%c ${message}`, `background: ${options.color};color: ${options.textColor ?? '#000000'};font-style: ${options.font};font-size: ${options.size ?? 15}px;`)
    }
    static $(query) {
        if (query.includes('#')) {
            return document.getElementById(query.replace('#', ''))?.content
        } else {
            let arr = []
            for (let element of document.querySelectorAll(query)) {
                arr.push(element.content)
            }
            return arr
        }
    }
    static tracking = {}
    static listeners = 0;
    static warn(message) {
        if (!Elem.logLevels.warn) {
            return
        }
        Elem.textStyle(`[WARN] ${message}`, { textColor: Colors.yellow, size: 15 })
    }
    static error(message) {
        if (!Elem.logLevels.error) {
            return
        }
        Elem.textStyle(`[ERROR] ${message}`, { textColor: Colors.red, size: 15 })
    }
    static findClass(className) {
        const styleSheets = document.styleSheets;
        // Loop through each stylesheet
        for (let i = 0; i < styleSheets.length; i++) {
            const rules = styleSheets[i].cssRules || styleSheets[i].rules;
            for (let j = 0; j < rules.length; j++) {
                if (rules[j].selectorText === `.${className}`) {
                    return true;
                }
            }
        }
        return false
    }
    static info(message) {
        if (!Elem.logLevels.info) {
            return
        }
        Elem.textStyle(`[INFO] ${message}`, { textColor: '#FFFFFF', size: 10 })
    }
    static success(message) {
        if (!Elem.logLevels.success) {
            return
        }
        Elem.textStyle(`[SUCCESS] ${message}`, { textColor: Colors.lightgreen, size: 15 })
    }
    static debug(message) {
        if (!Elem.logLevels.debug) {
            return
        }
        Elem.textStyle(`[DEBUG] ${message}`, { textColor: Colors.orange, size: 10 })
    }
    static messages = {
        noclass(msg) {
            Elem.warn(`"${msg}" currently does not exist within the documents Style Sheets`)
        }
    }
    static logLevels = {
        debug: false,
        warn: false,
        error: false,
        info: false,
        success: false,
    }
    static select(identifier) {
        let element = $search(identifier)
        Object.setPrototypeOf(element, this.prototype)
        return element.current
    }
    #display;
    #_label_ = ''
    #initial
    constructor(opts, immediate) {
        if (!opts?.tag) {
            Elem.error('No tag was provided so i cannot make the new node.')
            return
        }
        if (Elem.logLevels.debug) {
            let arr = ''
            for (let [key, value] of Object.entries(opts)) {
                arr += `${key}="${value}" `.replaceAll('\n', '').replaceAll(' ', '')
            }
            Elem.debug(`New <${opts.tag}> element:\n ${arr}`)
        }
        if (opts._label_) {
            if (!(opts._label_ in Elem.tracking)) {
                this.#_label_ = opts._label_
                Elem.tracking[this.#_label_] = this
            } else {
                Elem.error(`${opts._label_} is already being used as an identifier!`)
            }
        }
        this.eventNames = {}
        this.content = document.createElement(opts.tag)
        this.content.content = this
        opts.type && this.content.setAttribute('type', opts.type)
        opts.for && this.content.setAttribute('for', opts.for)
        opts.download && this.content.setAttribute('download', opts.download)
        opts.style && this.content.setAttribute('style', opts.style)
        opts.value && this.content.setAttribute('value', opts.value)
        opts.name && this.content.setAttribute('name', opts.name)
        opts.checked != null && this.content.setAttribute('checked', opts.checked)
        opts.src && this.content.setAttribute('src', opts.src)
        opts.accept && this.content.setAttribute('accept', opts.accept)
        opts.placeholder && this.content.setAttribute('placeholder', opts.placeholder)
        this.parent = null
        this.content.id = opts.id ?? this.content.id
        this.content.width = opts.width ?? this.content.width
        this.content.height = opts.height ?? this.content.height
        this.content.href = opts.href ?? ''
        this.content.innerHTML = opts.text ?? ''
        this.children = []
        opts.style?.forEach?.(o => this.content.style[o] = opts.style[o])
        this.#display = this.content.style.display
        this.#initial = opts
        if (opts.class) {
            for (let $class of opts.class) {
                this.content.classList.add($class)
            }
        }
        if (opts.events) {
            this.addevent(...opts.events)
        }
        if (opts.parent) {
            this.appendTo(opts.parent)
        }
        this.current = this.content
        if (immediate) {
            this.appendTo(document.body)
        }
        if (opts.children) {
            for (let kid of opts.children) {
                kid.appendTo(this.current)
                this.children.push(kid)
                kid.parent = this
            }
        }
    }
    get initial() {
        return this.#initial
    }
    appendTo(parent) {
        if (typeof parent === 'string') {
            Elem.$('#'+parent).content.appendChild(this.content)
            return
        }
        try {
            parent.appendChild(this.content)
        }
        catch (e) {
            parent.content.appendChild(this.content)
        }
        if (parent instanceof Elem) {
            parent.children.push(this)
            this.parent = parent
        }
        return this
    }
    appendInto(child) {
        this.content.appendChild(child.content)
        this.children.push(child)
        child.parent = this
        return this
    }
    addClass(...className) {
        this.add({ class: className })
        return this
    }
    add(props) {
        if (props.class) {

            /*  if (!Array.isArray(props.class)) {
                  Elem.error(`Expected Array, instead got ${typeof props.class}`)
              }*/
            if (typeof props.class === 'string') {
                props.class = [props.class]
            }
            for (let $class of props.class) {
                if (!Elem.findClass($class)) {
                    Elem.messages.noclass($class)
                } else if ([...this.content.classList].includes($class)) {
                    Elem.warn(`Class ${$class} already added${this.content.id ? ' to ' + this.content.id : ''}`)
                }
                else { Elem.success(`Class ${$class} added${this.content.id ? ' to ' + this.content.id : ''}`) }
                this.content.classList.add($class)
            }
        }
        return this
    }

    anim(target, callback) {
        this.add(target)
        this.addevent(['animationend', () => { this.noevent('animationend'); callback?.call?.(this.content); }])
        return this
    }
    removeClass(...className) {
        for (let name of className) {
            this.content.classList.remove(name)
        }
        return this
    }
    addevent(...events) {
        for (let [eventName, event] of events) {
            Elem.listeners++
            this.content.addEventListener(eventName, event)
            this.eventNames[eventName] = event
            Elem.info(`Event "${eventName}" added${this.content.id ? ' to  ' + this.content.id : ''}: \n${event.toString().replaceAll(`\n`, '').replaceAll(' ', '')}`)
        }
    }
    noevent(...target) {
        for (let event of target) {
            this.content.removeEventListener(event, this.eventNames[event])
            if (!this.eventNames[event]) {
                Elem.warn(`No event found for "${event}"${this.content.id ? ' on ' + this.content.id : ''}`)
            } else {
                Elem.listeners--
                Elem.info(`Removing event "${event}" ${this.content.id ? 'from ' + this.content.id : ''}:\n${this.eventNames[event].toString()}`)
            }
            delete this.eventNames[event]
        }
    }
    kill() {
        this.noevent(...Object.keys(this.eventNames))
        if (this.content.id) {
            Elem.info(`Element ${this.content.id} was removed from body`)
        }
        Elem.debug(`Element removed`)
        delete Elem.tracking[this.#_label_]
        this.killChildren()
        this?.parent?.children?.deleteWithin?.(this)
        this.content.remove()
        return this
    }
    killChildren() {
        while (this.children.length) {
            this.children.forEach(o => o.kill())
        }
        return this
    }

    hide(type) {
        this.content.style.display = type ?? 'none'
        return this
    }
    show() {
        this.content.style.display = this.#display
        return this
    }
}
export function $search(query) {
    let result;
    if (query.includes('#')) {
        result = document.getElementById(query.replaceAll('#', ''))
    }
    else {
        result = document.querySelectorAll(query)
    }
    return result
}
window.Elem = Elem
window.$search = $search