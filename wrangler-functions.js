// Example Wrangler Pages Functions for the backend
// Place this in your functions directory

// functions/api/save-grid.js
export async function onRequestPost(context) {
  try {
    const { request, env } = context
    const data = await request.json()

    // Generate a unique ID for the grid
    const gridId = crypto.randomUUID()
    const timestamp = new Date().toISOString()

    const gridData = {
      id: gridId,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Store in KV (if using Cloudflare KV)
    if (env.GRID_STORAGE) {
      await env.GRID_STORAGE.put(`grid:${gridId}`, JSON.stringify(gridData))
    }

    return Response.json({
      success: true,
      gridId: gridId,
      message: "Grid saved successfully",
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

// functions/api/load-grid/[id].js
export async function onRequestGet(context) {
  try {
    const { params, env } = context
    const gridId = params.id

    if (env.GRID_STORAGE) {
      const gridData = await env.GRID_STORAGE.get(`grid:${gridId}`)

      if (gridData) {
        return Response.json(JSON.parse(gridData))
      } else {
        return Response.json(
          {
            success: false,
            error: "Grid not found",
          },
          { status: 404 },
        )
      }
    }

    return Response.json(
      {
        success: false,
        error: "Storage not available",
      },
      { status: 500 },
    )
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

// functions/api/list-grids.js
export async function listGrids(context) {
  try {
    const { env } = context

    if (env.GRID_STORAGE) {
      const list = await env.GRID_STORAGE.list({ prefix: "grid:" })
      const grids = []

      for (const key of list.keys) {
        const data = await env.GRID_STORAGE.get(key.name)
        if (data) {
          const gridData = JSON.parse(data)
          grids.push({
            id: gridData.id,
            createdAt: gridData.createdAt,
            updatedAt: gridData.updatedAt,
            portCount: gridData.ports ? gridData.ports.length : 0,
          })
        }
      }

      return Response.json(grids)
    }

    return Response.json([])
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
