<script>
	import { setContext } from "svelte";
	import { browser } from "$app/environment";
	import Meta from "$components/Meta.svelte";
	import Index from "$components/Index.svelte";
	import Footer from "$components/Footer.svelte";
	import FooterCC from "$components/Footer.CC.svelte";
	import copy from "$data/copy.json";
	import { session } from "$runes/misc.svelte.js";
	import "$utils/version.js";

	let { data } = $props();

	const dev = true;

	if (browser && dev) {
		localStorage.removeItem("pudding_mow_game");
		session.userId = "0a78toj0l4";
		session.completedLevels["round2"] = 1;
	}

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

<Index />

<svelte:boundary onerror={(e) => console.error(e)}>
	{#if import.meta.env.VITE_SITE == "citizencodex"}
		<FooterCC />
	{:else}
		<Footer recirc={true} />
	{/if}
</svelte:boundary>

<style>
</style>
