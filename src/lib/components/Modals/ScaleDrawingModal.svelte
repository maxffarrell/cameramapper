<script lang="ts">
	import { updateScale, setActiveTool } from '$lib/stores/app.js';
	import { X } from 'lucide-svelte';

	let { isOpen, onClose, scaleLine } = $props<{
		isOpen: boolean;
		onClose: () => void;
		scaleLine?: { x1: number; y1: number; x2: number; y2: number; pixelLength: number };
	}>();

	let realWorldDistance = $state(10);
	let units = $state<'feet' | 'meters' | 'inches' | 'centimeters'>('feet');

	function handleSetScale() {
		if (!scaleLine) return;
		
		const pixelsPerUnit = scaleLine.pixelLength / realWorldDistance;
		const pixelsPerFoot = units === 'feet' ? pixelsPerUnit : 
							 units === 'meters' ? pixelsPerUnit * 3.28084 :
							 units === 'inches' ? pixelsPerUnit * 12 :
							 pixelsPerUnit * 30.48;

		updateScale({
			pixelsPerFoot,
			units,
			referenceLine: {
				x1: scaleLine.x1,
				y1: scaleLine.y1,
				x2: scaleLine.x2,
				y2: scaleLine.y2,
				realWorldDistance
			}
		});
		
		setActiveTool('select');
		onClose();
	}

	function handleCancel() {
		setActiveTool('select');
		onClose();
	}
</script>

{#if isOpen && scaleLine}
	<div class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					Set Scale Reference
				</h2>
				<button
					onclick={handleCancel}
					class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
				>
					<X size={20} />
				</button>
			</div>

			<div class="space-y-4">
				<div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
					<p class="text-sm text-blue-800 dark:text-blue-200">
						You've drawn a line of <strong>{scaleLine.pixelLength.toFixed(1)} pixels</strong>.
						<br />Enter the real-world distance this line represents.
					</p>
				</div>

				<div>
					<label for="distance" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Real-world distance
					</label>
					<div class="flex space-x-2">
						<input
							id="distance"
							bind:value={realWorldDistance}
							type="number"
							min="0.1"
							step="0.1"
							class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
							placeholder="Enter distance"
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

				<div class="flex space-x-3">
					<button
						onclick={handleCancel}
						class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						onclick={handleSetScale}
						disabled={!realWorldDistance || realWorldDistance <= 0}
						class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Set Scale
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}