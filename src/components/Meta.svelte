<script>
	let {
		title = "Title TK",
		description = "Description TK",
		url = "https://pudding.cool",
		author = "The Pudding",
		website = "https://pudding.cool",
		handle = "puddingviz",
		keywords = "",
		preloadFont = []
	} = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="author" content={author} />
	<meta name="news_keywords" content={keywords} />

	<meta property="og:title" content={title} />
	<meta property="og:site_name" content={author} />
	<meta property="og:url" content={url} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="article" />
	<meta property="og:locale" content="en_US" />

	<meta property="og:image" content="{url}/assets/social-facebook.jpg" />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="628" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={website} />
	<meta name="twitter:creator" content="@{handle}" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image:src" content="{url}/assets/social-twitter.jpg" />

	<meta name="robots" content="max-image-preview:large" />

	<link rel="canonical" href="{url}/" />

	{#if import.meta.env.VITE_SITE == "citizencodex"}
		<!-- todo analytics -->
	{:else}
		{#each preloadFont as href}
			<link rel="preload" {href} as="font" type="font/woff2" crossorigin />
		{/each}

		<script
			data-goatcounter="https://thepudding.goatcounter.com/count"
			async
			src="//gc.zgo.at/count.js"
		></script>
	{/if}
</svelte:head>
