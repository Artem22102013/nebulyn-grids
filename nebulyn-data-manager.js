class NebulynDataManager {
  constructor() {
    this.storageKey = "nebulyn-grids-enhanced"
  }

  // Save to localStorage
  saveToLocalStorage(gridName, data) {
    try {
      const savedGrids = this.getLocalStorageGrids()
      savedGrids[gridName] = {
        ...data,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(this.storageKey, JSON.stringify(savedGrids))
      return true
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
      return false
    }
  }

  // Load from localStorage
  loadFromLocalStorage(gridName) {
    try {
      const savedGrids = this.getLocalStorageGrids()
      return savedGrids[gridName] || null
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
      return null
    }
  }

  // Get all saved grids from localStorage
  getLocalStorageGrids() {
    try {
      const saved = localStorage.getItem(this.storageKey)
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error("Failed to get localStorage grids:", error)
      return {}
    }
  }

  // List all saved grid names
  listSavedGrids() {
    const grids = this.getLocalStorageGrids()
    return Object.keys(grids).map((name) => ({
      name,
      savedAt: grids[name].savedAt,
      portCount: grids[name].ports ? grids[name].ports.length : 0,
      version: grids[name].version || "1.0.0",
    }))
  }

  // Delete a saved grid
  deleteGrid(gridName) {
    try {
      const savedGrids = this.getLocalStorageGrids()
      delete savedGrids[gridName]
      localStorage.setItem(this.storageKey, JSON.stringify(savedGrids))
      return true
    } catch (error) {
      console.error("Failed to delete grid:", error)
      return false
    }
  }

  // Export grid data as JSON file
  exportToFile(data, filename = "nebulyn-enhanced-grid.json") {
    try {
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error("Failed to export file:", error)
      return false
    }
  }

  // Import grid data from JSON file
  importFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || file.type !== "application/json") {
        reject(new Error("Please select a valid JSON file"))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          resolve(data)
        } catch (error) {
          reject(new Error("Invalid JSON file format"))
        }
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  // Create a file input for importing
  createFileInput(onImport) {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.style.display = "none"

    input.addEventListener("change", async (e) => {
      const file = e.target.files[0]
      if (file) {
        try {
          const data = await this.importFromFile(file)
          onImport(data)
        } catch (error) {
          console.error("Import failed:", error)
          alert("Failed to import file: " + error.message)
        }
      }
    })

    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  }

  // Generate color-specific grids from main grid (enhanced for multiple I/O)
  generateColorGrids(mainGridData) {
    const colorGrids = {}
    const colors = new Set()

    // Collect all colors used
    mainGridData.ports.forEach((port) => {
      colors.add(port.color)
    })

    // Create a grid for each color
    colors.forEach((color) => {
      colorGrids[color] = {
        name: `Nebulyn ${color.charAt(0).toUpperCase() + color.slice(1)} Enhanced Grid`,
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        gridSize: mainGridData.gridSize || 16,
        textureBasePath: mainGridData.textureBasePath,
        color: color,
        ports: mainGridData.ports
          .filter((port) => port.color === color)
          .map((port) => ({
            ...port,
            colorOnly: true,
          })),
      }
    })

    return colorGrids
  }

  // Merge multiple color grids back into main grid
  mergeColorGrids(colorGrids) {
    const allPorts = []
    let textureBasePath = "./textures/"

    Object.values(colorGrids).forEach((grid) => {
      if (grid.textureBasePath) {
        textureBasePath = grid.textureBasePath
      }
      if (grid.ports) {
        grid.ports.forEach((port) => {
          allPorts.push({
            ...port,
            colorOnly: false, // Reset to full display mode
          })
        })
      }
    })

    return {
      name: "Nebulyn Enhanced Merged Grid",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      gridSize: 16,
      textureBasePath: textureBasePath,
      ports: allPorts,
    }
  }

  // Enhanced statistics
  getGridStatistics(gridData) {
    if (!gridData.ports) return null

    const stats = {
      totalPorts: gridData.ports.length,
      totalInputs: 0,
      totalOutputs: 0,
      colorBreakdown: {},
      blockBreakdown: {},
      averageInputsPerPort: 0,
      averageOutputsPerPort: 0,
      mostComplexPort: null,
      maxComplexity: 0,
    }

    gridData.ports.forEach((port) => {
      const inputs = port.inputArrows ? port.inputArrows.length : 0
      const outputs = port.outputArrows ? port.outputArrows.length : 0
      const complexity = inputs + outputs

      stats.totalInputs += inputs
      stats.totalOutputs += outputs

      // Track most complex port
      if (complexity > stats.maxComplexity) {
        stats.maxComplexity = complexity
        stats.mostComplexPort = {
          coordinate: port.coordinate,
          inputs,
          outputs,
          block: port.block,
          color: port.color,
        }
      }

      // Color breakdown
      stats.colorBreakdown[port.color] = (stats.colorBreakdown[port.color] || 0) + 1

      // Block breakdown
      stats.blockBreakdown[port.block] = (stats.blockBreakdown[port.block] || 0) + 1
    })

    stats.averageInputsPerPort = stats.totalInputs / stats.totalPorts
    stats.averageOutputsPerPort = stats.totalOutputs / stats.totalPorts

    return stats
  }
}

// Export for different module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = NebulynDataManager
}
if (typeof window !== "undefined") {
  window.NebulynDataManager = NebulynDataManager
}
