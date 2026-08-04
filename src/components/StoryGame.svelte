<script>
	import { tick } from "svelte";
	import { browser } from "$app/environment";
	import Game from "$components/Game.svelte";
	import Grid from "$components/Grid.svelte";
	import GameLayer from "$components/grid/GameLayer.svelte";
	import Button from "$components/ui/Button.svelte";
	import { session } from "$runes/misc.svelte.js";
	import loadCsv from "$utils/loadCsv.js";
	import levels from "$data/levels.json";

	let { prompt, played } = $props();

	const STORAGE_KEY = "pudding_mow_game";
	const level = levels.find((l) => l.id === "round2");

	let hydrated = $state(false);
	let wasDoneOnLoad = $state(false);
	let fetchedPath = $state(null);
	let fetchAttempted = $state(false);
	let replayLayer = $state();
	let skipped = $state(false);

	let display = $derived(wasDoneOnLoad ? played : prompt);

	let replayPath = $derived(
		session.storyGamePath?.length ? session.storyGamePath : fetchedPath
	);
	// hold everything back until we know whether they play or watch a replay
	let ready = $derived(hydrated && (!wasDoneOnLoad || replayPath?.length > 0));

	function onStart() {
		session.startedLevels["round2"] = true;
	}

	function restartReplay() {
		if (replayLayer) {
			replayLayer.stop();
			setTimeout(replayLayer.play, 1000);
		}
	}

	async function onFinish() {
		await reveal(500);
	}

	function onComplete(path) {
		// ran out of moves: don't count it as played, so a return visit replays
		if (path == null) {
			onFinish();
			return;
		}
		session.completedLevels["round2"] = path.length;
		session.storyGamePath = path;
		if (level.optimal != null) {
			session.levelEfficiencies["round2"] = Math.min(
				1,
				+(level.optimal / path.length).toFixed(4)
			);
		}
		onFinish();
	}

	async function reveal(uiDelay = 0, noScroll) {
		const post = document.getElementById("post");
		if (!post) return;
		post.classList.add("visible");

		if (noScroll) return;

		if (uiDelay) await new Promise((r) => setTimeout(r, uiDelay));
		await tick();
		document.getElementById("post").scrollIntoView();
	}

	async function onSkip() {
		skipped = true;
		await reveal();
	}

	$effect(() => {
		if (!browser || hydrated) return;
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			try {
				const parsed = JSON.parse(raw);
				Object.assign(session, parsed);
			} catch (e) {
				console.warn("Could not parse stored session", e);
			}
		}
		wasDoneOnLoad = session.completedLevels["round2"] > 0;
		hydrated = true;
	});

	$effect(() => {
		if (!hydrated) return;
		const snapshot = $state.snapshot(session);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
	});

	async function loadStoredPath() {
		fetchAttempted = true;
		try {
			const rows = await loadCsv(`assets/round2/${session.userId}.csv`);
			const path = rows
				.map((row) => ({
					x: +row.x,
					y: +row.y,
					t: Number.isFinite(+row.t) ? +row.t : 0
				}))
				.filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));
			if (!path.length) throw new Error("empty or malformed path");
			fetchedPath = path;
			session.storyGamePath = path;
		} catch (err) {
			console.warn("Could not load stored path", err);
			// no usable path: let them play it now
			wasDoneOnLoad = false;
		}
	}

	$effect(() => {
		if (
			fetchAttempted ||
			!hydrated ||
			!wasDoneOnLoad ||
			session.storyGamePath?.length
		)
			return;
		if (!session.userId) {
			fetchAttempted = true;
			wasDoneOnLoad = false;
			return;
		}
		loadStoredPath();
	});

	// anyone who isn't playing needs the article unhidden
	$effect(() => {
		if (hydrated && wasDoneOnLoad && replayPath?.length) reveal(0, true);
	});

	$effect(() => {
		if (replayLayer && replayPath?.length) replayLayer.play();
		return () => replayLayer?.stop();
	});
</script>

<div class="c" class:ready>
	<p>
		<strong>{display}</strong>
	</p>
	{#if ready && !wasDoneOnLoad}
		<p class="skip">
			<small>
				<Button onclick={onSkip}>skip to results</Button>
			</small>
		</p>
	{/if}
</div>

<div class="lawn" class:skipped>
	{#if ready}
		{#if !wasDoneOnLoad}
			<Game
				size={level.size}
				obstacles={level.obstacles}
				{onStart}
				{onComplete}
			/>
		{:else if replayPath?.length}
			<Grid size={level.size} obstacles={level.obstacles} started={true}>
				<GameLayer
					bind:this={replayLayer}
					replay={replayPath}
					onFinish={restartReplay}
					auto={true}
				/>
			</Grid>
		{/if}
	{/if}
</div>

<style>
	.skipped {
		visibility: hidden;
	}

	.c {
		opacity: 0;
	}

	.c.ready {
		opacity: 1;
	}

	.skip {
		display: flex;
		justify-content: center;
	}

	.lawn {
		max-width: var(--grid-max-width);
		margin: 2rem auto;
	}
</style>
