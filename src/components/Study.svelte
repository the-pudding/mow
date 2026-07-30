<script>
	import Scatter from "$components/charts/Scatter.svelte";
	import variables from "$data/variables.json";
	import rawData from "$data/study.csv";

	const data = rawData.map((d) => ({
		nodes: +d.nodes,
		value: +d.value,
		shape: d.group === "optimal" ? "square" : "circle",
		fill:
			d.group === "optimal"
				? variables.category["green-medium"]
				: variables.category["orange-light"]
	}));

	let w = $state(1);
	let ratio = $derived(w < 480 ? 1 : 0.5);
</script>

<div class="c" bind:offsetWidth={w}>
	{#if data.length}
		<Scatter
			{data}
			radius={5}
			{ratio}
			x={{
				value: "nodes",
				label: "nodes"
			}}
			y={{ value: "value", label: "solution length" }}
			customLabels={[
				{
					label: "Human",
					x: 120,
					y: 1410,
					fill: variables.category["orange-light"]
				},
				{
					label: "Optimal",
					x: 120,
					y: 1170,
					fill: variables.category["green-medium"]
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
