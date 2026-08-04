<script>
	let { li } = $props();
</script>

<ul>
	{#each li as item}
		<li>{@html item}</li>
	{/each}
</ul>
