# Camera System Designer

A professional SvelteKit + TypeScript application for designing surveillance camera systems on floor plan PDFs with visual field-of-view coverage areas.

## Features

### Core Functionality
- **PDF Floor Plan Upload**: Drag-and-drop PDF floor plans with PDF.js rendering
- **Camera Placement**: Drag cameras from sidebar palette onto floor plans
- **FOV Visualization**: Real-time SVG field-of-view arc rendering
- **Infrastructure Components**: Network equipment placement (servers, switches, etc.)
- **Interactive Tools**: Select, pan, and scale tools with zoom controls
- **Project Management**: Save/load projects as JSON files
- **CSV Export**: Export equipment lists with coordinates and specifications

### Camera Database
Pre-configured camera models from major manufacturers:
- **Hikvision**: DS-2CD2387G2-LU, DS-2CD2087G2-LU
- **Dahua**: IPC-HFW3849T1-AS-PV  
- **Axis**: AXIS P3245-LVE

Each model includes:
- FOV angle (10-180 degrees)
- Detection range (5-200 feet)
- Price information
- Feature badges (Night Vision, Varifocal, PTZ, Audio)

### Infrastructure Components
- IDF/MDF Cabinets
- PoE Switches
- Recording Servers
- NVR Systems

### User Interface
- **Modern Design**: Clean, professional styling with Tailwind CSS
- **Dark/Light Themes**: Persistent theme switching
- **Responsive Layout**: Header, sidebar, and main canvas areas
- **Floating Toolbar**: Tool selection and zoom controls
- **Properties Panel**: Context-sensitive component details

## Technology Stack

- **Frontend**: SvelteKit 2 + TypeScript
- **Styling**: Tailwind CSS 4 with custom design system
- **PDF Rendering**: PDF.js 5.3 for floor plan display
- **Icons**: Lucide Svelte for UI icons
- **Build Tool**: Vite 7
- **Package Manager**: pnpm

## Development

### Prerequisites
- Node.js 18+
- pnpm

### Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Type checking
pnpm run check

# Build for production
pnpm run build
```

### Project Structure
```
src/
├── lib/
│   ├── components/
│   │   ├── Layout/          # Header, Sidebar, Toolbar
│   │   └── Canvas/          # PDF rendering and interaction
│   ├── stores/              # Svelte stores for state management
│   ├── types.ts             # TypeScript interfaces
│   └── utils/               # PDF.js utilities
├── routes/
│   ├── +layout.svelte      # App layout
│   └── +page.svelte        # Main application
└── app.css                 # Global styles and themes
```

## Key Workflows

### 1. New Project Setup
1. Upload PDF floor plan via drag-and-drop or file picker
2. Set scale using interactive measurement tool
3. Begin placing cameras and infrastructure

### 2. Camera Placement
1. Drag camera model from sidebar to floor plan
2. Select placed camera to view/edit properties
3. Adjust position, rotation, FOV, and range
4. View real-time coverage visualization

### 3. System Export
1. Review complete camera coverage and infrastructure
2. Export CSV with equipment list and coordinates
3. Save project file for future modifications

## Browser Requirements

- Modern browsers with ES6+ support
- Canvas and SVG rendering capabilities
- File API support for PDF upload
- Local storage for theme persistence

## Performance Features

- Efficient Canvas rendering with selective updates
- PDF.js worker for background processing
- Optimized drag-and-drop interactions
- Memory-efficient PDF handling

## Security

- Client-side only operation
- No server communication required
- Local file processing in browser sandbox
- No sensitive data handling

## Future Enhancements

The architecture supports:
- Advanced coverage analysis
- Cable routing visualization
- CAD software integration
- Mobile responsive design
- Plugin system for custom camera models
