let out={
    music: new Set,
    sfx: new Set
}
for (let src of new Set('beach flowers freshair garden leaves love peach rainbow spring'.split(' ').map(o=>o+'.mp3'))) {
    out.music.add(new Audio('./audio/'+src))
}
for (let src of new Set('confirm click pop'.split(' ').map(o=>o+'.mp3'))) {
    out.sfx.add(new Audio('./audio/'+src))
}
console.log('Audio loaded')
console.log('All music credit goes to %c@SakuraGirl%c on youtube: ','color:pink;font-size:16px;font-family:arial;','color:white;')
console.log('%chttps://www.youtube.com/@SakuraGirl/',  'color: blue; text-decoration: underline; cursor: pointer;')
export default out