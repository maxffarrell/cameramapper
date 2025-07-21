<script lang="ts">
	import { appState, cameraModels, infrastructureModels, selectCamera, selectInfrastructure, addCustomCameraModel, updateCamera } from '$lib/stores/app.js';
	import { Upload, Ruler, Camera, Server, Plus } from 'lucide-svelte';
	import CameraIcons from '$lib/components/Icons/CameraIcons.svelte';
	import FeatureIcons from '$lib/components/Icons/FeatureIcons.svelte';
	import SidebarCustomCameraBuilder from '$lib/components/SidebarCustomCameraBuilder.svelte';
	import type { CameraModel } from '$lib/types.js';

	let { onPdfUpload, onScaleSet } = $props<{
		onPdfUpload: (file: File) => void;
		onScaleSet: () => void;
	}>();

	let fileInput: HTMLInputElement;
	let searchTerm = $state('');
	let showCustomBuilder = $state(false);
	let showScaleModal = $state(false);

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
</script>

<aside class="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
	{#if showCustomBuilder}
		<!-- Custom Camera Builder -->
		<SidebarCustomCameraBuilder 
			onClose={() => showCustomBuilder = false}
			on:created={handleCustomCameraCreated}
		/>
	{:else}
		<!-- Main Sidebar Content -->
		<!-- PDF Upload Section -->
		<div class="p-4 border-b border-gray-200 dark:border-gray-700">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 1: Floor Plan</h2>
			<p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Start by uploading your building's floor plan PDF</p>
		
		<button
			onclick={() => fileInput.click()}
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

		{#if $appState.currentProject?.pdfFile}
			<div class="mt-2 text-xs text-green-600 dark:text-green-400">
				✓ {$appState.currentProject.pdfFile.name}
			</div>
			
			<div class="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
				<p class="text-xs text-blue-800 dark:text-blue-200 mb-2">
					<strong>Step 2:</strong> Set the scale by drawing a line on something with a known measurement
				</p>
				<button
					onclick={onScaleSet}
					class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors text-sm"
				>
					<Ruler size={16} />
					<span>Draw Scale Line</span>
				</button>
			</div>
		{/if}
	</div>

	<!-- Camera Models Section -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center space-x-2 mb-2">
			<Camera size={20} class="text-gray-600 dark:text-gray-300" />
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Step 3: Add Cameras</h2>
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
										e.currentTarget.style.display = 'none';
										const fallback = e.currentTarget.nextElementSibling;
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

	<!-- Infrastructure Section -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center space-x-2 mb-2">
			<Server size={20} class="text-gray-600 dark:text-gray-300" />
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Step 4: Add Infrastructure</h2>
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

	<!-- Properties Panel -->
	<div class="flex-1 p-4">
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
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Rotation: {selectedCamera.rotation}°
					</label>
					<input
						type="range"
						min="0"
						max="359"
						bind:value={selectedCamera.rotation}
						onchange={() => updateCamera(selectedCamera.id, { rotation: selectedCamera.rotation })}
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>

				<!-- FOV Cone Size Control -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Cone Size: {((selectedCamera.coneSize || 0.3) * 100).toFixed(0)}%
					</label>
					<input
						type="range"
						min="0.1"
						max="2.0"
						step="0.1"
						bind:value={selectedCamera.coneSize}
						onchange={() => updateCamera(selectedCamera.id, { coneSize: selectedCamera.coneSize || 0.3 })}
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
					/>
				</div>

				<!-- FOV Override -->
				{#if model}
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							FOV Override: {selectedCamera.fovOverride || model.fovAngle}°
						</label>
						<input
							type="range"
							min="10"
							max="360"
							bind:value={selectedCamera.fovOverride}
							onchange={() => updateCamera(selectedCamera.id, { fovOverride: selectedCamera.fovOverride || model.fovAngle })}
							class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
						/>
					</div>
				{/if}
				
				<button
					onclick={() => selectCamera(undefined)}
					class="w-full px-3 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
				>
					Deselect
				</button>
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
				
				<button
					onclick={() => selectInfrastructure(undefined)}
					class="w-full px-3 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
				>
					Deselect
				</button>
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