<script>
	import Button from "$components/ui/Button.svelte";
	import { session } from "$runes/misc.svelte.js";

	function start() {
		session.phase = "bonus1";
	}

	function exit() {
		session.phase = "skip_end";
	}
</script>

<section class="c">
	<h2>Bonus rounds</h2>
	<p>Harder grids, for fun. Your paths are still recorded.</p>
	<div class="actions">
		<Button variant="primary" onclick={start}>Let’s go</Button>
		<Button variant="ghost" onclick={exit}>Actually, I’m done</Button>
	</div>
</section>

<style>
	.c {
		max-width: var(--grid-max-width);
		margin: 2rem auto;
		padding: 1rem;
		text-align: center;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		margin-top: 1.5rem;
	}
</style>
