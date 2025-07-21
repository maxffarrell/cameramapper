<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { appState, updateTransform, initTheme, setActiveTool } from '$lib/stores/app.js';
	import Header from '$lib/components/Layout/Header.svelte';
	import Sidebar from '$lib/components/Layout/Sidebar.svelte';
	import Toolbar from '$lib/components/Layout/Toolbar.svelte';
	import PdfCanvas from '$lib/components/Canvas/PdfCanvas.svelte';
	import ScaleDrawingModal from '$lib/components/Modals/ScaleDrawingModal.svelte';
	import EditCameraModal from '$lib/components/Modals/EditCameraModal.svelte';
	import EditInfrastructureModal from '$lib/components/Modals/EditInfrastructureModal.svelte';
	import type { Camera, InfrastructureComponent } from '$lib/types.js';
	
	let mounted = $state(false);
	let showScaleModal = $state(false);
	let showEditCameraModal = $state(false);
	let showEditInfrastructureModal = $state(false);
	let drawnScaleLine = $state<{ x1: number; y1: number; x2: number; y2: number; pixelLength: number } | undefined>();
	let editingCamera = $state<Camera | undefined>();
	let editingInfrastructure = $state<InfrastructureComponent | undefined>();

	let pdfCanvas = $state<PdfCanvas>();

	onMount(() => {
		mounted = true;
		
		// Initialize automatic theme detection
		const systemTheme = initTheme();
		document.documentElement.setAttribute('data-theme', systemTheme);
		document.documentElement.classList.toggle('dark', systemTheme === 'dark');
	});

	function handlePdfUpload(file: File) {
		if (pdfCanvas) {
			pdfCanvas.handlePdfUpload(file);
		}
	}

	function handleScaleSet() {
		// Switch to scale drawing tool
		setActiveTool('scale');
	}

	function handleScaleLineDrawn(line: { x1: number; y1: number; x2: number; y2: number; pixelLength: number }) {
		drawnScaleLine = line;
		showScaleModal = true;
	}

	function handleEditCamera(camera: Camera) {
		editingCamera = camera;
		showEditCameraModal = true;
	}

	function handleEditInfrastructure(component: InfrastructureComponent) {
		editingInfrastructure = component;
		showEditInfrastructureModal = true;
	}

	function handleSave() {
		if (!$appState.currentProject) return;
		
		const dataStr = JSON.stringify($appState.currentProject, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		
		const link = document.createElement('a');
		link.href = url;
		link.download = `${$appState.currentProject.name}.json`;
		link.click();
		
		URL.revokeObjectURL(url);
	}

	function handleLoad() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					try {
						const project = JSON.parse(e.target?.result as string);
						// TODO: Load project into store
						console.log('Loaded project:', project);
					} catch (error) {
						console.error('Error loading project:', error);
					}
				};
				reader.readAsText(file);
			}
		};
		input.click();
	}

	function handleExport() {
		if (!$appState.currentProject) return;
		
		import('$lib/stores/app.js').then(({ cameraModels }) => {
			cameraModels.subscribe(models => {
				const cameras = $appState.currentProject!.cameras;
				const infrastructure = $appState.currentProject!.infrastructure;
				const scale = $appState.currentProject!.scale;
				
				let csv = 'Type,Model,Brand,Label,X (pixels),Y (pixels),X (feet),Y (feet),Rotation,FOV,Range,Price,Features,Notes\n';
				
				cameras.forEach(camera => {
					const model = models.find(m => m.id === camera.modelId);
					const xFeet = (camera.x / scale.pixelsPerFoot).toFixed(1);
					const yFeet = (camera.y / scale.pixelsPerFoot).toFixed(1);
					const fov = camera.fovOverride || model?.fovAngle || 0;
					const range = camera.rangeOverride || model?.range || 0;
					
					csv += `Camera,"${model?.name || 'Unknown'}","${model?.brand || 'Unknown'}","${camera.label || ''}",${camera.x.toFixed(1)},${camera.y.toFixed(1)},${xFeet},${yFeet},${camera.rotation},${fov},${range},$${model?.price || 0},"${model?.features.join('; ') || ''}","${camera.notes || ''}"\n`;
				});
				
				infrastructure.forEach(component => {
					const xFeet = (component.x / scale.pixelsPerFoot).toFixed(1);
					const yFeet = (component.y / scale.pixelsPerFoot).toFixed(1);
					
					csv += `Infrastructure,"${component.name}","","",${ component.x.toFixed(1)},${component.y.toFixed(1)},${xFeet},${yFeet},,,,$${component.price},"",""\n`;
				});
				
				// Add summary
				const totalCameras = cameras.length;
				const totalInfrastructure = infrastructure.length;
				const totalCost = cameras.reduce((sum, cam) => {
					const model = models.find(m => m.id === cam.modelId);
					return sum + (model?.price || 0);
				}, 0) + infrastructure.reduce((sum, comp) => sum + comp.price, 0);
				
				csv += `\nSummary\n`;
				csv += `Total Cameras,${totalCameras}\n`;
				csv += `Total Infrastructure,${totalInfrastructure}\n`;
				csv += `Total Cost,$${totalCost.toLocaleString()}\n`;
				csv += `Scale,${scale.pixelsPerFoot.toFixed(1)} pixels per foot\n`;
				csv += `Export Date,${new Date().toLocaleString()}\n`;
				
				const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
				const url = URL.createObjectURL(blob);
				
				const link = document.createElement('a');
				link.href = url;
				link.download = `${$appState.currentProject!.name}-camera-system-${new Date().toISOString().split('T')[0]}.csv`;
				link.click();
				
				URL.revokeObjectURL(url);
			})();
		});
	}

	function handleZoomIn() {
		const project = $appState.currentProject;
		if (project) {
			const newZoom = Math.min(project.transform.zoom * 1.2, 5);
			updateTransform({ zoom: newZoom });
		}
	}

	function handleZoomOut() {
		const project = $appState.currentProject;
		if (project) {
			const newZoom = Math.max(project.transform.zoom / 1.2, 0.1);
			updateTransform({ zoom: newZoom });
		}
	}

	function handleZoomReset() {
		updateTransform({ zoom: 1, panX: 0, panY: 0 });
	}
</script>

<div class="h-screen flex flex-col">
	<Header 
		onSave={handleSave}
		onLoad={handleLoad}
		onExport={handleExport}
	/>
	
	<div class="flex-1 flex">
		<Sidebar 
			onPdfUpload={handlePdfUpload}
			onScaleSet={handleScaleSet}
		/>
		
		<main class="flex-1 relative">
			<div class="canvas-container w-full h-full">
				{#if mounted}
					<PdfCanvas 
						bind:this={pdfCanvas} 
						onScaleLineDrawn={handleScaleLineDrawn}
						onEditCamera={handleEditCamera}
						onEditInfrastructure={handleEditInfrastructure}
					/>
				{/if}
				
				<!-- Placeholder when no PDF is loaded -->
				{#if !$appState.currentProject?.pdfFile}
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto p-8">
							<div class="text-6xl mb-6">🏗️</div>
							<h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
								Camera System Designer
							</h2>
							<div class="space-y-3 text-sm">
								<div class="flex items-center space-x-2">
									<span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
									<span>Upload your building's floor plan PDF</span>
								</div>
								<div class="flex items-center space-x-2">
									<span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
									<span>Set the scale by drawing on a known measurement</span>
								</div>
								<div class="flex items-center space-x-2">
									<span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
									<span>Drag cameras and equipment onto your plan</span>
								</div>
								<div class="flex items-center space-x-2">
									<span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
									<span>Export your design for procurement and installation</span>
								</div>
							</div>
							<p class="text-xs text-gray-400 dark:text-gray-500 mt-6">
								Start by uploading a PDF floor plan using the sidebar →
							</p>
						</div>
					</div>
				{/if}
			</div>
			
			{#if mounted}
				<Toolbar 
					onZoomIn={handleZoomIn}
					onZoomOut={handleZoomOut}
					onZoomReset={handleZoomReset}
				/>
			{/if}
		</main>
	</div>
	
	<ScaleDrawingModal 
		isOpen={showScaleModal} 
		onClose={() => { showScaleModal = false; drawnScaleLine = undefined; }}
		scaleLine={drawnScaleLine}
	/>
	
	<EditCameraModal 
		isOpen={showEditCameraModal} 
		onClose={() => { showEditCameraModal = false; editingCamera = undefined; }}
		camera={editingCamera}
	/>
	
	<EditInfrastructureModal 
		isOpen={showEditInfrastructureModal} 
		onClose={() => { showEditInfrastructureModal = false; editingInfrastructure = undefined; }}
		component={editingInfrastructure}
	/>
</div>
