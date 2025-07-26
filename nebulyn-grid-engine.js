class NebulynGridEngine {
  constructor(containerId, options = {}) {
    this.containerId = containerId
    this.gridSize = 16
    this.cellSize = options.cellSize || 40 // Increased for better visuals
    this.currentCoordinate = { x: 1, y: 1 }
    this.lastCoordinate = { x: 1, y: 1 }
    this.ports = new Map()
    this.selectedCell = null
    this.onCoordinateChange = options.onCoordinateChange || null
    this.onPortChange = options.onPortChange || null
    this.textureBasePath = options.textureBasePath || "./textures/" // Path to texture folder

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

    // Arrow positions (8 directions around the cell)
    this.arrowPositions = {
      top: { x: "50%", y: "2px", transform: "translateX(-50%)", rotation: "0deg" },
      "top-right": { x: "calc(100% - 2px)", y: "2px", transform: "translateX(-100%)", rotation: "45deg" },
      right: { x: "calc(100% - 2px)", y: "50%", transform: "translateX(-100%) translateY(-50%)", rotation: "90deg" },
      "bottom-right": {
        x: "calc(100% - 2px)",
        y: "calc(100% - 2px)",
        transform: "translateX(-100%) translateY(-100%)",
        rotation: "135deg",
      },
      bottom: { x: "50%", y: "calc(100% - 2px)", transform: "translateX(-50%) translateY(-100%)", rotation: "180deg" },
      "bottom-left": { x: "2px", y: "calc(100% - 2px)", transform: "translateY(-100%)", rotation: "225deg" },
      left: { x: "2px", y: "50%", transform: "translateY(-50%)", rotation: "270deg" },
      "top-left": { x: "2px", y: "2px", transform: "", rotation: "315deg" },
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
        gap: 2px;
        background-color: #1a1a1a;
        padding: 15px;
        border-radius: 12px;
        width: fit-content;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      }
      .nebulyn-cell {
        width: ${this.cellSize}px;
        height: ${this.cellSize}px;
        background-color: #4a4a4a;
        border: 2px solid #666;
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      .nebulyn-cell:hover {
        background-color: #5a5a5a;
        border-color: #4caf50;
        transform: scale(1.05);
      }
      .nebulyn-cell.has-port {
        background-color: #2196f3;
        border-color: #1976d2;
      }
      .nebulyn-cell.selected {
        background-color: #ff9800;
        border-color: #ff5722;
        box-shadow: 0 0 15px rgba(255, 152, 0, 0.5);
      }
      .nebulyn-arrow {
        position: absolute;
        font-size: 14px;
        font-weight: bold;
        z-index: 10;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        pointer-events: none;
      }
      .nebulyn-arrow.input {
        color: #4caf50;
      }
      .nebulyn-arrow.output {
        color: #f44336;
      }
      .nebulyn-color-indicator {
        position: absolute;
        bottom: 3px;
        left: 3px;
        width: 12px;
        height: 12px;
        border-radius: 3px;
        border: 1px solid rgba(255,255,255,0.3);
        z-index: 5;
      }
      .nebulyn-color-only {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        border: 2px solid rgba(255,255,255,0.2);
      }
      .nebulyn-texture {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        background-size: cover;
        background-position: center;
        border-radius: 2px;
        opacity: 0.8;
        z-index: 3;
      }
      .nebulyn-port-count {
        position: absolute;
        top: 2px;
        right: 2px;
        background: rgba(0,0,0,0.7);
        color: white;
        font-size: 8px;
        padding: 1px 3px;
        border-radius: 2px;
        z-index: 15;
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

  // Enhanced port management with multiple inputs/outputs
  addPort(x, y, config) {
    const coord = `${x},${y}`
    const portData = {
      inputArrows: config.inputArrows || [], // Array of positions: ['top', 'left', etc.]
      outputArrows: config.outputArrows || [], // Array of positions
      block: config.block || "stone",
      color: config.color || "white",
      colorHex: this.minecraftColors[config.color] || this.minecraftColors.white,
      colorOnly: config.colorOnly || false,
      texture: config.texture || null, // Custom texture path
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

    // Add texture background
    if (portData.texture) {
      const textureDiv = document.createElement("div")
      textureDiv.className = "nebulyn-texture"
      textureDiv.style.backgroundImage = `url(${portData.texture})`
      cell.appendChild(textureDiv)
    } else if (portData.block) {
      // Try to load default texture
      const textureDiv = document.createElement("div")
      textureDiv.className = "nebulyn-texture"
      textureDiv.style.backgroundImage = `url(${this.textureBasePath}${portData.block}.png)`
      textureDiv.onerror = () => {
        // Fallback to solid color if texture fails to load
        textureDiv.style.backgroundImage = "none"
        textureDiv.style.backgroundColor = portData.colorHex
        textureDiv.style.opacity = "0.3"
      }
      cell.appendChild(textureDiv)
    }

    // Add multiple input arrows
    portData.inputArrows.forEach((position, index) => {
      if (this.arrowPositions[position]) {
        const inputArrow = document.createElement("div")
        inputArrow.className = "nebulyn-arrow input"
        inputArrow.textContent = "→"
        inputArrow.style.left = this.arrowPositions[position].x
        inputArrow.style.top = this.arrowPositions[position].y
        inputArrow.style.transform = this.arrowPositions[position].transform
        cell.appendChild(inputArrow)
      }
    })

    // Add multiple output arrows
    portData.outputArrows.forEach((position, index) => {
      if (this.arrowPositions[position]) {
        const outputArrow = document.createElement("div")
        outputArrow.className = "nebulyn-arrow output"
        outputArrow.textContent = "←"
        outputArrow.style.left = this.arrowPositions[position].x
        outputArrow.style.top = this.arrowPositions[position].y
        outputArrow.style.transform = this.arrowPositions[position].transform
        cell.appendChild(outputArrow)
      }
    })

    // Add color indicator
    const colorIndicator = document.createElement("div")
    colorIndicator.className = "nebulyn-color-indicator"
    colorIndicator.style.backgroundColor = portData.colorHex
    cell.appendChild(colorIndicator)

    // Add port count indicator
    const totalArrows = portData.inputArrows.length + portData.outputArrows.length
    if (totalArrows > 0) {
      const countIndicator = document.createElement("div")
      countIndicator.className = "nebulyn-port-count"
      countIndicator.textContent = `${portData.inputArrows.length}/${portData.outputArrows.length}`
      countIndicator.title = `${portData.inputArrows.length} inputs, ${portData.outputArrows.length} outputs`
      cell.appendChild(countIndicator)
    }

    // Enhanced tooltip
    const inputs = portData.inputArrows.length
    const outputs = portData.outputArrows.length
    cell.title = `Block: ${portData.block}\nColor: ${portData.color}\nInputs: ${inputs} (${portData.inputArrows.join(", ")})\nOutputs: ${outputs} (${portData.outputArrows.join(", ")})`
  }

  // Enhanced data methods
  getData() {
    return {
      name: "Nebulyn Grid",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      gridSize: this.gridSize,
      textureBasePath: this.textureBasePath,
      ports: Array.from(this.ports.entries()).map(([coord, portData]) => ({
        coordinate: coord,
        ...portData,
      })),
    }
  }

  setData(data) {
    this.clearAllPorts()
    if (data.textureBasePath) {
      this.textureBasePath = data.textureBasePath
    }
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

  // Helper methods for arrow management
  addInputArrow(x, y, position) {
    const coord = `${x},${y}`
    const port = this.ports.get(coord)
    if (port && !port.inputArrows.includes(position)) {
      port.inputArrows.push(position)
      this.renderPort(coord, port)
      return true
    }
    return false
  }

  addOutputArrow(x, y, position) {
    const coord = `${x},${y}`
    const port = this.ports.get(coord)
    if (port && !port.outputArrows.includes(position)) {
      port.outputArrows.push(position)
      this.renderPort(coord, port)
      return true
    }
    return false
  }

  removeInputArrow(x, y, position) {
    const coord = `${x},${y}`
    const port = this.ports.get(coord)
    if (port) {
      const index = port.inputArrows.indexOf(position)
      if (index > -1) {
        port.inputArrows.splice(index, 1)
        this.renderPort(coord, port)
        return true
      }
    }
    return false
  }

  removeOutputArrow(x, y, position) {
    const coord = `${x},${y}`
    const port = this.ports.get(coord)
    if (port) {
      const index = port.outputArrows.indexOf(position)
      if (index > -1) {
        port.outputArrows.splice(index, 1)
        this.renderPort(coord, port)
        return true
      }
    }
    return false
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

  getArrowPositions() {
    return Object.keys(this.arrowPositions)
  }

  getPortsByColor(color) {
    return Array.from(this.ports.entries()).filter(([coord, port]) => port.color === color)
  }

  getAvailableColors() {
    return new Set(Array.from(this.ports.values()).map((port) => port.color))
  }

  setTextureBasePath(path) {
    this.textureBasePath = path
    // Re-render all ports to update textures
    this.ports.forEach((portData, coord) => {
      this.renderPort(coord, portData)
    })
  }
}

// Export for different module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = NebulynGridEngine
}
if (typeof window !== "undefined") {
  window.NebulynGridEngine = NebulynGridEngine
}
