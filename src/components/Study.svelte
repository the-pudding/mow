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
				? variables.category["green-light"]
				: variables.category["orange-light"]
	}));
</script>

<div class="c">
	{#if data.length}
		<Scatter
			{data}
			radius={5}
			ratio={0.5}
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
					fill: variables.category["green-light"]
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
