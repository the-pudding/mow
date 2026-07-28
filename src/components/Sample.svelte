<script>
	import { shuffle } from "d3";
	import loadCsv from "$utils/loadCsv.js";
	import Grid from "$components/Grid.svelte";
	import XrayLayer from "$components/grid/XrayLayer.svelte";
	import levels from "$data/levels.json";

	const CYCLE_TIMER = 4000;
	const LEVEL = "round2";

	let currentLevel = $derived(levels.find((l) => l.id === LEVEL));
	let size = $derived(currentLevel ? currentLevel.size : 10);
	let obstacles = $derived(currentLevel ? currentLevel.obstacles : []);

	let data = $state([]);
	let index = $state(0);
	// XrayLayer ref for the path currently on screen
	let layer = $state(null);

	let cur = $derived(data.length ? data[index % data.length] : {});
	let path = $derived(cur.path);
	let id = $derived(cur.id);
	let moves = $derived(cur.moves);
	let stepTime = $derived(path ? (CYCLE_TIMER * 0.9) / path.length : 0);

	async function load() {
		try {
			const raw = await loadCsv("assets/data/round2-sample-paths.csv");
			data = shuffle(
				raw
					.map((d) => ({
						id: d.user_id,
						path: JSON.parse(d.path)
					}))
					.map((d) => ({
						...d,
						moves: d.path.length
					}))
			);
		} catch (error) {
			console.error(error);
		}
	}

	$effect(() => {
		load();
	});

	// advance to the next path on a fixed cycle
	$effect(() => {
		if (!data.length) return;
		const id = setInterval(() => index++, CYCLE_TIMER);
		return () => clearInterval(id);
	});

	// each keyed swap mounts a fresh layer; kick off its reveal
	$effect(() => {
		layer?.animate();
	});
</script>

<div class="c">
	<div class="g">
		<span class="label"
			><small><strong>player id: {id}</strong> ({moves} moves)</small></span
		>
		<Grid {size} {obstacles} started={true} variant="wireframe">
			{#if path}
				{#key index}
					<XrayLayer
						bind:this={layer}
						{path}
						shouldAnimate
						showBacktracks
						{stepTime}
					/>
				{/key}
			{/if}
		</Grid>
	</div>
</div>

<style>
	.c {
		max-width: calc(var(--media-max-width) * 0.5);
		margin: 4rem auto;
	}

	.label {
		display: block;
		text-align: center;
		font-family: var(--font-mono);
		text-transform: uppercase;
	}
</style>
