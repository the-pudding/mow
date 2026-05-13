<script>
	import { browser } from "$app/environment";
	import { page } from "$app/state";
	import Meta from "$components/Meta.svelte";
	import Intro from "$components/game/Intro.svelte";
	import Tutorial from "$components/game/Tutorial.svelte";
	import Round from "$components/game/Round.svelte";
	import Interstitial from "$components/game/Interstitial.svelte";
	import BonusIntro from "$components/game/BonusIntro.svelte";
	import Bonus from "$components/game/Bonus.svelte";
	import End from "$components/game/End.svelte";
	import { session } from "$runes/misc.svelte.js";

	const STORAGE_KEY = "pudding_mow_session";

	const title = "Lawn mowing experiment";
	const description =
		"Mow a series of lawns as efficiently as you can. We will publish the analysis in a couple weeks.";

	let hydrated = $state(false);
	// is not pudding.cool
	// let dev = !page.url.hostname.includes("pudding.cool");
	let dev = false;

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

<Meta {title} {description} />

<div class="page">
	{#if session.phase === "intro"}
		<Intro />
	{:else if session.phase === "tutorial"}
		<Tutorial />
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
			startMessage="Last one. Bigger lawn."
			nextPhase="interstitial"
		/>
	{:else if session.phase === "interstitial"}
		<Interstitial />
	{:else if session.phase === "bonus_intro"}
		<BonusIntro />
	{:else if session.phase === "bonus"}
		<Bonus />
	{:else if session.phase === "end"}
		<End />
	{/if}
</div>

<style>
	.page {
		margin-bottom: 4rem;
	}
</style>
