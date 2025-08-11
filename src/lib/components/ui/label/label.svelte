<script lang="ts">
        import { cn } from "$lib/utils.js";

        let {
                ref = $bindable(null),
                class: className,
                ...restProps
        }: { ref: any; class?: string } = $props();
</script>

<label
        bind:this={ref}
        data-slot="label"
        class={cn(
                "flex select-none items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
                className
        )}
        {...restProps}
/>
