<script>
	import loadCsv from "$utils/loadCsv.js";
	import Histogram from "$components/charts/Histogram.svelte";

	let { label } = $props();
	let data = $state([]);
	$effect(async () => {
		try {
			const raw = await loadCsv(`assets/data/round2-move-counts.csv`);
			const temp = raw.map(({ moves, count }) => ({
				value: +moves,
				count: +count
			}));
			// add up everything above 79 moves into a single "80+" bin
			const threshold = 80;
			const over = temp
				.filter((d) => d.value >= threshold)
				.reduce((acc, d) => acc + d.count, 0);
			data = [
				...temp.filter((d) => d.value < threshold),
				{ value: threshold, count: over, label: `${threshold}+` }
			];
		} catch (error) {
			console.error(error);
		}
	});
</script>

<div class="c">
	{#if data.length}
		<Histogram {data} {label} highlight={49} />
	{/if}
</div>

<style>
	.c {
		margin: 4rem auto;
	}
</style>
