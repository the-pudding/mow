<script>
	import Scatter from "$components/charts/Scatter.svelte";
	import loadCsv from "$utils/loadCsv.js";
	import variables from "$data/variables.json";
	// Loads user-cohorts.csv (one row per completed-all player, pace/optimality
	// already expressed as percentile ranks) and hands it to the generic Scatter
	// chart, which draws its own line of best fit via regression={true}.
	const src = "assets/data/user-cohorts.csv";

	let data = $state([]);

	$effect(() => {
		let alive = true;
		loadCsv(src).then((rows) => {
			if (!alive) return;
			data = rows
				.map((d) => ({
					id: d.user_id,
					time: +d.pace_pct,
					optimality: +d.opt_pct,
					count: 1
				}))
				.map((d) => ({
					...d,
					fill:
						d.optimality < 0.1
							? variables.category["purple-light"]
							: d.optimality > 0.9
								? variables.category["yellow-light"]
								: variables.color["gray-500"]
				}));
		});
		return () => (alive = false);
	});
</script>

<div class="c">
	<!-- {#if items.length > 1}
		<div class="controls">
			<ToggleGroup {items} bind:value={selected} required />
		</div>
	{/if} -->

	{#if data.length}
		<Scatter
			{data}
			x={{
				value: "time",
				label: "speed percentile",
				low: "← Faster",
				high: "Slower →"
			}}
			y={{ value: "optimality", label: "optimality percentile" }}
			format=".0%"
			regression={false}
			customLabels={[
				{
					label: "10th percentile",
					x: 0.1,
					y: 0.125,
					fill: variables.category["purple-light"]
				},
				{
					label: "90th percentile",
					x: 0.1,
					y: 0.85,
					fill: variables.category["yellow-light"]
				}
			]}
		/>
	{/if}
</div>

<style>
	.c {
		width: 100%;
	}
</style>
