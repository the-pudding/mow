<script>
	import { tick } from "svelte";
	import { browser } from "$app/environment";
	import Game from "$components/Game.svelte";
	import Button from "$components/ui/Button.svelte";
	import { session } from "$runes/misc.svelte.js";
	import levels from "$data/levels.json";

	let { prompt, played } = $props();

	const STORAGE_KEY = "pudding_mow_game";
	const level = levels.find((l) => l.id === "round2");

	let hydrated = $state(false);

	let done = $derived(session.completedLevels["round2"] != null);
	let display = $derived(done ? played : prompt);

	function onStart() {
		session.startedLevels["round2"] = true;
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
		if (level.optimal != null) {
			session.levelEfficiencies["round2"] = Math.min(
				1,
				+(level.optimal / path.length).toFixed(4)
			);
		}
		onFinish();
	}

	async function reveal(uiDelay = 0) {
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

		if (uiDelay) await new Promise((r) => setTimeout(r, uiDelay));
		await tick();
		document.getElementById("post").scrollIntoView();
	}

	async function onSkip() {
		await reveal();
	}

	$effect(() => {
		if (!browser) return;
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			try {
				const parsed = JSON.parse(raw);
				Object.assign(session, parsed);
			} catch (e) {
				console.warn("Could not parse stored session", e);
			}
		}
		hydrated = true;
	});

	$effect(() => {
		if (!hydrated) return;
		const snapshot = $state.snapshot(session);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
	});
</script>

<div class="c">
	<p class="big">
		{display}
	</p>
	<p class="skip">
		<small>
			<Button variant="link" onclick={onSkip}>skip to results</Button>
		</small>
	</p>
</div>

{#if hydrated && !done}
	<Game size={level.size} obstacles={level.obstacles} {onStart} {onComplete} />
{/if}

<style>
	p {
		text-align: center;
	}
</style>
