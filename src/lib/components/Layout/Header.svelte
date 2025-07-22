<script lang="ts">
	import { appState, updateProjectName, cameraModels } from '$lib/stores/app.js';
	import { Save, Upload, Download, Edit } from 'lucide-svelte';
	import { createExportZip, downloadZip } from '$lib/utils/export.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let { onLoad, getCanvasElements } = $props<{
		onLoad: () => void;
		getCanvasElements: () => { canvas: HTMLCanvasElement; svgElement: SVGSVGElement } | null;
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

	async function handleExport() {
		const project = $appState.currentProject;
		const models = $cameraModels;
		
		if (!project) {
			alert('No project to export');
			return;
		}

		const elements = getCanvasElements();
		if (!elements) {
			alert('Unable to access canvas elements');
			return;
		}

		try {
			const zipBlob = await createExportZip(
				project,
				models,
				elements.canvas,
				elements.svgElement
			);
			
			downloadZip(zipBlob, project.name);
		} catch (error) {
			console.error('Export failed:', error);
			alert('Export failed. Please try again.');
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
						<Input
							bind:value={projectNameInput}
							onkeydown={handleNameKeydown}
							onblur={saveProjectName}
							class="text-sm w-48"
							placeholder="Project name"
						/>
					{:else}
						<Button
							onclick={startEditingName}
							variant="ghost"
							size="sm"
							class="flex items-center space-x-1 text-sm"
						>
							<span>{$appState.currentProject.name}</span>
							<Edit size={14} class="opacity-60" />
						</Button>
					{/if}
				</div>
			{/if}
		</div>

		<div class="flex items-center space-x-4">
			<div class="flex items-center space-x-2">
				<Button
					onclick={onLoad}
					variant="outline"
					size="sm"
					class="flex items-center space-x-2"
				>
					<Upload size={16} />
					<span>Load</span>
				</Button>

				<Button
					onclick={handleExport}
					size="sm"
					class="flex items-center space-x-2"
				>
					<Download size={16} />
					<span>Export ZIP</span>
				</Button>
			</div>

		</div>
	</div>
</header>