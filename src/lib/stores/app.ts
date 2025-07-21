import { writable } from 'svelte/store';
import type { AppState, Camera, CameraModel, InfrastructureComponent, Project, Tool, Theme } from '../types.js';

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

export const cameraModels = writable<CameraModel[]>([
	{
		id: 'hik-ds2cd2387g2',
		name: 'DS-2CD2387G2-LU',
		brand: 'Hikvision',
		fovAngle: 110,
		range: 100,
		price: 299,
		features: ['Night Vision', 'Color at Night', 'Audio'],
		emoji: '📹'
	},
	{
		id: 'hik-ds2cd2087g2',
		name: 'DS-2CD2087G2-LU',
		brand: 'Hikvision',
		fovAngle: 90,
		range: 150,
		price: 379,
		features: ['Night Vision', 'Varifocal', 'Audio'],
		emoji: '🎥'
	},
	{
		id: 'dahua-ipc-hfw3849t1',
		name: 'IPC-HFW3849T1-AS-PV',
		brand: 'Dahua',
		fovAngle: 95,
		range: 120,
		price: 245,
		features: ['Night Vision', 'Smart Detection'],
		emoji: '📷'
	},
	{
		id: 'axis-p3245',
		name: 'AXIS P3245-LVE',
		brand: 'Axis',
		fovAngle: 108,
		range: 100,
		price: 895,
		features: ['Varifocal', 'Night Vision', 'Analytics'],
		emoji: '🔍'
	}
]);

export const infrastructureModels = writable<Omit<InfrastructureComponent, 'id' | 'x' | 'y'>[]>([
	{ type: 'idf', name: 'IDF Cabinet', price: 450, emoji: '🗄️' },
	{ type: 'mdf', name: 'MDF Cabinet', price: 850, emoji: '🏢' },
	{ type: 'poe-switch', name: '24-Port PoE Switch', price: 320, emoji: '🔌' },
	{ type: 'server', name: 'Recording Server', price: 2500, emoji: '🖥️' },
	{ type: 'recorder', name: 'NVR 32-Channel', price: 1200, emoji: '💾' }
]);

export function setActiveTool(tool: Tool) {
	appState.update(state => ({ ...state, activeTool: tool }));
}

export function setTheme(theme: Theme) {
	appState.update(state => ({ ...state, theme }));
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('cameramapper-theme', theme);
	}
}

export function loadThemeFromStorage(): Theme {
	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem('cameramapper-theme');
		if (stored === 'dark' || stored === 'light') {
			return stored as Theme;
		}
	}
	return 'light';
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