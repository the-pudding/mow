<script>
	import { getContext } from "svelte";
	import Game from "$components/Game.svelte";
	import Video from "$components/Video.svelte";
	import Img from "$components/Img.svelte";
	import Result from "$components/Result.svelte";
	import CMS from "$components/helpers/CMS.svelte";
	import Footer from "$components/Footer.svelte";

	const copy = getContext("copy");
	const { body } = copy;
	const components = { Game, Video, Result, Img };
</script>

<div class="byline">
	<p>{@html copy.byline}</p>
</div>

<div class="c">
	<CMS {body} {components}></CMS>
</div>

<svelte:boundary onerror={(e) => console.error(e)}>
	<!-- <Footer recirc={true} /> -->
</svelte:boundary>

<style>
	.byline {
		position: absolute;
		top: 0;
		right: 0;
		padding: 8px;
		display: none;
	}

	.byline p {
		margin: 0;
		max-width: 10em;
		text-align: right;
		font-size: var(--14px);
	}

	.c {
		padding: 0 16px;
	}

	:global(.c p, .c h1) {
		margin: 32px auto;
		max-width: var(--grid-max-width);
	}

	:global(.c figure) {
		max-width: 800px;
	}

	@media (min-width: 960px) {
		.byline p {
			font-size: var(--16px);
		}
	}
</style>
