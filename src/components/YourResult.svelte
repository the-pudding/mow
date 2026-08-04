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
			? ((optimalPath.length / userPath.length) * 100).toFixed(1)
			: 0
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
		<div class="lawns">
			{#if userPath.length}
				<div class="g">
					<span>
						<small><strong class="user">Your path</strong></small>
					</span>

					<Grid {size} {obstacles} started={true} variant="wireframe">
						<XrayLayer
							bind:this={gridUser}
							path={userPath}
							color="user"
							showBacktracks
						/>
					</Grid>
				</div>
			{/if}
			<div class="g">
				<span>
					<small>
						<strong class="optimal">An Optimal path</strong>
					</small>
				</span>

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
</div>

<style>
	.inner {
		margin: 2rem auto;
		max-width: var(--media-max-width);
	}

	.lawns {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.g {
		padding-top: 1rem;
		width: 50%;
	}

	.inner span {
		display: block;
		margin: 0 auto;
		text-align: center;
		font-family: var(--font-form);
		text-transform: uppercase;
	}

	p.replay {
		text-align: center;
		margin-top: 1rem;
	}

	@media (min-width: 600px) {
		.inner {
			margin: 4rem auto;
		}
	}
</style>
