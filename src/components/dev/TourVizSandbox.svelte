<script>
	// Dev-only preview harness for the new Tour visualizations. Mounts each new
	// component with hand-written sample data so they can be eyeballed via
	// `npm run dev` without touching the Tour scrolly. Not part of the story —
	// temporarily render this from Index.svelte (or a throwaway route) to review,
	// then remove once the real wiring lands.
	import Grid from "$components/Grid.svelte";
	import PulseLayer from "$components/grid/PulseLayer.svelte";
	import ForkLayer from "$components/grid/ForkLayer.svelte";
	import SectionLayer from "$components/grid/SectionLayer.svelte";
	import FirstMovePauseHistogram from "$components/charts/FirstMovePauseHistogram.svelte";
	import OptimalitySlopegraph from "$components/charts/OptimalitySlopegraph.svelte";
	import { range } from "d3";

	const size = 8;

	// --- PulseLayer sample: the two options at the 5th square ---
	const pulseCells = [
		{ x: 5, y: 0 },
		{ x: 4, y: 1 }
	];

	// --- ForkLayer sample: down (chosen, 68%) vs right (32%) ---
	const forkOrigin = { x: 4, y: 0 };
	const forkBranches = [
		{ to: { x: 4, y: 1 }, count: 68 },
		{ to: { x: 5, y: 0 }, count: 32 }
	];

	// --- SectionLayer sample: left/right split with a one-way corridor ---
	const leftCells = range(size).flatMap((y) => range(3).map((x) => ({ x, y })));
	const rightCells = range(size).flatMap((y) =>
		range(4, size).map((x) => ({ x, y }))
	);
	const regions = [
		{ cells: leftCells, label: "left", fill: "rgba(247, 118, 34, 0.12)" },
		{ cells: rightCells, label: "right", fill: "rgba(46, 114, 81, 0.14)" }
	];
	const corridor = range(size).map((y) => ({ x: 3, y }));
	const arrow = { from: { x: 3, y: 0 }, to: { x: 3, y: size - 1 } };

	// --- Histogram sample: ~200 first-move pauses (seconds) ---
	let seed = 42;
	const rand = () => {
		seed = (seed * 1103515245 + 12345) & 0x7fffffff;
		return seed / 0x7fffffff;
	};
	const pauseValues = range(200).map(() => {
		// skewed toward ~2-4s, clamp at 0.3
		const v = 1 + (rand() + rand() + rand()) * 1.6;
		return Math.round(v * 10) / 10;
	});

	// --- Slopegraph sample: optimality across rounds ---
	const slopeSeries = [
		{
			label: "all players",
			points: [
				{ round: "R1", value: 91 },
				{ round: "R2", value: 90 },
				{ round: "R3", value: 89 },
				{ round: "R4", value: 90 },
				{ round: "R5", value: 88 },
				{ round: "R6", value: 90 }
			]
		},
		{
			label: "popular avg",
			points: [
				{ round: "R1", value: 84 },
				{ round: "R2", value: 82 },
				{ round: "R3", value: 80 },
				{ round: "R4", value: 81 },
				{ round: "R5", value: 78 },
				{ round: "R6", value: 79 }
			]
		}
	];
</script>

<div class="sandbox">
	<h1>Tour viz sandbox</h1>

	<section>
		<h2>PulseLayer — blinking choice cells (step <code>fifth</code>)</h2>
		<div class="grid-wrap">
			<Grid {size} started={true} variant="wireframe">
				<PulseLayer cells={pulseCells} />
			</Grid>
		</div>
	</section>

	<section>
		<h2>ForkLayer — weighted two-branch split (step <code>diverge</code>)</h2>
		<div class="grid-wrap">
			<Grid {size} started={true} variant="wireframe">
				<ForkLayer origin={forkOrigin} branches={forkBranches} chosen={0} />
			</Grid>
		</div>
	</section>

	<section>
		<h2>
			SectionLayer — left/right divide + corridor (step <code>sections</code>)
		</h2>
		<div class="grid-wrap">
			<Grid {size} started={true} variant="wireframe">
				<SectionLayer {regions} {corridor} {arrow} />
			</Grid>
		</div>
	</section>

	<section>
		<h2>FirstMovePauseHistogram (step <code>rewind</code>)</h2>
		<FirstMovePauseHistogram values={pauseValues} highlight={2.9} median={3} />
	</section>

	<section>
		<h2>OptimalitySlopegraph (trailing note)</h2>
		<OptimalitySlopegraph series={slopeSeries} />
	</section>
</div>

<style>
	.sandbox {
		max-width: 640px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	section {
		margin-bottom: 3rem;
	}

	h2 {
		font-size: 1rem;
		margin-bottom: 0.75rem;
	}

	.grid-wrap {
		max-width: 360px;
	}
</style>
