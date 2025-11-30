import { serve } from "https://deno.land/std@0.150.0/http/server.ts"
// import { serveDir } from "https://deno.land/std/http/file_server.ts"
// import { join } from "https://deno.land/std@0.150.0/path/mod.ts"
const COLLECTION_ID = '6922248b43b1c97be9be892d'
const API_KEY = '$2a$10$8vsegKBNSeF0l5/9AcuiMOsfODKzLH1vHTCF6cI.iQUJFibGzMgmW'
// In-memory cache - no expiration for immutable levels
const cache = new Map()
await serve(async req => {
    const url = new URL(req.url)

    switch (req.method) {
        case 'GET': {
            const id = url.searchParams.get('level')
            if (!id) return new Response('Missing level ID', { status: 400 })

            // Check cache first
            if (cache.has(id)) {
                return new Response(JSON.stringify(cache.get(id)), {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Cache': 'HIT',
                        'Cache-Control': 'public, max-age=31536000, immutable',
                        'access-control-allow-origin': '*'
                    }
                })
            }
            try {
                const level = await fetch(`https://api.jsonbin.io/v3/b/${id}`, {
                    headers: {
                        'X-Master-Key': API_KEY,
                        'X-Collection-Id': COLLECTION_ID,
                    }
                })

                if (!level.ok) throw new Error('Level Not Found')

                const data = (await level.json()).record

                // Store permanently in cache
                cache.set(id, data)

                return new Response(JSON.stringify(data), {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Cache': 'MISS',
                        'Cache-Control': 'public, max-age=31536000, immutable',
                        'access-control-allow-origin': '*'
                    }
                })
            } catch {
                return new Response(null, { status: 404 })
            }
        }

        case 'POST': {
            try {
                const data = await req.json()
                return await createLevel(data)
            } catch (err) {
                return new Response('Invalid JSON', { status: 400 })
            }
        }

        default:
            return new Response('Method Not Allowed', { status: 405 })
    }
})

function validate(level) {
    // Add your validation logic here
}
async function createLevel(data) {
    validate(data)
    const { title } = data
    const req = await fetch(`https://api.jsonbin.io/v3/b`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Collection-Id': COLLECTION_ID,
            'X-Master-Key': API_KEY,
            'X-Bin-Name': `${title || 'Untitled'}`,
        }
    })

    if (!req.ok) {
        throw new Error(`Error creating level: ${req.status} ${req.statusText}`)
    }
    const res = await req.json()
    const levelId = res.metadata.id
    // Permanently cache the newly created level
    cache.set(levelId, data)
    return new Response(levelId, {
        headers: { 'Content-Type': 'text/plain',
                                    'access-control-allow-origin': '*'

         }
    })
}