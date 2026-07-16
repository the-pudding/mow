<script>
	import { tick } from "svelte";
	import { browser } from "$app/environment";
	import { base } from "$app/paths";
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
	let replayPath = $derived(session.storyGamePath ?? fetchedPath);

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
		if (path == null) {
			session.completedLevels["round2"] = 0;
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
		// game.active = false;
		// if (complete)
		// 	document
		// 		.querySelectorAll("span.you")
		// 		.forEach((el) => el.classList.add("visible"));
		// else
		// 	document
		// 		.querySelectorAll("span.skip")
		// 		.forEach((el) => el.classList.add("visible"));

		document.getElementById("post").classList.add("visible");

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
				console.log(parsed);
				Object.assign(session, parsed);
			} catch (e) {
				console.warn("Could not parse stored session", e);
			}
		}
		wasDoneOnLoad = session.completedLevels["round2"] != null;
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
			const rows = await loadCsv(`${base}/assets/users/${session.userId}.csv`);
			fetchedPath = rows.map((row) => ({
				x: +row.x,
				y: +row.y,
				t: +row.t
			}));
			session.storyGamePath = fetchedPath;
			reveal(0, true);
		} catch (err) {
			console.warn("Could not load stored path", err);
		}
	}

	$effect(() => {
		if (
			fetchAttempted ||
			!hydrated ||
			!wasDoneOnLoad ||
			session.storyGamePath ||
			!session.userId
		)
			return;
		loadStoredPath();
	});

	$effect(() => {
		if (replayLayer && replayPath?.length) replayLayer.play();
		return () => replayLayer?.stop();
	});
</script>

<div class="c">
	<p>
		<strong>{display}</strong>
	</p>
	{#if !wasDoneOnLoad}
		<p class="skip">
			<small>
				<Button variant="link" onclick={onSkip}>skip to results</Button>
			</small>
		</p>
	{/if}
</div>

<div class="lawn" class:skipped>
	{#if hydrated}
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
				/>
			</Grid>
		{/if}
	{/if}
</div>

<style>
	.skipped {
		visibility: hidden;
	}

	.lawn {
		max-width: var(--grid-max-width);
		margin: 2rem auto;
	}

	.c :global(strong) {
		color: var(--color-yellow);
	}
</style>
