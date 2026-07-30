<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { scaleLinear, interpolateHcl, shuffle } from "d3";
	import Grid from "$components/Grid.svelte";
	import variables from "$data/variables.json";

	// Decorative "traveling salesman" brand piece: draws `nodes` on a `size`
	// grid and, on a timer, connects them in a random order — a new random
	// tour every cycle, forever. Not an actual TSP solver (that's the point:
	// it's meant to look like a machine trying routes), so the "path length"
	// below the grid will jump around between rounds rather than trend
	// downward. nodes: [{ x, y }], in grid-cell coordinates.
	let {
		size = 5,
		nodes = [
			{ x: 0, y: 0 },
			{ x: 3, y: 1 },
			{ x: 4, y: 4 },
			{ x: 1, y: 3 },
			{ x: 4, y: 0 }
		],
		// ms per grid-cell step as the route draws in, cell by cell, like
		// XrayLayer's reveal
		stepTime = 100,
		// ms the finished route holds on screen before the next reshuffle —
		// total cycle time otherwise depends on how many cells that tour's
		// route happens to cross, which varies shuffle to shuffle
		pause = 2000,
		closed = false,
		autoPlay = true,
		colorFrom = variables.category["orange-light"],
		colorTo = variables.category["orange-dark"],
		showOrder = true
	} = $props();

	// same light-to-dark ramp as XrayLayer, walked across the route's cells
	let colorScale = $derived(
		scaleLinear().interpolate(interpolateHcl).range([colorFrom, colorTo])
	);

	const POOL_SIZE = 200;

	// Manhattan tour length for a candidate order, without going through the
	// cell-by-cell route — used to de-dupe the pool by distance.
	function manhattanLength(orderIndices) {
		const pts = orderIndices.map((i) => nodes[i]);
		const loop = closed ? [...pts, pts[0]] : pts;
		let total = 0;
		for (let i = 0; i < loop.length - 1; i++) {
			total +=
				Math.abs(loop[i + 1].x - loop[i].x) +
				Math.abs(loop[i + 1].y - loop[i].y);
		}
		return total;
	}

	// Sample POOL_SIZE random orderings, keep one per unique path length, then
	// shuffle the rotation order. Playback then cycles through this fixed,
	// pre-varied set of distances instead of drawing a fresh random order
	// every cycle, which can repeat a length back-to-back or clump.
	function buildPool() {
		if (nodes.length < 2) return [];
		const base = nodes.map((_, i) => i);
		const byLength = new Map();
		for (let n = 0; n < POOL_SIZE; n++) {
			const candidate = shuffle(base.slice());
			const len = manhattanLength(candidate);
			if (!byLength.has(len)) byLength.set(len, candidate);
		}
		return shuffle([...byLength.values()]);
	}

	let pool = $state([]);
	let poolIndex = $state(0);
	let order = $derived(pool[poolIndex] ?? []);

	function advance() {
		if (!pool.length) return;
		poolIndex = (poolIndex + 1) % pool.length;
		// full lap done — reshuffle the rotation order for the next one
		if (poolIndex === 0) pool = shuffle(pool.slice());
	}

	$effect(() => {
		nodes;
		closed;
		pool = buildPool();
		poolIndex = 0;
	});

	// each cycle's route can cross a different number of cells, so the hold
	// time is scheduled after the fact rather than on a fixed interval
	onMount(() => {
		if (!autoPlay) return;
		let timeoutId;
		const loop = () => {
			timeoutId = setTimeout(
				() => {
					advance();
					loop();
				},
				flatPath.length * stepTime + pause
			);
		};
		loop();
		return () => clearTimeout(timeoutId);
	});

	let tour = $derived(order.map((i) => nodes[i]).filter(Boolean));

	// mower-style routing: one elbow per edge, alternating which axis moves
	// first so the path doesn't read as a repetitive comb pattern. Returns the
	// unit-length cell steps from (exclusive) `a` through the corner to
	// (inclusive) `b`, so the route can be revealed one grid square at a time.
	function edgeSteps(a, b, horizontalFirst) {
		const corner = horizontalFirst ? { x: b.x, y: a.y } : { x: a.x, y: b.y };
		const points = [];
		let { x, y } = a;
		const walkTo = (target) => {
			while (x !== target.x || y !== target.y) {
				if (x < target.x) x++;
				else if (x > target.x) x--;
				else if (y < target.y) y++;
				else if (y > target.y) y--;
				points.push({ x, y });
			}
		};
		walkTo(corner);
		walkTo(b);
		return points;
	}

	// every cell the route crosses, start to finish, in order
	let flatPath = $derived.by(() => {
		if (tour.length < 2) return [];
		const pts = closed ? [...tour, tour[0]] : tour;
		const path = [pts[0]];
		for (let i = 0; i < pts.length - 1; i++) {
			path.push(...edgeSteps(pts[i], pts[i + 1], i % 2 === 0));
		}
		return path;
	});

	// grid-unit (Manhattan) distance == the number of cell-to-cell steps taken
	let pathLength = $derived(Math.max(0, flatPath.length - 1));
</script>

<div class="c">
	<Grid {size} variant="wireframe" started={true}>
		<svg class="tsp" viewBox="0 0 {size} {size}">
			{#if flatPath.length > 1}
				{#key order.join(",")}
					<g>
						{#each flatPath.slice(0, -1) as cell, i}
							{@const next = flatPath[i + 1]}
							<line
								in:fade|global={{
									delay: (i + 1) * stepTime,
									duration: 0
								}}
								out:fade|global={{ duration: 150 }}
								x1={cell.x + 0.5}
								y1={cell.y + 0.5}
								x2={next.x + 0.5}
								y2={next.y + 0.5}
								stroke={colorScale(i / (flatPath.length - 2 || 1))}
							/>
						{/each}
					</g>
				{/key}
			{/if}

			<!-- nodes stay on screen the whole time; only their color/order
				label updates as the route reshuffles -->
			{#each nodes as node, origIndex}
				{@const i = order.indexOf(origIndex)}
				<circle
					cx={node.x + 0.5}
					cy={node.y + 0.5}
					r="0.2"
					fill={colorScale(i / (nodes.length - 1 || 1))}
				/>
				{#if showOrder}
					<text
						x={node.x + 0.5}
						y={node.y + 0.5}
						text-anchor="middle"
						dominant-baseline="central">{i + 1}</text
					>
				{/if}
			{/each}
		</svg>

		<div class="tsp-legend">Path length: {pathLength}</div>
	</Grid>
</div>

<style>
	.c {
		max-width: calc(var(--media-max-width) * 0.5);
		margin: 2rem auto 3rem auto;
	}

	svg.tsp {
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	line {
		stroke-width: 0.25;
		stroke-linecap: round;
	}

	text {
		font-family: var(--font-form);
		font-size: 0.2px;
		font-weight: 700;
		fill: var(--color-bg);
	}

	circle {
		transition: fill 300ms ease;
	}

	.tsp-legend {
		position: absolute;
		bottom: -0.5rem;
		left: 0;
		width: 100%;
		text-align: center;
		z-index: var(--z-top);
		transform: translateY(100%);
		font-family: var(--font-form);
		font-size: var(--12px);
		text-transform: uppercase;
	}
</style>
