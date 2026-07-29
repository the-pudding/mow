<script>
	import { interpolateHcl } from "d3";
	import Grid from "$components/Grid.svelte";
	import Game from "$components/Game.svelte";
	import HeatmapLayer from "$components/grid/HeatmapLayer.svelte";
	import Select from "$components/ui/Select.svelte";
	import ToggleGroup from "$components/ui/ToggleGroup.svelte";
	import loadCsv from "$utils/loadCsv.js";
	import levels from "$data/levels.json";
	import variables from "$data/variables.json";

	// Reader sandbox: pick any round, then either replay it yourself or look at
	// how everyone else played it. Each aggregate view is a per-cell heatmap
	// loaded from assets/data/{level}-heatmap-{name}.csv (columns: x, y, value).
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
		{ value: "pause", label: "Pauses" },
		{ value: "ending", label: "Endings" },
		{ value: "backtrack", label: "Backtracks" }
	];

	// title + value formatting per heatmap type; `name` is the csv suffix
	const heatmaps = {
		pause: {
			name: "pause",
			title: "Median seconds paused per square",
			formatValue: (v) => `${v}`
		},
		ending: {
			name: "ending",
			title: "Where players finished",
			formatValue: (v) => `${v}`
		},
		backtrack: {
			name: "backtrack",
			title: "How often players re-mowed a square",
			formatValue: (v) => `${v}`
		}
	};

	let levelId = $state("tutorial");
	let viz = $state("play");

	let level = $derived(levels.find((l) => l.id === levelId));
	let heatmap = $derived(heatmaps[viz]);

	// one fetch per level+view, kept so toggling back and forth is instant
	const cache = new Map();
	let data = $state([]);
	let loading = $state(false);
	let failed = $state(false);

	async function load(id, name) {
		const key = `${id}-heatmap-${name}`;
		if (cache.has(key)) return cache.get(key);
		const rows = await loadCsv(`assets/data/${key}.csv`);
		if (!rows.length || rows[0].x === undefined)
			throw new Error(`bad csv: ${key}`);
		const parsed = rows.map((r) => ({ x: +r.x, y: +r.y, value: +r.value }));
		cache.set(key, parsed);
		return parsed;
	}

	$effect(() => {
		if (!heatmap) return;
		const id = levelId;
		const name = heatmap.name;
		let alive = true;
		loading = true;
		failed = false;
		load(id, name)
			.then((rows) => {
				if (!alive) return;
				data = rows;
				loading = false;
			})
			.catch((err) => {
				if (!alive) return;
				console.warn(`Could not load ${id}-heatmap-${name}.csv`, err);
				data = [];
				failed = true;
				loading = false;
			});
		return () => (alive = false);
	});
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
				{:else if data.length}
					<Grid
						size={level.size}
						obstacles={level.obstacles}
						started
						variant="wireframe"
					>
						<HeatmapLayer
							{data}
							interpolate={interpolatePuYe}
							title={heatmap.title}
							formatValue={heatmap.formatValue}
						/>
					</Grid>
				{:else if loading}
					<p class="note">Loading…</p>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.sandbox {
		margin: 2rem auto;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stage {
		width: 100%;
		max-width: var(--grid-max-width);
		margin: 3rem auto;
		padding: 1rem 0;
	}

	.note {
		text-align: center;
		font-family: var(--font-mono);
		font-size: var(--14px);
	}
</style>
