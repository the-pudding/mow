<script>
	import { onMount, tick } from "svelte";
	import { fade } from "svelte/transition";
	import { interpolateGreens, interpolateOrRd } from "d3";
	import { base } from "$app/paths";
	import Scrolly from "$components/helpers/Scrolly.svelte";
	import Grid from "$components/Grid.svelte";
	import GameLayer from "$components/grid/GameLayer.svelte";
	import XrayLayer from "$components/grid/XrayLayer.svelte";
	import HeatmapLayer from "$components/grid/HeatmapLayer.svelte";
	import SectionLayer from "$components/grid/SectionLayer.svelte";
	import ForkLayer from "$components/grid/ForkLayer.svelte";
	import PulseLayer from "$components/grid/PulseLayer.svelte";
	import loadCsv from "$utils/loadCsv.js";
	import levels from "$data/levels.json";

	let { steps } = $props();
	let stepIndex = $state(0);

	// ---------------------------------------------------------------------------
	// CONFIG — the featured run. TODO(you): confirm which level the tour lawn is
	// and the player id whose path we replay.
	// ---------------------------------------------------------------------------
	const FADE_IN = 250;
	const FADE_OUT = 50;
	const BONES_ID = "yo7m5rr3nl";
	const TOUR_LEVEL = "round2"; // 8x8 lawn; matches Bones' path extent + obstacles
	let level = $derived(levels.find((l) => l.id === TOUR_LEVEL));

	// Bones' full path, loaded once ({ x, y, t }). Steps slice this for replay.
	let bonesPath = $state([]);

	// Finishing spots: player count per (moves, last square), from web.js.
	let lastMoveRows = $state([]);

	// "three or more moves from optimal" splits sub-optimal from near/perfect.
	const SUBOPTIMAL_FROM = 3;
	let optimalMoves = $derived(
		lastMoveRows.length
			? Math.min(...lastMoveRows.map((r) => r.moves))
			: Infinity
	);

	// The dead-end pause (~2.4s at cell 3,7) — the "up to this point" cutoff for
	// the pause-duration heatmap. bonesPath[19] is where they hit the bottom.
	const PAUSE_THROUGH_INDEX = 19;

	// Left/right sections, transcribed from the tour figure onto the round2 grid.
	// Neutral cells (the top strip, the (2,3) neck, the (4,6) pocket) belong to
	// neither section.
	const LEFT_CELLS = [
		{ x: 0, y: 3 },
		{ x: 1, y: 3 },
		{ x: 0, y: 4 },
		{ x: 1, y: 4 },
		{ x: 0, y: 5 },
		{ x: 1, y: 5 },
		{ x: 0, y: 6 },
		{ x: 1, y: 6 },
		{ x: 2, y: 6 },
		{ x: 3, y: 6 },
		{ x: 0, y: 7 },
		{ x: 1, y: 7 },
		{ x: 2, y: 7 },
		{ x: 3, y: 7 },
		{ x: 4, y: 6 }
	];
	const RIGHT_CELLS = [
		{ x: 4, y: 1 },
		{ x: 5, y: 1 },
		{ x: 6, y: 1 },
		{ x: 2, y: 2 },
		{ x: 3, y: 2 },
		{ x: 4, y: 2 },
		{ x: 5, y: 2 },
		{ x: 6, y: 2 },
		{ x: 7, y: 2 },
		{ x: 3, y: 3 },
		{ x: 4, y: 3 },
		{ x: 5, y: 3 },
		{ x: 6, y: 3 },
		{ x: 7, y: 3 },
		{ x: 3, y: 4 },
		{ x: 4, y: 4 },
		{ x: 5, y: 4 },
		{ x: 6, y: 4 },
		{ x: 7, y: 4 },
		{ x: 5, y: 5 },
		{ x: 6, y: 5 },
		{ x: 7, y: 5 },
		{ x: 6, y: 6 },
		{ x: 7, y: 6 },
		{ x: 6, y: 7 },
		{ x: 7, y: 7 }
	];

	// Per-cell dwell time (seconds) from a path's timestamps: dwell at a cell is
	// how long before the player moved off it (t of next point − t of this one),
	// summed across revisits. `throughIndex` caps it to the story's current point.
	function dwellHeatmap(path, throughIndex = path.length - 2) {
		const totals = new Map();
		const end = Math.min(throughIndex, path.length - 2);
		for (let i = 0; i <= end; i++) {
			const key = `${path[i].x},${path[i].y}`;
			const dt = (path[i + 1].t - path[i].t) / 1000;
			totals.set(key, (totals.get(key) ?? 0) + dt);
		}
		return [...totals].map(([key, value]) => {
			const [x, y] = key.split(",").map(Number);
			return { x, y, value: +value.toFixed(2) };
		});
	}

	// Sum players per finishing cell across the rows matching `predicate`.
	function finishHeatmap(rows, predicate) {
		const totals = new Map();
		for (const r of rows) {
			if (!predicate(r)) continue;
			const key = `${r.x},${r.y}`;
			totals.set(key, (totals.get(key) ?? 0) + r.players);
		}
		return [...totals].map(([key, value]) => {
			const [x, y] = key.split(",").map(Number);
			return { x, y, value };
		});
	}

	// sub-optimal (3+ from optimal) "finished all over"; near/perfect ended left
	let finishRightData = $derived(
		finishHeatmap(
			lastMoveRows,
			(r) => r.moves - optimalMoves >= SUBOPTIMAL_FROM
		)
	);
	let finishLeftData = $derived(
		finishHeatmap(lastMoveRows, (r) => r.moves - optimalMoves < SUBOPTIMAL_FROM)
	);

	onMount(async () => {
		try {
			const rows = await loadCsv(`${base}/assets/users/${BONES_ID}.csv`);
			bonesPath = rows.map((r) => ({ x: +r.x, y: +r.y, t: +r.t }));
		} catch (err) {
			console.warn(`Could not load Bones path (${BONES_ID})`, err);
		}
		try {
			const rows = await loadCsv(`${base}/assets/data/round2-last-move.csv`);
			lastMoveRows = rows.map((r) => ({
				moves: +r.moves,
				x: +r.x,
				y: +r.y,
				players: +r.players
			}));
		} catch (err) {
			console.warn("Could not load round2-last-move.csv", err);
		}
	});

	// ---------------------------------------------------------------------------
	// SCENE STATE — which layers render, and their data. Each stepTrigger sets the
	// full scene; resetScene() clears everything first so scrubbing back and forth
	// is deterministic. Layer refs let us fire reveal animations after render.
	// ---------------------------------------------------------------------------
	let variant = $state("wireframe");

	let showXray = $state(false);
	let xrayRealtime = $state(false);
	let xrayBacktracks = $state(false);
	let xrayLayer = $state();

	let showGame = $state(false);
	let gameReplay = $state([]);
	let gameStartIndex = $state(0);
	let gameLayer = $state();

	let showPulse = $state(false);
	let pulseCells = $state([]);

	let showFork = $state(false);
	let forkOrigin = $state({ x: 0, y: 0 });
	let forkTrunk = $state([]);
	let forkBranches = $state([]);
	let forkChosen = $state(null);

	let showHeatmap = $state(false);
	let heatmapData = $state([]);
	let heatmapInterpolate = $state(interpolateGreens);

	let showSection = $state(false);
	let sectionRegions = $state([]);
	let sectionCorridor = $state([]);
	let sectionArrow = $state(null);

	function resetScene() {
		showXray = false;
		showGame = false;
		showPulse = false;
		showFork = false;
		showHeatmap = false;
		showSection = false;
		gameReplay = [];
		gameStartIndex = 0;
		heatmapInterpolate = interpolateGreens;
	}

	// ---------------------------------------------------------------------------
	// STEP TRIGGERS — one per named `step` in copy.json. Each sets `variant`,
	// flips on the layer(s) it needs, and supplies their data. Values marked TODO
	// are placeholders for you to fill with the real aggregates.
	// ---------------------------------------------------------------------------
	const stepTriggers = {
		// "Just the trace of the path (use xray, not realtime)"
		intro() {
			variant = "wireframe";
			showXray = true;
			xrayRealtime = false;
			xrayBacktracks = true;
		},

		// "back to lawn" — mower parked at the start; pause histogram is inline in
		// the step text, not on the grid.
		rewind() {
			variant = "grass";
			showGame = true;
			gameReplay = bonesPath.slice(0, 1);
		},

		// "play quick animation until fifth square, then overlay blinking options"
		fifth() {
			variant = "grass";
			showGame = true;
			gameReplay = bonesPath.slice(0, 5);
			showPulse = true;
			pulseCells = [
				{ x: 5, y: 0 },
				{ x: 4, y: 1 }
			];
		},

		// "introduce forking; fork viz of everyone" (weighted two-branch split)
		diverge() {
			variant = "wireframe";
			showFork = true;
			forkOrigin = { x: 4, y: 0 };
			forkTrunk = bonesPath.slice(0, 5); // shared opening (0,0)→(4,0)
			forkBranches = [
				{ to: { x: 4, y: 1 }, count: 0 },
				{ to: { x: 5, y: 0 }, count: 0 }
			];
			forkChosen = 0; // Bones went down
		},

		// "heatmap of pause duration (player's path up to this point), hide lawn"
		pause() {
			variant = "wireframe";
			showHeatmap = true;
			heatmapInterpolate = interpolateOrRd;
			heatmapData = dwellHeatmap(bonesPath, PAUSE_THROUGH_INDEX);
		},

		// "show lawn, animate remainder of path" — grass mowed up to the dead-end,
		// then the mower carries on from there to the finish.
		remaining() {
			variant = "grass";
			showGame = true;
			gameReplay = bonesPath;
			gameStartIndex = PAUSE_THROUGH_INDEX;
		},

		// "left/right divide graphic and highlight the corridor"
		sections() {
			variant = "wireframe";
			showSection = true;
			sectionRegions = [
				{
					cells: LEFT_CELLS,
					label: "left",
					labelAt: { x: 1, y: 6.5 },
					fill: "rgba(255, 0, 0, 0.33)"
				},
				{
					cells: RIGHT_CELLS,
					label: "right",
					labelAt: { x: 5.5, y: 3.5 },
					fill: "rgba(0, 255, 0, 0.33)"
				}
			];
			sectionCorridor = [{ x: 2, y: 3 }];
			sectionArrow = { from: { x: 2, y: 3 }, to: { x: 1, y: 3 } };
		},

		// "heatmap of other finishing spots on the right side" (sub-optimal players)
		right() {
			variant = "wireframe";
			showHeatmap = true;
			heatmapInterpolate = interpolateGreens;
			heatmapData = finishRightData;
		},

		// "heatmap of other finishing spots on the left side" (near-optimal players)
		left() {
			variant = "wireframe";
			showHeatmap = true;
			heatmapInterpolate = interpolateGreens;
			heatmapData = finishLeftData;
		}
	};

	// Apply the active step's scene, then (after the layers render) fire any
	// reveal/replay animations.
	async function applyStep(step) {
		resetScene();
		stepTriggers[step]?.();
		await tick();
		if (showXray) {
			xrayLayer?.reset();
			xrayLayer?.animate();
		}
		if (showGame && gameReplay.length - gameStartIndex > 1) {
			gameLayer?.stop();
			gameLayer?.play();
		}
	}

	$effect(() => {
		applyStep(steps[stepIndex]?.step);
	});
</script>

<div class="c tour">
	<div class="vis">
		{#if level}
			<div class="stage">
				<Grid
					size={level.size}
					obstacles={level.obstacles}
					started={true}
					{variant}
				>
					{#if showGame}
						<div
							class="layer"
							in:fade={{ duration: FADE_IN }}
							out:fade={{ duration: FADE_OUT }}
						>
							<GameLayer
								bind:this={gameLayer}
								replay={gameReplay}
								startIndex={gameStartIndex}
							/>
						</div>
					{/if}
					{#if showXray}
						<div
							class="layer"
							in:fade={{ duration: FADE_IN }}
							out:fade={{ duration: FADE_OUT }}
						>
							<XrayLayer
								bind:this={xrayLayer}
								path={bonesPath}
								realtime={xrayRealtime}
								showBacktracks={xrayBacktracks}
							/>
						</div>
					{/if}
					{#if showHeatmap}
						<div
							class="layer"
							in:fade={{ duration: FADE_IN }}
							out:fade={{ duration: FADE_OUT }}
						>
							<HeatmapLayer
								data={heatmapData}
								interpolate={heatmapInterpolate}
							/>
						</div>
					{/if}
					{#if showSection}
						<div
							class="layer"
							in:fade={{ duration: FADE_IN }}
							out:fade={{ duration: FADE_OUT }}
						>
							<SectionLayer
								regions={sectionRegions}
								corridor={sectionCorridor}
								arrow={sectionArrow}
							/>
						</div>
					{/if}
					{#if showFork}
						<div
							class="layer"
							in:fade={{ duration: FADE_IN }}
							out:fade={{ duration: FADE_OUT }}
						>
							<ForkLayer
								origin={forkOrigin}
								trunk={forkTrunk}
								branches={forkBranches}
								chosen={forkChosen}
							/>
						</div>
					{/if}
					{#if showPulse}
						<div
							class="layer"
							in:fade={{ duration: FADE_IN }}
							out:fade={{ duration: FADE_OUT }}
						>
							<PulseLayer cells={pulseCells} />
						</div>
					{/if}
				</Grid>
			</div>
		{/if}
	</div>

	<Scrolly bind:value={stepIndex}>
		{#each steps as { text, step, note }, i}
			{@const active = stepIndex === i}
			<div class="step" class:active data-step={i}>
				<p>{@html text}</p>
				<mark>{note}</mark>
			</div>
		{/each}
	</Scrolly>
</div>

<style>
	.c {
		position: relative;
		--text-width: 30rem;
		max-width: 1600px;
		margin: 0 auto;
	}

	.step {
		margin-bottom: 90svh;
	}

	.step:first-of-type {
		margin-top: -100svh;
	}

	.vis {
		position: sticky;
		top: 0;
		height: 100svh;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: -1;
	}

	.stage {
		width: 100%;
		max-width: min(var(--grid-max-width), 80svh);
		margin: 0 auto;
		padding: 1rem;
	}

	/* fade wrapper for each grid layer; fills the grid so the layer's own
	   absolute positioning resolves against it */
	.layer {
		position: absolute;
		inset: 0;
	}

	@media screen and (min-width: 640px) {
		.step {
			max-width: var(--text-width);
			margin-bottom: 50svh;
			padding-right: 1rem;
		}

		.vis {
			margin-left: var(--text-width);
			width: calc(100% - var(--text-width));
		}
	}

	.tour :global(strong) {
		color: var(--color-yellow);
	}
</style>
