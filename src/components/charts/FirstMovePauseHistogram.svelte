<script>
	import { scaleLinear, bin, max, range } from "d3";

	// Inline mini-histogram of every player's first-move pause (seconds), with a
	// marker for a highlighted player and a marker for the median. Sized to sit
	// inside the story text column, not the sticky grid vis.
	//
	// values:    number[] — first-move pause in seconds, one per player.
	// highlight: number — the featured player's pause (e.g. Bones = 2.9).
	// median:    number — the population median (e.g. 3).
	let {
		values = [],
		highlight = null,
		median = null,
		width = 420,
		height = 140,
		binCount = 24
	} = $props();

	const margin = { top: 16, right: 12, bottom: 28, left: 12 };

	let innerW = $derived(width - margin.left - margin.right);
	let innerH = $derived(height - margin.top - margin.bottom);

	let maxVal = $derived(max(values) ?? 1);

	let x = $derived(scaleLinear().domain([0, maxVal]).nice().range([0, innerW]));

	let bins = $derived(
		bin().domain(x.domain()).thresholds(x.ticks(binCount))(values)
	);

	let y = $derived(
		scaleLinear()
			.domain([0, max(bins, (b) => b.length) ?? 1])
			.range([innerH, 0])
	);

	let ticks = $derived(x.ticks(5));
</script>

<figure class="chart">
	<svg
		viewBox="0 0 {width} {height}"
		role="img"
		aria-label="Histogram of first-move pause times"
	>
		<g transform={`translate(${margin.left},${margin.top})`}>
			<!-- bars -->
			{#each bins as b (b.x0)}
				<rect
					class="bar"
					x={x(b.x0) + 0.5}
					y={y(b.length)}
					width={Math.max(0, x(b.x1) - x(b.x0) - 1)}
					height={innerH - y(b.length)}
				/>
			{/each}

			<!-- median marker -->
			{#if median != null}
				<line class="median" x1={x(median)} x2={x(median)} y1={0} y2={innerH} />
				<text class="lbl median-lbl" x={x(median)} y={-4} text-anchor="middle"
					>median {median}s</text
				>
			{/if}

			<!-- highlighted player marker -->
			{#if highlight != null}
				<line
					class="hl"
					x1={x(highlight)}
					x2={x(highlight)}
					y1={0}
					y2={innerH}
				/>
				<text
					class="lbl hl-lbl"
					x={x(highlight)}
					y={innerH + 22}
					text-anchor="middle">{highlight}s</text
				>
			{/if}

			<!-- x axis -->
			<line class="axis" x1={0} x2={innerW} y1={innerH} y2={innerH} />
			{#each ticks as t}
				<text class="tick" x={x(t)} y={innerH + 14} text-anchor="middle"
					>{t}s</text
				>
			{/each}
		</g>
	</svg>
</figure>

<style>
	.chart {
		margin: 0.5rem 0;
		max-width: 100%;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	rect.bar {
		fill: var(--color-gray-300);
	}

	line.axis {
		stroke: var(--color-gray-700);
		stroke-width: 1;
	}

	line.median {
		stroke: var(--color-gray-900);
		stroke-width: 1.5;
		stroke-dasharray: 3 3;
	}

	line.hl {
		stroke: var(--color-yellow);
		stroke-width: 2.5;
	}

	text {
		font-family: var(--font-mono);
		fill: var(--color-fg);
	}

	text.tick {
		font-size: 11px;
		fill: var(--color-gray-700);
	}

	text.lbl {
		font-size: 12px;
		font-weight: 700;
	}

	text.hl-lbl {
		fill: var(--color-yellow);
	}
</style>
