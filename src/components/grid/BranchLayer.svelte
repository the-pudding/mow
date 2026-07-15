<script>
	import { getContext } from "svelte";

	// Branching-paths overlay. `branches` is an edge list, each edge
	// { from: {x, y}, to: {x, y}, weight? }; links are drawn between cell centers.
	// Data shape is a stub — wire the real branching model when it exists.
	let { branches = [], stroke = "var(--color-gray-700)" } = $props();

	const grid = getContext("grid");
</script>

<svg viewBox="0 0 {grid.size} {grid.size}">
	{#each branches as { from, to, weight = 1 }, i (i)}
		{@const a = grid.center(from.x, from.y)}
		{@const b = grid.center(to.x, to.y)}
		<line
			x1={a.cx}
			y1={a.cy}
			x2={b.cx}
			y2={b.cy}
			{stroke}
			stroke-width={0.08 * weight}
		/>
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

	line {
		stroke-linecap: round;
	}
</style>
