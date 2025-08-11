<script lang="ts">
	import { updateInfrastructure } from '$lib/stores/app.js';
	import { X, Trash2 } from 'lucide-svelte';
	import type { InfrastructureComponent } from '$lib/types.js';

	let { isOpen, onClose, component } = $props<{
		isOpen: boolean;
		onClose: () => void;
		component?: InfrastructureComponent;
	}>();

        let name = $state('');

	$effect(() => {
                if (component) {
                        name = component.name;
                }
        });

        function handleSave() {
                if (!component) return;

                updateInfrastructure(component.id, {
                        name
                });
		
		onClose();
	}

	function handleDelete() {
		if (!component) return;
		
		if (confirm('Are you sure you want to delete this component?')) {
			// Remove infrastructure component
			import('$lib/stores/app.js').then(({ appState }) => {
				appState.update(state => {
					if (!state.currentProject) return state;
					return {
						...state,
						currentProject: {
							...state.currentProject,
							infrastructure: state.currentProject.infrastructure.filter(c => c.id !== component.id),
							updatedAt: new Date()
						},
						selectedInfrastructureId: state.selectedInfrastructureId === component.id ? undefined : state.selectedInfrastructureId
					};
				});
			});
			onClose();
		}
	}
</script>

{#if isOpen && component}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					Edit Infrastructure
				</h2>
				<button
					onclick={onClose}
					class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
				>
					<X size={20} />
				</button>
			</div>

			<div class="space-y-4">
				<!-- Component Info -->
				<div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Type: {component.type.toUpperCase()}
					</p>
				</div>

				<!-- Name -->
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Component Name
					</label>
					<input
						id="name"
						bind:value={name}
						type="text"
						placeholder="Enter component name"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
					/>
				</div>

                                <!-- Position -->
                                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                Position
                                        </h3>
					<p class="text-xs text-gray-600 dark:text-gray-400">
						X: {component.x.toFixed(1)}px, Y: {component.y.toFixed(1)}px
					</p>
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