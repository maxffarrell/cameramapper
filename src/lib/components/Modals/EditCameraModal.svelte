<script lang="ts">
	import { updateCamera, removeCamera, cameraModels } from '$lib/stores/app.js';
	import { X, Trash2, RotateCw } from 'lucide-svelte';
	import type { Camera } from '$lib/types.js';

	let { isOpen, onClose, camera } = $props<{
		isOpen: boolean;
		onClose: () => void;
		camera?: Camera;
	}>();

	let label = $state('');
	let notes = $state('');
	let rotation = $state(0);
	let fovOverride = $state<number | undefined>();
	let rangeOverride = $state<number | undefined>();

	$effect(() => {
		if (camera) {
			label = camera.label || '';
			notes = camera.notes || '';
			rotation = camera.rotation;
			fovOverride = camera.fovOverride;
			rangeOverride = camera.rangeOverride;
		}
	});

	const model = $derived(camera ? $cameraModels.find(m => m.id === camera.modelId) : null);

	function handleSave() {
		if (!camera) return;
		
		updateCamera(camera.id, {
			label,
			notes,
			rotation,
			fovOverride,
			rangeOverride
		});
		
		onClose();
	}

	function handleDelete() {
		if (!camera) return;
		
		if (confirm('Are you sure you want to delete this camera?')) {
			removeCamera(camera.id);
			onClose();
		}
	}

	function adjustRotation(delta: number) {
		rotation = (rotation + delta + 360) % 360;
	}
</script>

{#if isOpen && camera && model}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4 max-h-[90vh] overflow-y-auto">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					Edit Camera
				</h2>
				<button
					onclick={onClose}
					class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
				>
					<X size={20} />
				</button>
			</div>

			<div class="space-y-4">
				<!-- Camera Info -->
				<div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
					<h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
						{model.name}
					</h3>
					<p class="text-xs text-gray-600 dark:text-gray-400">
						{model.brand} • Default FOV: {model.fovAngle}° • Range: {model.range}ft
					</p>
				</div>

				<!-- Label -->
				<div>
					<label for="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Label
					</label>
					<input
						id="label"
						bind:value={label}
						type="text"
						placeholder="e.g., Front Entrance, Loading Dock"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
					/>
				</div>

				<!-- Rotation -->
				<div>
					<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Rotation: {rotation}°
					</span>
					<div class="flex items-center space-x-2">
						<button
							onclick={() => adjustRotation(-15)}
							class="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
						>
							<RotateCw size={16} class="transform -scale-x-100" />
						</button>
						<input
							bind:value={rotation}
							type="range"
							min="0"
							max="359"
							class="flex-1"
						/>
						<button
							onclick={() => adjustRotation(15)}
							class="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
						>
							<RotateCw size={16} />
						</button>
					</div>
				</div>

				<!-- FOV Override -->
				<div>
					<label for="fov" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Field of View Override (degrees)
					</label>
					<input
						id="fov"
						bind:value={fovOverride}
						type="number"
						min="10"
						max="360"
						placeholder={`Default: ${model.fovAngle}°`}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
					/>
				</div>

				<!-- Range Override -->
				<div>
					<label for="range" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Detection Range Override (feet)
					</label>
					<input
						id="range"
						bind:value={rangeOverride}
						type="number"
						min="5"
						max="500"
						placeholder={`Default: ${model.range}ft`}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
					/>
				</div>

				<!-- Notes -->
				<div>
					<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Installation Notes
					</label>
					<textarea
						id="notes"
						bind:value={notes}
						rows="3"
						placeholder="Special mounting requirements, cable routing notes, etc."
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
					></textarea>
				</div>

				<!-- Actions -->
				<div class="flex space-x-3 pt-4">
					<button
						onclick={handleDelete}
						class="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
					>
						<Trash2 size={16} />
						<span>Delete</span>
					</button>
					<button
						onclick={onClose}
						class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						onclick={handleSave}
						class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						Save Changes
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}