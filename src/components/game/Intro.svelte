<script>
	import Button from "$components/ui/Button.svelte";
	import { session } from "$runes/misc.svelte.js";
	import generateId from "$utils/generateId.js";

	function start() {
		if (!session.userId) session.userId = generateId();
		session.phase = "tutorial";
	}
</script>

<section class="c">
	<h1>Lawn mowing experiment</h1>
	<p>
		This is a game about mowing a lawn as efficiently as possible. And a small
		experiment. Play through, and we’ll break down the findings when our story
		drops in a couple weeks.
	</p>
	<Button variant="primary" size="lg" onclick={start}>Start</Button>
</section>

<style>
	.c {
		max-width: var(--grid-max-width);
		margin: 2rem auto;
		padding: 1rem;
	}

	.c :global(.bits-button) {
		margin-top: 1.5rem;
	}
</style>
