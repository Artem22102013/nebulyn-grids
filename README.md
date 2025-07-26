# Nebulyn Grid Engine - Enhanced

A powerful, modular JavaScript grid engine for creating interactive 16x16 grids with advanced port management, multiple inputs/outputs, and Minecraft-style textures.

## ✨ New Features

- **Multiple I/O Support**: Each port can have multiple input and output arrows in 8 directions
- **Texture Support**: Load Minecraft block textures from a folder
- **Enhanced UI**: Beautiful gradient interface with intuitive controls
- **Advanced Port Builder**: Visual arrow placement and color selection
- **Port Statistics**: Track complexity and usage patterns
- **Improved Visuals**: Larger cells, better animations, and visual feedback

## 🚀 Quick Start

1. Clone this repository
2. Create a `textures/` folder and add your Minecraft block textures (PNG format)
3. Open `index.html` in your browser
4. Start building complex port networks!

## 📁 Texture Setup

Create a `textures/` folder in your project root and add PNG files named after blocks:
```
textures/
├── stone.png
├── dirt.png
├── iron_block.png
├── gold_block.png
├── diamond_block.png
└── ...
```

## 🎮 Usage

### Basic Port Creation
```javascript
// Create a port with multiple inputs/outputs
grid.addPort(5, 10, {
  inputArrows: ['top', 'left', 'bottom-left'],
  outputArrows: ['right', 'top-right'],
  block: 'iron_block',
  color: 'blue'
})
```

### Arrow Positions
Available positions: `top`, `top-right`, `right`, `bottom-right`, `bottom`, `bottom-left`, `left`, `top-left`

### Texture Loading
```javascript
// Set custom texture path
grid.setTextureBasePath('https://example.com/textures/')

// Or use local folder
grid.setTextureBasePath('./my-textures/')
```

## 🔧 API Reference

### Enhanced Methods
- `addInputArrow(x, y, position)` - Add input arrow to existing port
- `addOutputArrow(x, y, position)` - Add output arrow to existing port
- `removeInputArrow(x, y, position)` - Remove specific input arrow
- `removeOutputArrow(x, y, position)` - Remove specific output arrow
- `setTextureBasePath(path)` - Update texture folder path
- `getArrowPositions()` - Get available arrow positions

### Data Structure (Enhanced)
```json
{
  "name": "Nebulyn Grid",
  "version": "2.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "gridSize": 16,
  "textureBasePath": "./textures/",
  "ports": [
    {
      "coordinate": "5,10",
      "inputArrows": ["top", "left"],
      "outputArrows": ["right", "bottom-right"],
      "block": "iron_block",
      "color": "blue",
      "colorHex": "#3C44AA",
      "texture": "./textures/iron_block.png"
    }
  ]
}
```

## 🎨 Features

### Port Builder
- Visual arrow placement grid
- Color palette selection
- Block type dropdown
- Real-time preview

### Enhanced Visuals
- Larger 45px cells for better detail
- Smooth hover animations
- Port complexity indicators
- Texture loading with fallbacks
- Beautiful gradient backgrounds

### Advanced Management
- Port duplication
- Random port generation
- Statistics tracking
- Enhanced export/import

## 🌈 Color-Specific Grids

Generate separate grids for each color used:
```javascript
const colorGrids = dataManager.generateColorGrids(mainData)
// Creates individual grids for red, blue, green, etc.
```

## 📊 Statistics

Get detailed port statistics:
```javascript
const stats = dataManager.getGridStatistics(gridData)
console.log(`Total ports: ${stats.totalPorts}`)
console.log(`Most complex port: ${stats.mostComplexPort.coordinate}`)
```

## 🎯 Use Cases

- **Redstone Circuit Planning**: Design complex redstone contraptions
- **Factory Layouts**: Plan industrial automation systems  
- **Network Diagrams**: Visualize data flow and connections
- **Game Level Design**: Create interconnected game mechanics
- **Educational Tools**: Teach logic and circuit design

## 🔄 Migration from v1

The enhanced version is backward compatible. Old grids will load with single arrows converted to the new array format.

## 📝 License

MIT License - Feel free to use in your projects!
