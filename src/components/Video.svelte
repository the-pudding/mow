<script>
	let { src, preload, autoplay, loop, muted, controls, restart, figcaption } =
		$props();

	const poster = src.replace("videos", "posters").replace("mp4", "jpg");
</script>

<figure>
	<video
		{src}
		{poster}
		{preload}
		{autoplay}
		{loop}
		{muted}
		{controls}
		playsinline
	></video>

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

	video {
		display: block;
		margin: 0;
	}
</style>
