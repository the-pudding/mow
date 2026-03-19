<script>
	let { li } = $props();
</script>

<ol>
	{#each li as item}
		<li>{@html item}</li>
	{/each}
</ol>
