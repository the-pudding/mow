<script>
	import { scaleBand, scaleLinear, min, max, format } from "d3";
	import loadCsv from "$utils/loadCsv.js";

	// Efficiency (optimal / actual) per level: a faint p10–p90 band with the
	// median line drawn on top, one column per level. Fills its container;
	// height follows from `ratio`. Reads the level-optimality csv itself so it
	// can drop straight into the story.
	let {
		src = "assets/data/level-optimality-all.csv",
		metric = "efficiency",
		ratio = 0.6,
		color = "var(--color-green-medium, #4c9f4c)",
		yTickCount = 5
	} = $props();

	const tickSize = 12;

	let width = $state(0);
	let raw = $state([]);

	$effect(() => {
		let alive = true;
		loadCsv(src).then((rows) => {
			if (alive) raw = rows;
		});
		return () => (alive = false);
	});

	let data = $derived(
		raw.map((d) => ({
			level: d.level,
			p10: +d[`${metric}_p10`],
			median: +d[`${metric}_median`],
			p90: +d[`${metric}_p90`]
		}))
	);

	let margin = $derived({
		top: 12,
		right: 12,
		bottom: 28,
		left: tickSize * 2 + 12
	});

	let height = $derived(Math.round(width * ratio));
	let innerW = $derived(width - margin.left - margin.right);
	let innerH = $derived(height - margin.top - margin.bottom);

	let x = $derived(
		scaleBand()
			.domain(data.map((d) => d.level))
			.range([0, innerW])
			.padding(0.35)
	);

	let y = $derived(scaleLinear().nice().range([innerH, 0]));

	let yTicks = $derived(data.length ? y.ticks(yTickCount) : []);
</script>

<figure class="chart" bind:clientWidth={width}>
	{#if width > 0 && data.length}
		<svg
			viewBox="0 0 {width} {height}"
			role="img"
			aria-label="Efficiency by level"
		>
			<g transform={`translate(${margin.left},${margin.top})`}>
				<!-- y gridlines + labels -->
				{#each yTicks as t}
					<line class="grid" x1={0} x2={innerW} y1={y(t)} y2={y(t)} />
					<text
						class="tick"
						x={-8}
						y={y(t)}
						text-anchor="end"
						dominant-baseline="middle">{format(".0%")(t)}</text
					>
				{/each}

				{#each data as d, i (d.level)}
					{@const cx = x(d.level)}
					{@const level = i === 0 ? d.level : `level ${i}`}
					<!-- faint p10–p90 band -->
					<rect
						class="band"
						fill={color}
						x={cx}
						y={y(d.p90)}
						width={x.bandwidth()}
						height={Math.max(0, y(d.p10) - y(d.p90))}
					/>
					<!-- median line -->
					<line
						class="median"
						stroke={color}
						x1={cx}
						x2={cx + x.bandwidth()}
						y1={y(d.median)}
						y2={y(d.median)}
					/>
					<!-- level label -->
					<text
						class="tick"
						x={cx + x.bandwidth() / 2}
						y={innerH + 18}
						text-anchor="middle">{level}</text
					>
				{/each}

				<line class="axis" x1={0} x2={innerW} y1={innerH} y2={innerH} />
			</g>
		</svg>
	{/if}
</figure>

<style>
	.chart {
		margin: 0.5rem 0;
		width: 100%;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	rect.band {
		opacity: 0.2;
	}

	line.median {
		stroke-width: 4;
	}

	line.axis {
		stroke: var(--color-gray-700);
		stroke-width: 1;
	}

	line.grid {
		stroke: var(--color-gray-700);
		stroke-width: 1;
	}

	text {
		font-family: var(--font-mono);
		fill: var(--color-fg);
	}

	text.tick {
		font-size: var(--12px);
		text-transform: uppercase;
	}
</style>
