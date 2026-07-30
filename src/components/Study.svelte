<script>
	import Scatter from "$components/charts/Scatter.svelte";
	import variables from "$data/variables.json";
	import rawData from "$data/study.csv";
	import useWindowDimensions from "$runes/useWindowDimensions.svelte.js";
	let dimensions = new useWindowDimensions();

	const data = rawData.map((d) => ({
		nodes: +d.nodes,
		value: +d.value,
		shape: d.group === "optimal" ? "square" : "circle",
		fill:
			d.group === "optimal"
				? variables.category["green-medium"]
				: variables.category["orange-light"]
	}));

	let mobile = $derived(dimensions.width < 480);
	let ratio = $derived(mobile ? 1 : 0.5);
</script>

<div class="c">
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
					x: 60,
					y: 945,
					dy: -16,
					textAnchor: "end",
					fill: variables.category["orange-light"]
				},
				{
					label: "Optimal",
					x: 60,
					y: 870,
					textAnchor: "start",
					dy: 16,
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
