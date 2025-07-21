<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X, Plus } from 'lucide-svelte';
	import type { CameraModel } from '$lib/types.js';

	let { isOpen, onClose } = $props<{
		isOpen: boolean;
		onClose: () => void;
	}>();

	const dispatch = createEventDispatcher<{
		created: CameraModel;
	}>();

	let customCamera = $state({
		name: '',
		brand: 'Custom',
		fovAngle: 90,
		range: 100,
		price: 0,
		features: [] as string[],
		type: 'bullet' as const,
		emoji: '📹',
		color: '#6366f1'
	});

	let newFeature = $state('');

	const availableFeatures = [
		'Night Vision',
		'Color at Night',
		'Audio',
		'Varifocal',
		'PTZ',
		'Analytics',
		'Smart Detection',
		'Dewarping',
		'Auto Tracking',
		'Motion Detection',
		'License Plate Recognition',
		'Facial Recognition',
		'Weatherproof',
		'Vandal Resistant'
	];

	const cameraTypes = [
		{ value: 'bullet', label: 'Bullet Camera' },
		{ value: 'dome', label: 'Dome Camera' },
		{ value: 'ptz', label: 'PTZ Camera' },
		{ value: 'fisheye', label: 'Fisheye Camera' }
	] as const;

	const commonEmojis = ['📹', '🎥', '📷', '🔍', '👁️', '🎯', '📺', '📻'];
	const commonColors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

	function addFeature(feature: string) {
		if (feature && !customCamera.features.includes(feature)) {
			customCamera.features = [...customCamera.features, feature];
		}
	}

	function removeFeature(feature: string) {
		customCamera.features = customCamera.features.filter(f => f !== feature);
	}

	function addCustomFeature() {
		if (newFeature.trim() && !customCamera.features.includes(newFeature.trim())) {
			customCamera.features = [...customCamera.features, newFeature.trim()];
			newFeature = '';
		}
	}

	function createCamera() {
		if (!customCamera.name.trim()) {
			alert('Please enter a camera name');
			return;
		}

		const camera: CameraModel = {
			id: `custom-${Date.now()}`,
			name: customCamera.name.trim(),
			brand: customCamera.brand,
			fovAngle: customCamera.fovAngle,
			range: customCamera.range,
			price: customCamera.price,
			features: customCamera.features,
			type: customCamera.type,
			emoji: customCamera.emoji,
			color: customCamera.color
		};

		dispatch('created', camera);
		resetForm();
		onClose();
	}

	function resetForm() {
		customCamera = {
			name: '',
			brand: 'Custom',
			fovAngle: 90,
			range: 100,
			price: 0,
			features: [],
			type: 'bullet',
			emoji: '📹',
			color: '#6366f1'
		};
		newFeature = '';
	}

	function handleClose() {
		resetForm();
		onClose();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
			<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Custom Camera Builder</h2>
				<button onclick={handleClose} class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
					<X size={24} />
				</button>
			</div>

			<div class="p-6 space-y-6">
				<!-- Basic Info -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Camera Name *
						</label>
						<input
							bind:value={customCamera.name}
							type="text"
							placeholder="e.g., Custom Security Camera"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Brand
						</label>
						<input
							bind:value={customCamera.brand}
							type="text"
							placeholder="e.g., Custom Brand"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>

				<!-- Technical Specs -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							FOV Angle (degrees)
						</label>
						<input
							bind:value={customCamera.fovAngle}
							type="number"
							min="10"
							max="360"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Range (feet)
						</label>
						<input
							bind:value={customCamera.range}
							type="number"
							min="10"
							max="1000"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Price ($)
						</label>
						<input
							bind:value={customCamera.price}
							type="number"
							min="0"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>

				<!-- Camera Type -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Camera Type
					</label>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-2">
						{#each cameraTypes as type}
							<button
								onclick={() => customCamera.type = type.value}
								class="px-3 py-2 text-sm border rounded-md transition-colors {customCamera.type === type.value
									? 'bg-blue-600 text-white border-blue-600'
									: 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}"
							>
								{type.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Visual Customization -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Display Emoji
						</label>
						<div class="flex flex-wrap gap-2 mb-2">
							{#each commonEmojis as emoji}
								<button
									onclick={() => customCamera.emoji = emoji}
									class="w-10 h-10 text-lg border rounded-md transition-colors {customCamera.emoji === emoji
										? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
										: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}"
								>
									{emoji}
								</button>
							{/each}
						</div>
						<input
							bind:value={customCamera.emoji}
							type="text"
							maxlength="2"
							placeholder="Or enter custom emoji"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Brand Color
						</label>
						<div class="flex flex-wrap gap-2 mb-2">
							{#each commonColors as color}
								<button
									onclick={() => customCamera.color = color}
									class="w-10 h-10 border-2 rounded-md transition-all {customCamera.color === color
										? 'border-gray-900 dark:border-white scale-110'
										: 'border-gray-300 dark:border-gray-600'}"
									style="background-color: {color}"
								></button>
							{/each}
						</div>
						<input
							bind:value={customCamera.color}
							type="color"
							class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
						/>
					</div>
				</div>

				<!-- Features -->
				<div>
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Features
					</label>
					
					<!-- Selected Features -->
					{#if customCamera.features.length > 0}
						<div class="flex flex-wrap gap-2 mb-3">
							{#each customCamera.features as feature}
								<span class="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
									{feature}
									<button onclick={() => removeFeature(feature)} class="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100">
										<X size={12} />
									</button>
								</span>
							{/each}
						</div>
					{/if}

					<!-- Available Features -->
					<div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
						{#each availableFeatures as feature}
							{#if !customCamera.features.includes(feature)}
								<button
									onclick={() => addFeature(feature)}
									class="px-2 py-1 text-xs text-left bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
								>
									+ {feature}
								</button>
							{/if}
						{/each}
					</div>

					<!-- Custom Feature Input -->
					<div class="flex gap-2">
						<input
							bind:value={newFeature}
							type="text"
							placeholder="Add custom feature"
							onkeydown={(e) => e.key === 'Enter' && addCustomFeature()}
							class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<button
							onclick={addCustomFeature}
							class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
						>
							<Plus size={16} />
						</button>
					</div>
				</div>
			</div>

			<div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
				<button
					onclick={handleClose}
					class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={createCamera}
					class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
				>
					Create Camera
				</button>
			</div>
		</div>
	</div>
{/if}