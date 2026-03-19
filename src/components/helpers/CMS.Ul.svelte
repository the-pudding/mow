<script>
	let { li } = $props();
	$inspect(li);
</script>

<ul>
	{#each li as item}
		<li>{@html item}</li>
	{/each}
</ul>
