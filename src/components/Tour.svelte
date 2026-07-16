<script>
	import Scrolly from "$components/helpers/Scrolly.svelte";
	let { steps } = $props();
	let stepIndex = $state(0);
</script>

<div class="c tour">
	<div class="vis"></div>
	<Scrolly bind:value={stepIndex}>
		{#each steps as { type, value }, i}
			{@const active = stepIndex === i}
			{@const isString = typeof value === "string"}
			{@const textContent = isString
				? [value]
				: type === "text"
					? value.map((v) => v.value)
					: []}
			<div class="step" class:active data-step={i}>
				{#if type === "text"}
					{#each textContent as t}
						<p>{@html t}</p>
					{/each}
				{:else if type === "ul"}
					<ul>
						{#each value.li as li}
							<li>{@html li}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</Scrolly>
</div>

<style>
	.c {
		position: relative;
		--text-width: 30rem;
		max-width: 1600px;
		margin: 0 auto;
	}

	.step {
		margin-bottom: 90svh;
	}

	.step:first-of-type {
		margin-top: -100svh;
	}

	.vis {
		position: sticky;
		top: 0;
		height: 100svh;
		width: 100%;
		z-index: -1;
		background: rgba(255, 255, 255, 0.25);
	}

	@media screen and (min-width: 640px) {
		.step {
			max-width: var(--text-width);
			margin-bottom: 50svh;
			padding-right: 1rem;
		}

		.vis {
			margin-left: var(--text-width);
			width: calc(100% - var(--text-width));
		}
	}

	.tour :global(strong) {
		color: var(--color-yellow);
	}
</style>
