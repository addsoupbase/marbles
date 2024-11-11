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
export {Engine,World,Bodies,Events,drawingWorker,Collision,Constraint,engine,Body,world,config,global,worker,Vertices}