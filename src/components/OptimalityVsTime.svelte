<script>
	import Scatter from "$components/charts/Scatter.svelte";
	import loadCsv from "$utils/loadCsv.js";
	import variables from "$data/variables.json";

	const highlight = [
		{
			id: "yo7m5rr3nl",
			label: "BONES",
			fill: variables.category["orange-light"]
		},
		{
			id: "tt3aprpgrp",
			label: "SARAH",
			fill: variables.category["green-light"]
		}
	];

	// Loads user-cohorts.csv (one row per completed-all player, pace/optimality
	// already expressed as percentile ranks) and hands it to the generic Scatter
	// chart, which draws its own line of best fit via regression={true}.
	let { src = "assets/data/user-cohorts.csv" } = $props();

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
						highlight.find((h) => h.id === d.id)?.fill || d.optimality < 0.1
							? variables.category["purple-dark"]
							: d.optimality > 0.9
								? variables.category["yellow-light"]
								: variables.color["gray-500"],
					label: highlight.find((h) => h.id === d.id)?.label || undefined
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
				label: "pace percentile",
				low: "← Faster",
				high: "Slower →"
			}}
			y={{ value: "optimality", label: "optimality percentile" }}
			regression
			regressionType="linear"
			format=".0%"
		/>
	{/if}
</div>

<style>
	.c {
		width: 100%;
	}

	.controls {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}
</style>
