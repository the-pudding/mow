<script>
	import { tick } from "svelte";
	import { interpolateHcl, format } from "d3";
	import Grid from "$components/Grid.svelte";
	import Game from "$components/Game.svelte";
	import HeatmapLayer from "$components/grid/HeatmapLayer.svelte";
	import XrayLayer from "$components/grid/XrayLayer.svelte";
	import Button from "$components/ui/Button.svelte";
	import Select from "$components/ui/Select.svelte";
	import ToggleGroup from "$components/ui/ToggleGroup.svelte";
	import loadCsv from "$utils/loadCsv.js";
	import levels from "$data/levels.json";
	import variables from "$data/variables.json";

	// Reader sandbox: pick any round, then either replay it yourself, look at how
	// everyone else played it, or see a perfect run. Each aggregate view is a
	// per-cell heatmap loaded from assets/data/{level}-heatmap-{name}.csv
	// (columns: x, y, value); the optimal view is a single path traced as an xray
	// from assets/optimal/{level}-{i}.csv (columns: x, y).
	//
	// How many distinct optimal solutions we have per round, indexed 0..n-1.
	// Hard-coded from what's on disk in static/assets/optimal.
	const OPTIMAL_COUNTS = {
		tutorial: 228,
		round1: 24,
		round2: 12,
		bonus1: 1000,
		bonus2: 1000,
		bonus3: 1000
	};

	const interpolatePuYe = interpolateHcl(
		variables.category["purple-dark"],
		variables.category["yellow-light"]
	);

	const levelItems = levels.map((l) => ({
		value: l.id,
		label: l.label
	}));

	const vizItems = [
		{ value: "play", label: "Play" },
		{ value: "optimal", label: "Optimal" },
		{ value: "pause", label: "Pauses" },
		{ value: "ending", label: "Endings" },
		{ value: "backtrack", label: "Backtracks" }
	];

	// title per heatmap type; `name` is the csv suffix. Values fall through to
	// HeatmapLayer's default formatter (thousands get a comma) unless a
	// formatValue is given — pause is seconds, so it gets a fixed decimal
	// (1 → "1.0") to match neighboring cells like 0.4 / 2.3.
	const heatmaps = {
		pause: {
			name: "pause",
			title: "Median seconds paused per square",
			formatValue: format(".1f")
		},
		ending: {
			name: "ending",
			title: "Where players finished"
		},
		backtrack: {
			name: "backtrack",
			title: "How often players re-mowed a square"
		}
	};

	let levelId = $state("tutorial");
	let viz = $state("play");

	let level = $derived(levels.find((l) => l.id === levelId));
	let heatmap = $derived(heatmaps[viz]);

	// which optimal solution is on screen; clamped so a leftover index from a
	// round with more solutions still resolves to a file that exists
	// The start square skews the pause ramp (everyone sits there before their
	// first move), so cap that scale at the second-highest value — the outlier
	// still fills, and the legend marks the top as "+".
	let maxValue = $derived.by(() => {
		if (viz !== "pause") return undefined;
		const values = [...new Set(data.map((d) => d.value))].sort((a, b) => b - a);
		return values[1];
	});

	let optimalCount = $derived(OPTIMAL_COUNTS[levelId] ?? 1);
	let optimalIndex = $state(0);
	let solution = $derived(Math.min(optimalIndex, optimalCount - 1));

	// one fetch per level+view, kept so toggling back and forth is instant
	const cache = new Map();
	let data = $state([]);
	let path = $state([]);
	let loading = $state(false);
	let failed = $state(false);
	let xrayLayer = $state();

	async function load(url, parse) {
		if (cache.has(url)) return cache.get(url);
		const rows = await loadCsv(url);
		if (!rows.length || rows[0].x === undefined)
			throw new Error(`bad csv: ${url}`);
		const parsed = rows.map(parse);
		cache.set(url, parsed);
		return parsed;
	}

	$effect(() => {
		if (viz === "play") return;
		const id = levelId;
		const optimal = viz === "optimal";
		const url = optimal
			? `assets/optimal/${id}-${solution}.csv`
			: `assets/data/${id}-heatmap-${heatmap.name}.csv`;
		const parse = optimal
			? (r) => ({ x: +r.x, y: +r.y })
			: (r) => ({ x: +r.x, y: +r.y, value: +r.value });
		let alive = true;
		loading = true;
		failed = false;
		data = [];
		path = [];
		load(url, parse)
			.then(async (rows) => {
				if (!alive) return;
				loading = false;
				if (!optimal) {
					data = rows;
					return;
				}
				// wait for the layer to mount with the new path before revealing it
				path = rows;
				await tick();
				if (alive) xrayLayer?.animate();
			})
			.catch((err) => {
				if (!alive) return;
				console.warn(`Could not load ${url}`, err);
				failed = true;
				loading = false;
			});
		return () => (alive = false);
	});

	async function replay() {
		xrayLayer?.reset();
		await tick();
		xrayLayer?.animate();
	}

	// swap in a different optimal run for this round (never the one on screen)
	function randomSolution() {
		if (optimalCount < 2) return;
		let next = solution;
		while (next === solution) next = Math.floor(Math.random() * optimalCount);
		optimalIndex = next;
	}
</script>

<div class="sandbox">
	<div class="controls">
		<Select
			bind:value={levelId}
			items={levelItems}
			placeholder="Choose a round"
		/>
		<ToggleGroup items={vizItems} bind:value={viz} required />
	</div>

	{#if level}
		{#if viz === "play"}
			<!-- keyed so switching rounds (or coming back) starts a fresh game -->
			{#key levelId}
				<Game
					size={level.size}
					obstacles={level.obstacles}
					onComplete={() => {}}
				/>
			{/key}
		{:else}
			<div class="stage">
				{#if failed}
					<p class="note">No data for this round yet.</p>
				{:else if viz === "optimal"}
					{#if path.length}
						<Grid
							size={level.size}
							obstacles={level.obstacles}
							started
							variant="wireframe"
						>
							<XrayLayer
								bind:this={xrayLayer}
								{path}
								color="optimal"
								stepTime={80}
							/>
						</Grid>
						<div class="actions">
							<Button onclick={replay}>Replay</Button>
							<Button onclick={randomSolution} disabled={optimalCount < 2}>
								Random solution
							</Button>
						</div>
					{/if}
				{:else if data.length}
					<Grid
						size={level.size}
						obstacles={level.obstacles}
						started
						variant="wireframe"
					>
						<HeatmapLayer
							{data}
							{maxValue}
							interpolate={interpolatePuYe}
							title={heatmap.title}
							formatValue={heatmap.formatValue}
						/>
					</Grid>
				{:else if loading}
					<p class="note">Loading...</p>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.sandbox {
		margin: 2rem auto;
		max-width: var(--col-width);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stage {
		width: 100%;
		aspect-ratio: 1;
		max-width: var(--col-width);
		margin: 3rem auto;
		padding: 1rem 0;
	}

	.note {
		text-align: center;
		font-family: var(--font-form);
		font-size: var(--14px);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1rem;
	}
</style>
