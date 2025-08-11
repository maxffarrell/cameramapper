# Camera System Designer - App Reconstruction Prompt

## Overview
You are to recreate a **Camera System Designer** web application that allows security professionals to design surveillance camera systems by placing cameras and infrastructure components on floor plan PDFs with visual field-of-view coverage areas.

## Core Application Purpose
Professional security system design tool for:
- Placing security cameras on architectural floor plans
- Visualizing camera field-of-view (FOV) coverage areas
- Managing camera models with specifications (FOV angle, range, features)
- Adding network infrastructure components (servers, switches, distribution frames)
- Calculating real-world coordinates using scale measurements
- Exporting system designs to CSV for procurement and installation

## Architecture & Technology Stack

### Frontend Technology
- **Pure HTML5/CSS3/JavaScript** (no frameworks)
- **PDF.js** for PDF floor plan rendering (`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`)
- **Canvas API** for PDF rendering and coordinate system
- **SVG** for dynamic field-of-view arc visualization
- **CSS Custom Properties** for comprehensive theming system
- **ES6 Classes** with modular object-oriented design

### Development Environment
- **Node.js** development setup with npm
- **ESLint + TypeScript** for code quality
- **http-server** for local development
- **TypeScript definitions** for PDF.js integration

## File Structure
```
/
├── camera_design_app.html          # Main application file
├── app.js                         # Core application logic
├── js/camera-app.js              # Alternative implementation
├── package-lock.json             # Dependencies lockfile
├── dist/                         # Build output directory
├── src/types/                    # TypeScript type definitions
└── node_modules/                 # Dependencies
```

## Core Features & Functionality

### 1. PDF Floor Plan Management
- **File Upload**: Drag-and-drop or click-to-upload PDF floor plans
- **PDF Rendering**: First page rendering at 1.5x scale using PDF.js
- **Viewport Integration**: Canvas-based rendering with zoom/pan capabilities
- **Scale Calibration**: Interactive scale measurement tool for real-world coordinate mapping

### 2. Camera System Design
- **Camera Placement**: Drag-and-drop cameras from sidebar palette onto floor plan
- **FOV Visualization**: Real-time SVG arc rendering showing camera coverage areas
- **Camera Properties**: 
  - Position coordinates (X, Y in feet/meters)
  - Rotation angle (0-360 degrees)
  - Field of view angle override
  - Detection range override
  - Custom labeling and notes
- **Selection System**: Click-to-select with visual highlighting and property panels

### 3. Camera Model Database
- **Pre-configured Models**: Hikvision, Dahua, Axis camera specifications
- **Model Properties**: 
  - FOV angle (10-180 degrees)
  - Detection range (5-200 feet)
  - Feature badges (Night Vision, Varifocal, PTZ, Audio)
- **Custom Models**: Add new camera models with full specification control
- **Visual Representation**: Emoji-based icons with hover tooltips

### 4. Infrastructure Components
- **Network Infrastructure**: IDF, MDF, PoE switches, recording servers
- **Drag-and-Drop Placement**: Same interaction model as cameras
- **Visual Distinction**: Color-coded icons and styling per component type

### 5. Interactive Tools & Controls
- **Multi-Tool System**:
  - Select tool (default): Element selection and property editing
  - Pan tool: Canvas navigation
  - Scale tool: Measurement reference drawing
- **Zoom Controls**: In/out/reset with mouse wheel support
- **Properties Panel**: Dynamic sidebar with context-sensitive controls
- **Toolbar**: Floating bottom toolbar with tool selection

### 6. Scale & Measurement System
- **Interactive Scale Drawing**: Click-and-drag to create reference measurements
- **Unit Support**: Feet, meters, inches, centimeters
- **Real-time Conversion**: Pixel-to-real-world coordinate transformation
- **Manual Scale Input**: Direct scale factor entry (feet per inch)
- **Visual Feedback**: Scale lines with endpoint markers

### 7. Data Management
- **Project Persistence**: JSON-based save/load functionality
- **CSV Export**: Comprehensive equipment list with coordinates and specifications
- **BOM Generation**: UTF-8 encoded export with feature details
- **Local Storage**: Theme preference persistence

## User Interface Design System

### Theme System
- **Light/Dark Mode**: Complete dual-theme support
- **CSS Custom Properties**: Systematic color and spacing variables
- **Dynamic Switching**: Runtime theme toggle with persistence
- **Consistent Styling**: Unified design language across all components

### Layout Structure
- **Header Bar**: Title, theme toggle, project controls (load/save/export)
- **Sidebar (300px)**: 
  - Floor plan upload and scale tools
  - Camera model palette with search/filter
  - Infrastructure component palette
  - Selected element properties panel
- **Main Canvas Area**: PDF floor plan with overlay elements
- **Floating Controls**: Zoom buttons and tool palette
- **Status Bar**: Contextual feedback and instruction display

### Visual Design Elements
- **Modern Aesthetics**: Clean, professional security industry styling
- **Interactive Feedback**: Hover states, transitions, and micro-animations
- **Color Coding**: Semantic colors for different element states and types
- **Typography**: System font stack optimized for readability
- **Spacing System**: Consistent 0.5rem-based spacing scale
- **Shadow System**: Layered elevation with multiple shadow levels

## Technical Implementation Details

### Canvas & Coordinate System
- **Transform Management**: Zoom and pan state with matrix transformations
- **Event Handling**: Mouse/touch interaction with coordinate translation
- **Performance Optimization**: Selective re-rendering and element caching
- **Responsive Calculations**: Real-time coordinate system updates

### FOV Arc Rendering
- **SVG Generation**: Dynamic arc path calculation based on camera properties
- **Trigonometric Calculations**: Precise angle and range visualization
- **Selection Highlighting**: Visual state changes for selected cameras
- **Performance**: Efficient re-rendering on property changes

### Drag & Drop System
- **HTML5 Drag API**: Native drag-and-drop implementation
- **Custom Dragging**: Mouse-based element repositioning
- **Collision Detection**: Boundary constraints and snap-to-grid options
- **Visual Feedback**: Ghost images and drop zone highlighting

### State Management
- **Class-Based Architecture**: Centralized state in main application class
- **Event System**: DOM event delegation and custom event handling
- **Property Binding**: Two-way data binding for form controls
- **Undo/Redo**: Transaction-based state history (implement if needed)

## Key User Workflows

### 1. New Project Setup
1. Upload PDF floor plan
2. Set scale using interactive drawing tool or manual input
3. Begin placing cameras and infrastructure

### 2. Camera Placement & Configuration
1. Drag camera model from sidebar to floor plan
2. Select placed camera to view properties panel
3. Adjust position, rotation, FOV, and range as needed
4. Add labels and installation notes

### 3. System Validation & Export
1. Review complete camera coverage
2. Verify infrastructure connectivity
3. Export CSV with equipment list and coordinates
4. Save project file for future modifications

## Performance & Browser Requirements
- **Modern Browser Support**: ES6+ features required
- **Canvas Performance**: Optimized rendering for large floor plans
- **Memory Management**: Efficient PDF and image handling
- **Mobile Responsive**: Touch-friendly interaction design (optional enhancement)

## Security & Data Handling
- **Client-Side Only**: No server communication or data transmission
- **Local File Processing**: PDF and JSON handling in browser sandbox
- **No Sensitive Data**: Public camera specifications only

## Extension Points
- **Plugin Architecture**: Modular camera model loading
- **Export Formats**: Additional file format support
- **Advanced Features**: Cable routing, coverage analysis
- **Integration APIs**: CAD software export, procurement system integration

## Code Quality Standards
- **ESLint Configuration**: Consistent code formatting and error detection
- **TypeScript Definitions**: Type safety for PDF.js and DOM interactions
- **Documentation**: Comprehensive inline comments and API documentation
- **Testing**: Unit tests for core calculation functions (recommended)

This application represents a complete professional security system design tool with enterprise-grade functionality implemented using modern web technologies while maintaining simplicity and performance.