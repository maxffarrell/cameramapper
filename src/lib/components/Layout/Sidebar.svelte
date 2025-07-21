<script lang="ts">
	import { appState, cameraModels, infrastructureModels, selectCamera, selectInfrastructure } from '$lib/stores/app.js';
	import { Upload, Ruler, Camera, Server } from 'lucide-svelte';
	import type { CameraModel } from '$lib/types.js';

	let { onPdfUpload, onScaleSet } = $props<{
		onPdfUpload: (file: File) => void;
		onScaleSet: () => void;
	}>();

	let fileInput: HTMLInputElement;
	let searchTerm = $state('');

	const filteredCameraModels = $derived(
		$cameraModels.filter(model => 
			model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			model.brand.toLowerCase().includes(searchTerm.toLowerCase())
		)
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
</script>

<aside class="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
	<!-- PDF Upload Section -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Floor Plan</h2>
		
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
			<div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
				{$appState.currentProject.pdfFile.name}
			</div>
		{/if}

		<button
			onclick={onScaleSet}
			class="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
		>
			<Ruler size={16} />
			<span class="text-sm">Set Scale</span>
		</button>
	</div>

	<!-- Camera Models Section -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center space-x-2 mb-3">
			<Camera size={20} class="text-gray-600 dark:text-gray-300" />
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Cameras</h2>
		</div>

		<input
			bind:value={searchTerm}
			type="text"
			placeholder="Search cameras..."
			class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
		/>

		<div class="mt-3 space-y-2 max-h-64 overflow-y-auto">
			{#each filteredCameraModels as model (model.id)}
				<div
					role="button"
					tabindex="0"
					draggable="true"
					ondragstart={(e) => startDrag(e, 'camera', model)}
					class="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 cursor-grab active:cursor-grabbing transition-colors"
				>
					<div class="flex items-center space-x-3">
						<span class="text-2xl">{model.emoji}</span>
						<div class="flex-1 min-w-0">
							<div class="text-sm font-medium text-gray-900 dark:text-white truncate">
								{model.name}
							</div>
							<div class="text-xs text-gray-500 dark:text-gray-400">
								{model.brand} • FOV: {model.fovAngle}° • Range: {model.range}ft
							</div>
							<div class="text-xs text-green-600 dark:text-green-400">
								${model.price}
							</div>
						</div>
					</div>
					
					{#if model.features.length > 0}
						<div class="mt-2 flex flex-wrap gap-1">
							{#each model.features as feature}
								<span class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
									{feature}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Infrastructure Section -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center space-x-2 mb-3">
			<Server size={20} class="text-gray-600 dark:text-gray-300" />
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Infrastructure</h2>
		</div>

		<div class="space-y-2">
			{#each $infrastructureModels as model}
				<div
					role="button"
					tabindex="0"
					draggable="true"
					ondragstart={(e) => startDrag(e, 'infrastructure', model)}
					class="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 cursor-grab active:cursor-grabbing transition-colors"
				>
					<div class="flex items-center space-x-3">
						<span class="text-2xl">{model.emoji}</span>
						<div class="flex-1">
							<div class="text-sm font-medium text-gray-900 dark:text-white">
								{model.name}
							</div>
							<div class="text-xs text-green-600 dark:text-green-400">
								${model.price}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Properties Panel -->
	<div class="flex-1 p-4">
		<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Properties</h2>
		
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
				
				<div>
					<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Rotation
					</span>
					<div class="text-sm text-gray-600 dark:text-gray-400">
						{selectedCamera.rotation}°
					</div>
				</div>
				
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
			<div class="text-sm text-gray-500 dark:text-gray-400">
				Select a camera or infrastructure component to view properties
			</div>
		{/if}
	</div>
</aside>