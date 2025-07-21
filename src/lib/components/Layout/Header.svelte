<script lang="ts">
	import { appState } from '$lib/stores/app.js';
	import { Save, Upload, Download } from 'lucide-svelte';

	let { onSave, onLoad, onExport } = $props<{
		onSave: () => void;
		onLoad: () => void;
		onExport: () => void;
	}>();
</script>

<header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
				Camera System Designer
			</h1>
			{#if $appState.currentProject}
				<span class="text-sm text-gray-500 dark:text-gray-400">
					{$appState.currentProject.name}
				</span>
			{/if}
		</div>

		<div class="flex items-center space-x-4">
			<div class="flex items-center space-x-2">
				<button
					onclick={onLoad}
					class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
				>
					<Upload size={16} />
					<span>Load</span>
				</button>

				<button
					onclick={onSave}
					class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
				>
					<Save size={16} />
					<span>Save</span>
				</button>

				<button
					onclick={onExport}
					class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
				>
					<Download size={16} />
					<span>Export CSV</span>
				</button>
			</div>

		</div>
	</div>
</header>