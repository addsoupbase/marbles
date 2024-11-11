'use strict'
addEventListener('message', event=>{
    let {state,operation,value} = event.data
    postMessage({state,image: [1,2,34,],value})
})