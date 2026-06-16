<script>
	import db from "$utils/supabase.js";
	import Button from "$components/ui/Button.svelte";
	import Leaderboard from "$components/game/Leaderboard.svelte";
	import { session } from "$runes/misc.svelte.js";

	function tryBonus() {
		session.phase = "bonus1";
	}

	const ROUND_IDS = ["round1", "round2"];

	let leaderboardReady = $state(false);

	$effect(() => {
		const allEfficiencies = Object.values(session.levelEfficiencies);

		const completedAllRounds = ROUND_IDS.every((id) => session.completedLevels[id]);

		// nothing to submit (no name, no scores, or didn't finish required rounds)
		if (!session.name || !allEfficiencies.length || !completedAllRounds) {
			leaderboardReady = true;
			return;
		}

		const roundEfficiencies = ROUND_IDS.map(
			(id) => session.levelEfficiencies[id]
		).filter(Boolean);
		const scoreStart =
			roundEfficiencies.reduce((a, b) => a + b, 0) / roundEfficiencies.length;
		const scoreFull =
			allEfficiencies.reduce((a, b) => a + b, 0) / allEfficiencies.length;

		// submit our score first so the fetched leaderboard reflects our rank
		db.submitScore({
			userId: session.userId,
			name: session.name,
			scoreStart: +scoreStart.toFixed(4),
			scoreFull: +scoreFull.toFixed(4)
		})
			.catch((e) => console.error("Error submitting score:", e))
			.finally(() => {
				leaderboardReady = true;
			});
	});
</script>

<section class="c">
	<Leaderboard ready={leaderboardReady} mode="full" />
	{#if session.email}
		<p>
			We’ll email <strong>{session.email}</strong> when the story drops.
		</p>
	{:else}
		<p>
			Your paths are now part of the dataset. The story drops here in a couple
			weeks. Until then, check out more from us on <a
				href="https://pudding.cool">The Pudding</a
			>.
		</p>
	{/if}
	{#if session.phase === "skip_end"}
		<div class="actions">
			<Button size="lg" onclick={tryBonus}
				>Actually, I’ll try the bonus levels</Button
			>
		</div>
	{/if}
</section>

<style>
	.c {
		max-width: var(--grid-max-width);
		margin: 2rem auto;
		padding: 1rem;
		text-align: center;
	}

	.actions {
		margin-top: 1.5rem;
	}
</style>
