<script>
	import Grid from "$components/Grid.svelte";
	import XrayLayer from "$components/grid/XrayLayer.svelte";
	import Button from "$components/ui/Button.svelte";
	import inView from "$actions/inview.js";
	import loadCsv from "$utils/loadCsv.js";
	import levels from "$data/levels.json";
	import { tick } from "svelte";
	import { format, range, descending } from "d3";

	let { ids = [], level, count } = $props();
	let optimal = $derived(count ? true : false);
	let currentLevel = $derived(levels.find((l) => l.id === level));
	let size = $derived(currentLevel ? currentLevel.size : 10);
	let obstacles = $derived(currentLevel ? currentLevel.obstacles : []);
	let visible = $state(false);
	let color = $derived(optimal ? "optimal" : "user");

	// one entry per id: { id, path, label }
	let items = $state([]);
	// XrayLayer refs, index-aligned with items
	let layers = $state([]);

	const formatCount = format(",");

	// solution_index -> number of people who found it
	async function loadCounts() {
		if (!optimal) return null;
		try {
			const rows = await loadCsv(
				`assets/data/${level}-optimal-solution-counts.csv`
			);
			return new Map(rows.map((row) => [+row.solution_index, +row.count]));
		} catch (err) {
			console.warn(`Could not load optimal solution counts for ${level}`, err);
			return null;
		}
	}

	async function loadPaths() {
		const idsToLoad = optimal ? range(+count).map((i) => `${level}-${i}`) : ids;
		const folder = optimal ? "optimal" : "users";
		const counts = await loadCounts();
		const temp = await Promise.all(
			idsToLoad.map(async (id, i) => {
				const count = counts?.get(i);
				const label =
					count === undefined
						? id
						: `${formatCount(count)} ${count === 1 ? "person" : "people"}`;
				try {
					const rows = await loadCsv(`assets/${folder}/${id}.csv`);
					const path = rows.map((row) => ({
						x: +row.x,
						y: +row.y,
						t: +row.t
					}));
					return { id, path, label, count };
				} catch (err) {
					console.warn(`Could not load path for ${id}`, err);
					return { id, path: [], label, count: 0 };
				}
			})
		);
		temp.sort((a, b) => descending(a.count, b.count));
		items = temp;
	}

	async function onReplay() {
		layers.forEach((l) => l?.reset());
		await tick();
		layers.forEach((l) => l?.animate());
	}

	$effect(() => {
		if (visible && items.length) onReplay();
	});

	$effect(() => {
		loadPaths();
	});
</script>

{#if items.length}
	<div class="c">
		<div class="inner">
			{#each items as { id, path, label }, i (id)}
				<div class="g">
					<span class="label"><small><strong>{label}</strong></small></span>
					<Grid {size} {obstacles} started={true} variant="wireframe">
						<XrayLayer
							bind:this={layers[i]}
							{path}
							{color}
							showBacktracks
							shouldAnimate={false}
						/>
					</Grid>
					<!-- <p class="moves"><small>{path.length} moves</small></p> -->
				</div>
			{/each}
		</div>

		<!-- <p class="replay"><Button onclick={onReplay}>Replay</Button></p> -->
	</div>
{/if}

<style>
	.c {
		margin: 4rem auto;
	}

	.inner {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: 0.5rem;
		max-width: var(--chart-max-width);
		margin: 0 auto;
	}

	.g {
		padding: 0 8px;
		width: 100%;
	}

	.label {
		display: block;
		text-align: center;
		font-family: var(--font-mono);
		text-transform: uppercase;
	}
</style>
