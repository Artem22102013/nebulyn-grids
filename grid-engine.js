class GridEngine {
  constructor(containerId, options = {}) {
    this.containerId = containerId
    this.gridSize = 16
    this.cellSize = options.cellSize || 30
    this.currentCoordinate = { x: 1, y: 1 }
    this.lastCoordinate = { x: 1, y: 1 }
    this.ports = new Map()
    this.selectedCell = null
    this.onCoordinateChange = options.onCoordinateChange || null
    this.onPortChange = options.onPortChange || null

    // Minecraft colors
    this.minecraftColors = {
      white: "#F9FFFE",
      orange: "#F9801D",
      magenta: "#C74EBD",
      lightblue: "#3AB3DA",
      yellow: "#FED83D",
      lime: "#80C71F",
      pink: "#F38BAA",
      gray: "#474F52",
      lightgray: "#9D9D97",
      cyan: "#169C9C",
      purple: "#8932B8",
      blue: "#3C44AA",
      brown: "#835432",
      green: "#5E7C16",
      red: "#B02E26",
      black: "#1D1D21",
    }

    this.init()
  }

  init() {
    this.createGrid()
    this.injectStyles()
  }

  injectStyles() {
    if (document.getElementById("grid-engine-styles")) return

    const style = document.createElement("style")
    style.id = "grid-engine-styles"
    style.textContent = `
      .grid-engine {
        display: grid;
        grid-template-columns: repeat(16, ${this.cellSize}px);
        grid-template-rows: repeat(16, ${this.cellSize}px);
        gap: 1px;
        background-color: #1a1a1a;
        padding: 10px;
        border-radius: 8px;
        width: fit-content;
      }
      .grid-engine-cell {
        width: ${this.cellSize}px;
        height: ${this.cellSize}px;
        background-color: #4a4a4a;
        border: 1px solid #666;
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
      }
      .grid-engine-cell:hover {
        background-color: #5a5a5a;
        border-color: #4caf50;
      }
      .grid-engine-cell.has-port {
        background-color: #2196f3;
      }
      .grid-engine-cell.selected {
        background-color: #ff9800;
        border-color: #ff5722;
      }
      .grid-arrow {
        position: absolute;
        font-size: 12px;
        font-weight: bold;
      }
      .grid-arrow.input {
        color: #4caf50;
        top: 2px;
        left: 2px;
      }
      .grid-arrow.output {
        color: #f44336;
        top: 2px;
        right: 2px;
      }
      .grid-color-indicator {
        position: absolute;
        bottom: 2px;
        left: 2px;
        width: 8px;
        height: 8px;
        border-radius: 2px;
      }
    `
    document.head.appendChild(style)
  }

  createGrid() {
    const container = document.getElementById(this.containerId)
    if (!container) {
      throw new Error(`Container with id "${this.containerId}" not found`)
    }

    const grid = document.createElement("div")
    grid.className = "grid-engine"
    grid.innerHTML = ""

    // Create cells from top to bottom (row 16 to 1)
    for (let row = this.gridSize; row >= 1; row--) {
      for (let col = 1; col <= this.gridSize; col++) {
        const cell = document.createElement("div")
        cell.className = "grid-engine-cell"
        cell.dataset.x = col
        cell.dataset.y = row
        cell.dataset.coord = `${col},${row}`

        cell.addEventListener("mouseenter", (e) => this.handleCellHover(e))
        cell.addEventListener("mouseleave", (e) => this.handleCellLeave(e))
        cell.addEventListener("click", (e) => this.handleCellClick(e))

        grid.appendChild(cell)
      }
    }

    // Handle mouse leaving entire grid
    grid.addEventListener("mouseleave", () => {
      this.updateCoordinate(this.lastCoordinate.x, this.lastCoordinate.y)
    })

    container.innerHTML = ""
    container.appendChild(grid)
  }

  handleCellHover(e) {
    const x = Number.parseInt(e.target.dataset.x)
    const y = Number.parseInt(e.target.dataset.y)
    this.currentCoordinate = { x, y }
    this.updateCoordinate(x, y)
  }

  handleCellLeave(e) {
    this.lastCoordinate = { ...this.currentCoordinate }
  }

  handleCellClick(e) {
    const cell = e.target
    const coord = cell.dataset.coord

    // Clear previous selection
    document.querySelectorAll(".grid-engine-cell.selected").forEach((el) => {
      el.classList.remove("selected")
    })

    // Select current cell
    cell.classList.add("selected")
    this.selectedCell = coord
  }

  updateCoordinate(x, y) {
    this.currentCoordinate = { x, y }
    if (this.onCoordinateChange) {
      this.onCoordinateChange(x, y)
    }
  }

  // Port management methods
  addPort(x, y, config) {
    const coord = `${x},${y}`
    const portData = {
      inputArrow: config.inputArrow || false,
      outputArrow: config.outputArrow || false,
      block: config.block || "stone",
      color: config.color || "white",
      colorHex: this.minecraftColors[config.color] || this.minecraftColors.white,
    }

    this.ports.set(coord, portData)
    this.renderPort(coord, portData)

    if (this.onPortChange) {
      this.onPortChange("add", coord, portData)
    }

    return portData
  }

  removePort(x, y) {
    const coord = `${x},${y}`
    if (this.ports.has(coord)) {
      const portData = this.ports.get(coord)
      this.ports.delete(coord)

      const cell = document.querySelector(`[data-coord="${coord}"]`)
      if (cell) {
        cell.classList.remove("has-port")
        cell.innerHTML = ""
        cell.title = ""
      }

      if (this.onPortChange) {
        this.onPortChange("remove", coord, portData)
      }

      return true
    }
    return false
  }

  renderPort(coord, portData) {
    const cell = document.querySelector(`[data-coord="${coord}"]`)
    if (!cell) return

    cell.classList.add("has-port")
    cell.innerHTML = ""

    // Add arrows
    if (portData.inputArrow) {
      const inputArrow = document.createElement("div")
      inputArrow.className = "grid-arrow input"
      inputArrow.textContent = "→"
      cell.appendChild(inputArrow)
    }

    if (portData.outputArrow) {
      const outputArrow = document.createElement("div")
      outputArrow.className = "grid-arrow output"
      outputArrow.textContent = "←"
      cell.appendChild(outputArrow)
    }

    // Add color indicator
    const colorIndicator = document.createElement("div")
    colorIndicator.className = "grid-color-indicator"
    colorIndicator.style.backgroundColor = portData.colorHex
    cell.appendChild(colorIndicator)

    // Add tooltip
    cell.title = `Block: ${portData.block}, Color: ${portData.color}`
  }

  // Data methods
  getData() {
    return {
      ports: Array.from(this.ports.entries()).map(([coord, portData]) => ({
        coordinate: coord,
        ...portData,
      })),
    }
  }

  setData(data) {
    this.clearAllPorts()
    if (data.ports && Array.isArray(data.ports)) {
      data.ports.forEach((portInfo) => {
        const { coordinate, ...portData } = portInfo
        const [x, y] = coordinate.split(",").map(Number)
        this.addPort(x, y, portData)
      })
    }
  }

  clearAllPorts() {
    this.ports.clear()
    document.querySelectorAll(".grid-engine-cell.has-port").forEach((cell) => {
      cell.classList.remove("has-port")
      cell.innerHTML = ""
      cell.title = ""
    })
  }

  // Utility methods
  getPortAt(x, y) {
    return this.ports.get(`${x},${y}`)
  }

  getAllPorts() {
    return Array.from(this.ports.entries())
  }

  getCurrentCoordinate() {
    return { ...this.currentCoordinate }
  }

  getSelectedCell() {
    return this.selectedCell
  }

  getMinecraftColors() {
    return { ...this.minecraftColors }
  }
}

// Export for different module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = GridEngine
}
if (typeof window !== "undefined") {
  window.GridEngine = GridEngine
}
