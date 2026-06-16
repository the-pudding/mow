<script>
	import Button from "$components/ui/Button.svelte";
	import Leaderboard from "$components/game/Leaderboard.svelte";
	import Demographics from "$components/game/Demographics.svelte";
import db from "$utils/supabase.js";
	import { session } from "$runes/misc.svelte.js";

	let step = $state(session.demographics ? "reveal" : "survey");

	$effect(() => {
		step;
		window.scrollTo({ top: 0, behavior: "instant" });
	});

	async function persistUser() {
		try {
			await db.upsertUser({
				id: session.userId,
				name: session.name,
				demographics: session.demographics
			});
		} catch (error) {
			console.error("Error saving user:", error);
		}
	}

	async function onSubmitSurvey({ answers, email }) {
		session.demographics = answers;
		session.email = email;
		step = "reveal";
		await persistUser();
		try {
			await db.insertEmail({ id: session.userId, email: email });
		} catch (error) {
			console.error("Error saving email:", error);
		}
	}

	async function onSkipSurvey() {
		step = "reveal";
		await persistUser();
	}

	function tryBonus() {
		session.phase = "bonus1";
	}

	function exit() {
		session.phase = "skip_end";
	}
</script>

<section class="c">
	{#if step === "survey"}
		<Demographics onSubmit={onSubmitSurvey} onSkip={onSkipSurvey} />
	{:else if step === "reveal"}
		<Leaderboard />
		<div class="pitch">
			<h2>Can you top the leaderboard?</h2>
			<p>Play a few harder bonus rounds to test your skills.</p>
			<div class="actions">
				<Button onclick={tryBonus}>Yes, more</Button>
				<Button variant="ghost" onclick={exit}>I’m done</Button>
			</div>
		</div>
	{/if}
</section>

<style>
	.c {
		max-width: var(--grid-max-width);
		margin: 2rem auto;
		padding: 1rem;
	}

	.pitch {
		text-align: center;
		margin-top: 2rem;
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		justify-content: center;
		margin-top: 1.5rem;
	}
</style>
