<script>
	import Game from "$components/Game.svelte";
	import db from "$utils/supabase.js";
	import { session, freshStartedLevels } from "$runes/misc.svelte.js";
	import levels from "$data/levels.json";

	let { id, label, startMessage, nextPhase } = $props();

	const level = levels.find((l) => l.id === id);

	let saving = $state(false);

	$effect.pre(() => {
		if (session.completedLevels[id]) {
			session.phase = nextPhase;
		}
	});

	function onStart() {
		session.startedLevels[id] = true;
		freshStartedLevels.add(id);
	}

	async function onComplete(path) {
		const isReturnVisitor =
			session.startedLevels[id] && !freshStartedLevels.has(id);
		const alreadyCompleted = session.completedLevels[id];
		session.completedLevels[id] = path.length;
		if (level.optimal != null) {
			session.levelEfficiencies[id] = Math.min(
				1,
				+(level.optimal / path.length).toFixed(4)
			);
		}
		saving = true;
		try {
			if (!isReturnVisitor && !alreadyCompleted) {
				await db.insertAttempt({
					user: session.userId,
					level: id,
					platform: session.platform,
					result: path
				});
			}
		} catch (error) {
			console.error("Error saving attempt:", error);
		} finally {
			saving = false;
			setTimeout(() => {
				session.phase = nextPhase;
			}, 1500);
		}
	}
</script>

<section class="c">
	<p class="label"><strong>{label}</strong></p>
	<p>{startMessage}</p>
	<Game size={level.size} obstacles={level.obstacles} {onStart} {onComplete} />
	{#if saving}
		<p class="saving"><small>Saving...</small></p>
	{/if}
</section>

<style>
	.c {
		max-width: var(--grid-max-width);
		margin: 2rem auto;
		padding: 1rem;
	}

	.label {
		color: var(--color-purple);
		margin-bottom: 0.25rem;
	}

	.saving {
		text-align: center;
		color: var(--color-fg-light);
	}
</style>
