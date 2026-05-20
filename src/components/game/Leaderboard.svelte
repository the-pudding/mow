<script>
	import db from "$utils/supabase.js";
	import { session } from "$runes/misc.svelte.js";

	const ROUND_IDS = ["round1", "round2"];
	const ALL_IDS = ["round1", "round2", "bonus1", "bonus2", "bonus3"];

	// mode: "start" = rounds 1+2 only, "full" = all rounds including bonus
	let { ready = true, mode = "start" } = $props();

	const levelIds = $derived(mode === "full" ? ALL_IDS : ROUND_IDS);
	const scoreField = $derived(mode === "full" ? "score_full" : "score_start");

	const yourScore = $derived.by(() => {
		const vals = levelIds
			.map((id) => session.levelEfficiencies[id])
			.filter(Boolean);
		if (!vals.length) return null;
		return +((vals.reduce((a, b) => a + b, 0) / vals.length) * 100).toFixed(1);
	});

	let topScores = $state([]);
	let loading = $state(true);

	$effect(() => {
		if (!ready) return;
		db.getTopScores()
			.then((scores) => {
				topScores = scores;
			})
			.catch((e) => console.error("Error loading leaderboard:", e))
			.finally(() => {
				loading = false;
			});
	});

	const topScore = $derived(
		topScores.length ? +(topScores[0][scoreField] * 100).toFixed(1) : null
	);
</script>

<div class="c">
	<h2>Thanks for mowing!</h2>
	{#if yourScore !== null}
		<p>
			You mowed <strong>{yourScore}% optimally</strong>.<br />
			{#if topScore !== null && yourScore < topScore}
				That’s {(topScore - yourScore).toFixed(1)}% behind the top player.
			{:else if topScore !== null}
				That’s top of the leaderboard so far.
			{/if}
		</p>
	{/if}

	{#if loading}
		<p class="loading">Loading leaderboard...</p>
	{:else if topScores.length}
		<table>
			<thead>
				<tr>
					<th>Rank</th>
					<th>Name</th>
					<th>% Optimal</th>
				</tr>
			</thead>
			<tbody>
				{#each topScores as score, i}
					<tr class:you={score.name === session.name}>
						<td>{i + 1}</td>
						<td>{score.name}</td>
						<td>{+(score[scoreField] * 100).toFixed(1)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if mode === "start"}
			<p class="note">
				<em><small><sup>*</sup>Through first two rounds</small></em>
			</p>
		{/if}
	{/if}
</div>

<style>
	.c {
		text-align: center;
	}

	.loading {
		font-size: var(--14px);
	}

	table {
		margin: 1.5rem auto;
		max-width: 20rem;
		font-size: var(--14px);
	}

	th,
	td {
		padding: 0.5rem;
		text-align: left;
	}

	th:last-of-type,
	td:last-of-type {
		text-align: right;
		width: 6rem;
	}

	th:first-of-type,
	td:first-of-type {
		text-align: right;
		width: 3.5rem;
	}

	th {
		font-weight: 700;
		text-transform: uppercase;
	}

	tr td {
		border-top: 1px solid var(--color-fg);
	}

	tr.you td {
		font-weight: 700;
	}
</style>
