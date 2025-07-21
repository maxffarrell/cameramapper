<script lang="ts">
	import { Eye, Volume2, RotateCcw, Zap, Moon, Focus, ScanLine } from 'lucide-svelte';

	let { feature, size = 16, class: className = "" } = $props<{
		feature: string;
		size?: number;
		class?: string;
	}>();

	function getFeatureIcon(feature: string) {
		const f = feature.toLowerCase();
		if (f.includes('night') || f.includes('vision')) return Moon;
		if (f.includes('audio') || f.includes('sound')) return Volume2;
		if (f.includes('ptz') || f.includes('pan') || f.includes('tilt')) return RotateCcw;
		if (f.includes('varifocal') || f.includes('zoom')) return Focus;
		if (f.includes('motion') || f.includes('detection')) return ScanLine;
		if (f.includes('power') || f.includes('poe')) return Zap;
		return Eye; // Default
	}

	const IconComponent = getFeatureIcon(feature);
</script>

<IconComponent {size} class={className} />