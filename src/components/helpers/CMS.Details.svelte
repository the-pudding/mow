<script>
	let { summary, content, open, name } = $props();

	let single = $derived(typeof content === "string");
	let isOpen = $derived(open === "true");
</script>

<details open={isOpen} {name}>
	<summary>{@html summary}</summary>
	<div class="content">
		{#if single}
			{@html content}
		{:else}
			{#each content as { value }}
				<p>
					{@html value}
				</p>
			{/each}
		{/if}
	</div>
</details>
