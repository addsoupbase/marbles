import{Images}from"./img.js";import{darkenHexColor,choose,frange,range,Colors as c}from"./utils.js";let select="edit",current=null,editorMode=!0,debugMode=!1,options=null,chosenEntity="Block1",text="",smooth=0,textColor="#000000";const Del=function(t){let e=null;for(let i of Entity.toSpawn)if(i.id===+t){e=i;break}Entity.toSpawn.deleteWithin(e),$(`[name='${e.id}']`).each((function(){$(this).remove()}))},spawnAllOfTheMarbles=()=>{for(let t of Entity.toSpawn)t.restitution=+$("#bounciness")[0].value,new Marble(t)},killAllOfTheMarbles=()=>{for(let t of Entity.all)t.CREATOR===Marble&&t.kill()},Spawn=function(t){let e=null;for(let i of Entity.toSpawn)if(i.id===t){e=i;break}e.img.src=e.imgSrc,e.restitution=+$("#bounciness")[0].value??1,new Marble(e)},addMarble=function(t){let e={Name:t.Name,restitution:+$("#bounciness")[0].value??0,size:30,x:-cam.x/cam.zoom+canvas.width/2+100*Math.random()*choose(1,-1),y:-cam.y/cam.zoom+canvas.height/2+100*Math.random()*choose(1,-1)},i=new Marble(e);i.imgSrc=t.imgSrc??"",i.img=new Image,i.img.src=i.imgSrc;let o=document.createElement("input");o.value=i.Name,o.placeholder="Name",o.id=`shh${i.id}`,o.name=i.id,$(o).on({focusout:findMarble}),$("#allMarbles").append(`<div class='separate' id='div${i.id}'></div>`),$("#div"+i.id).append(`<input name='${i.id}' type='url' id='mrbl${i.id}' placeholder='Image Url' value='${i.imgSrc??""}'>`),$(`#mrbl${i.id}`).on("focusout",findMarbleImage),$("#allMarbles").append(o);let a=getIndex(),s=getIndex();$("#allMarbles").append(`\n                <button class="good" name="${i.id}" id="spawn${a}">Spawn</button>\n                <button name="${i.id}" id="Del${s}" class="bad">🗑️</button>\n            `);for(let[t,e]of[[`spawn${a}`,spawnEvent],[`Del${s}`,deleteEvent]])$(`#${t}`).on({click(){e(i.id)}});i.kill(),Entity.toSpawn.push({Name:i.Name,shape:"circle",size:30,id:i.id,img:i.img,game:!0,imgSrc:i.imgSrc})};function fill(t){let e=ctx.fillStyle;ctx.fillStyle=t??e,ctx.fill(),ctx.fillStyle=e}function stroke(t){let e=ctx.strokeStyle;ctx.strokeStyle=t??e,ctx.stroke(),ctx.strokeStyle=e}function shapeToImage(t){const e=document.createElement("canvas");e.width=200,e.height=200;const i=e.getContext("2d");i.fillStyle=t.color,i.strokeStyle=t.dark,i.lineWidth=ctx.lineWidth,i.beginPath(),i.arc(e.width/2,e.height/2,e.width/2.05,0,2*Math.PI),i.fill(),i.stroke(),t.img.src=e.toDataURL("image/png")}const bounds={x:3e3,y:3e3,get center(){return{x:this.x/2,y:this.y/2}}},save=function(){editorMode||startGame();let t=[];for(let e of a.all){if("Marble"===e.CREATOR.name)continue;let i=e.start;for(let t in i)(void 0===i[t]||t.match(/restitution|friction/))&&delete i[t];t.push([e.start,e.CREATOR.name])}for(let e of Entity.toSpawn)t.push(e);$("#textData")[0].value=JSON.stringify(t)},Load=function(){editorMode||startGame();try{let t=JSON.parse($("#textData")[0].value);Entity.all.length=Entity.toSpawn.length=Entity.graveyard.length=Entity.gameSpawns.length=Entity.temporarilyDead.length=0,$("#allMarbles").empty();for(let t of Matter.Composite.allBodies(world))World.remove(world,t);for(let e of t){if("game"in e){console.log(e),Entity.toSpawn.push(e),addMarble(e);continue}let t=e[0];t.img=new Image,t.img.src=t.imgSrc,new Entity.allClasses[e[1]](t).start=t}for(let t of Entity.toSpawn)t.img.src!==t.imgSrc&&Entity.toSpawn.deleteWithin(t)}catch(t){throw Text="Check logs please :(#FF0000",t}},menu=function(t){$(".menu").each((function(){$(this).hide()})),$("#"+t).show(),$(`#${t}`).children().length||$(`#${t}`).append("<p>Nothing selected...</p>")},deleteFrom=t=>{if(!editorMode)return Text="Exit play mode first!!!#ff0000";t.kill(),showData()};for(let[t,e]of[["data2","put"],["data","edit"],["data3","marble"]])$(`#${e}`).on({click(){select=e,menu(t)}});for(let[t,e]of[["marbleAdder",addMarble],["spawnImmediately",spawnAllOfTheMarbles],["killAll",killAllOfTheMarbles],["startButton",startGame],["saveButton",save],["loadButton",Load]])$(`#${t}`).on({click:e});Object.defineProperty(window,"Text",{set:function(t){let e=t.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g);e?(t=t.replace(e[0],""),textColor=e[0]):textColor="#000000",text=t,smooth=0}});{let t=getIndex(),e=(getIndex(),getIndex()),i=getIndex(),o=getIndex(),a=getIndex();$("#buttonholder").append(`<button class="good" id="block${t}">Block</button>`),$("#buttonholder").append(`<button class="good" id="motor${e}">Motor</button>`),$("#buttonholder").append(`<button class="good" id='cam${i}'>Camera</button>`),$("#buttonholder").append(`<button class="good" id='spawner${o}'>Spawner</button>`),$("#buttonholder").append(`<button class="good" id='wind${a}'>Wind Zone</button>`);for(let[s,n]of[[`block${t}`,()=>chosenEntity="Block"],[`motor${e}`,()=>chosenEntity="Motor"],[`cam${i}`,()=>chosenEntity="Cam"],[`spawner${o}`,()=>chosenEntity="Spawner"],[`wind${a}`,()=>chosenEntity="WindZone"]])$(`#${s}`).on({click(){n()}})}function place(t){if(t.includes("Block")){let t=new Wall({x:mouse.x/cam.zoom-cam.x/cam.zoom,y:mouse.y/cam.zoom-cam.y/cam.zoom,color:c.gray,width:30,height:30,isStatic:!0});current=t,showData(t)}if(t.includes("Motor")){let t=new Blade({frictionAir:0,x:mouse.x/cam.zoom-cam.x/cam.zoom,y:mouse.y/cam.zoom-cam.y/cam.zoom,color:c.yellow,size:100,isStatic:!1});current=t,showData(t)}if(t.includes("Cam")){let t=new Cam({x:mouse.x/cam.zoom-cam.x/cam.zoom,y:mouse.y/cam.zoom-cam.y/cam.zoom,color:c.grey});current=t,showData(t)}if(t.includes("Spawner")){let t=new Spawner({size:30,x:mouse.x/cam.zoom-cam.x/cam.zoom,y:mouse.y/cam.zoom-cam.y/cam.zoom,color:c.grey,shape:"circle"});current=t,showData(t)}if(t.includes("WindZone")){let t=new WindZone({height:30,width:30,x:mouse.x/cam.zoom-cam.x/cam.zoom,y:mouse.y/cam.zoom-cam.y/cam.zoom,color:c.grey,shape:"circle"});current=t,showData(t)}}const canvas=$("canvas")[0],ctx=canvas.getContext("2d"),cam={x:0,y:0,click:{x:NaN,y:NaN},angle:0,speed:10,zoom:1,following:null,existingcam:null,key:{w:!1,s:!1,a:!1,d:!1}};ctx.lineWidth=4;const Engine=Matter.Engine,World=Matter.World,Bodies=Matter.Bodies,Events=Matter.Events,Body=Matter.Body,Collision=Matter.Collision,Constraint=Matter.Constraint,engine=Engine.create(),world=engine.world,apply=()=>{editorMode||startGame(),Text="Changes applied!!!#0dff00";let t={};for(let e of $("#data").children()){let i=$(e)[0];(null!=i.value||"checked"in i)&&i.id&&(t[i.id]=i.value)}for(let t of Entity.toSpawn)$(`#shh${t.id}`)[0].value=t.Name;for(let e in t)if(e in current){if("angle"===e&&(Body.setAngle(current,+t[e]*Math.PI/180||0),current.start[e]=+t[e]*Math.PI/180||0),"speed"===e&&(cam.speed=+t[e]),"mass"===e&&(Body.setMass(current,+t[e]),current.start[e]=+t[e]),"windSpeed"===e&&(current.start[e]=current[e]=+t[e]/100),"interval"===e&&(current[e]=+t[e],current.start[e]=+t[e]),"Name"===e&&(current.Name=current.start.Name=t[e]),"opacity"===e&&(current.opacity=current.start.opacity=+t[e]),e.match(/restitution|frictionAir/)&&(current[e]=+t[e],current.start[e]=+t[e]),e.match(/inertia/)&&(Body.setInertia(current,+t[e]||.1),current.start[e]=+t[e]||.1),e.match(/width/)){let i=current.start;i.width=t[e];let o=new current.CREATOR(i);current.kill(),current=o,showData(current)}if(e.match(/height/)){let i=current.start;i.height=t[e];let o=new current.CREATOR(i);current.kill(),current=o,showData(current)}"color"===e&&(current.start.color=current.color=t[e],current.start.dark=current.dark=darkenHexColor(t[e],40),current.customImage||(current.img=new Image,showData(current)))}showData(current)};let frame=0;function update(){requestAnimationFrame(update),frame++,smooth++,ctx.clearRect(0,0,canvas.width,canvas.height);for(const t of Entity.toKill)World.remove(world,t),Entity.all.deleteWithin(t);for(const t of Entity.temporarilyDead)World.remove(world,t),Entity.all.deleteWithin(t),Entity.graveyard.push(t);Entity.temporarilyDead=[],cam.key.w&&(cam.y+=cam.speed),cam.key.s&&(cam.y-=cam.speed),cam.key.a&&(cam.x+=cam.speed),cam.key.d&&(cam.x-=cam.speed);cam.x,cam.zoom,cam.y,cam.zoom;Entity.toKill=[];for(let t of Entity.all)t.dead&&(t.dead=!1,t.kill());cam.existingcam=null;for(const t of Entity)t.CREATOR!==Cam||cam.existingcam||(cam.existingcam=t),editorMode?(t.start.x??=t.position.x,t.start.y??=t.position.y,t.isSleeping=!0,Body.setVelocity(t,{x:0,y:0})):t.isSleeping=!1,t.draw?.(frame);editorMode&&(ctx.save(),ctx.lineWidth=1,ctx.fillStyle=c.gray,ctx.strokeStyle=c.black,ctx.fillRect(10,10,7,20),ctx.fillRect(21,10,7,20),ctx.strokeRect(10,10,7,20),ctx.strokeRect(21,10,7,20),ctx.restore()),ctx.save(),ctx.translate(canvas.width/2,canvas.height/2),ctx.font="30px lexend",ctx.textBaseline="middle",ctx.textAlign="center",ctx.fillStyle=textColor,ctx.strokeStyle=darkenHexColor(textColor,40),ctx.lineWidth=1,ctx.fillText(text,0,Math.min(-30,4*-(smooth-100))),ctx.strokeText(text,0,Math.min(-30,4*-(smooth-100))),ctx.restore(),ctx.save(),ctx.translate(cam.x,cam.y),ctx.scale(cam.zoom,cam.zoom),ctx.rotate(cam.existingcam?.angle??0),ctx.fillStyle=c.lightblue,ctx.globalCompositeOperation="destination-over",ctx.fillRect(0,0,bounds.x,bounds.y),ctx.restore(),debugMode&&(ctx.save(),ctx.beginPath(),ctx.arc(mouse.x,mouse.y,10,0,2*Math.PI),ctx.stroke(),ctx.beginPath(),ctx.arc(cam.click.x,cam.click.y,15,0,2*Math.PI),ctx.strokeStyle=c.red,ctx.stroke(),ctx.fillText(`x: ${mouse.x} y: ${mouse.y}`,mouse.x,mouse.y-30),ctx.fillStyle=c.red,ctx.fillText(`x: ${cam.click.x} y: ${cam.click.y}`,cam.click.x-70,cam.click.y+30),ctx.restore())}Matter.Runner.run(engine);class Entity{static all=Matter.Composite.allBodies(world);static toKill=[];static allClasses={};static graveyard=[];static temporarilyDead=[];static Images=[];static toSpawn=[];static gameSpawns=[];static{window.a=Entity;for(let t of Images){let e=new Image(50,50);e.src=t,this.Images.push(e)}}static*[Symbol.iterator](){yield*this.all}constructor(t){let e,i=bounds.center;if(t.width=Math.max(t.width,1),t.height=Math.max(t.height,1),isFinite(t.angle)||(t.angle=0),isFinite(t.x)||(t.x=bounds.center.x),isFinite(t.y)||(t.y=bounds.center.y),"circle"===t.shape)e=Bodies.circle(t.x??i.x,t.y??i.y,t.size??30,{friction:.02,inertia:2e3,isStatic:t.isStatic??!1,restitution:t.bounce??t.restitution??0,frictionAir:t.frictionAir??.01,angle:t.angle??0,mass:t.mass??1});else{if("rect"!==t.shape)throw console.error(this),Text="Check logs please :(#FF0000",TypeError("No shape was provided.");e=Bodies.rectangle(t.x??i.x,t.y??i.y,t.width??30,t.height??30,{friction:0,mass:t.mass??2.799984164,isStatic:t.isStatic??!1,restitution:t.bounce??t.restitution??0,frictionAir:t.frictionAir??.01,angle:t.angle??0,mass:t.mass??1})}e.CREATOR=new.target,new.target!==Marble&&(e.collisionFilter.group=-1),e.Name=t.Name||`${new.target.name} ${e.id}`,e.shape=t.shape,e.isSleeping=!0,World.add(world,e),e.color=t.color;let o=Object.values(c);return e.color??=choose(...o),e.dead=!1,Body.setAngle(e,t.angle??0),e.img=t.img??new Image,t.img||(e.img.src=""),e.imgSrc=e.img.src,e.dark=darkenHexColor(e.color,40),e.selected=!1,e.isCustom=!0,e.toggleable=["angle","Name","circleRadius","restitution","color","opacity","width","height"],e.opacity=t.opacity??1,e.start={x:e.position.x,y:e.position.y,size:t.size,isStatic:t.isStatic??!1,height:t.height,width:t.width,angle:t.angle??0,img:e.img,imgSrc:e.img.src,frictionAir:e.frictionAir,restitution:e.restitution,mass:t.mass,color:e.color,dark:e.dark,Name:e.Name,opacity:e.opacity,windSpeed:e.windSpeed},e.SIZE??Object.defineProperty(e,"SIZE",{get:function(){if(this.circleRadius)return{x:this.circleRadius,y:this.circleRadius};return{x:Math.abs(this.bounds.max.x-this.bounds.min.x),y:Math.abs(this.bounds.max.y-this.bounds.min.y)}}}),e.width??Object.defineProperty(e,"width",{get:function(){return this.start.width}}),e.height??Object.defineProperty(e,"height",{get:function(){return this.start.height}}),Entity.all.push(e),e.reset=function(){this.isSleeping=!0,this.start.angle??=this.angle,-1===this.index&&(Entity.all.push(this),Entity.graveyard.deleteWithin(this),World.add(world,this)),Body.setVelocity(this,{x:0,y:0}),Body.setAngularVelocity(this,0),Body.setAngularSpeed(this,0),Body.setAngle(this,this.start.angle),Body.setPosition(this,{x:this.start.x,y:this.start.y})},e.constructor.prototype.draw=e.draw=function(t){if(isNaN(this.position.x)||isNaN(this.position.y))throw this.kill(),editorMode||startGame(),console.error("NaN: ",this),showData(),Text="Check logs please :(#FF0000",this.isTemporary&&=!1,RangeError("NaN Position detected");ctx.save(),this.position.x>bounds.x&&(Body.setPosition(this,{x:bounds.x,y:this.position.y}),this.outOfBounds?.()),this.position.x<0&&(Body.setPosition(this,{x:0,y:this.position.y}),this.outOfBounds?.()),this.position.y>bounds.y&&(Body.setPosition(this,{y:bounds.y,x:this.position.x}),this.outOfBounds?.()),this.position.y<0&&(Body.setPosition(this,{y:0,x:this.position.x}),this.outOfBounds?.()),cam.following&&(cam.x=-cam.following.position.x*cam.zoom+canvas.width*cam.zoom/2/cam.zoom,cam.y=-cam.following.position.y*cam.zoom+canvas.height*cam.zoom/2/cam.zoom),ctx.translate(cam.x,cam.y),ctx.scale(cam.zoom,cam.zoom),ctx.rotate(cam.existingcam?.angle??0),ctx.translate(this.position.x,this.position.y),this.circleRadius&&ctx.rotate(this.angle),ctx.beginPath(),editorMode?this.opacity=this.start.opacity:this.selected?this.opacity=.6:this.opacity=this.start.opacity,this.selected&&(this.start.isStatic&&Body.setStatic(this,!1),Body.setPosition(this,{x:mouse.x/cam.zoom-cam.x/cam.zoom,y:mouse.y/cam.zoom-cam.y/cam.zoom}),this.velocity.x=0,this.velocity.y=0),this===current&&(ctx.shadowBlur=30,ctx.shadowColor=c.green);for(let t of Entity.all){if(editorMode)break;t!==this&&t.isSensor&&(Collision.collides(this,t)&&t.collision?.(this))}editorMode||(ctx.globalAlpha=this.opacity),this.illustrate?.(t),editorMode&&"put"!=select&&ctx.isPointInPath(mouse.x,mouse.y)&&cam.click.x&&cam.click.y?Entity.all.some((t=>t.selected))||(this.onclick?.(),this.selected=!0,current=this,menu("data"),showData(this)):!editorMode||cam.click.x&&cam.click.y||(this.selected&&(this.velocity.x=this.velocity.y=0,this.start.x=this.position.x,this.start.y=this.position.y),this.selected=!1,this.start.isStatic&&Body.setStatic(this,!0)),ctx.isPointInPath(mouse.x,mouse.y)&&cam.click.x&&cam.click.y&&!editorMode&&this.isMarble&&(cam.following=this),ctx.restore()},e.kill=function(){this.dead||(this.dead=!0,Entity.toKill.push(this))},e.tempKill=function(){editorMode||Entity.temporarilyDead.push(this)},e.index??Object.defineProperty(e,"index",{get:()=>Entity.all.indexOf(e)}),e}}window.a=Entity;class Marble extends Entity{static{Entity.allClasses[this.name]=this}constructor(t){t.shape="circle",super(t),this.img=t.img,t.img?this.customImage=!0:(this.img=new Image,this.img.src="",this.customImage=!1),this.outOfBounds=this.tempKill,this.collisionFilter.group=0,this.isMarble=!0,this.toggleable.push("img"),this.toggleable.deleteWithin("angle"),this.toggleable.deleteWithin("width"),this.toggleable.deleteWithin("height"),Marble.prototype.illustrate=this.illustrate=function(t){if(editorMode&&(ctx.save(),ctx.textBaseline="middle",ctx.textAlign="center",ctx.fillText(this.Name,0,-50),ctx.beginPath(),ctx.lineWidth=1,ctx.moveTo(5,-40),ctx.lineTo(-5,-40),ctx.lineTo(-0,-36),ctx.closePath(),ctx.stroke(),ctx.restore()),ctx.beginPath(),ctx.arc(0,0,this.circleRadius,0,2*Math.PI),ctx.clip(),ctx.fillStyle=this.color,ctx.strokeStyle=this.dark,ctx.fill(),ctx.stroke(),this.img&&this.customImage){this.customImage=!0;try{ctx.drawImage(this.img,-this.circleRadius,-this.circleRadius,2*this.circleRadius,2*this.circleRadius)}catch(t){console.error('The following "image" is broken: ',this.img),this.customImage=!1}}},this.onclick=function(){this.selected&&(this.selected=!this.selected)}}}class Wall extends Entity{static{Entity.allClasses[this.name]=this}constructor(t){t.shape="rect",t.friction=0,new.target===Wall&&(t.isStatic=!0),super(t),this.toggleable.deleteWithin("frictionAir"),this.toggleable.deleteWithin("restitution"),this.illustrate=function(t){ctx.moveTo(this.vertices[0].x-this.position.x,this.vertices[0].y-this.position.y);for(let t=0,e=this.vertices.length;t<e;t++)ctx.lineTo(this.vertices[t].x-this.position.x,this.vertices[t].y-this.position.y);ctx.strokeStyle=this.dark,ctx.fillStyle=this.color,ctx.closePath(),ctx.stroke(),ctx.fill()}}}class Blade extends Wall{static{Entity.allClasses[this.name]=this}constructor(t){let e=t;e.width=.9*t.size,e.height=.1*t.size,e.isStatic=!1,super(e),this.collisionFilter.group=-1,this.collisionFilter.group=-1,this.toggleable.push("frictionAir","mass"),this.draw=function(){Entity.prototype.draw.call(this),Body.setVelocity(this,{x:0,y:0}),editorMode||Body.setPosition(this,this.start)}}}class WindZone extends Wall{static{Entity.allClasses[this.name]=this}constructor(t){t.shape="rect",t.isStatic=!0,t.color=c.blue,super(t),this.toggleable.push("windSpeed"),this.windSpeed=this.start.windSpeed=t.windSpeed??.01,this.isSensor=!0,this.winds=[];for(let e=0;e<20;e++)this.winds.push({x:Math.random()*t.width-t.width/2,y:Math.random()*t.height-t.height/2,radius:Math.random()*this.width/20});this.collision=function(t){if(!t.isMarble)return;const e=this.angle-Math.PI/2,i=this.windSpeed,o=i*Math.cos(e),a=i*Math.sin(e);Body.applyForce(t,t.position,{x:o,y:a})},this.illustrate=function(t){ctx.rotate(this.angle),ctx.moveTo(this.vertices[0].x-this.position.x,this.vertices[0].y-this.position.y);for(let t=0,e=this.vertices.length;t<e;t++)ctx.lineTo(this.vertices[t].x-this.position.x,this.vertices[t].y-this.position.y);ctx.closePath(),ctx.clip(),ctx.beginPath(),ctx.shadowBlur=0,ctx.fillStyle=this.color;for(let t of this.winds)t.y-=1*this.windSpeed*160,Math.abs(t.y)>this.height/2+10&&(t.y=this.height/2),ctx.beginPath(),ctx.arc(t.x,t.y,t.radius,0,2*Math.PI),ctx.fill();editorMode&&(ctx.beginPath(),ctx.moveTo(-5,0),ctx.lineTo(5,0),ctx.lineTo(-0,-4),ctx.closePath(),ctx.stroke()),ctx.beginPath(),ctx.moveTo(this.vertices[0].x-this.position.x,this.vertices[0].y-this.position.y);for(let t=0,e=this.vertices.length;t<e;t++)ctx.lineTo(this.vertices[t].x-this.position.x,this.vertices[t].y-this.position.y);editorMode&&(ctx.closePath(),ctx.stroke())}}}class MotorBlade extends Wall{static{Entity.allClasses[this.name]=this}constructor(t){let e=t;e.isStatic=!1,super(e),this.toggleable.push("frictionAir","mass"),this.draw=function(){Entity.prototype.draw.call(this),Body.setVelocity(this,{x:0,y:0}),Body.setPosition(this,this.start)}}}class Cam extends Entity{static{Entity.allClasses[this.name]=this}constructor(t){t.shape="circle",super(t);for(let t of Entity.all)t.CREATOR===Cam&&t!==this&&t.kill();this.isSensor=!0,this.toggleable.push("speed"),this.toggleable.deleteWithin("Name"),this.toggleable.deleteWithin("restitution"),this.toggleable.deleteWithin("color"),this.toggleable.deleteWithin("width"),this.toggleable.deleteWithin("height"),this.illustrate=function(){editorMode&&(ctx.arc(0,0,30,0,2*Math.PI),ctx.stroke(),ctx.textBaseline="middle",ctx.textAlign="center",ctx.font="30px serif",ctx.strokeText("🎥",0,0))}}}class Spawner extends Entity{static{Entity.allClasses[this.name]=this}constructor(t){t.shape="circle",super(t),this.interval=t.interval||50,this.isSensor=!0,this.toggleable.push("interval"),this.toggleable.deleteWithin("Name"),this.toggleable.deleteWithin("Angle"),this.toggleable.deleteWithin("restitution"),this.toggleable.deleteWithin("color"),this.illustrate=function(t){if(editorMode)ctx.arc(0,0,this.circleRadius,0,2*Math.PI),ctx.stroke(),fill("rgb(100,0,255,0.3)");else if(!(t%this.interval||editorMode)){Entity.gameSpawns=Entity.gameSpawns.shuffle();let t=Entity.gameSpawns.pop();if(t){t.x=this.start.x+Math.random()*this.circleRadius/1.2*choose(1,-1),t.y=this.start.y+Math.random()*this.circleRadius/1.2*choose(1,-1),t.restitution=+$("#bounciness")[0].value??1,new Marble(t).isTemporary=!0}}}}}let mouse={x:0,y:0};function temp(t,e,i,o){let a=Bodies.rectangle(t,e,i,o,{isStatic:!0});return World.add(world,a),Entity.all.push(a),a.draw=function(){ctx.beginPath(),ctx.save(),ctx.moveTo(this.bounds.max.x,this.bounds.max.y),ctx.lineTo(this.bounds.max.x,this.bounds.min.y),ctx.lineTo(this.bounds.min.x,this.bounds.min.y),ctx.lineTo(this.bounds.min.x,this.bounds.max.y),ctx.stroke(),ctx.fill(),ctx.restore()},a}function startGame(){if(editorMode){cam.following=current=null;for(let t of Entity.all)t.selected=!1;select=null,showData(),Entity.gameSpawns=[...Entity.toSpawn],Entity.all.push(...Entity.graveyard)}else{frame=0,cam.following=null,Entity.gameSpawns=[...Entity.toSpawn];for(let t of Entity.graveyard)Entity.all.push(t),World.add(world,t);Entity.graveyard=[];for(let t of Entity.all)t.isCustom&&(t.isTemporary&&t.kill(),t.reset())}cam.existingcam&&(cam.x=(-cam.existingcam.position.x+canvas.width/2/cam.zoom)*cam.zoom,cam.y=(-cam.existingcam.position.y+canvas.height/2/cam.zoom)*cam.zoom),editorMode=!editorMode}function showData(t){if($("#data").children().each((function(){$(this).off("click",spawnEvent),$(this).off("click",deleteEvent),$(this).off("click",findMarble),$(this).off("click",findMarbleImage),$(this).off("click",fileChange)})),$("#data").empty(),!t)return void $("#data").append("<p>Nothing selected...</p>");let e=getIndex(),i=getIndex(),a=getIndex();$("#data").append(`<button class="good" id="apply${e}">Apply Changes</button><button class='good' id='clone${a}'>Clone</button><button class="bad" id="delete${i}">Delete</button>`);for(let[t,o]of[["apply"+e,apply],["delete"+i,deleteFrom],[`clone${a}`,clone]])$(`#${t}`).on({click(){o(current)}});for(let e of t.toggleable)if("object"==typeof t[e]||e in t){if(e.match(/angle/)){let i=document.createElement("input");i.id=e,i.className="write",i.value=180*t[e]/Math.PI,$("#data").append(`<label for="${e}">${e.upper()}</label>`),$("#data").append(i)}if("speed"===e){let t=document.createElement("input");t.id=e,t.className="write",t.value=+cam.speed,$("#data").append(`<label for="${e}">${e.upper()}</label>`),$("#data").append(t)}if("windSpeed"===e){let i=document.createElement("input");i.id=e,i.className="write",i.value=100*t[e],$("#data").append(`<label for="${e}">${e.upper()}</label>`),$("#data").append(i)}if("opacity"===e){let i=document.createElement("input");i.id=e,i.className="write",i.value=t[e],$("#data").append(`<label for="${e}">${e.upper()}</label>`),$("#data").append(i)}if(e.match(/restitution|mass|frictionAir|Name/)){let i=document.createElement("input");i.id=e,i.className="write",i.value=t[e],$("#data").append(`<label for="${e}">${e.upper()}</label>`),$("#data").append(i)}if(e.match(/interval/)){let i=document.createElement("input");i.id=e,i.className="write",i.value=t[e],$("#data").append(`<label for="${e}">${e.upper()}</label>`),$("#data").append(i)}if(e.match(/width|height/)){let i=document.createElement("input");i.id=e,i.className="write",i.value=t[e],$("#data").append(`<label for="${e}">${e.upper()}</label>`),$("#data").append(i)}if(e.match(/color/)){let i=document.createElement("input");i.id=e,i.className="color",i.value=t[e],i.type="color",$("#data").append(`<label for="${e}">${e.upper()}</label>`),$("#data").append(i)}if(e.match(/img/)){let i=document.createElement("input");i.id=e,i.type="file",i.style.display="none",i.accept=".png, .jpeg, .jpg, .webp",i.addEventListener("change",(()=>fileChange(o))),t.customImage||shapeToImage(t),$("#data").append(`<div style="position: relative; display: flex; align-items:center; flex-direction: column;" id="status"><img src='${t.img?.src}' width="50" height="50"></div>`),$("#status").append(i),$("#status").append("<button class='good' onclick='$(`#img`)[0].click()'>Picture</button>")}}if(t.CREATOR===Marble){let t=document.createElement("button");t.onclick=()=>{cam.following=current},t.innerHTML="Follow",t.className="good",$("#status").append(t)}options={ids:[],values:[]};for(let t of $("#data").children())"input"===t.type&&(options.values.push(t.value),options.ids.push(t.id))}function getIndex(){return getIndex.inx++}function fileChange(t){let e=new FileReader;e.readAsDataURL(t.target.files[0]),e.onload=t=>{current.img.src=t.target.result,current.imgSrc=t.target.result,current.start.img.src=t.target.result,current.start.imgSrc=t.target.result,current.customImage=!0,showData(current)}}function findMarble(){let t=null;for(let e of Entity.toSpawn)if(e.id===+this.name){t=e;break}t.Name=this.value}function findMarbleImage(){if(!this.value.length)return;let t=null;for(let e of Entity.toSpawn)if(e.id===+this.name){t=e;break}t.img=new Image,t.img.src=this.value,t.imgSrc=this.value,t.customImage=!0}function spawnEvent(t){Spawn(t)}function deleteEvent(t){Del(t)}function clone(){let t=current.start;t.x+=100,t.y+=100;let e=new current.CREATOR(t);current=select=e,showData(e)}update(),$("#can").on({mousedown:function(t){cam.click.x=t.offsetX,cam.click.y=t.offsetY,"put"===select&&editorMode&&place(chosenEntity),"edit"===select&&editorMode&&(cam.following=null)},mousemove:function(t){mouse.x=t.offsetX,mouse.y=t.offsetY},mouseup:function(){cam.click.x=cam.click.y=NaN}}),window.ctx=ctx,$(window).on({mousewheel:function(t){cam.zoom-=t.originalEvent.deltaY/8e3,cam.zoom=Math.abs(cam.zoom)},keyup:function(t){const e=t.key.toLowerCase();"w"===e&&(cam.key.w=!1),"s"===e&&(cam.key.s=!1),"a"===e&&(cam.key.a=!1),"d"===e&&(cam.key.d=!1)},keydown:function(t){cam.following=null;const e=t.key.toLowerCase();"w"===e&&(cam.key.w=!0,cam.key.s=!1),"s"===e&&(cam.key.s=!0,cam.key.w=!1),"a"===e&&(cam.key.a=!0,cam.key.d=!1),"d"===e&&(cam.key.d=!0,cam.key.s=!1)}}),cam.x=-bounds.center.x+canvas.width/2,cam.y=-bounds.center.y+canvas.height/2,cam.zoom=1,getIndex.inx=0;