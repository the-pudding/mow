<script>
	import Scatter from "$components/charts/Scatter.svelte";
	import loadCsv from "$utils/loadCsv.js";
	import variables from "$data/variables.json";
	const src = "assets/data/percentile-optimality-time.csv";
	import useWindowDimensions from "$runes/useWindowDimensions.svelte.js";
	let dimensions = new useWindowDimensions();

	let data = $state([]);
	let mobile = $derived(dimensions.width < 480);
	let radius = $derived(mobile ? 1 : 2);
	let ratio = $derived(mobile ? 1 : 0.7);

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
				label: "pace percentile",
				low: "← Faster",
				high: "Slower →"
			}}
			y={{ value: "optimality", label: "optimality percentile" }}
			format=".0%"
			regression={false}
			{radius}
			{ratio}
			customLabels={[
				{
					label: "10th percentile",
					x: 0.05,
					y: 0.125,
					textAnchor: "start",
					fill: variables.category["purple-light"]
				},
				{
					label: "90th percentile",
					x: 0.05,
					y: 0.85,
					textAnchor: "start",
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
