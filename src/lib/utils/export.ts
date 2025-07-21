import type { Project, Camera, InfrastructureComponent, CameraModel, CompassRose } from '../types.js';
import { getCompassDirection } from '../stores/app.js';

// Export project data as JSON
export function exportProjectJSON(project: Project): string {
	const exportData = {
		projectName: project.name,
		createdAt: project.createdAt,
		updatedAt: project.updatedAt,
		scale: project.scale,
		compassRose: project.compassRose,
		cameras: project.cameras,
		infrastructure: project.infrastructure
	};
	
	return JSON.stringify(exportData, null, 2);
}

// Generate bill of materials CSV
export function generateBillOfMaterials(
	project: Project, 
	cameraModels: CameraModel[]
): string {
	const items: Array<{
		type: string;
		model: string;
		brand: string;
		quantity: number;
		features: string;
		notes: string;
	}> = [];

	// Group cameras by model
	const cameraGroups = new Map<string, Camera[]>();
	project.cameras.forEach(camera => {
		const existing = cameraGroups.get(camera.modelId) || [];
		existing.push(camera);
		cameraGroups.set(camera.modelId, existing);
	});

	// Add camera entries
	cameraGroups.forEach((cameras, modelId) => {
		const model = cameraModels.find(m => m.id === modelId);
		if (model) {
			const rotations = cameras.map(c => 
				project.compassRose 
					? getCompassDirection(c.rotation, project.compassRose)
					: `${c.rotation}°`
			);
			
			items.push({
				type: 'Camera',
				model: model.name,
				brand: model.brand,
				quantity: cameras.length,
				features: model.features.join(', '),
				notes: `Rotations: ${rotations.join(', ')}`
			});
		}
	});

	// Group infrastructure by type
	const infraGroups = new Map<string, InfrastructureComponent[]>();
	project.infrastructure.forEach(component => {
		const existing = infraGroups.get(component.name) || [];
		existing.push(component);
		infraGroups.set(component.name, existing);
	});

	// Add infrastructure entries
	infraGroups.forEach((components, name) => {
		items.push({
			type: 'Infrastructure',
			model: name,
			brand: 'Various',
			quantity: components.length,
			features: components[0].type.toUpperCase(),
			notes: 'Network/Support Equipment'
		});
	});

	// Generate CSV
	const headers = ['Type', 'Model', 'Brand', 'Quantity', 'Features', 'Notes'];
	const csvContent = [
		headers.join(','),
		...items.map(item => [
			item.type,
			`"${item.model}"`,
			item.brand,
			item.quantity,
			`"${item.features}"`,
			`"${item.notes}"`
		].join(','))
	].join('\n');

	return csvContent;
}

// Create marked up PDF (canvas to PDF)
export async function createMarkedUpPDF(
	canvas: HTMLCanvasElement,
	svgElement: SVGSVGElement,
	projectName: string
): Promise<Blob> {
	// Create a new canvas to combine PDF and overlays
	const combinedCanvas = document.createElement('canvas');
	const ctx = combinedCanvas.getContext('2d')!;
	
	// Set canvas size to match original
	combinedCanvas.width = canvas.width;
	combinedCanvas.height = canvas.height;
	
	// Draw the original canvas (PDF + cameras/infrastructure)
	ctx.drawImage(canvas, 0, 0);
	
	// Convert SVG to image and draw FOV cones
	const svgData = new XMLSerializer().serializeToString(svgElement);
	const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
	const svgUrl = URL.createObjectURL(svgBlob);
	
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(svgUrl);
			
			// Convert to PDF blob (using canvas.toBlob)
			combinedCanvas.toBlob((blob) => {
				if (blob) {
					resolve(blob);
				} else {
					// Fallback: create a simple blob
					resolve(new Blob(['PDF generation failed'], { type: 'text/plain' }));
				}
			}, 'image/png');
		};
		img.src = svgUrl;
	});
}

// Export multiple files (for now, we'll download them separately)
export async function createExportZip(
	project: Project,
	cameraModels: CameraModel[],
	canvas: HTMLCanvasElement,
	svgElement: SVGSVGElement
): Promise<Blob> {
	// For now, return the JSON export
	// Future enhancement: implement proper ZIP creation with JSZip
	const jsonData = exportProjectJSON(project);
	
	// Also download CSV and PNG files separately
	setTimeout(() => {
		downloadCSV(project, cameraModels);
	}, 100);
	
	setTimeout(async () => {
		const markedUpPDF = await createMarkedUpPDF(canvas, svgElement, project.name);
		downloadBlob(markedUpPDF, `${project.name}_marked_up_plan.png`);
	}, 200);
	
	return new Blob([jsonData], { type: 'application/json' });
}

// Download CSV separately
function downloadCSV(project: Project, cameraModels: CameraModel[]) {
	const csvData = generateBillOfMaterials(project, cameraModels);
	const blob = new Blob([csvData], { type: 'text/csv' });
	downloadBlob(blob, `${project.name}_bill_of_materials.csv`);
}

// Generic blob download function
function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

// Download file
export function downloadZip(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	
	// Determine file extension based on blob type
	const extension = blob.type.includes('json') ? '.json' : '.zip';
	link.download = `${filename}${extension}`;
	
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}