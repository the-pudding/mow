<script>
	import Grid from "$components/Grid.svelte";
	import XrayLayer from "$components/grid/XrayLayer.svelte";
	import Button from "$components/ui/Button.svelte";
	import inView from "$actions/inview.js";
	import loadCsv from "$utils/loadCsv.js";
	import levels from "$data/levels.json";
	import { base } from "$app/paths";
	import { tick } from "svelte";
	import { range } from "d3";

	let { ids = [], level, count } = $props();
	let currentLevel = $derived(levels.find((l) => l.id === level));
	let size = $derived(currentLevel ? currentLevel.size : 10);
	let obstacles = $derived(currentLevel ? currentLevel.obstacles : []);
	let visible = $state(false);

	// one entry per id: { id, path }
	let items = $state([]);
	// XrayLayer refs, index-aligned with items
	let layers = $state([]);

	async function loadPaths() {
		const idsToLoad = count ? range(+count).map((i) => `${level}-${i}`) : ids;
		const folder = count ? "optimal" : "users";
		items = await Promise.all(
			idsToLoad.map(async (id) => {
				try {
					const rows = await loadCsv(`${base}/assets/${folder}/${id}.csv`);
					const path = rows.map((row) => ({
						x: +row.x,
						y: +row.y,
						t: +row.t
					}));
					console.log(id, path);
					return { id, path };
				} catch (err) {
					console.warn(`Could not load path for ${id}`, err);
					return { id, path: [] };
				}
			})
		);
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
		if (visible) loadPaths();
	});
</script>

<div class="c" use:inView onenter={() => (visible = true)}>
	<div class="inner">
		{#each items as { id, path }, i (id)}
			<div class="g">
				<p><small><strong class="user">{id}</strong></small></p>
				<Grid {size} {obstacles} started={true} variant="wireframe">
					<XrayLayer
						bind:this={layers[i]}
						{path}
						color="user"
						showBacktracks
						realtime
					/>
				</Grid>
				<!-- <p class="moves"><small>{path.length} moves</small></p> -->
			</div>
		{/each}
	</div>

	<p class="replay"><Button onclick={onReplay}>Replay</Button></p>
</div>

<style>
	.inner {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: 1rem;
		max-width: var(--media-max-width);
		margin: 0 auto;
	}

	.g {
		padding: 0 8px;
		width: 100%;
	}

	.inner p {
		margin: 0;
		text-align: center;
		font-family: var(--font-mono);
		text-transform: uppercase;
	}

	/* p.moves {
		margin-top: 0.25rem;
	} */

	p.replay {
		text-align: center;
		margin-top: 1rem;
	}
</style>
