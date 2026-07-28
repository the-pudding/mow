<script>
	import { onMount } from "svelte";
	import { interpolateHcl } from "d3";
	import Grid from "$components/Grid.svelte";
	import HeatmapLayer from "$components/grid/HeatmapLayer.svelte";
	import loadCsv from "$utils/loadCsv.js";
	import levels from "$data/levels.json";
	import variables from "$data/variables.json";

	// Side-by-side bonus2 comparison: the plain lawn/obstacles next to a heatmap
	// of how long players, in aggregate, paused on each square (median seconds
	// paused per cell, across every player who visited it — see tasks/web.js's
	// writePauseHeatmap).
	const LEVEL_ID = "bonus2";

	const interpolatePuYe = interpolateHcl(
		variables.category["purple-dark"],
		variables.category["yellow-light"]
	);

	let level = $derived(levels.find((l) => l.id === LEVEL_ID));

	let heatmapData = $state([]);

	onMount(async () => {
		try {
			const rows = await loadCsv(`assets/data/${LEVEL_ID}-pause-heatmap.csv`);
			heatmapData = rows
				.map((r) => ({
					x: +r.x,
					y: +r.y,
					value: +r.median_seconds
				}))
				.filter((d) => !(d.x === 0 && d.y === 0));
		} catch (err) {
			console.warn(`Could not load ${LEVEL_ID}-pause-heatmap.csv`, err);
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
				variant="grass"
			/>
		</div>
		<div class="stage">
			<Grid
				size={level.size}
				obstacles={level.obstacles}
				started
				variant="wireframe"
			>
				<HeatmapLayer
					data={heatmapData}
					interpolate={interpolatePuYe}
					showValues={false}
					title="Median seconds paused per square <br>(excluding the start)"
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
