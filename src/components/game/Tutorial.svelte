<script>
	import Game from "$components/Game.svelte";
	import { session } from "$runes/misc.svelte.js";
	import levels from "$data/levels.json";

	const level = levels.find((l) => l.id === "tutorial");

	let instructions = $derived(
		session.platform === "desktop" ? "arrow keys" : "on-screen keyboard"
	);

	function onComplete() {
		session.phase = "round1";
	}
</script>

<section class="c">
	<h2>Tutorial</h2>
	<p>
		The goal: Mow every green tile in as few moves as possible. Time doesn’t
		matter. Gray tiles are obstacles you can’t cross. You can retrace your
		steps, but try to be efficient. Use the {instructions} to move.
	</p>
	<p class="meta"><em>Warm-up — this round isn't recorded.</em></p>
	<Game
		size={level.size}
		obstacles={level.obstacles}
		{onComplete}
		startMessage="Mow the lawn."
	/>
</section>

<style>
	.c {
		max-width: var(--grid-max-width);
		margin: 2rem auto;
		padding: 1rem;
	}

	.meta {
		font-size: var(--14px);
		color: var(--color-fg-light);
	}
</style>
