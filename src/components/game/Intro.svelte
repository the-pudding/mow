<script>
	import Button from "$components/ui/Button.svelte";
	import { session } from "$runes/misc.svelte.js";
	import generateId from "$utils/generateId.js";

	async function start() {
		if (!session.userId) session.userId = generateId(10);
		session.phase = "tutorial";
	}
</script>

<section class="c">
	<h1><strong>Lawn Mowing Experiment</strong></h1>
	<p>
		This is a game about mowing a lawn as efficiently as possible. And a small
		experiment. Play just two rounds, and then we’ll break down the findings
		when our story drops in a few weeks.
	</p>
	<div>
		<Button size="lg" onclick={start}>Let’s do it</Button>
	</div>
</section>

<style>
	.c {
		max-width: var(--grid-max-width);
		margin: 2rem auto;
		padding: 1rem;
	}

	h1 {
		line-height: 1.1;
		text-align: center;
	}

	div {
		text-align: center;
		padding: 4rem 0;
	}
</style>
