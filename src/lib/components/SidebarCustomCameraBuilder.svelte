<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X, Plus, ArrowLeft } from 'lucide-svelte';
	import type { CameraModel } from '$lib/types.js';

	let { onClose } = $props<{
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
		{ value: 'bullet', label: 'Bullet' },
		{ value: 'dome', label: 'Dome' },
		{ value: 'ptz', label: 'PTZ' },
		{ value: 'fisheye', label: 'Fisheye' }
	] as const;

	const commonEmojis = ['📹', '🎥', '📷', '🔍', '👁️', '🎯'];
	const commonColors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
			features: customCamera.features,
			type: customCamera.type,
			emoji: customCamera.emoji,
			color: customCamera.color,
			isCustom: true
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

<div class="p-4 space-y-4">
	<div class="flex items-center justify-between">
		<button onclick={handleClose} class="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
			<ArrowLeft size={16} />
			<span class="text-sm">Back to Cameras</span>
		</button>
	</div>

	<div class="space-y-4">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Create Custom Camera</h3>

		<!-- Basic Info -->
		<div class="space-y-3">
			<div>
				<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
					Camera Name *
				</label>
				<input
					bind:value={customCamera.name}
					type="text"
					placeholder="Custom Camera"
					class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div>
				<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
					Brand
				</label>
				<input
					bind:value={customCamera.brand}
					type="text"
					placeholder="Custom"
					class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
		</div>

		<!-- Technical Specs -->
		<div class="grid grid-cols-2 gap-2">
			<div>
				<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
					FOV (degrees)
				</label>
				<input
					bind:value={customCamera.fovAngle}
					type="number"
					min="10"
					max="360"
					class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div>
				<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
					Range (feet)
				</label>
				<input
					bind:value={customCamera.range}
					type="number"
					min="10"
					max="1000"
					class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>
		</div>

		<!-- Camera Type -->
		<div>
			<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
				Type
			</label>
			<div class="grid grid-cols-2 gap-1">
				{#each cameraTypes as type}
					<button
						onclick={() => customCamera.type = type.value}
						class="px-2 py-1 text-xs rounded transition-colors {customCamera.type === type.value
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
					>
						{type.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Visual -->
		<div class="space-y-3">
			<div>
				<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
					Emoji
				</label>
				<div class="flex flex-wrap gap-1 mb-2">
					{#each commonEmojis as emoji}
						<button
							onclick={() => customCamera.emoji = emoji}
							class="w-8 h-8 text-sm border rounded transition-colors {customCamera.emoji === emoji
								? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
								: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}"
						>
							{emoji}
						</button>
					{/each}
				</div>
			</div>

			<div>
				<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
					Color
				</label>
				<div class="flex flex-wrap gap-1 mb-2">
					{#each commonColors as color}
						<button
							onclick={() => customCamera.color = color}
							class="w-8 h-8 border-2 rounded transition-all {customCamera.color === color
								? 'border-gray-900 dark:border-white scale-110'
								: 'border-gray-300 dark:border-gray-600'}"
							style="background-color: {color}"
						></button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Features -->
		<div>
			<label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
				Features
			</label>
			
			<!-- Selected Features -->
			{#if customCamera.features.length > 0}
				<div class="flex flex-wrap gap-1 mb-2">
					{#each customCamera.features as feature}
						<span class="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
							{feature}
							<button onclick={() => removeFeature(feature)} class="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100">
								<X size={10} />
							</button>
						</span>
					{/each}
				</div>
			{/if}

			<!-- Feature Selection (first 6 common ones) -->
			<div class="grid grid-cols-2 gap-1 mb-2">
				{#each availableFeatures.slice(0, 6) as feature}
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
			<div class="flex gap-1">
				<input
					bind:value={newFeature}
					type="text"
					placeholder="Custom feature"
					onkeydown={(e) => e.key === 'Enter' && addCustomFeature()}
					class="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
				/>
				<button
					onclick={addCustomFeature}
					class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
				>
					<Plus size={12} />
				</button>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex gap-2 pt-2">
			<button
				onclick={handleClose}
				class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
			>
				Cancel
			</button>
			<button
				onclick={createCamera}
				class="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
			>
				Create
			</button>
		</div>
	</div>
</div>