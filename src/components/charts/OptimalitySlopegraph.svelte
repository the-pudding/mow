<script>
	import { scalePoint, scaleLinear, line as d3line, extent } from "d3";

	// Inline slopegraph of optimality across rounds. One line per series (e.g.
	// "all players" vs a "popular average"), plotted over the ordered rounds.
	//
	// series: [{ label, color?, points: [{ round, value }] }]
	// rounds: optional explicit ordered list of round labels; inferred otherwise.
	let {
		series = [],
		rounds = null,
		width = 460,
		height = 220,
		valueLabel = (v) => `${v}%`
	} = $props();

	const margin = { top: 20, right: 96, bottom: 32, left: 40 };

	let innerW = $derived(width - margin.left - margin.right);
	let innerH = $derived(height - margin.top - margin.bottom);

	let roundDomain = $derived(
		rounds ?? [...new Set(series.flatMap((s) => s.points.map((p) => p.round)))]
	);

	let x = $derived(
		scalePoint().domain(roundDomain).range([0, innerW]).padding(0.1)
	);

	let yExtent = $derived(
		extent(series.flatMap((s) => s.points.map((p) => p.value)))
	);

	let y = $derived(
		scaleLinear()
			.domain([yExtent[0] ?? 0, yExtent[1] ?? 100])
			.nice()
			.range([innerH, 0])
	);

	let path = $derived(
		d3line()
			.x((p) => x(p.round))
			.y((p) => y(p.value))
	);

	const palette = ["var(--color-yellow)", "var(--color-green-dark)"];

	let yTicks = $derived(y.ticks(4));
</script>

<figure class="chart">
	<svg
		viewBox="0 0 {width} {height}"
		role="img"
		aria-label="Optimality across rounds"
	>
		<g transform={`translate(${margin.left},${margin.top})`}>
			<!-- y gridlines + labels -->
			{#each yTicks as t}
				<line class="grid" x1={0} x2={innerW} y1={y(t)} y2={y(t)} />
				<text
					class="ytick"
					x={-8}
					y={y(t)}
					text-anchor="end"
					dominant-baseline="middle">{valueLabel(t)}</text
				>
			{/each}

			<!-- round labels -->
			{#each roundDomain as r}
				<text class="xtick" x={x(r)} y={innerH + 20} text-anchor="middle"
					>{r}</text
				>
			{/each}

			<!-- series lines + endpoints -->
			{#each series as s, i (s.label)}
				{@const color = s.color ?? palette[i % palette.length]}
				<path class="line" d={path(s.points)} style:stroke={color} />
				{#each s.points as p (p.round)}
					<circle cx={x(p.round)} cy={y(p.value)} r="3.5" style:fill={color} />
				{/each}
				{@const last = s.points[s.points.length - 1]}
				<text
					class="series-lbl"
					x={x(last.round) + 8}
					y={y(last.value)}
					dominant-baseline="middle"
					style:fill={color}>{s.label}</text
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

	line.grid {
		stroke: var(--color-gray-300);
		stroke-width: 1;
	}

	path.line {
		fill: none;
		stroke-width: 2.5;
	}

	text {
		font-family: var(--font-mono);
	}

	text.ytick,
	text.xtick {
		font-size: 11px;
		fill: var(--color-gray-700);
	}

	text.series-lbl {
		font-size: 12px;
		font-weight: 700;
	}
</style>
