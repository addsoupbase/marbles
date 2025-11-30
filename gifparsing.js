// import * as h from '../handle.js'
import gif from 'https://cdn.jsdelivr.net/npm/gifuct-js@2.1.2/+esm'
const canvas = new OffscreenCanvas(0, 0)
const ctx = canvas.getContext('2d')
self.addEventListener('message', message)
async function message({ data: src }) {
    src = new URL(src, location).toString()
    // console.debug(`Started parsing for ${src}`)
    let frames = gif.decompressFrames(gif.parseGIF(await buffer(src)), true)
    let out = []
    for (let thing of frames) {
        let { width, height, left, top } = thing.dims
        canvas.width = width
        canvas.height = height
        let data = new ImageData(thing.patch, width, height)
        ctx.putImageData(data, left, top)
        out.push({ data: await createImageBitmap(canvas.valueOf()), delay: thing.delay })
        switch (thing.disposalType) {
            default: ctx.clearRect(0, 0, width, height)
                break
            case 1: break
        }
    }
    // console.debug(`Gif parsed! ${src}. Sending message to main thread...`)
    postMessage({imageData: out, src})
    // console.debug(`Message sent!`)
}
let isGif = / /.test.bind(/image\/gif/)
async function buffer(src, settings) {
    let n = await fetch(src, settings)
    let type = n.headers.get('content-type')
    if (!n.ok) throw TypeError(`Failed fetching ${src}: ${n.status}`)
    if (isGif(type)) return await n.arrayBuffer()
    throw TypeError(`File must be a gif: ${type}`)

}
console.log('worker ready')
