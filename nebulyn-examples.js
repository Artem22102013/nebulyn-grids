// Example usage of Nebulyn Grid Engine

// Import or declare the NebulynDataManager and NebulynGridEngine variables
const NebulynDataManager = require("./NebulynDataManager") // Adjust the path as necessary
const NebulynGridEngine = require("./NebulynGridEngine") // Adjust the path as necessary

// Initialize the data manager
const dataManager = new NebulynDataManager()

// Example 1: Basic grid setup
function setupMainGrid() {
  const mainGrid = new NebulynGridEngine("main-grid", {
    onCoordinateChange: (x, y) => {
      document.getElementById("coordinates").textContent = `${x},${y}`
    },
    onPortChange: (action, coord, portData) => {
      console.log(`Port ${action} at ${coord}:`, portData)
      // Auto-save to localStorage
      dataManager.saveToLocalStorage("main-grid", mainGrid.getData())
    },
  })

  // Add some example ports
  mainGrid.addPort(5, 10, {
    inputArrow: true,
    outputArrow: false,
    block: "stone",
    color: "red",
  })

  mainGrid.addPort(8, 12, {
    inputArrow: false,
    outputArrow: true,
    block: "iron",
    color: "blue",
  })

  mainGrid.addPort(3, 7, {
    inputArrow: true,
    outputArrow: true,
    block: "gold",
    color: "red",
  })

  return mainGrid
}

// Example 2: Create color-specific grids
function createColorGrids(mainGrid) {
  const mainData = mainGrid.getData()
  const colorGrids = dataManager.generateColorGrids(mainData)

  // Create separate grid displays for each color
  Object.entries(colorGrids).forEach(([color, gridData]) => {
    // Create container for this color grid
    const container = document.createElement("div")
    container.id = `${color}-grid`
    container.innerHTML = `<h3>${color.toUpperCase()} Ports</h3>`
    document.body.appendChild(container)

    // Create the grid
    const colorGrid = new NebulynGridEngine(`${color}-grid`)
    colorGrid.setData(gridData)

    // Save this color grid
    dataManager.saveToLocalStorage(`${color}-grid`, gridData)
  })
}

// Example 3: Save and load operations
function setupSaveLoadButtons(grid) {
  // Save button
  document.getElementById("save-btn").addEventListener("click", () => {
    const data = grid.getData()
    dataManager.exportToFile(data, "my-nebulyn-grid.json")
  })

  // Load button
  document.getElementById("load-btn").addEventListener("click", () => {
    dataManager.createFileInput((data) => {
      grid.setData(data)
      console.log("Grid loaded successfully!")
    })
  })

  // Save to localStorage button
  document.getElementById("save-local-btn").addEventListener("click", () => {
    const gridName = prompt("Enter grid name:")
    if (gridName) {
      const success = dataManager.saveToLocalStorage(gridName, grid.getData())
      alert(success ? "Saved successfully!" : "Save failed!")
    }
  })

  // Load from localStorage button
  document.getElementById("load-local-btn").addEventListener("click", () => {
    const savedGrids = dataManager.listSavedGrids()
    if (savedGrids.length === 0) {
      alert("No saved grids found!")
      return
    }

    const gridList = savedGrids.map((g) => `${g.name} (${g.portCount} ports)`).join("\n")
    const gridName = prompt(`Select grid to load:\n${gridList}\n\nEnter grid name:`)

    if (gridName) {
      const data = dataManager.loadFromLocalStorage(gridName)
      if (data) {
        grid.setData(data)
        alert("Grid loaded successfully!")
      } else {
        alert("Grid not found!")
      }
    }
  })
}

// Example 4: Generate all color grids from main grid
function generateAllColorDisplays() {
  const mainGrid = new NebulynGridEngine("main-display")

  // Load main grid data
  const mainData = dataManager.loadFromLocalStorage("main-grid")
  if (mainData) {
    mainGrid.setData(mainData)

    // Generate color-specific grids
    const colorGrids = dataManager.generateColorGrids(mainData)

    // Export each color grid as separate JSON files
    Object.entries(colorGrids).forEach(([color, gridData]) => {
      dataManager.exportToFile(gridData, `nebulyn-${color}-grid.json`)
    })

    console.log("Generated color grids for:", Object.keys(colorGrids))
  }
}

// Example 5: Complete workflow
function completeWorkflow() {
  // 1. Setup main grid
  const mainGrid = setupMainGrid()

  // 2. Setup save/load functionality
  setupSaveLoadButtons(mainGrid)

  // 3. Auto-generate color grids when ports change
  mainGrid.onPortChange = (action, coord, portData) => {
    // Save main grid
    dataManager.saveToLocalStorage("main-grid", mainGrid.getData())

    // Regenerate color grids
    setTimeout(() => createColorGrids(mainGrid), 100)
  }

  return mainGrid
}

// Example data structure for a saved grid
const exampleGridData = {
  name: "Nebulyn Main Grid",
  version: "1.0.0",
  timestamp: "2024-01-15T10:30:00.000Z",
  gridSize: 16,
  ports: [
    {
      coordinate: "5,10",
      inputArrow: true,
      outputArrow: false,
      block: "stone",
      color: "red",
      colorHex: "#B02E26",
    },
    {
      coordinate: "8,12",
      inputArrow: false,
      outputArrow: true,
      block: "iron",
      color: "blue",
      colorHex: "#3C44AA",
    },
  ],
}

// Export examples
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    setupMainGrid,
    createColorGrids,
    setupSaveLoadButtons,
    generateAllColorDisplays,
    completeWorkflow,
    exampleGridData,
  }
}
