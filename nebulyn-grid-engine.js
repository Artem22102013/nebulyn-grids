class NebulynGridEngine {
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
    if (document.getElementById("nebulyn-grid-styles")) return

    const style = document.createElement("style")
    style.id = "nebulyn-grid-styles"
    style.textContent = `
      .nebulyn-grid {
        display: grid;
        grid-template-columns: repeat(16, ${this.cellSize}px);
        grid-template-rows: repeat(16, ${this.cellSize}px);
        gap: 1px;
        background-color: #1a1a1a;
        padding: 10px;
        border-radius: 8px;
        width: fit-content;
      }
      .nebulyn-cell {
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
      .nebulyn-cell:hover {
        background-color: #5a5a5a;
        border-color: #4caf50;
      }
      .nebulyn-cell.has-port {
        background-color: #2196f3;
      }
      .nebulyn-cell.selected {
        background-color: #ff9800;
        border-color: #ff5722;
      }
      .nebulyn-arrow {
        position: absolute;
        font-size: 12px;
        font-weight: bold;
      }
      .nebulyn-arrow.input {
        color: #4caf50;
        top: 2px;
        left: 2px;
      }
      .nebulyn-arrow.output {
        color: #f44336;
        top: 2px;
        right: 2px;
      }
      .nebulyn-color-indicator {
        position: absolute;
        bottom: 2px;
        left: 2px;
        width: 8px;
        height: 8px;
        border-radius: 2px;
      }
      .nebulyn-color-only {
        width: 100%;
        height: 100%;
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
    grid.className = "nebulyn-grid"
    grid.innerHTML = ""

    // Create cells from top to bottom (row 16 to 1)
    for (let row = this.gridSize; row >= 1; row--) {
      for (let col = 1; col <= this.gridSize; col++) {
        const cell = document.createElement("div")
        cell.className = "nebulyn-cell"
        cell.dataset.x = col
        cell.dataset.y = row
        cell.dataset.coord = `${col},${row}`

        cell.addEventListener("mouseenter", (e) => this.handleCellHover(e))
        cell.addEventListener("mouseleave", (e) => this.handleCellLeave(e))
        cell.addEventListener("click", (e) => this.handleCellClick(e))

        grid.appendChild(cell)
      }
    }

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

    document.querySelectorAll(".nebulyn-cell.selected").forEach((el) => {
      el.classList.remove("selected")
    })

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
      colorOnly: config.colorOnly || false,
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

    // Color-only mode (for individual color grids)
    if (portData.colorOnly) {
      const colorDiv = document.createElement("div")
      colorDiv.className = "nebulyn-color-only"
      colorDiv.style.backgroundColor = portData.colorHex
      cell.appendChild(colorDiv)
      cell.title = `Color: ${portData.color}, Block: ${portData.block}`
      return
    }

    // Full port mode (for main display)
    if (portData.inputArrow) {
      const inputArrow = document.createElement("div")
      inputArrow.className = "nebulyn-arrow input"
      inputArrow.textContent = "→"
      cell.appendChild(inputArrow)
    }

    if (portData.outputArrow) {
      const outputArrow = document.createElement("div")
      outputArrow.className = "nebulyn-arrow output"
      outputArrow.textContent = "←"
      cell.appendChild(outputArrow)
    }

    const colorIndicator = document.createElement("div")
    colorIndicator.className = "nebulyn-color-indicator"
    colorIndicator.style.backgroundColor = portData.colorHex
    cell.appendChild(colorIndicator)

    cell.title = `Block: ${portData.block}, Color: ${portData.color}`
  }

  // Data methods
  getData() {
    return {
      name: "Nebulyn Grid",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      gridSize: this.gridSize,
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
    document.querySelectorAll(".nebulyn-cell.has-port").forEach((cell) => {
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

  getPortsByColor(color) {
    return Array.from(this.ports.entries()).filter(([coord, port]) => port.color === color)
  }

  getAvailableColors() {
    return new Set(Array.from(this.ports.values()).map((port) => port.color))
  }
}

// Export for different module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = NebulynGridEngine
}
if (typeof window !== "undefined") {
  window.NebulynGridEngine = NebulynGridEngine
}
