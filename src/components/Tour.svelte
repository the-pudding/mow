<script>
	import Scrolly from "$components/helpers/Scrolly.svelte";
	let { steps } = $props();
	let stepIndex = $state(0);
</script>

<div class="c">
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
	.step {
		margin-bottom: 90svh;
	}

	.step:first-of-type {
		margin-top: -100svh;
	}

	.c {
		position: relative;
	}

	.vis {
		position: sticky;
		top: 0;
		height: 100svh;
		width: 100%;
		z-index: -1;
		background: rgba(255, 0, 0, 0.2);
	}
</style>
