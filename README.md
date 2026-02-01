# 🎸 PedalboardFactory

A professional, high-performance web application for planning and visualizing guitar pedalboard layouts.

## 🌟 Overview

PedalboardFactory allows musicians to accurately plan their signal chains by providing a library of real-world pedalboards and effects units with precise dimensions. Users can drag, rotate, and arrange gear on a virtual canvas to ensure everything fits before committing to a physical build.

## ✨ Features

- 📏 **Accurate Dimensions**: Every board and device is modeled with real-world measurements in mm.
- 🎯 **Interactive Canvas**: Drag-and-drop gear with pixel-perfect precision; pinch-to-zoom and selection/drag are mutually exclusive on touch devices.
- 🔄 **Orientation Control**: Rotate objects in 90-degree increments to find the perfect fit.
- 🔍 **Dynamic Zoom & Pan**: Navigate large boards with intuitive mouse, keyboard, and touch controls (including pinch-to-zoom).
- 🌓 **Unit Switching**: Toggle between Metric (mm/cm) and Imperial (inches) units instantly.
- 📋 **Detailed Info**: View precise dimensions of selected items in a real-time info popup.
- 📐 **Ruler Tools**: Rectangle ruler for distance measurement; polyline ruler for cable length.
- 💾 **Save & Load**: Export pedalboard layout to JSON (current configuration only); load from file.
- ⚠️ **Confirmation Dialogs**: Confirm before clearing the board or deleting items.
- 🖼️ **High-Quality Assets**: Visual representations for popular brands like Boss, MXR, Dunlop, Pedaltrain, and more.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher recommended
- **npm**: v9 or higher

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/pedal.git
    cd pedal
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  **Open in browser**:
    Navigate to `http://localhost:5173` (or the port specified in your terminal).

## 🛠️ Built With

- **React 18**: For a responsive and declarative UI.
- **Vite**: For lightning-fast builds and HMR.
- **TypeScript**: Ensuring robust data structures and type safety.
- **CSS3**: Custom layouts with CSS Variables and Flexbox/Grid.

## ⚖️ Legal Disclaimer

**Trademark & Copyright Notice:**

This application is intended for personal, non-commercial planning purposes only. 

All product names, logos, brands, models, and trademarks mentioned or shown within this application are the property of their respective owners. These owners are not affiliated with this project, and their mention does not imply endorsement or sponsorship. 


All trademarks and copyrights are the property of their respective owners.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
