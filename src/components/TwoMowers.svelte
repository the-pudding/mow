<script>
	import { onMount } from "svelte";
	import Grid from "$components/Grid.svelte";
	import GameLayer from "$components/grid/GameLayer.svelte";
	import Button from "$components/ui/Button.svelte";
	import loadCsv from "$utils/loadCsv.js";
	import inView from "$actions/inview.js";
	import levels from "$data/levels.json";

	// Two players' bonus2 runs, each replayed with a mower sprite walking
	// its own path on its own lawn.
	const LEVEL_ID = "bonus2";

	const sarah = "tt3aprpgrp";
	const other = "nkdu4xxevi";
	// 2a826e0mz7 - mysterybear
	// nkdu4xxevi - cheesepuff
	// cpt1csrzxq - seamus

	let level = $derived(levels.find((l) => l.id === LEVEL_ID));

	let sarahPath = $state([]);
	let otherPath = $state([]);

	let sarahLayer = $state();
	let otherLayer = $state();
	let visible = $state(false);

	// optimal percent compared to level data
	let sarahOptimal = $derived(
		sarahPath.length && level.optimal
			? Math.round((level.optimal / sarahPath.length) * 100)
			: 0
	);

	let otherOptimal = $derived(
		otherPath.length && level.optimal
			? Math.round((level.optimal / otherPath.length) * 100)
			: 0
	);

	async function loadPath(id) {
		try {
			const rows = await loadCsv(`assets/${LEVEL_ID}/${id}.csv`);
			return rows.map((r) => ({ x: +r.x, y: +r.y, t: +r.t }));
		} catch (err) {
			console.warn(`Could not load ${LEVEL_ID}/${id}.csv`, err);
			return [];
		}
	}

	function replay() {
		sarahLayer?.play();
		otherLayer?.play();
	}

	onMount(async () => {
		[sarahPath, otherPath] = await Promise.all([
			loadPath(sarah),
			loadPath(other)
		]);
	});

	$effect(() => {
		if (visible && sarahPath.length && otherPath.length) replay();
	});
</script>

{#if level}
	<div use:inView onenter={() => (visible = true)}>
		<div class="c">
			<div class="stage">
				<div class="name">Sarah ({sarahOptimal}% optimal)</div>
				<Grid size={level.size} obstacles={level.obstacles} started>
					<GameLayer bind:this={sarahLayer} replay={sarahPath} />
				</Grid>
			</div>
			<div class="stage">
				<div class="name">Cheesepuff ({otherOptimal}% optimal)</div>
				<Grid size={level.size} obstacles={level.obstacles} started>
					<GameLayer bind:this={otherLayer} replay={otherPath} />
				</Grid>
			</div>
		</div>
		<p class="replay"><Button onclick={replay}>Replay</Button></p>
	</div>
{/if}

<style>
	.c {
		display: flex;
		justify-content: center;
		margin: 2rem auto 0 auto;
	}

	.stage {
		width: 100%;
		max-width: min(var(--grid-max-width), 40svh);
		padding: 1rem;
	}

	.name {
		text-align: center;
		font-size: var(--12px);
		font-weight: 700;
		font-family: var(--font-form);
		text-transform: uppercase;
	}

	p.replay {
		text-align: center;
		margin: 0 auto 2rem auto;
	}
</style>
