<script>
	import { getContext } from "svelte";
	import StoryGame from "$components/StoryGame.svelte";
	import CMS from "$components/helpers/CMS.svelte";
	import Img from "$components/Img.svelte";
	import Video from "$components/Video.svelte";
	import YourResult from "$components/YourResult.svelte";
	import Compare from "$components/Compare.svelte";
	import Tour from "$components/Tour.svelte";
	import Round2Moves from "$components/Round2Moves.svelte";
	import Sample from "$components/Sample.svelte";
	import SixLawns from "$components/SixLawns.svelte";
	import Optimality from "$components/Optimality.svelte";
	import OptimalityVsTime from "$components/OptimalityVsTime.svelte";
	import TSPLayer from "$components/grid/TSPLayer.svelte";
	import Study from "$components/Study.svelte";
	import LevelFour from "$components/LevelFour.svelte";
	import LevelFourHeat from "$components/LevelFourHeat.svelte";
	import TwoMowers from "$components/TwoMowers.svelte";

	const copy = getContext("copy");
	const { body } = copy;
	const components = {
		Video,
		Img,
		StoryGame,
		YourResult,
		Tour,
		Compare,
		Round2Moves,
		Sample,
		SixLawns,
		Optimality,
		OptimalityVsTime,
		TSPLayer,
		Study,
		LevelFour,
		LevelFourHeat,
		TwoMowers
	};
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
		font-size: clamp(var(--32px, 32px), 10vw, var(--48px, 48px));
		font-weight: 900;
		line-height: 1;
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
