<script>
	import { getContext } from "svelte";
	import StoryGame from "$components/StoryGame.svelte";
	import Img from "$components/Img.svelte";
	import Video from "$components/Video.svelte";
	import YourResult from "$components/YourResult.svelte";
	import CMS from "$components/helpers/CMS.svelte";

	const copy = getContext("copy");
	const { body } = copy;
	const components = { Video, Img, StoryGame, YourResult };
</script>

<div class="c">
	<h1>{@html copy.meta.title}</h1>
	<div class="byline">
		<p><small>{@html copy.meta.byline}</small></p>
		<img src="assets/images/mower.png" alt="person mowing lawn 8-bit art" />
	</div>

	<CMS {body} {components}></CMS>
</div>

<style>
	.c {
		padding: 0 1rem;
	}

	h1 {
		font-size: clamp(var(--36px, 36px), 10vw, var(--64px, 64px));
		font-weight: 900;
		line-height: 1;
		text-transform: uppercase;
	}

	.byline {
		margin-bottom: 5rem;
	}

	.byline p {
		text-align: center;
	}

	.byline img {
		display: block;
		margin: 0 auto;
		width: 100%;
		max-width: 4rem;
		transform: scaleX(-1);
	}
</style>
