<script>
	import { onMount, tick, untrack } from "svelte";
	import { fade } from "svelte/transition";
	import { interpolateHcl, format } from "d3";
	import Scrolly from "$components/helpers/Scrolly.svelte";
	import Grid from "$components/Grid.svelte";
	import Overlay from "$components/grid/Overlay.svelte";
	import GameLayer from "$components/grid/GameLayer.svelte";
	import XrayLayer from "$components/grid/XrayLayer.svelte";
	import HeatmapLayer from "$components/grid/HeatmapLayer.svelte";
	import SectionLayer from "$components/grid/SectionLayer.svelte";
	import PulseLayer from "$components/grid/PulseLayer.svelte";
	import Histogram from "$components/charts/Histogram.svelte";
	import loadCsv from "$utils/loadCsv.js";
	import levels from "$data/levels.json";
	import variables from "$data/variables.json";

	let { steps } = $props();

	// Heatmap bins: low → high, dark green to light yellow. Add/remove entries to
	// change how many steps the heatmap quantizes into.
	const HEAT_COLORS = [
		"#8c4c92",
		"#a0678a",
		"#b38181",
		"#c59a79",
		"#d8b471",
		"#ebcd69",
		"#fee761"
	];

	// Heatmap ramp: low = dark categorical green, high = light yellow.
	const interpolateGr = interpolateHcl(
		variables.category["green-dark"],
		variables.category["green-light"]
	);

	const interpolateGrYe = interpolateHcl(
		variables.category["green-dark"],
		variables.category["yellow-light"]
	);

	const interpolatePuYe = interpolateHcl(
		variables.category["purple-dark"],
		variables.category["yellow-light"]
	);

	const interpolatePu = interpolateHcl(
		variables.category["purple-dark"],
		variables.category["pink-light"]
	);

	const interpolateYe = interpolateHcl(
		variables.category["yellow-dark"],
		variables.category["yellow-light"]
	);

	// ---------------------------------------------------------------------------
	// CONFIG — the featured run. TODO(you): confirm which level the tour lawn is
	// and the player id whose path we replay.
	// ---------------------------------------------------------------------------
	const FADE_IN = 250;
	const FADE_OUT = 0;
	const BONES_ID = "yo7m5rr3nl";
	const SARAH_ID = "tt3aprpgrp";
	const TOUR_LEVEL = "round2"; // 8x8 lawn; matches Bones' path extent + obstacles

	let stepIndex = $state(0);

	let histogramData = $state([]);
	let histogramLabel = $state("seconds");

	let level = $derived(levels.find((l) => l.id === TOUR_LEVEL));

	// Bones' full path, loaded once ({ x, y, t }). Steps slice this for replay.
	let bonesPath = $state([]);

	// Sarah's full path ({ x, y, t }) — the near-optimal player featured in the
	// closing tour steps (full lawn mow, pause heatmap, and static xray trace).
	let sarahPath = $state([]);

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
	const PAUSE_INDEX = 19;

	// The story has already walked the mower through the fork by the pause step,
	// so it starts mowed through here and only animates the run-in to the dead end.
	const FORK_INDEX = 5;

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
			return { x, y, value: +value.toFixed(1) };
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
			const rows = await loadCsv(`assets/round2/${BONES_ID}.csv`);
			bonesPath = rows.map((r) => ({ x: +r.x, y: +r.y, t: +r.t }));
		} catch (err) {
			console.warn(`Could not load Bones path (${BONES_ID})`, err);
		}
		try {
			const rows = await loadCsv(`assets/round2/${SARAH_ID}.csv`);
			sarahPath = rows.map((r) => ({ x: +r.x, y: +r.y, t: +r.t }));
		} catch (err) {
			console.warn(`Could not load Sarah path (${SARAH_ID})`, err);
		}
		try {
			const rows = await loadCsv("assets/data/round2-last-move.csv");
			lastMoveRows = rows.map((r) => ({
				moves: +r.moves,
				x: +r.x,
				y: +r.y,
				players: +r.players
			}));
		} catch (err) {
			console.warn("Could not load round2-last-move.csv", err);
		}
		try {
			const rows = await loadCsv(
				"assets/data/round2-first-move-pause-counts.csv"
			);

			const temp = rows.map((r) => ({
				value: +r.seconds,
				count: +r.count
			}));
			const threshold = 30; // seconds
			const over = temp
				.filter((d) => d.value >= threshold)
				.reduce((acc, d) => acc + d.count, 0);
			histogramData = [
				...temp.filter((d) => d.value < threshold),
				{ value: threshold, count: over, label: `${threshold}+` }
			];
		} catch (err) {
			console.warn("Could not load round2-first-move-pause-counts.csv", err);
		}

		try {
			const rows = await loadCsv("assets/data/round2-fork-counts.csv");
			const total = rows.reduce((acc, r) => acc + +r.count, 0);
			forkBranches = rows.map((r) => ({
				x: +r.x,
				y: +r.y,
				label: format(".0%")(+r.count / total)
			}));
		} catch (err) {
			console.warn("Could not load round2-fork-counts.csv", err);
			forkBranches = [
				{ x: 4, y: 1 },
				{ x: 5, y: 0 }
			];
		}
	});

	// ---------------------------------------------------------------------------
	// SCENE STATE — which layers render, and their data. Each stepTrigger sets the
	// full scene; resetScene() clears everything first so scrubbing back and forth
	// is deterministic. Layer refs let us fire reveal animations after render.
	// ---------------------------------------------------------------------------
	let variant = $state("wireframe");

	let heatmapInterpolate = $state(interpolatePuYe);

	let showXray = $state(false);
	let xrayRealtime = $state(false);
	let xrayBacktracks = $state(false);
	let xrayAnimate = $state(true);
	let xrayLayer = $state();

	// Which player's trace the xray layer draws. Derived (not copied) so the layer
	// still updates when the chosen path finishes loading after the step fires.
	let xraySource = $state("bones");
	let xrayPath = $derived(xraySource === "sarah" ? sarahPath : bonesPath);

	let showGame = $state(false);
	let gameReplay = $state([]);
	let gameStartIndex = $state(0);
	let gameLayer = $state();

	let showPulse = $state(false);
	let pulseCells = $state([]);

	// Scene change held back until the game replay reaches its last square. A step
	// trigger sets it, GameLayer's onFinish fires it, resetScene() clears it.
	// Plain `let`, NOT $state: resetScene() reads these synchronously inside
	// applyStep's effect, so tracking them would make the effect depend on them —
	// finishing a replay would retrigger the step and loop the animation forever.
	// Nothing in the template reads them, so there is nothing to be reactive for.
	let afterReplay = null;
	let afterReplayTimeout = null;

	// beat between the mower landing and the deferred reveal firing
	const AFTER_REPLAY_DELAY = 500;

	let forkBranches = $state([]);

	let showHeatmap = $state(false);
	let heatmapData = $state([]);
	let heatmapTitle = $state("");

	let showSection = $state(false);
	let sectionRegions = $state([]);
	let sectionCorridor = $state([]);
	let sectionArrow = $state(null);

	let autoTimer = $state(true);

	// Tear down the previous step before the next one builds its scene. Halts any
	// in-flight replay and drops its deferred reveal first — the game layer
	// survives step changes that keep it on screen, so its timer would otherwise
	// keep ticking and land onFinish on the new scene.
	function resetScene() {
		// untracked: this runs synchronously inside applyStep's effect, and
		// `gameLayer` is a bind:this ref. Reading it tracked would make the effect
		// depend on the layer mounting — so a deferred reveal that hides the game
		// would retrigger the step and replay it forever.
		untrack(() => gameLayer)?.stop();
		clearTimeout(afterReplayTimeout);
		afterReplayTimeout = null;
		afterReplay = null;

		showXray = false;
		xraySource = "bones";
		xrayAnimate = true;
		showGame = false;
		showPulse = false;
		showHeatmap = false;
		showSection = false;
		gameReplay = [];
		gameStartIndex = 0;
		// heatmapInterpolate = interpolateGr;
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
			xraySource = "bones";
			xrayRealtime = false;
			xrayBacktracks = true;
			autoTimer = true;
		},

		// "back to lawn" — mower parked at the start; pause histogram is inline in
		// the step text, not on the grid.
		rewind() {
			variant = "grass";
			showGame = true;
			gameReplay = bonesPath.slice(0, 1);
			autoTimer = true;
		},

		// "play quick animation until fifth square, then overlay blinking options"
		fifth() {
			variant = "grass";
			showGame = true;
			gameReplay = bonesPath.slice(0, FORK_INDEX);
			autoTimer = 500;
			pulseCells = [
				{ x: 5, y: 0 },
				{ x: 4, y: 1 }
			];
			// hold the pulse until the mower actually reaches the fifth square
			afterReplay = () => {
				showPulse = true;
			};
		},

		// "introduce forking; fork viz of everyone" (weighted two-branch split)
		diverge() {
			autoTimer = true;
			variant = "wireframe";
			showPulse = true;
			showGame = true;
			variant = "grass";
			gameReplay = bonesPath.slice(0, FORK_INDEX);
			gameStartIndex = FORK_INDEX;
			pulseCells = [...forkBranches];
		},

		// "heatmap of pause duration (player's path up to this point), hide lawn" —
		// mow the run-up to the dead-end first, then swap the lawn for the heatmap
		// of how long they lingered on each square along the way.
		pause() {
			autoTimer = 250;
			variant = "grass";
			showGame = true;
			gameReplay = bonesPath.slice(0, PAUSE_INDEX);
			gameStartIndex = FORK_INDEX;
			afterReplay = () => {
				variant = "wireframe";
				showGame = false;
				showHeatmap = true;
				// heatmapInterpolate = interpolateGr;
				heatmapData = dwellHeatmap(bonesPath, PAUSE_INDEX - 1);
				heatmapTitle = "Seconds paused per square";
			};
		},

		// "show lawn, animate remainder of path" — grass mowed up to the dead-end,
		// then the mower carries on from there to the finish.
		remaining() {
			autoTimer = true;
			variant = "grass";
			showGame = true;
			gameReplay = bonesPath;
			gameStartIndex = PAUSE_INDEX - 1;
		},

		// "left/right divide graphic and highlight the corridor"
		sections() {
			autoTimer = true;
			variant = "wireframe";
			showSection = true;
			sectionRegions = [
				{
					cells: LEFT_CELLS,
					label: "left",
					labelAt: { x: 1, y: 6.5 },
					fill: variables.category["green-light"]
				},
				{
					cells: RIGHT_CELLS,
					label: "right",
					labelAt: { x: 5.5, y: 3.5 },
					fill: variables.category["orange-light"]
				}
			];
			sectionCorridor = [{ x: 2, y: 3 }];
			sectionArrow = { from: { x: 2, y: 3 }, to: { x: 1, y: 3 } };
		},

		// "heatmap of other finishing spots on the right side" (sub-optimal players)
		right() {
			autoTimer = true;
			variant = "wireframe";
			showHeatmap = true;
			// heatmapInterpolate = interpolateGr;
			heatmapData = finishRightData;
			heatmapTitle = "Count of where sub-optimal players finished";
		},

		// "heatmap of other finishing spots on the left side" (near-optimal players)
		left() {
			autoTimer = true;
			variant = "wireframe";
			showHeatmap = true;
			// heatmapInterpolate = interpolateGr;
			heatmapData = finishLeftData;
			heatmapTitle = "Count of where near-optimal players finished";
		},

		// Sarah is introduced — replay her full near-optimal run on the real lawn at
		// the auto (fixed-pace) timer, start to finish.
		"sarah-path"() {
			autoTimer = true;
			variant = "grass";
			showGame = true;
			gameReplay = sarahPath;
			gameStartIndex = 0;
			afterReplay = () => {
				gameLayer?.play();
			};
		},

		// "Sarah's pause heatmap" — swap the lawn for a dwell-time heatmap of her
		// full run, showing her longest hesitation landing a square before the fork.
		"sarah-pause"() {
			autoTimer = true;
			variant = "wireframe";
			showHeatmap = true;
			heatmapData = dwellHeatmap(sarahPath);
			heatmapTitle = "Seconds Sarah paused per square";
		},

		// Close on Sarah's trace — the whole xray path rendered at once, no reveal
		// animation (xrayAnimate = false).
		"sarah-snake"() {
			autoTimer = true;
			variant = "wireframe";
			showXray = true;
			xraySource = "sarah";
			xrayRealtime = false;
			xrayBacktracks = true;
			xrayAnimate = false;
		}
	};

	// Fired when a game replay reaches its final square (lawn need not be done),
	// running whatever reveal the active step deferred until the mower arrives.
	function handleGameFinish() {
		if (!afterReplay) return;
		afterReplayTimeout = setTimeout(() => {
			afterReplayTimeout = null;
			afterReplay?.();
		}, AFTER_REPLAY_DELAY);
	}

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
		if (showGame && gameReplay.length - gameStartIndex > 1) gameLayer?.play();
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
							in:fade={{ delay: FADE_IN, duration: FADE_IN }}
							out:fade={{ duration: FADE_OUT }}
						>
							<GameLayer
								bind:this={gameLayer}
								replay={gameReplay}
								startIndex={gameStartIndex}
								onFinish={handleGameFinish}
								auto={autoTimer}
							/>
						</div>
					{/if}
					{#if showXray}
						<div
							class="layer"
							in:fade={{ delay: FADE_IN, duration: FADE_IN }}
							out:fade={{ duration: FADE_OUT }}
						>
							<XrayLayer
								bind:this={xrayLayer}
								path={xrayPath}
								realtime={xrayRealtime}
								showBacktracks={xrayBacktracks}
								shouldAnimate={xrayAnimate}
							/>
						</div>
					{/if}
					{#if showHeatmap}
						<div
							class="layer"
							in:fade={{ delay: FADE_IN, duration: FADE_IN }}
							out:fade={{ duration: FADE_OUT }}
						>
							<HeatmapLayer
								data={heatmapData}
								interpolate={heatmapInterpolate}
								title={heatmapTitle}
							/>
						</div>
						<Overlay />
					{/if}
					{#if showSection}
						<div
							class="layer"
							in:fade={{ delay: FADE_IN, duration: FADE_IN }}
							out:fade={{ duration: FADE_OUT }}
						>
							<SectionLayer
								regions={sectionRegions}
								corridor={sectionCorridor}
								arrow={sectionArrow}
							/>
						</div>
					{/if}
					{#if showPulse}
						<div
							class="layer"
							in:fade={{ delay: FADE_IN, duration: FADE_IN }}
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
		{#each steps as { text, step, chart }, i}
			{@const active = stepIndex === i}
			<div class="step" class:active data-step={i}>
				<p>{@html text}</p>
				{#if chart && histogramData.length}
					<Histogram
						data={histogramData}
						label={histogramLabel}
						yLabel="Number of Players"
						highlight={3}
						highlightLabel={"Median"}
						highlightLabelAnchor="start"
						higlightBaseline="bottom"
					/>
				{/if}
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
		padding-bottom: 25svh;
		padding-top: 25svh;
		opacity: 0.5;
		transition: opacity 0.25s ease-in-out;
	}

	.step:first-of-type {
		padding-top: 0;
		margin-top: -100svh;
	}

	.step.active {
		opacity: 1;
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
			padding-right: 1rem;
		}

		.vis {
			margin-left: var(--text-width);
			width: calc(100% - var(--text-width));
		}
	}
</style>
