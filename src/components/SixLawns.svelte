<script>
	import Game from "$components/Game.svelte";
	import levels from "$data/levels.json";
</script>

<div class="c">
	{#each levels as { id, size, obstacles }, i}
		<!-- replace numbers with nothing -->
		{@const label = i === 0 ? id : `level ${i}`}
		<div class="lawn">
			<span class="label">
				<small><strong>{label}</strong> ({size} &times; {size})</small>
			</span>
			<Game {size} {obstacles} controls={false} showCharacter={false} fill />
		</div>
	{/each}
</div>

<style>
	.c {
		max-width: var(--chart-max-width);
		margin: 4rem auto;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem 1rem;
	}

	.lawn :global(.c) {
		margin: 0;
	}

	.label {
		display: block;
		text-align: center;
		font-family: var(--font-form);
		text-transform: uppercase;
	}

	@media (max-width: 640px) {
		.c {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
