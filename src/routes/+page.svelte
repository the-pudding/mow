<script>
	import { setContext } from "svelte";
	import { browser } from "$app/environment";
	import Meta from "$components/Meta.svelte";
	import Index from "$components/Index.svelte";
	import Footer from "$components/Footer.svelte";
	import FooterCC from "$components/Footer.CC.svelte";
	import copy from "$data/copy.json";
	import version from "$utils/version.js";

	let { data } = $props();

	version();

	const preloadFont = [
		"https://pudding.cool/assets/fonts/inconsolata/inconsolata-v32-latin-regular.woff2",
		"https://pudding.cool/assets/fonts/inconsolata/inconsolata-v32-latin-700.woff2"
	];

	const { title, description, keywords } = copy;

	const metaObj =
		import.meta.env.VITE_SITE == "citizencodex"
			? {
					url: "https://citizencodex.com/our-stories/mow",
					author: "Citizen Codex",
					website: "https://citizencodex.com",
					handle: "citizencodex"
				}
			: {
					url: "https://pudding.cool/2026/06/mow",
					author: "The Pudding",
					website: "https://pudding.cool",
					handle: "puddingviz"
				};
	setContext("copy", copy);
</script>

<Meta {title} {description} {preloadFont} {keywords} {...metaObj} />

<!-- <Index /> -->

<div class="coming-soon">
	<p>
		Nothing to see here, yet...<br />The full story drops in a few weeks. Until
		then you can <a href="game">play the experiment here</a>.
	</p>
</div>

<svelte:boundary onerror={(e) => console.error(e)}>
	{#if import.meta.env.VITE_SITE == "citizencodex"}
		<FooterCC />
	{:else}
		<Footer recirc={true} />
	{/if}
</svelte:boundary>

<style>
	.coming-soon {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 80svh;
		padding: 1rem;
		text-align: center;
		position: relative;
		top: 0;
		left: 0;
		width: 100%;
		z-index: var(--z-middle);
	}

	.coming-soon a {
		text-decoration: underline;
	}
</style>
