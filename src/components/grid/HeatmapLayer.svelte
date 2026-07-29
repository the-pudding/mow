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
		showLegend = true,
		title = "",
		// overrides the domain's upper bound instead of deriving it from `data`
		maxValue,
		minValue,
		// big counts get compacted (1600 → 1.6k); small/decimal values print as-is
		formatValue = (v) => (Math.abs(+v) >= 1000 ? format(",")(v) : String(v))
	} = $props();

	const grid = getContext("grid");

	// WCAG relative luminance → pick the label color with the better contrast.
	// 0.179 is the crossover where white and black contrast equally against a fill.
	// function labelColor(fill) {
	// 	const { r, g, b } = rgb(fill);
	// 	const channel = (c) => {
	// 		const s = c / 255;
	// 		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	// 	};
	// 	const l = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
	// 	return l > 0.25
	// 		? variables.color["gray-900"]
	// 		: variables.category["gray-50"];
	// }

	let lookup = $derived(new Map(data.map((d) => [`${d.x},${d.y}`, d.value])));

	let lo = $derived(minValue ?? extent(data, (d) => d.value)[0]);
	let hi = $derived(maxValue ?? extent(data, (d) => d.value)[1]);

	let color = $derived.by(() => {
		const domain = [lo ?? 0, hi ?? 1];
		return Array.isArray(interpolate)
			? scaleQuantize().domain(domain).range(interpolate)
			: scaleSequential(interpolate).domain(domain).clamp(true);
	});

	// sample the ramp into CSS gradient stops; discrete arrays are used as-is
	let legendGradient = $derived(
		Array.isArray(interpolate)
			? interpolate.join(", ")
			: Array.from({ length: 10 }, (_, i) => interpolate(i / 9)).join(", ")
	);
</script>

{#if title}
	<div class="heatmap-title">{@html title}</div>
{/if}
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
					dominant-baseline="central">{formatValue(value)}</text
				>
			{/if}
		{/if}
	{/each}
</svg>
{#if showLegend && lo != null && hi != null}
	<div class="heatmap-legend">
		<span class="legend-label">{formatValue(lo)}</span>
		<div
			class="legend-bar"
			style="background: linear-gradient(to right, {legendGradient});"
		></div>
		<span class="legend-label">{formatValue(hi)}{maxValue ? "+" : ""}</span>
	</div>
{/if}

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
		font-family: var(--font-form);
		font-size: 0.2px;
		font-weight: 700;
		fill: var(--color-bg);
	}

	.heatmap-title {
		position: absolute;
		top: -0.5rem;
		left: 0;
		width: 100%;
		text-align: center;
		z-index: var(--z-top);
		transform: translateY(-100%);
		font-family: var(--font-form);
		font-size: var(--12px);
		text-transform: uppercase;
	}

	.heatmap-legend {
		position: absolute;
		bottom: -0.5rem;
		left: 50%;
		width: 100%;
		max-width: 10rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		z-index: var(--z-top);
		transform: translate(-50%, 100%);
	}

	.legend-bar {
		flex: 1;
		height: 0.5rem;
	}

	.legend-label {
		font-family: var(--font-form);
		font-size: var(--12px);
		white-space: nowrap;
	}
</style>
