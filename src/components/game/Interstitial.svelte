<script>
	import Button from "$components/ui/Button.svelte";
	import LeaderboardReveal from "$components/game/LeaderboardReveal.svelte";
	import Demographics from "$components/game/Demographics.svelte";
	import NameCapture from "$components/game/NameCapture.svelte";
	import db from "$utils/supabase.js";
	import { session } from "$runes/misc.svelte.js";

	let step = $state(
		session.demographics ? (session.name ? "reveal" : "name") : "survey"
	);

	async function persistUser() {
		try {
			await db.upsertUser({
				id: session.userId,
				email: session.email,
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
		step = "name";
		await persistUser();
	}

	async function onSkipSurvey() {
		step = "name";
		await persistUser();
	}

	async function onSubmitName(name) {
		session.name = name;
		await persistUser();
		step = "reveal";
	}

	async function onSkipName() {
		await persistUser();
		step = "reveal";
	}

	function tryBonus() {
		session.phase = "bonus_intro";
	}

	function exit() {
		session.phase = "skip_end";
	}
</script>

<section class="c">
	{#if step === "survey"}
		<Demographics onSubmit={onSubmitSurvey} onSkip={onSkipSurvey} />
	{:else if step === "name"}
		<NameCapture onSubmit={onSubmitName} onSkip={onSkipName} />
	{:else if step === "reveal"}
		<LeaderboardReveal />
		<div class="pitch">
			<h2>Can you top the leaderboard?</h2>
			<p>A few harder bonus rounds for the adventurous.</p>
			<div class="actions">
				<Button variant="primary" onclick={tryBonus}>Yes, more</Button>
				<Button variant="ghost" onclick={exit}>No, I’m done</Button>
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
		gap: 0.75rem;
		justify-content: center;
		margin-top: 1.5rem;
	}
</style>
