<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { appState, updateTransform, setTheme, loadThemeFromStorage } from '$lib/stores/app.js';
	import Header from '$lib/components/Layout/Header.svelte';
	import Sidebar from '$lib/components/Layout/Sidebar.svelte';
	import Toolbar from '$lib/components/Layout/Toolbar.svelte';
	import PdfCanvas from '$lib/components/Canvas/PdfCanvas.svelte';
	import ScaleModal from '$lib/components/Modals/ScaleModal.svelte';
	
	let mounted = $state(false);
	let showScaleModal = $state(false);

	let pdfCanvas = $state<PdfCanvas>();

	onMount(() => {
		mounted = true;
		
		// Load theme from storage and apply it
		const savedTheme = loadThemeFromStorage();
		setTheme(savedTheme);
		document.documentElement.setAttribute('data-theme', savedTheme);
		document.documentElement.classList.toggle('dark', savedTheme === 'dark');
	});

	function handlePdfUpload(file: File) {
		if (pdfCanvas) {
			pdfCanvas.handlePdfUpload(file);
		}
	}

	function handleScaleSet() {
		showScaleModal = true;
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

		const cameras = $appState.currentProject.cameras;
		const infrastructure = $appState.currentProject.infrastructure;
		
		let csv = 'Type,Name,Brand,X,Y,Rotation,Price,Features\n';
		
		cameras.forEach(camera => {
			// TODO: Get camera model details for export
			csv += `Camera,${camera.id},Unknown,${camera.x},${camera.y},${camera.rotation},$0,\n`;
		});
		
		infrastructure.forEach(component => {
			csv += `Infrastructure,${component.name},,${component.x},${component.y},,$${component.price},\n`;
		});
		
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		
		const link = document.createElement('a');
		link.href = url;
		link.download = `${$appState.currentProject.name}-export.csv`;
		link.click();
		
		URL.revokeObjectURL(url);
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
					<PdfCanvas bind:this={pdfCanvas} />
				{/if}
				
				<!-- Placeholder when no PDF is loaded -->
				{#if !$appState.currentProject?.pdfFile}
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="text-center text-gray-500 dark:text-gray-400">
							<div class="text-6xl mb-4">📋</div>
							<h2 class="text-xl font-semibold mb-2">No Floor Plan Loaded</h2>
							<p class="text-sm">Upload a PDF floor plan to get started</p>
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
	
	<ScaleModal 
		isOpen={showScaleModal} 
		onClose={() => showScaleModal = false} 
	/>
</div>
