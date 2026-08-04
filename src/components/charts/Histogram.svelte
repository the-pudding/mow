<script>
	import { scaleLinear, extent, max, min, ascending, pairs, format } from "d3";

	// Inline mini-histogram sized to sit inside the story text column, not the
	// sticky grid vis. Fills its container; height follows from `ratio`. One bar
	// can be called out, and the population median gets a vertical marker.
	//
	// data:      {value, count, label?}[] — already binned upstream (e.g. the
	//            task csvs); `label` overrides that value's x axis tick text
	// label:     x axis label, e.g. "seconds" or "moves" (also the aria label)
	// yLabel:    y axis label, sits above the chart, e.g. "players"
	// unit:      appended to tick + marker labels, e.g. "s"
	// highlight: a value in `data` — that bar gets `highlightColor` and, if
	//            `highlightLabel` is set, a label sitting on top of it
	let {
		data = [],
		label = "",
		yLabel = "",
		unit = "",
		ratio = 1 / 3,
		color = "currentColor",
		highlight = null,
		highlightLabel = null,
		highlightColor = "var(--color-yellow)",
		highlightLabelAnchor = "middle",
		highlightBaseline = "top",
		median = null,
		medianLabel = null,
		tickCount = 5,
		yTickCount = 3,
		showAxis = true,
		showTicks = true,
		showY = true
	} = $props();

	const fmt = format(",");
	const tickSize = 12;

	let width = $state(0);

	// bar width comes from the tightest gap between values, so a missing value
	// (nobody finished in 53 moves) leaves a gap instead of a double-wide bar
	let bins = $derived.by(() => {
		if (!data.length) return [];
		const values = data.map((d) => d.value).sort(ascending);
		const step = values.length > 1 ? min(pairs(values, (a, b) => b - a)) : 1;
		return data.map((d) => ({
			x0: d.value - step / 2,
			x1: d.value + step / 2,
			label: d.label,
			count: d.count
		}));
	});

	let maxCount = $derived(max(bins, (b) => b.count) ?? 1);

	// left gutter has to clear the widest y tick label, which we size off the
	// tallest bar rather than the ticks themselves (the ticks need the scale,
	// and the scale needs the margin)
	let margin = $derived({
		top: yLabel ? tickSize + 8 : 16,
		right: 12,
		bottom: (showTicks ? 20 : 4) + (label ? tickSize + 6 : 0),
		left: showY ? fmt(maxCount).length * (tickSize * 0.6) + 8 : 12
	});

	let height = $derived(Math.round(width * ratio));
	let innerW = $derived(width - margin.left - margin.right);
	let innerH = $derived(height - margin.top - margin.bottom);

	// matched by range rather than equality so a float value (2.9) still lands
	// on its bar (the 3s bin)
	let binAt = $derived(
		(value) => bins.find((b) => value >= b.x0 && value < b.x1) ?? null
	);

	let highlighted = $derived(highlight == null ? null : binAt(highlight));

	let x = $derived(
		scaleLinear()
			.domain(extent(bins.flatMap((b) => [b.x0, b.x1])))
			.range([0, innerW])
	);

	let y = $derived(
		scaleLinear().domain([0, maxCount]).nice().range([innerH, 0])
	);

	// a datum can override its own tick text with `label` (e.g. 49 -> "optimal")
	let ticks = $derived(
		x.ticks(tickCount).map((value) => ({
			value,
			text: binAt(value)?.label ?? `${value}${unit}`
		}))
	);
	let yTicks = $derived(showY ? y.ticks(yTickCount) : []);
</script>

<figure class="chart" bind:clientWidth={width}>
	{#if width > 0 && bins.length}
		<svg
			viewBox="0 0 {width} {height}"
			role="img"
			aria-label={label ? `Histogram of ${label}` : "Histogram"}
		>
			<g transform={`translate(${margin.left},${margin.top})`}>
				<!-- y axis: gridlines behind the bars, labels in the left gutter -->
				{#each yTicks as t}
					{#if t > 0}
						<line class="grid" x1={0} x2={innerW} y1={y(t)} y2={y(t)} />
						<text
							class="tick"
							x={-6}
							y={y(t)}
							text-anchor="end"
							dominant-baseline="middle">{fmt(t)}</text
						>
					{/if}
				{/each}

				{#if yLabel}
					<text class="tick y-label" x={-margin.left + 2} y={y(maxCount) - 16}
						>{yLabel}</text
					>
				{/if}

				<!-- bars -->
				{#each bins as b (b.x0)}
					<rect
						class="bar"
						fill={b === highlighted ? highlightColor : color}
						x={x(b.x0) + 0.5}
						y={y(b.count)}
						width={Math.max(0, x(b.x1) - x(b.x0) - 1)}
						height={innerH - y(b.count)}
					/>
				{/each}

				<!-- median marker -->
				<!-- {#if median != null}
					<line
						class="median"
						x1={x(median)}
						x2={x(median)}
						y1={0}
						y2={innerH}
					/>
					<text class="lbl median-lbl" x={x(median)} y={-4} text-anchor="middle"
						>{medianLabel ?? `median ${median}${unit}`}</text
					>
				{/if} -->

				<!-- label sitting on top of the highlighted bar -->
				{#if highlighted && highlightLabel}
					<text
						class="lbl lbl-highlight"
						style="fill: {highlightColor}"
						x={x((highlighted.x0 + highlighted.x1) / 2) +
							(x(highlighted.x1) - x(highlighted.x0)) * 0.5 +
							4}
						y={y(highlighted.count) + (highlightBaseline === "bottom" ? -4 : 2)}
						alignment-baseline={highlightBaseline}
						text-anchor={highlightLabelAnchor}>{highlightLabel}</text
					>
				{/if}

				<!-- x axis -->
				{#if showAxis}
					<line class="axis" x1={0} x2={innerW} y1={innerH} y2={innerH} />
				{/if}
				{#if showTicks}
					{#each ticks as t (t.value)}
						<text
							class="tick"
							x={x(t.value)}
							y={innerH + 14}
							text-anchor="middle">{t.text}</text
						>
					{/each}
				{/if}
				{#if label}
					<text
						class="tick x-label"
						x={innerW / 2}
						y={innerH + margin.bottom - 4}
						text-anchor="middle">{label}</text
					>
				{/if}
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

	line.axis {
		stroke: var(--color-gray-700);
		stroke-width: 1;
	}

	line.grid {
		stroke: var(--color-gray-700);
		stroke-width: 1;
	}

	text {
		font-family: var(--font-form);
		fill: var(--color-fg);
		text-transform: uppercase;
	}

	text.tick {
		font-size: var(--12px);
	}

	text.lbl {
		font-size: 12px;
	}

	.x-label {
		text-transform: uppercase;
	}
</style>
