// API integration functions for Wrangler Pages
class GridEngineAPI {
  constructor(gridEngine) {
    this.gridEngine = gridEngine
    this.baseUrl = "/api" // Adjust based on your Wrangler Pages setup
  }

  async saveToServer() {
    try {
      const data = this.gridEngine.getData()
      const response = await fetch(`${this.baseUrl}/save-grid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Grid saved successfully:", result)
        return result
      } else {
        throw new Error("Failed to save grid")
      }
    } catch (error) {
      console.error("Error saving grid:", error)
      throw error
    }
  }

  async loadFromServer(gridId) {
    try {
      const response = await fetch(`${this.baseUrl}/load-grid/${gridId}`)

      if (response.ok) {
        const data = await response.json()
        this.gridEngine.setData(data)
        console.log("Grid loaded successfully")
        return data
      } else {
        throw new Error("Failed to load grid")
      }
    } catch (error) {
      console.error("Error loading grid:", error)
      throw error
    }
  }

  async listSavedGrids() {
    try {
      const response = await fetch(`${this.baseUrl}/list-grids`)

      if (response.ok) {
        const grids = await response.json()
        return grids
      } else {
        throw new Error("Failed to list grids")
      }
    } catch (error) {
      console.error("Error listing grids:", error)
      throw error
    }
  }
}

// Usage example:
// const api = new GridEngineAPI(gridEngine);
// api.saveToServer().then(result => console.log('Saved:', result));
