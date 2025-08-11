<script lang="ts">
	import { appState, cameraModels, infrastructureModels, selectCamera, selectInfrastructure, addCustomCameraModel, updateCamera, updateScale, setActiveTool, setDrawnScaleLine } from '$lib/stores/app.js';
	import { Upload, Ruler, Camera, Server, Plus, RotateCw, X, Check } from 'lucide-svelte';
	import CameraIcons from '$lib/components/Icons/CameraIcons.svelte';
	import FeatureIcons from '$lib/components/Icons/FeatureIcons.svelte';
	import SidebarCustomCameraBuilder from '$lib/components/SidebarCustomCameraBuilder.svelte';
	import type { CameraModel } from '$lib/types.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let { onPdfUpload, onScaleSet } = $props<{
		onPdfUpload: (file: File) => void;
		onScaleSet: () => void;
	}>();

	let fileInput = $state<HTMLInputElement>();
	let searchTerm = $state('');
	let showCustomBuilder = $state(false);
	let showScaleSetting = $state(false);
	let realWorldDistance = $state(10);
	let units = $state<'feet' | 'meters' | 'inches' | 'centimeters'>('feet');

	const filteredCameraModels = $derived(
		$cameraModels.filter(model => {
			const term = searchTerm.toLowerCase();
			return (
				model.name.toLowerCase().includes(term) ||
				model.brand.toLowerCase().includes(term) ||
				model.features.some(feature => feature.toLowerCase().includes(term)) ||
				model.fovAngle.toString().includes(term) ||
				model.range.toString().includes(term) ||
				(term.includes('fov') && model.fovAngle.toString().includes(term.replace('fov', '').trim())) ||
				(term.includes('range') && model.range.toString().includes(term.replace('range', '').trim()))
			);
		})
	);

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && file.type === 'application/pdf') {
			onPdfUpload(file);
		}
	}

	function startDrag(event: DragEvent, type: 'camera' | 'infrastructure', data: any) {
		if (!event.dataTransfer) return;
		event.dataTransfer.setData('application/json', JSON.stringify({ type, data }));
		event.dataTransfer.effectAllowed = 'copy';
	}

	const selectedCamera = $derived(
		$appState.selectedCameraId ? 
		$appState.currentProject?.cameras.find(c => c.id === $appState.selectedCameraId) : 
		undefined
	);

	const selectedInfrastructure = $derived(
		$appState.selectedInfrastructureId ? 
		$appState.currentProject?.infrastructure.find(i => i.id === $appState.selectedInfrastructureId) : 
		undefined
	);

	function handleCustomCameraCreated(event: CustomEvent<CameraModel>) {
		addCustomCameraModel(event.detail);
	}

	// Scale setting functions
	const drawnScaleLine = $derived($appState.currentProject?.drawnScaleLine);

	function handleSetScale() {
		if (!drawnScaleLine) return;
		
		const pixelsPerUnit = drawnScaleLine.pixelLength / realWorldDistance;
		const pixelsPerFoot = units === 'feet' ? pixelsPerUnit : 
							 units === 'meters' ? pixelsPerUnit * 3.28084 :
							 units === 'inches' ? pixelsPerUnit * 12 :
							 pixelsPerUnit * 30.48;

		updateScale({
			pixelsPerFoot,
			units,
			referenceLine: {
				x1: drawnScaleLine.x1,
				y1: drawnScaleLine.y1,
				x2: drawnScaleLine.x2,
				y2: drawnScaleLine.y2,
				realWorldDistance
			}
		});
		
		setActiveTool('select');
		showScaleSetting = false;
		setDrawnScaleLine(undefined);
	}

	function handleCancelScale() {
		setActiveTool('select');
		showScaleSetting = false;
		setDrawnScaleLine(undefined);
	}

	function handleStartScale() {
		onScaleSet();
		showScaleSetting = true;
	}
</script>

<aside class="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
	{#if showCustomBuilder}
		<!-- Custom Camera Builder -->
		<SidebarCustomCameraBuilder 
			onClose={() => showCustomBuilder = false}
			on:created={handleCustomCameraCreated}
		/>
	{:else if showScaleSetting && drawnScaleLine}
		<!-- Scale Setting -->
		<div class="p-4 h-full flex flex-col">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					Set Scale Reference
				</h2>
				<Button variant="ghost" size="sm" onclick={handleCancelScale}>
					<X size={20} />
				</Button>
			</div>

			<div class="space-y-4 flex-1">
				<Card>
					<CardContent class="p-4">
						<div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
							<p class="text-sm text-blue-800 dark:text-blue-200">
								You've drawn a line of <strong>{drawnScaleLine.pixelLength.toFixed(1)} pixels</strong>.
								<br />Enter the real-world distance this line represents.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="pb-2">
						<CardTitle class="text-sm">Real-world distance</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex space-x-2">
							<Input
								bind:value={realWorldDistance}
								type="number"
								min="0.1"
								step="0.1"
								placeholder="Enter distance"
								class="flex-1"
							/>
							<select
								bind:value={units}
								class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[80px]"
							>
								<option value="feet">Feet</option>
								<option value="meters">Meters</option>
								<option value="inches">Inches</option>
								<option value="centimeters">cm</option>
							</select>
						</div>

						<div class="flex space-x-2 pt-2">
							<Button
								onclick={handleCancelScale}
								variant="outline"
								class="flex-1"
							>
								Cancel
							</Button>
							<Button
								onclick={handleSetScale}
								disabled={!realWorldDistance || realWorldDistance <= 0}
								class="flex-1"
							>
								<Check size={16} class="mr-1" />
								Set Scale
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{:else}
		<!-- Main Sidebar Content -->
		<div class="flex-1 overflow-y-auto">
			<!-- PDF Upload Section - Only show if no PDF loaded -->
			{#if !$appState.currentProject?.pdfFile}
				<div class="p-4 border-b border-gray-200 dark:border-gray-700">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Floor Plan</h2>
					<p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Start by uploading your building's floor plan PDF</p>
				
					<button
						onclick={() => fileInput?.click()}
						class="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
					>
						<Upload size={20} class="text-gray-400" />
						<span class="text-sm text-gray-600 dark:text-gray-300">Upload PDF Floor Plan</span>
					</button>
					
					<input
						bind:this={fileInput}
						type="file"
						accept=".pdf"
						onchange={handleFileUpload}
						class="hidden"
					/>
				</div>
			{:else}
				<!-- PDF Loaded - Show scale setting if not set -->
				{#if !$appState.currentProject.scale.referenceLine}
					<div class="p-4 border-b border-gray-200 dark:border-gray-700">
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Set Scale</h2>
						<p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Draw a line on something with a known measurement</p>
						
						<Button
							onclick={handleStartScale}
							class="w-full flex items-center justify-center space-x-2 text-sm"
						>
							<Ruler size={16} />
							<span>Draw Scale Line</span>
						</Button>
					</div>
				{/if}
			{/if}

			<!-- Camera Models Section - Only show if PDF loaded and scale set -->
			{#if $appState.currentProject?.pdfFile && $appState.currentProject.scale.referenceLine}
				<div class="p-4 border-b border-gray-200 dark:border-gray-700">
					<div class="flex items-center space-x-2 mb-2">
						<Camera size={20} class="text-gray-600 dark:text-gray-300" />
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Add Cameras</h2>
					</div>
					<p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Drag cameras onto your floor plan</p>

		<input
			bind:value={searchTerm}
			type="text"
			placeholder="Search by name, brand, FOV, range, features..."
			class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
		/>
		{#if searchTerm}
			<div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
				Showing {filteredCameraModels.length} of {$cameraModels.length} cameras
			</div>
		{/if}

		<div class="mt-3 space-y-2 max-h-64 overflow-y-auto">
			{#each filteredCameraModels as model (model.id)}
				<div
					role="button"
					tabindex="0"
					draggable="true"
					ondragstart={(e) => startDrag(e, 'camera', model)}
					class="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 cursor-grab active:cursor-grabbing transition-colors"
				>
					<div class="flex items-start space-x-3">
						<div class="flex-shrink-0 mt-1">
							{#if model.imageUrl}
                                                                <img
                                                                        src={model.imageUrl}
                                                                        alt={model.name}
                                                                        class="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                                                                        onerror={(e) => {
                                                                                const img = e.currentTarget as HTMLImageElement;
                                                                                img.style.display = 'none';
                                                                                const fallback = img.nextElementSibling as HTMLElement | null;
                                                                                if (fallback) fallback.style.display = 'flex';
                                                                        }}
                                                                />
								<div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 flex items-center justify-center" style="display: none;">
									<span class="text-lg">{model.emoji}</span>
								</div>
							{:else}
								<div class="w-12 h-12 rounded-md border-2 border-dashed flex items-center justify-center" style="border-color: {model.color}; background-color: {model.color}15;">
									<span class="text-xl">{model.emoji}</span>
								</div>
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<div class="text-sm font-medium text-gray-900 dark:text-white truncate">
								{model.name}
							</div>
							<div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
								<span class="inline-block w-2 h-2 rounded-full mr-1" style="background-color: {model.color}"></span>
								{model.brand} • FOV: {model.fovAngle}° • Range: {model.range}ft
							</div>
						</div>
					</div>
					
					{#if model.features.length > 0}
						<div class="mt-2 flex flex-wrap gap-1">
							{#each model.features as feature}
								<div class="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
									<FeatureIcons {feature} size={12} />
									<span>{feature}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
		
		<!-- Custom Camera Builder Button -->
					<div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
						<button
							onclick={() => showCustomBuilder = true}
							class="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
						>
							<Plus size={16} />
							<span>Create Custom Camera</span>
						</button>
					</div>
				</div>
			{/if}

			<!-- Infrastructure Section - Only show if PDF loaded and scale set -->
			{#if $appState.currentProject?.pdfFile && $appState.currentProject.scale.referenceLine}
				<div class="p-4 border-b border-gray-200 dark:border-gray-700">
					<div class="flex items-center space-x-2 mb-2">
						<Server size={20} class="text-gray-600 dark:text-gray-300" />
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Add Infrastructure</h2>
					</div>
					<p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Add network equipment and servers</p>

		<div class="space-y-2">
			{#each $infrastructureModels as model}
				<div
					role="button"
					tabindex="0"
					draggable="true"
					ondragstart={(e) => startDrag(e, 'infrastructure', model)}
					class="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 cursor-grab active:cursor-grabbing transition-colors"
				>
					<div class="flex items-start space-x-3">
						<div class="flex-shrink-0 mt-1">
							<div class="w-12 h-12 rounded-md border-2 border-dashed border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
								<span class="text-xl">{model.emoji}</span>
							</div>
						</div>
						<div class="flex-1 min-w-0">
							<div class="text-sm font-medium text-gray-900 dark:text-white truncate">
								{model.name}
							</div>
							<div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
								<span class="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-1"></span>
								Infrastructure • {model.type.toUpperCase()}
							</div>
						</div>
					</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

		</div>

		<!-- Properties Panel -->
		<div class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 max-h-96 overflow-y-auto">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Selected Item</h2>
		
		{#if selectedCamera}
			{@const model = $cameraModels.find(m => m.id === selectedCamera.modelId)}
			<div class="space-y-3">
				<div>
					<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Camera Model
					</span>
					<div class="text-sm text-gray-900 dark:text-white">
						{model?.name || 'Unknown'}
					</div>
				</div>
				
				<div>
					<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Position
					</span>
					<div class="text-sm text-gray-600 dark:text-gray-400">
						X: {selectedCamera.x.toFixed(1)}px, Y: {selectedCamera.y.toFixed(1)}px
					</div>
				</div>
				
				<!-- Rotation Control -->
				<Card>
					<CardHeader class="pb-2">
						<CardTitle class="flex items-center gap-2 text-sm">
							<RotateCw size={16} />
							Rotation: {selectedCamera.rotation}°
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-2">
						<input
							type="range"
							min="0"
							max="359"
							step="1"
							bind:value={selectedCamera.rotation}
							onchange={() => updateCamera(selectedCamera.id, { rotation: selectedCamera.rotation })}
							class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
						/>
						<div class="flex gap-1">
							<Button size="sm" variant="outline" onclick={() => { selectedCamera.rotation = 0; updateCamera(selectedCamera.id, { rotation: 0 }); }}>N</Button>
							<Button size="sm" variant="outline" onclick={() => { selectedCamera.rotation = 90; updateCamera(selectedCamera.id, { rotation: 90 }); }}>E</Button>
							<Button size="sm" variant="outline" onclick={() => { selectedCamera.rotation = 180; updateCamera(selectedCamera.id, { rotation: 180 }); }}>S</Button>
							<Button size="sm" variant="outline" onclick={() => { selectedCamera.rotation = 270; updateCamera(selectedCamera.id, { rotation: 270 }); }}>W</Button>
						</div>
					</CardContent>
				</Card>

				<!-- FOV Cone Size Control -->
				<div>
					<label class="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
						Cone Size: {((selectedCamera.coneSize || 0.3) * 100).toFixed(0)}%
					</label>
					<input
						type="range"
						min="0.1"
						max="2.0"
						step="0.1"
						bind:value={selectedCamera.coneSize}
						onchange={() => updateCamera(selectedCamera.id, { coneSize: selectedCamera.coneSize || 0.3 })}
						class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
					/>
				</div>

				<!-- FOV Override -->
				{#if model}
					<div>
						<label class="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
							FOV Override: {selectedCamera.fovOverride || model.fovAngle}°
						</label>
						<input
							type="range"
							min="10"
							max="360"
							step="1"
							bind:value={selectedCamera.fovOverride}
							onchange={() => updateCamera(selectedCamera.id, { fovOverride: selectedCamera.fovOverride || model.fovAngle })}
							class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
						/>
					</div>
				{/if}
				
				<Button
					onclick={() => selectCamera(undefined)}
					variant="destructive"
					size="sm"
					class="w-full"
				>
					Deselect
				</Button>
			</div>
		{:else if selectedInfrastructure}
			<div class="space-y-3">
				<div>
					<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Component
					</span>
					<div class="text-sm text-gray-900 dark:text-white">
						{selectedInfrastructure.name}
					</div>
				</div>
				
				<div>
					<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Position
					</span>
					<div class="text-sm text-gray-600 dark:text-gray-400">
						X: {selectedInfrastructure.x.toFixed(1)}px, Y: {selectedInfrastructure.y.toFixed(1)}px
					</div>
				</div>
				
				<Button
					onclick={() => selectInfrastructure(undefined)}
					variant="destructive"
					size="sm"
					class="w-full"
				>
					Deselect
				</Button>
			</div>
		{:else}
			<div class="text-center p-6">
				<div class="text-4xl mb-2">👆</div>
				<div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
					Click to select an item on the floor plan
				</div>
				<div class="text-xs text-gray-400 dark:text-gray-500">
					Double-click to edit • Mouse wheel to zoom • Right tool to pan
				</div>
			</div>
		{/if}
		</div>
	{/if}
</aside>