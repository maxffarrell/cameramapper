<script lang="ts">
	import { appState, updateScale } from '$lib/stores/app.js';
	import { X } from 'lucide-svelte';

	let { isOpen, onClose } = $props<{
		isOpen: boolean;
		onClose: () => void;
	}>();

	let realWorldDistance = $state(10);
	let units = $state<'feet' | 'meters' | 'inches' | 'centimeters'>('feet');
	let manualScale = $state(50);

	function handleSetScale() {
		updateScale({
			pixelsPerFoot: units === 'feet' ? manualScale : 
						   units === 'meters' ? manualScale * 3.28084 :
						   units === 'inches' ? manualScale * 12 :
						   manualScale * 30.48,
			units
		});
		onClose();
	}

	function handleManualScale() {
		updateScale({
			pixelsPerFoot: manualScale,
			units: 'feet'
		});
		onClose();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					Set Scale
				</h2>
				<button
					onclick={onClose}
					class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
				>
					<X size={20} />
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Method 1: Manual Scale Entry
					</span>
					<div class="flex space-x-2">
						<input
							bind:value={manualScale}
							type="number"
							min="1"
							step="0.1"
							class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
							placeholder="Pixels per foot"
						/>
						<button
							onclick={handleManualScale}
							class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
						>
							Set
						</button>
					</div>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Enter how many pixels equal one foot
					</p>
				</div>

				<div class="border-t border-gray-200 dark:border-gray-600 pt-4">
					<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Method 2: Reference Distance
					</span>
					<div class="space-y-3">
						<div>
							<span class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
								Real-world distance
							</span>
							<div class="flex space-x-2">
								<input
									bind:value={realWorldDistance}
									type="number"
									min="0.1"
									step="0.1"
									class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								/>
								<select
									bind:value={units}
									class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								>
									<option value="feet">Feet</option>
									<option value="meters">Meters</option>
									<option value="inches">Inches</option>
									<option value="centimeters">cm</option>
								</select>
							</div>
						</div>

						<button
							onclick={handleSetScale}
							class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
						>
							Set Scale
						</button>
					</div>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
						Draw a line on your floor plan, then enter its real-world measurement
					</p>
				</div>

				{#if $appState.currentProject}
					<div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
						<h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
							Current Scale
						</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							{$appState.currentProject.scale.pixelsPerFoot.toFixed(1)} pixels per foot
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Units: {$appState.currentProject.scale.units}
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}