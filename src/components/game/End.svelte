<script>
	import { session } from "$runes/misc.svelte.js";
</script>

<section class="c">
	<h2>Enjoy the rest of your day.</h2>
	<p>Your paths are now part of the dataset.</p>
	{#if session.email}
		<p>
			We'll email <strong>{session.email}</strong> when the story drops.
		</p>
	{:else}
		<p>
			The story drops in 1-2 weeks at <a href="https://pudding.cool"
				>pudding.cool</a
			>.
		</p>
	{/if}
</section>

<style>
	.c {
		max-width: var(--grid-max-width);
		margin: 2rem auto;
		padding: 1rem;
		text-align: center;
	}
</style>
