<script>
	import { setContext } from "svelte";
	import { browser } from "$app/environment";
	import Meta from "$components/Meta.svelte";
	import Index from "$components/Index.svelte";
	import copy from "$data/copy.json";
	import version from "$utils/version.js";

	let { data } = $props();

	version();

	const preloadFont = [
		// "https://pudding.cool/assets/fonts/tiempos/TiemposTextWeb-Regular.woff2",
		// "https://pudding.cool/assets/fonts/tiempos/TiemposTextWeb-Bold.woff2",
		// "https://pudding.cool/assets/fonts/atlas/AtlasGrotesk-Regular-Web.woff2",
		// "https://pudding.cool/assets/fonts/atlas/AtlasGrotesk-Bold-Web.woff2"
	];

	const { title, description, url, keywords } = copy;
	setContext("copy", copy);
	setContext("data", data);
</script>

<Meta {title} {description} {url} {preloadFont} {keywords} />

<!-- <Index /> -->

<div class="coming-soon">
	<p>
		Nothing to see here, yet...<br />The full story drops in about two weeks.
		Until then you can <a href="/game">play the experiment here</a>.
	</p>
</div>

<style>
	.coming-soon {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 1rem;
		text-align: center;
	}

	.coming-soon a {
		text-decoration: underline;
	}
</style>
