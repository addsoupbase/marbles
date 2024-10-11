const Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Body = Matter.Body,
    Collision = Matter.Collision,
    Constraint = Matter.Constraint;

const engine = Engine.create({
    enableSleeping: true
})
const world = engine.world
const config = {
    sleepThreshold: 20
}
const worker = new Worker('worker.js');
const global = {
    select: 'edit',
    current: null,
    editorMode: true,
    debugMode: false,
    chosenEntity: 'Block',
    gameEnded: false,
    playingLevel: false

}
export {Engine,World,Bodies,Events,Collision,Constraint,engine,Body,world,config,global,worker}