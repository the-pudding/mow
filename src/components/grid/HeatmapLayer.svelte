<script>
	import { getContext } from "svelte";
	import { scaleSequential, interpolateGreens, extent } from "d3";

	// Per-cell heatmap overlay. `data` is an array of { x, y, value }; each grid
	// cell is filled from a sequential color scale over the value extent.
	// Use with the foundation's variant="wireframe" so the fills read cleanly.
	let { data = [], interpolate = interpolateGreens } = $props();

	const grid = getContext("grid");

	let lookup = $derived(
		new Map(data.map((d) => [`${d.x},${d.y}`, d.value]))
	);

	let color = $derived.by(() => {
		const [lo, hi] = extent(data, (d) => d.value);
		return scaleSequential(interpolate).domain([lo ?? 0, hi ?? 1]);
	});
</script>

<svg viewBox="0 0 {grid.size} {grid.size}">
	{#each grid.cells as { x, y, obstacle }}
		{@const value = lookup.get(`${x},${y}`)}
		{#if value != null && !obstacle}
			<rect {x} {y} width="1" height="1" fill={color(value)} />
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
		pointer-events: none;
	}

	rect {
		shape-rendering: crispEdges;
	}
</style>
