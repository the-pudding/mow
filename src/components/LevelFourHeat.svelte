<script>
	import { onMount } from "svelte";
	import { interpolateHcl } from "d3";
	import Grid from "$components/Grid.svelte";
	import HeatmapLayer from "$components/grid/HeatmapLayer.svelte";
	import loadCsv from "$utils/loadCsv.js";
	import levels from "$data/levels.json";
	import variables from "$data/variables.json";

	// Side-by-side bonus2 comparison: the pause heatmap for the top 10% most
	// efficient players next to the same heatmap for the bottom 10% — both
	// written by tasks/web.js's writePauseHeatmap.
	const LEVEL_ID = "bonus2";

	const interpolatePuYe = interpolateHcl(
		variables.category["purple-dark"],
		variables.category["yellow-light"]
	);

	let level = $derived(levels.find((l) => l.id === LEVEL_ID));

	let topData = $state([]);
	let bottomData = $state([]);

	async function loadHeatmap(suffix) {
		const rows = await loadCsv(
			`assets/data/${LEVEL_ID}-pause-heatmap${suffix}.csv`
		);
		return rows
			.map((r) => ({ x: +r.x, y: +r.y, value: +r.median_seconds }))
			.filter((d) => !(d.x === 0 && d.y === 0));
	}

	onMount(async () => {
		try {
			topData = await loadHeatmap("-top");
		} catch (err) {
			console.warn(`Could not load ${LEVEL_ID}-pause-heatmap-top.csv`, err);
		}
		try {
			bottomData = await loadHeatmap("-bottom");
		} catch (err) {
			console.warn(`Could not load ${LEVEL_ID}-pause-heatmap-bottom.csv`, err);
		}
	});
</script>

{#if level}
	<div class="c">
		<div class="stage">
			<Grid
				size={level.size}
				obstacles={level.obstacles}
				started
				variant="wireframe"
			>
				<HeatmapLayer
					data={topData}
					interpolate={interpolatePuYe}
					title="Top 10% — seconds paused per square"
				/>
			</Grid>
		</div>
		<div class="stage">
			<Grid
				size={level.size}
				obstacles={level.obstacles}
				started
				variant="wireframe"
			>
				<HeatmapLayer
					data={bottomData}
					interpolate={interpolatePuYe}
					title="Bottom 10% — seconds paused per square"
				/>
			</Grid>
		</div>
	</div>
{/if}

<style>
	.c {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 2rem;
		margin: 0 auto;
	}

	.stage {
		width: 100%;
		max-width: min(var(--grid-max-width), 40svh);
		padding: 1rem;
	}
</style>
