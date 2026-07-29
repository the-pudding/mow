<script>
	import { scaleLinear, extent, line as d3Line, format as d3Format } from "d3";
	import {
		regressionLinear,
		regressionQuad,
		regressionPoly,
		regressionExp,
		regressionLog,
		regressionPow
	} from "d3-regression";
	import variables from "$data/variables.json";

	// Generic canvas scatterplot. Fills its container; height follows from
	// `ratio`. Dots draw on a canvas (fast for thousands of points) while the
	// axes stay in SVG. x/y are accessor + label:
	//   x={{ value: "time", label: "seconds" }}
	// `value` may be a key string or a (d) => number function.
	// regression: draw a line/curve of best fit through `data` using the same
	// x/y accessors. regressionType picks the d3-regression fit ("linear",
	// "quad", "poly", "exp", "log", "pow"). x.low/x.high: optional floating
	// captions at the far left/right of the x-axis (e.g. "Faster"/"Slower"),
	// placed near the top so they don't collide with the numeric tick row.
	let {
		data = [],
		x = { value: "x", label: "" },
		y = { value: "y", label: "" },
		ratio = 0.7,
		color = "var(--color-orange-light)",
		radius = 2,
		// per-dot alpha = count * alpha, capped at 1, so busy cells read darker
		count = "count",
		alpha = 1,
		xTickCount = 6,
		yTickCount = 5,
		regression = false,
		regressionType = "linear",
		// tick label formatting: a d3.format specifier string (e.g. ".0%") or a
		// (value) => string function, applied to both axes' tick labels.
		format = null,
		// free-floating annotations, positioned in data space (same units as
		// x.value/y.value): [{ label, x, y, fill }]
		customLabels = []
	} = $props();

	let formatTick = $derived(
		typeof format === "function" ? format : format ? d3Format(format) : (t) => t
	);

	const REGRESSIONS = {
		linear: regressionLinear,
		quad: regressionQuad,
		poly: regressionPoly,
		exp: regressionExp,
		log: regressionLog,
		pow: regressionPow
	};

	const tickSize = 12;

	let width = $state(0);
	let canvas = $state();

	const accessor = (v) => (typeof v === "function" ? v : (d) => +d[v]);
	let getX = $derived(accessor(x.value));
	let getY = $derived(accessor(y.value));
	// missing/NaN count falls back to a weight of 1
	let getCount = $derived((d) => accessor(count)(d) || 1);

	let margin = $derived({
		top: radius * 2,
		right: radius * 2,
		bottom: 48,
		left: tickSize * 4 + radius * 2
	});

	let height = $derived(Math.round(width * ratio));
	let innerW = $derived(Math.max(0, width - margin.left - margin.right));
	let innerH = $derived(Math.max(0, height - margin.top - margin.bottom));

	let xScale = $derived(
		scaleLinear().domain(extent(data, getX)).nice().range([0, innerW])
	);
	let yScale = $derived(
		scaleLinear().domain(extent(data, getY)).nice().range([innerH, 0])
	);

	let xTicks = $derived(data.length ? xScale.ticks(xTickCount) : []);
	let yTicks = $derived(data.length ? yScale.ticks(yTickCount) : []);

	// fit points (already sorted ascending by x) rendered as a single SVG path,
	// separate from the canvas dots.
	let fitPoints = $derived.by(() => {
		if (!regression || data.length < 2) return [];
		const regressionFn = REGRESSIONS[regressionType];
		if (!regressionFn) return [];
		return regressionFn().x(getX).y(getY)(data);
	});

	// d3-regression returns each fitted point as [x, y], not {x, y}
	let fitLine = $derived(
		d3Line()
			.x((d) => xScale(d[0]))
			.y((d) => yScale(d[1]))(fitPoints)
	);

	// dots carrying a `label` field get an SVG text label next to them
	let labeledPoints = $derived(data.filter((d) => d.label));

	let fitLabel = $derived(
		regression && fitPoints.length
			? `Trend line (R² = ${d3Format(".1%")(fitPoints.rSquared)})`
			: ""
	);

	// label sits just past the line's right-hand endpoint, rotated to match the
	// line's on-screen angle (pixel space, since x/y scales share a unit).
	let fitLabelPos = $derived.by(() => {
		if (fitPoints.length < 2) return null;
		const [x0, y0] = [xScale(fitPoints[0][0]), yScale(fitPoints[0][1])];
		const [x1, y1] = [xScale(fitPoints[1][0]), yScale(fitPoints[1][1])];
		const angle = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
		return { x: x1, y: y1, angle };
	});

	// d3-regression attaches a/b/rSquared to the fitPoints array itself (not
	// per-point). log the fit so it can be sanity-checked against R/stats
	// software: a = slope, b = intercept, rSquared, and rho = the Pearson
	// correlation coefficient (sign(a) * sqrt(rSquared)) — for a single
	// predictor these are the same fit, just reported differently.
	$effect(() => {
		if (!regression || !fitPoints.length) return;
		const { a, b, rSquared } = fitPoints;
		// console.log(`[Scatter regression: ${regressionType}]`, {
		// 	n: data.length,
		// 	slope: a,
		// 	intercept: b,
		// 	rSquared,
		// 	rho: Math.sign(a) * Math.sqrt(rSquared),
		// 	points: fitPoints
		// });
	});

	// dots at the domain's min/max extend `radius` px past the plot's inner
	// bounds; pad the canvas bitmap itself (not just the layout margin) so
	// that overflow isn't clipped by the canvas's own pixel bounds.
	let canvasPad = $derived(radius);
	let canvasW = $derived(innerW + canvasPad * 2);
	let canvasH = $derived(innerH + canvasPad * 2);

	// redraw whenever the canvas, size, data, or scales change
	$effect(() => {
		if (!canvas || !innerW || !innerH || !data.length) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = canvasW * dpr;
		canvas.height = canvasH * dpr;

		const ctx = canvas.getContext("2d");
		ctx.setTransform(dpr, 0, 0, dpr, canvasPad * dpr, canvasPad * dpr);
		ctx.clearRect(-canvasPad, -canvasPad, canvasW, canvasH);
		// canvas can't parse a raw var(); the `color` property computes to rgb()
		const defaultFill = variables.color["gray-500"];

		for (const d of data) {
			const cx = xScale(getX(d));
			const cy = yScale(getY(d));
			ctx.globalAlpha = Math.min(1, getCount(d) * alpha);
			ctx.fillStyle = d.fill || defaultFill;
			ctx.beginPath();
			if (d.shape === "square") {
				ctx.rect(cx - radius, cy - radius, radius * 2, radius * 2);
			} else {
				ctx.arc(cx, cy, radius, 0, Math.PI * 2);
			}
			ctx.fill();
		}
	});
</script>

<figure class="chart" bind:clientWidth={width} style="--dot: {color};">
	{#if width > 0 && data.length}
		<div class="plot" style="height: {height}px;">
			<!-- grid/ticks/axis: painted behind the canvas -->
			<svg viewBox="0 0 {width} {height}" role="img" aria-label="Scatterplot">
				<g transform={`translate(${margin.left},${margin.top})`}>
					<!-- y gridlines + labels -->
					{#each yTicks as t}
						<line
							class="grid"
							x1={0}
							x2={innerW}
							y1={yScale(t)}
							y2={yScale(t)}
						/>
						<text
							class="tick"
							x={-8}
							y={yScale(t)}
							text-anchor="end"
							dominant-baseline="middle">{formatTick(t)}</text
						>
					{/each}

					<!-- x ticks -->
					{#each xTicks as t}
						<text
							class="tick"
							x={xScale(t)}
							y={innerH + 18}
							text-anchor="middle">{formatTick(t)}</text
						>
					{/each}

					<line class="axis" x1={0} x2={innerW} y1={innerH} y2={innerH} />

					{#if x.low}
						<text class="tick axis-end-label" x={0} y={-4} text-anchor="start"
							>{x.low}</text
						>
					{/if}
					{#if x.high}
						<text
							class="tick axis-end-label"
							x={innerW}
							y={-4}
							text-anchor="end">{x.high}</text
						>
					{/if}

					{#if x.label}
						<text
							class="tick label"
							x={innerW / 2}
							y={innerH + margin.bottom - 8}
							text-anchor="middle">{x.label}</text
						>
					{/if}
					{#if y.label}
						<text
							class="tick label"
							transform={`translate(${-margin.left + tickSize},${innerH / 2}) rotate(-90)`}
							text-anchor="middle">{y.label}</text
						>
					{/if}
				</g>
			</svg>

			<canvas
				bind:this={canvas}
				style="left: {margin.left - canvasPad}px; top: {margin.top -
					canvasPad}px; width: {canvasW}px; height: {canvasH}px;"
			></canvas>

			<!-- dot labels/annotations/regression: painted above the canvas -->
			<svg
				viewBox="0 0 {width} {height}"
				role="img"
				aria-label="Scatterplot annotations"
			>
				<g transform={`translate(${margin.left},${margin.top})`}>
					<!-- per-dot labels -->
					{#each labeledPoints as d}
						<text
							class="tick dot-label"
							x={xScale(getX(d))}
							y={yScale(getY(d))}
							dy={-radius - 4}
							text-anchor="middle">{d.label}</text
						>
					{/each}

					<!-- free-floating annotations -->
					{#each customLabels as d}
						<text
							class="tick dot-label custom-label"
							x={xScale(d.x)}
							y={yScale(d.y)}
							text-anchor="middle"
							style={d.fill ? `fill: ${d.fill};` : undefined}>{d.label}</text
						>
					{/each}

					{#if regression && fitLine && fitLabelPos}
						<path class="regression" d={fitLine} />
						<text
							class="tick regression-label"
							x={fitLabelPos.x}
							y={fitLabelPos.y}
							dy={-8}
							text-anchor="end"
							transform={`rotate(${fitLabelPos.angle}, ${fitLabelPos.x}, ${fitLabelPos.y})`}
							>{fitLabel}</text
						>
					{/if}
				</g>
			</svg>
		</div>
	{/if}
</figure>

<style>
	.chart {
		margin: 0.5rem 0;
		width: 100%;
	}

	.plot {
		position: relative;
		width: 100%;
	}

	canvas {
		position: absolute;
		color: var(--dot);
	}

	svg {
		position: absolute;
		top: 0;
		left: 0;
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
		pointer-events: none;
	}

	line.axis {
		stroke: var(--color-gray-700);
		stroke-width: 1;
	}

	path.regression {
		fill: none;
		stroke: var(--color-fg);
		stroke-width: 1.5;
	}

	line.grid {
		stroke: var(--color-gray-700);
		stroke-width: 1;
	}

	text {
		font-family: var(--font-form);
		fill: var(--color-fg);
	}

	text.tick {
		font-size: var(--12px);
	}

	text.axis-end-label {
		fill: var(--color-gray-300);
		text-transform: uppercase;
	}

	text.regression-label {
		font-weight: 700;
		text-transform: uppercase;
		paint-order: stroke fill;
		stroke: var(--color-bg);
		stroke-width: 4px;
		stroke-linejoin: round;
	}

	text.label {
		text-transform: uppercase;
	}

	text.dot-label {
		paint-order: stroke fill;
		stroke: var(--color-bg);
		stroke-width: 3px;
		stroke-linejoin: round;
	}

	text.custom-label {
		font-weight: 700;
		text-transform: uppercase;
	}
</style>
