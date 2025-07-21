<script lang="ts">
	import { appState, setActiveTool } from '$lib/stores/app.js';
	import { MousePointer, Hand, Ruler, ZoomIn, ZoomOut, RotateCcw } from 'lucide-svelte';
	import type { Tool } from '$lib/types.js';

	let { onZoomIn, onZoomOut, onZoomReset } = $props<{
		onZoomIn: () => void;
		onZoomOut: () => void;
		onZoomReset: () => void;
	}>();

	function selectTool(tool: Tool) {
		setActiveTool(tool);
	}
</script>

<div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
	<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex items-center space-x-2">
		<!-- Tool Selection -->
		<div class="flex items-center space-x-1 px-2 border-r border-gray-200 dark:border-gray-600">
			<button
				onclick={() => selectTool('select')}
				class="p-2 rounded-md transition-colors {$appState.activeTool === 'select' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				title="Select items (click to select, double-click to edit)"
			>
				<MousePointer size={18} />
			</button>
			
			<button
				onclick={() => selectTool('pan')}
				class="p-2 rounded-md transition-colors {$appState.activeTool === 'pan' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				title="Pan around the floor plan (or use mouse wheel to zoom)"
			>
				<Hand size={18} />
			</button>
			
			<button
				onclick={() => selectTool('scale')}
				class="p-2 rounded-md transition-colors {$appState.activeTool === 'scale' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				title="Draw a line to set scale measurements"
			>
				<Ruler size={18} />
			</button>
		</div>

		<!-- Zoom Controls -->
		<div class="flex items-center space-x-1 px-2">
			<button
				onclick={onZoomOut}
				class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
				title="Zoom Out"
			>
				<ZoomOut size={18} />
			</button>
			
			<span class="text-sm text-gray-600 dark:text-gray-300 min-w-12 text-center">
				{Math.round(($appState.currentProject?.transform.zoom || 1) * 100)}%
			</span>
			
			<button
				onclick={onZoomIn}
				class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
				title="Zoom In"
			>
				<ZoomIn size={18} />
			</button>
			
			<button
				onclick={onZoomReset}
				class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
				title="Reset Zoom"
			>
				<RotateCcw size={18} />
			</button>
		</div>
	</div>
</div>