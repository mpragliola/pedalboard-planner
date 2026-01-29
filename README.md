# 🎸 Guitar Pedalboard Builder

A React-based drag-and-drop tool for building virtual guitar pedalboards. Drag objects from the library onto your pedalboard and arrange them to create your perfect signal chain.

## Features

- 🎯 **Drag & Drop**: Intuitive drag-and-drop interface for adding objects
- 🔄 **Reorder**: Drag objects within the pedalboard to reorder them
- 🗑️ **Remove**: Click the × button to remove objects from your board
- 🎨 **Beautiful UI**: Modern, responsive design with gradient backgrounds
- 📱 **Responsive**: Works on desktop and mobile devices
- 🎛️ **Multiple Object Types**: Support for effect pedals, power units, multieffects, expression pedals, and MIDI controllers
- 🎨 **Visual Differentiation**: Each object type has unique visual styling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Usage

1. **Add Objects**: Drag any object from the "Object Library" panel on the left onto the pedalboard
2. **Reorder**: Drag objects within the pedalboard to change their order
3. **Remove**: Hover over an object and click the × button in the top-right corner

## Available Object Types

### Effect Pedals
- Distortion, Overdrive, Fuzz, Chorus, Delay, Reverb, Wah, Phaser, Flanger, Tremolo, Compressor, EQ

### Power Units
- Power Supply 1, Power Supply 2, Isolated Power

### Multieffects
- Helix, GT-1000, Kemper, Axe-Fx

### Expression Pedals
- Expression Pedal, Volume Pedal, Wah Expression

### MIDI Controllers
- MIDI Controller, MIDI Footswitch, MIDI Looper

## Technologies Used

- **React** - UI framework
- **Vite** - Build tool and dev server
- **react-dnd** - Drag and drop functionality
- **CSS3** - Styling with modern features

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT
