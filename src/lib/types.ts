export interface CameraModel {
	id: string;
	name: string;
	brand: string;
	fovAngle: number; // degrees
	range: number; // feet
	features: string[];
	type: 'dome' | 'bullet' | 'ptz' | 'fisheye';
	emoji: string; // Keep for backward compatibility, but use icons instead
	color: string; // Brand color for FOV cones and icons
	imageUrl?: string; // Optional camera image
	isCustom?: boolean; // Flag to identify custom cameras that can be edited
}

export interface Camera {
	id: string;
	modelId: string;
	x: number; // pixels
	y: number; // pixels
	rotation: number; // degrees (0-360)
	label?: string;
	notes?: string;
	fovOverride?: number;
	rangeOverride?: number;
	coneSize?: number; // Scale factor for FOV cone display (0.1 to 2.0, default 0.5)
}

export interface InfrastructureComponent {
	id: string;
	type: 'idf' | 'mdf' | 'poe-switch' | 'server' | 'recorder';
	name: string;
	x: number;
	y: number;
	emoji: string;
}

export interface Scale {
	pixelsPerFoot: number;
	units: 'feet' | 'meters' | 'inches' | 'centimeters';
	referenceLine?: {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
		realWorldDistance: number;
	};
}

export interface Transform {
	zoom: number;
	panX: number;
	panY: number;
}

export interface CompassRose {
	isSet: boolean;
	northAngle: number; // Angle in degrees where north points (0 = right, 90 = down)
	x: number; // Position on canvas
	y: number; // Position on canvas
}

export interface Project {
	id: string;
	name: string;
	pdfFile?: File;
	pdfUrl?: string;
	cameras: Camera[];
	infrastructure: InfrastructureComponent[];
	scale: Scale;
	transform: Transform;
	compassRose?: CompassRose;
	drawnScaleLine?: { x1: number; y1: number; x2: number; y2: number; pixelLength: number };
	createdAt: Date;
	updatedAt: Date;
}

export type Tool = 'select' | 'pan' | 'scale' | 'draw-scale';

export type Theme = 'light' | 'dark';

export interface AppState {
	currentProject?: Project;
	selectedCameraId?: string;
	selectedInfrastructureId?: string;
	activeTool: Tool;
	theme: Theme;
	isLoading: boolean;
}