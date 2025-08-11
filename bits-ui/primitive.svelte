<script lang="ts">
  export let tag: keyof HTMLElementTagNameMap = 'div';
</script>

<svelte:element this={tag} {...$$restProps}><slot /></svelte:element>
