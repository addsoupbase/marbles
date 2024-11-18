let audio = {
    music: new Map,
    sfx: new Map,
    setVolume(volume) {
        local.volume = volume;
        [...audio.music.values(),...audio.sfx.values()].forEach(o=>o.volume = local.volume)
    }
}
local.volume??='1'
local.platform ??= 'Desktop'
function playAudio({src,loop=false,interrupt=false,action='play'}) {
    if (!src) throw TypeError('Source for audio required')
    if (audio.music.has(src)||audio.sfx.has(src)) {
       let targ = audio.music.get(src) ?? audio.sfx.get(src)
       if (audio.music.has(src))console.log('🎶 Currently playing: ' +src.split('/').at(-1))
       targ.volume = +local.volume
       if (action==='play') {
        if (interrupt) targ.currentTime = 0
        targ.loop = loop
        targ.play()
       }
       if (action === 'pause') {
        targ.pause()
       }
      
    } else {
        throw TypeError('Unrecognized media source: '+src+'\n(Maybe it is not loaded yet?)')
    }
}
;(async ()=>{
    let n = await import('./audio.js')
    let tra = new Set
    for (let a of [...n.default.music,]) {
        let url = new URL(a.src,location.href)
        a.addEventListener('ended',()=>{
            playAudio({src:tracks.val})
        })
        let figewntuh = url.pathname.split('/').at(-1)
        audio.music.set(figewntuh,a)
        tra.add(figewntuh)
    }
    let tracks = new utilMath.Cycle(...ran.shuffle(...[...tra]))
     for (let a of [...n.default.sfx,]) {
        let url = new URL(a.src,location.href)
         audio.sfx.set(url.pathname.split('/').at(-1),a)
     }
    
    let func = ()=>{
        playAudio({src:ran.choose(...audio.music.keys())})
        window.removeEventListener('click',func)
    }

    window.addEventListener('click',func)
 })()
 
const {Engine, 
    World, 
    Bodies, 
    Events, 
    Body,
    Collision, 
    Constraint, 
    Vertices} = Matter

const engine = Engine.create({
    enableSleeping: true
})
const world = engine.world
const config = {
    sleepThreshold: 20
}
export let cachedImages= new Map
const worker = new Worker('worker.js');
const drawingWorker = new Worker('reusable.js')
const global = {
    select: 'edit',
    current: null,
    editorMode: true,
    debugMode: false,
    chosenEntity: 'Block',
    gameEnded: false,
    playingLevel: false

}
export {audio,playAudio,Engine,World,Bodies,Events,drawingWorker,Collision,Constraint,engine,Body,world,config,global,worker,Vertices}