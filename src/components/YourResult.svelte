<script>
	import Grid from "$components/Grid.svelte";
	import XrayLayer from "$components/grid/XrayLayer.svelte";
	import Button from "$components/ui/Button.svelte";
	import optimalRaw from "$data/optimal.csv";
	import inView from "$actions/inview.js";
	import levels from "$data/levels.json";
	import { session } from "$runes/misc.svelte.js";
	import { tick } from "svelte";

	const optimalPath = optimalRaw.map((d) => ({ x: +d.x, y: +d.y }));

	let { level, a1, b1, a2, b2, a3, b3, skip, strip } = $props();
	let currentLevel = $derived(levels.find((l) => l.id === level));
	let size = $derived(currentLevel ? currentLevel.size : 10);
	let obstacles = $derived(currentLevel ? currentLevel.obstacles : []);
	let userPath = $derived(session.storyGamePath ?? []);
	let visible = $state(false);
	let gridUser = $state();
	let gridOptimal = $state();
	let score = $derived(
		userPath.length && optimalPath.length
			? ((optimalPath.length / userPath.length) * 100).toFixed(2)
			: (0).toFixed(2)
	);

	async function onReplay() {
		if (gridUser) gridUser.reset();
		gridOptimal.reset();

		await tick();

		if (gridUser) gridUser.animate();
		gridOptimal.animate();
	}

	$effect(() => {
		if (visible) onReplay();
	});
</script>

<div class="c" use:inView onenter={() => (visible = true)}>
	{#if userPath.length}
		<p>
			{strip}
			{b1}
			{userPath.length}
			{a1}
			{b2}
			{optimalPath.length}
			{a2}
			{b3}
			{score}%
			{a3}
		</p>
	{:else}
		<p>
			{skip}
		</p>
	{/if}
	<div class="inner">
		{#if userPath.length}
			<div class="g">
				<p>
					<small><strong class="user">Your path</strong></small>
				</p>
				<Grid {size} {obstacles} started={true} variant="wireframe">
					<XrayLayer bind:this={gridUser} path={userPath} color="user" />
				</Grid>
			</div>
		{/if}
		<div class="g">
			<p>
				<small>
					<strong class="optimal">An Optimal path</strong>
				</small>
			</p>
			<Grid {size} {obstacles} started={true} variant="wireframe">
				<XrayLayer
					bind:this={gridOptimal}
					path={optimalPath}
					color="optimal"
				/>
			</Grid>
		</div>
	</div>

	<p class="replay"><Button onclick={onReplay}>Replay</Button></p>
</div>

<style>
	.inner {
		display: flex;
		justify-content: center;
		max-width: var(--media-max-width);
		margin: 0 auto;
		flex-direction: column;
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

	p.replay {
		text-align: center;
		margin-top: 1rem;
	}

	.user {
		/* color: var(--color-yellow-medium); */
	}

	.optimal {
		/* color: var(--color-green-medium); */
	}

	@media (min-width: 640px) {
		.inner {
			flex-direction: row;
		}

		.g {
			width: 50%;
		}
	}
</style>
