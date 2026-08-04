<script>
	import { getContext } from "svelte";

	// Optional second set of cell borders, drawn on top of the layer stack so
	// gridlines stay visible over layer fills (heatmap, sections, forks). The
	// foundation still draws its own borders underneath; render this last inside
	// Grid only where the fills would otherwise swallow them.
	//
	// `obstacles` includes obstacle cells, which the foundation styles
	// differently, so they're skipped by default.
	let {
		color = "var(--color-gray-700)",
		width = 1,
		opacity = 1,
		obstacles = false
	} = $props();

	const grid = getContext("grid");
</script>

<svg
	viewBox="0 0 {grid.size} {grid.size}"
	style="--stroke: {color}; --stroke-width: {width}; --stroke-opacity: {opacity};"
	aria-hidden="true"
>
	{#each grid.cells as { x, y, obstacle }}
		{#if obstacles || !obstacle}
			<rect {x} {y} width="1" height="1" />
		{/if}
	{/each}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		/* perimeter strokes straddle the viewBox edge */
		overflow: visible;
		pointer-events: none;
	}

	rect {
		fill: none;
		stroke: var(--stroke);
		stroke-width: var(--stroke-width);
		stroke-opacity: var(--stroke-opacity);
		vector-effect: non-scaling-stroke;
		shape-rendering: crispEdges;
	}
</style>
