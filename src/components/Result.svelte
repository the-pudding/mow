<script>
	import Grid from "$components/Grid.svelte";
	import obstacles from "$data/obstacles.json";
	import solution from "$data/solution.json";
	import { game } from "$runes/misc.svelte.js";
	import inView from "$actions/inview.js";

	const size = 10;
	let visible = $state(false);
	let gridUser = $state();
	let gridSolution = $state();

	$effect(() => {
		if (visible) {
			if (gridUser) gridUser.animate();
			gridSolution.animate();
		}
	});
</script>

<div class="c" use:inView onenter={() => (visible = true)}>
	<div class="inner">
		{#if game.path.length}
			<div class="g">
				<p>
					<small
						><strong class="user">Your path</strong> ({game.path.length} moves)</small
					>
				</p>
				<Grid
					bind:this={gridUser}
					{size}
					perspective={false}
					{obstacles}
					path={game.path}
					game={false}
					color="user"
				></Grid>
			</div>
		{/if}
		<div class="g">
			<p>
				<small>
					<strong class="optimal">Optimal path</strong> ({solution.length} moves)
				</small>
			</p>
			<Grid
				bind:this={gridSolution}
				{size}
				perspective={false}
				{obstacles}
				path={solution}
				game={false}
				color="solution"
			></Grid>
		</div>
	</div>

	<p class="replay"><button>Replay</button></p>
</div>

<style>
	.inner {
		display: flex;
		justify-content: center;
		max-width: 800px;
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
	}

	p.replay {
		text-align: center;
		margin-top: 16px;
	}

	.user {
		color: var(--color-orange-medium);
	}

	.optimal {
		color: var(--color-green-medium);
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
