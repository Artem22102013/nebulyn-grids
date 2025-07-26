# Nebulyn Grid Engine

A modular JavaScript grid engine for creating interactive 16x16 grids with port management and Minecraft-style color coding.

## Features

- 16x16 interactive grid with coordinate tracking (1,1 at bottom-left)
- Port management with input/output arrows
- Minecraft block and color selection
- Data persistence (localStorage + JSON file export/import)
- Color-specific grid generation
- Framework-free, pure JavaScript

## Quick Start

1. Clone this repository
2. Open `index.html` in your browser
3. Start adding ports and experimenting!

## Usage in Your Project

```html
<div id="my-grid"></div>
<script src="nebulyn-grid-engine.js"></script>
<script src="nebulyn-data-manager.js"></script>
<script>
  // Initialize grid
  const grid = new NebulynGridEngine('my-grid', {
    onCoordinateChange: (x, y) => console.log(\`Coordinate: \${x},\${y}\`)
  })
  
  // Add a port
  grid.addPort(5, 10, {
    inputArrow: true,
    outputArrow: false,
    block: 'stone',
    color: 'red'
  })
</script>
```

## API Reference

### NebulynGridEngine
- `addPort(x, y, config)` - Add a port at coordinates
- `removePort(x, y)` - Remove port at coordinates
- `getData()` - Get current grid data
- `setData(data)` - Load grid data
- `getPortAt(x, y)` - Get port at coordinates
- `clearAllPorts()` - Remove all ports

### NebulynDataManager
- `saveToLocalStorage(name, data)` - Save to browser storage
- `loadFromLocalStorage(name)` - Load from browser storage
- `exportToFile(data, filename)` - Export as JSON file
- `importFromFile(file)` - Import from JSON file
- `generateColorGrids(mainData)` - Create color-specific grids

## Use Cases

### Main Display (All Ports)
Shows all ports with arrows, blocks, and colors

### Color-Only Displays
Shows only ports of specific colors for individual grid displays

## Data Structure

```json
{
  "name": "Nebulyn Grid",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "gridSize": 16,
  "ports": [
    {
      "coordinate": "5,10",
      "inputArrow": true,
      "outputArrow": false,
      "block": "stone",
      "color": "red",
      "colorHex": "#B02E26"
    }
  ]
}
```

## License

MIT License
