<script lang="ts">
	import { appState, updateProjectName } from '$lib/stores/app.js';
	import { Save, Upload, Download, Edit } from 'lucide-svelte';

	let { onSave, onLoad, onExport } = $props<{
		onSave: () => void;
		onLoad: () => void;
		onExport: () => void;
	}>();

	let isEditingName = $state(false);
	let projectNameInput = $state('');

	function startEditingName() {
		if ($appState.currentProject) {
			projectNameInput = $appState.currentProject.name;
			isEditingName = true;
		}
	}

	function saveProjectName() {
		if (projectNameInput.trim()) {
			updateProjectName(projectNameInput.trim());
		}
		isEditingName = false;
	}

	function cancelEditingName() {
		isEditingName = false;
		projectNameInput = '';
	}

	function handleNameKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			saveProjectName();
		} else if (event.key === 'Escape') {
			cancelEditingName();
		}
	}
</script>

<header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
				Camera System Designer
			</h1>
			{#if $appState.currentProject}
				<div class="flex items-center space-x-2">
					{#if isEditingName}
						<input
							bind:value={projectNameInput}
							onkeydown={handleNameKeydown}
							onblur={saveProjectName}
							class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Project name"
							autofocus
						/>
					{:else}
						<button
							onclick={startEditingName}
							class="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
						>
							<span>{$appState.currentProject.name}</span>
							<Edit size={14} class="opacity-60" />
						</button>
					{/if}
				</div>
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