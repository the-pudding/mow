<script>
	let { src, alt, figcaption } = $props();
</script>

<figure>
	<img {src} {alt} />

	{#if figcaption}
		<figcaption>
			{@html figcaption}
		</figcaption>
	{/if}
</figure>

<style>
	figure {
		position: relative;
		margin: 32px auto;
	}

	figcaption {
		font-size: var(--14px);
		padding: 8px 0;
		text-align: center;
	}

	img {
		display: block;
		margin: 0;
	}
</style>
