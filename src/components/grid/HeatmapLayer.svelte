<script>
	import { getContext } from "svelte";
	import { scaleSequential, scaleQuantize, extent, rgb, format } from "d3";
	import variables from "$data/variables.json";

	// Per-cell heatmap overlay. `data` is an array of { x, y, value }; each grid
	// cell is colored by its value across the data's extent.
	// Use with the foundation's variant="wireframe" so the fills read cleanly.
	//
	// `interpolate` takes either:
	//   - an array of colors → that many discrete, equal-width bins
	//   - an interpolator fn (e.g. d3.interpolateViridis) → continuous ramp
	//
	// `showValues` prints each cell's value on top of its fill, in black or white
	// (whichever contrasts more with that fill). `formatValue` overrides the label.
	let {
		data = [],
		interpolate,
		showValues = true,
		// big counts get compacted (1600 → 1.6k); small/decimal values print as-is
		formatValue = (v) => (Math.abs(v) >= 1000 ? format(",")(v) : String(v))
	} = $props();

	const grid = getContext("grid");

	// WCAG relative luminance → pick the label color with the better contrast.
	// 0.179 is the crossover where white and black contrast equally against a fill.
	function labelColor(fill) {
		const { r, g, b } = rgb(fill);
		const channel = (c) => {
			const s = c / 255;
			return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
		};
		const l = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
		return l > 0.25
			? variables.category["yellow-dark"]
			: variables.category["yellow-light"];
	}

	let lookup = $derived(new Map(data.map((d) => [`${d.x},${d.y}`, d.value])));

	let color = $derived.by(() => {
		const [lo, hi] = extent(data, (d) => d.value);
		const domain = [lo ?? 0, hi ?? 1];
		return Array.isArray(interpolate)
			? scaleQuantize().domain(domain).range(interpolate)
			: scaleSequential(interpolate).domain(domain);
	});
</script>

<svg viewBox="0 0 {grid.size} {grid.size}">
	{#each grid.cells as { x, y, obstacle }}
		{@const value = lookup.get(`${x},${y}`)}
		{#if value != null && !obstacle}
			{@const fill = color(value)}
			<rect {x} {y} width="1" height="1" {fill} />
			{#if showValues}
				<text
					x={x + 0.5}
					y={y + 0.5}
					text-anchor="middle"
					dominant-baseline="central"
					fill={labelColor(fill)}>{formatValue(value)}</text
				>
			{/if}
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

	text {
		font-family: var(--font-mono);
		font-size: 0.2px;
		font-weight: 700;
	}
</style>
