'use strict';
addEventListener('message', async event=> {
  let source = event.data.image
  let response = await fetch(source)
  const blob = await response.blob()
  const bitmap = await createImageBitmap(blob)
  const off = new OffscreenCanvas(bitmap.width,bitmap.height),
  ctx = off.getContext('2d')
  ctx.drawImage(bitmap,0,0)
  let data = await off.convertToBlob()
  postMessage({new: data, old:event.data.id})
})