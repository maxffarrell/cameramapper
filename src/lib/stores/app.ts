import { writable } from 'svelte/store';
import type { AppState, Camera, CameraModel, InfrastructureComponent, Project, Tool, Theme, CompassRose } from '../types.js';

const defaultProject: Project = {
	id: crypto.randomUUID(),
	name: 'New Project',
	cameras: [],
	infrastructure: [],
	scale: {
		pixelsPerFoot: 50,
		units: 'feet'
	},
	transform: {
		zoom: 1,
		panX: 0,
		panY: 0
	},
	createdAt: new Date(),
	updatedAt: new Date()
};

const defaultState: AppState = {
	currentProject: defaultProject,
	activeTool: 'select',
	theme: 'light',
	isLoading: false
};

export const appState = writable<AppState>(defaultState);

// Generate unique colors for camera models
const MODEL_COLORS = [
	'#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
	'#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b',
	'#dc2626', '#7c3aed', '#0891b2', '#65a30d', '#ea580c', '#db2777'
];

export function getModelColor(modelId: string): string {
	// Generate a consistent color based on model ID
	let hash = 0;
	for (let i = 0; i < modelId.length; i++) {
		const char = modelId.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	const colorIndex = Math.abs(hash) % MODEL_COLORS.length;
	return MODEL_COLORS[colorIndex];
}

// Initialize camera models with unique colors
const initializeCameraModels = () => {
	const models: CameraModel[] = [
		{
			id: 'hik-ds2cd2387g2',
			name: 'DS-2CD2387G2-LU',
			brand: 'Hikvision',
			fovAngle: 110,
			range: 100,
			features: ['Night Vision', 'Color at Night', 'Audio'],
			type: 'dome',
			emoji: '📹',
			color: ''
		},
		{
			id: 'hik-ds2cd2087g2',
			name: 'DS-2CD2087G2-LU',
			brand: 'Hikvision',
			fovAngle: 90,
			range: 150,
			features: ['Night Vision', 'Varifocal', 'Audio'],
			type: 'bullet',
			emoji: '🎥',
			color: ''
		},
		{
			id: 'dahua-ipc-hfw3849t1',
			name: 'IPC-HFW3849T1-AS-PV',
			brand: 'Dahua',
			fovAngle: 95,
			range: 120,
			features: ['Night Vision', 'Smart Detection'],
			type: 'bullet',
			emoji: '📷',
			color: ''
		},
		{
			id: 'axis-p3245',
			name: 'AXIS P3245-LVE',
			brand: 'Axis',
			fovAngle: 108,
			range: 100,
			features: ['Varifocal', 'Night Vision', 'Analytics'],
			type: 'dome',
			emoji: '🔍',
			color: ''
		},
		{
			id: 'hikvision-ptz-ds2de4a425iw',
			name: 'DS-2DE4A425IW-DE',
			brand: 'Hikvision',
			fovAngle: 360,
			range: 200,
			features: ['PTZ', 'Night Vision', 'Auto Tracking', 'Audio'],
			type: 'ptz',
			emoji: '🎯',
			color: ''
		},
		{
			id: 'axis-m3067-p',
			name: 'AXIS M3067-P',
			brand: 'Axis',
			fovAngle: 180,
			range: 80,
			features: ['Fisheye', 'Night Vision', 'Dewarping'],
			type: 'fisheye',
			emoji: '👁️',
			color: ''
		}
	];

	// Assign unique colors to each model
	return models.map(model => ({
		...model,
		color: getModelColor(model.id)
	}));
};

export const cameraModels = writable<CameraModel[]>(initializeCameraModels());

export const infrastructureModels = writable<Omit<InfrastructureComponent, 'id' | 'x' | 'y'>[]>([
	{ type: 'idf', name: 'IDF Cabinet', emoji: '🗄️' },
	{ type: 'mdf', name: 'MDF Cabinet', emoji: '🏢' },
	{ type: 'poe-switch', name: '24-Port PoE Switch', emoji: '🔌' },
	{ type: 'server', name: 'Recording Server', emoji: '🖥️' },
	{ type: 'recorder', name: 'NVR 32-Channel', emoji: '💾' }
]);

export function setActiveTool(tool: Tool) {
	appState.update(state => ({ ...state, activeTool: tool }));
}

export function setTheme(theme: Theme) {
	appState.update(state => ({ ...state, theme }));
}

export function getSystemTheme(): Theme {
	if (typeof window !== 'undefined' && window.matchMedia) {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return 'light';
}

export function initTheme(): Theme {
	const systemTheme = getSystemTheme();
	setTheme(systemTheme);
	
	// Listen for system theme changes
	if (typeof window !== 'undefined' && window.matchMedia) {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', (e) => {
			const newTheme = e.matches ? 'dark' : 'light';
			setTheme(newTheme);
			document.documentElement.classList.toggle('dark', newTheme === 'dark');
		});
	}
	
	return systemTheme;
}

export function selectCamera(id: string | undefined) {
	appState.update(state => ({ 
		...state, 
		selectedCameraId: id,
		selectedInfrastructureId: undefined 
	}));
}

export function selectInfrastructure(id: string | undefined) {
	appState.update(state => ({ 
		...state, 
		selectedInfrastructureId: id,
		selectedCameraId: undefined 
	}));
}

export function addCamera(camera: Camera) {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				cameras: [...state.currentProject.cameras, camera],
				updatedAt: new Date()
			}
		};
	});
}

export function updateCamera(id: string, updates: Partial<Camera>) {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				cameras: state.currentProject.cameras.map(cam => 
					cam.id === id ? { ...cam, ...updates } : cam
				),
				updatedAt: new Date()
			}
		};
	});
}

export function removeCamera(id: string) {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				cameras: state.currentProject.cameras.filter(cam => cam.id !== id),
				updatedAt: new Date()
			},
			selectedCameraId: state.selectedCameraId === id ? undefined : state.selectedCameraId
		};
	});
}

export function addInfrastructure(component: InfrastructureComponent) {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				infrastructure: [...state.currentProject.infrastructure, component],
				updatedAt: new Date()
			}
		};
	});
}

export function updateInfrastructure(id: string, updates: Partial<InfrastructureComponent>) {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				infrastructure: state.currentProject.infrastructure.map(comp => 
					comp.id === id ? { ...comp, ...updates } : comp
				),
				updatedAt: new Date()
			}
		};
	});
}

export function updateScale(updates: Partial<typeof defaultProject.scale>) {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				scale: { ...state.currentProject.scale, ...updates },
				updatedAt: new Date()
			}
		};
	});
}

export function setDrawnScaleLine(line: { x1: number; y1: number; x2: number; y2: number; pixelLength: number } | undefined) {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				drawnScaleLine: line,
				updatedAt: new Date()
			}
		};
	});
}

export function updateTransform(updates: Partial<typeof defaultProject.transform>) {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				transform: { ...state.currentProject.transform, ...updates },
				updatedAt: new Date()
			}
		};
	});
}

export function loadProject(project: Project) {
	appState.update(state => ({
		...state,
		currentProject: project,
		selectedCameraId: undefined,
		selectedInfrastructureId: undefined
	}));
}

export function setPdfFile(file: File, url?: string) {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				pdfFile: file,
				pdfUrl: url,
				updatedAt: new Date()
			}
		};
	});
}

export function setLoading(isLoading: boolean) {
	appState.update(state => ({ ...state, isLoading }));
}

export function updateProjectName(name: string) {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				name,
				updatedAt: new Date()
			}
		};
	});
}

export function setCompassRose(x: number, y: number, northAngle: number) {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				compassRose: {
					isSet: true,
					northAngle,
					x,
					y
				},
				updatedAt: new Date()
			}
		};
	});
}

export function clearCompassRose() {
	appState.update(state => {
		if (!state.currentProject) return state;
		return {
			...state,
			currentProject: {
				...state.currentProject,
				compassRose: undefined,
				updatedAt: new Date()
			}
		};
	});
}

export function getCompassDirection(angle: number, compassRose?: CompassRose): string {
	if (!compassRose?.isSet) return `${angle}°`;
	
	// Adjust angle relative to compass rose north
	const adjustedAngle = (angle - compassRose.northAngle + 360) % 360;
	
	// Convert to cardinal directions
	const directions = ['E', 'ENE', 'NE', 'NNE', 'N', 'NNW', 'NW', 'WNW', 'W', 'WSW', 'SW', 'SSW', 'S', 'SSE', 'SE', 'ESE'];
	const index = Math.round(adjustedAngle / 22.5) % 16;
	
	return directions[index];
}

export function addCustomCameraModel(model: CameraModel) {
	// Assign a unique color to custom cameras if not already set
	if (!model.color) {
		model.color = getModelColor(model.id);
	}
	cameraModels.update(models => [...models, model]);
}