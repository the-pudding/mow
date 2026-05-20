<script>
	import { browser } from "$app/environment";

	import Meta from "$components/Meta.svelte";
	import Intro from "$components/game/Intro.svelte";

	import Round from "$components/game/Round.svelte";
	import Interstitial from "$components/game/Interstitial.svelte";
	import Bonus from "$components/game/Bonus.svelte";
	import End from "$components/game/End.svelte";
	import { session } from "$runes/misc.svelte.js";

	const preloadFont = [
		"https://pudding.cool/assets/fonts/inconsolata/inconsolata-v32-latin-regular.woff2",
		"https://pudding.cool/assets/fonts/inconsolata/inconsolata-v32-latin-700.woff2"
	];

	const STORAGE_KEY = "pudding_mow_game";

	const title = "Lawn mowing experiment";
	const description =
		"Mow a series of lawns as efficiently as you can. We will publish the analysis in a couple weeks.";

	let hydrated = $state(false);

	const dev = browser
		? !window.location.hostname.includes("pudding.cool") &&
			!window.location.hostname.includes("citizencodex.com")
		: true;

	let instructions = $derived(
		session.platform === "desktop" ? "arrow keys" : "on-screen keyboard"
	);

	let tutorialText = $derived(
		`The goal: Mow every green tile in as few moves as possible. Time doesn’t matter. Gray tiles are obstacles you can’t cross. You can retrace your steps, but try to be efficient. Use the ${instructions} to move.`
	);

	$effect(() => {
		if (dev) console.log("dev mode: skipping hydration and persistence");
	});

	$effect(() => {
		if (!browser) return;
		if (dev) {
			localStorage.removeItem(STORAGE_KEY);
		} else {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				try {
					const parsed = JSON.parse(raw);
					Object.assign(session, parsed);
				} catch (e) {
					console.warn("Could not parse stored session", e);
				}
			}
		}
		hydrated = true;
	});

	$effect(() => {
		if (!hydrated) return;
		if (dev) return;
		const snapshot = $state.snapshot(session);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
	});
</script>

<Meta {title} {description} {preloadFont} />

<div class="page">
	{#if session.phase === "intro"}
		<Intro />
	{:else if session.phase === "tutorial"}
		<Round
			id="tutorial"
			label="Tutorial"
			startMessage={tutorialText}
			nextPhase="round1"
		/>
	{:else if session.phase === "round1"}
		<Round
			id="round1"
			label="Round 1 of 2"
			startMessage="Now we’re recording. Do your best."
			nextPhase="round2"
		/>
	{:else if session.phase === "round2"}
		<Round
			id="round2"
			label="Round 2 of 2"
			startMessage="Last one! A little bigger."
			nextPhase="interstitial"
		/>
	{:else if session.phase === "interstitial"}
		<Interstitial />
	{:else if session.phase === "bonus1"}
		<Round
			id="bonus1"
			label="Round 3 of 5"
			startMessage=""
			nextPhase="bonus2"
		/>
	{:else if session.phase === "bonus2"}
		<Round
			id="bonus2"
			label="Round 4 of 5"
			startMessage=""
			nextPhase="bonus3"
		/>
	{:else if session.phase === "bonus3"}
		<Round id="bonus3" label="Round 5 of 5" startMessage="" nextPhase="end" />
	{:else if session.phase === "end" || session.phase === "skip_end"}
		<End />
	{/if}
</div>

<style>
	.page {
		margin-bottom: 4rem;
	}
</style>
