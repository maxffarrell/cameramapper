<script lang="ts">
	import { Eye, Volume2, RotateCcw, Zap, Moon } from 'lucide-svelte';

	let { type, size = 20, class: className = "" } = $props<{
		type: 'dome' | 'bullet' | 'ptz' | 'fisheye';
		size?: number;
		class?: string;
	}>();
</script>

{#if type === 'dome'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" class={className}>
		<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
		<circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.3"/>
		<circle cx="12" cy="12" r="2" fill="currentColor"/>
	</svg>
{:else if type === 'bullet'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" class={className}>
		<rect x="4" y="8" width="16" height="8" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
		<rect x="6" y="10" width="4" height="4" rx="2" fill="currentColor"/>
		<rect x="14" y="11" width="4" height="2" fill="currentColor"/>
	</svg>
{:else if type === 'ptz'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" class={className}>
		<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
		<circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3"/>
		<path d="m8 8 8 8M16 8l-8 8" stroke="currentColor" stroke-width="1"/>
		<circle cx="12" cy="12" r="1" fill="currentColor"/>
	</svg>
{:else if type === 'fisheye'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" class={className}>
		<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
		<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>
		<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>
		<circle cx="12" cy="12" r="1" fill="currentColor"/>
	</svg>
{/if}