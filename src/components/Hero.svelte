<script>
	import { tick } from "svelte";
	import { game } from "$runes/misc.svelte.js";
	import Game from "$components/Game.svelte";
	import server from "$utils/server.js";
	import localStore from "$runes/localStore.svelte.js";
	let storage = localStore("pudding_mowing", {});

	async function reveal(uiDelay = 0) {
		game.active = false;
		if (complete)
			document
				.querySelectorAll("span.you")
				.forEach((el) => el.classList.add("visible"));
		else
			document
				.querySelectorAll("span.skip")
				.forEach((el) => el.classList.add("visible"));

		document.getElementById("post").classList.add("visible");

		if (uiDelay) await new Promise((r) => setTimeout(r, uiDelay));
		await tick();
		document.getElementById("post").scrollIntoView();
	}

	function skip() {
		storage.value.skipped = true;
		reveal();
	}

	async function submit(alreadyCompleted) {
		try {
			const str = path.map((p) => p.join(",")).join("|");
			// TODO remove
			// window.russell = JSON.stringify(path);
			storage.value.path = path;
			game.path = $state.snapshot(path);
			if (!alreadyCompleted) {
				// TODO if we can do heuristic on front end, only submit if not already completed
				// const response = await server("submit", str);
				// storage.value.heuristic = response?.heuristic;
			} else {
				// TODO handle too long
			}
		} catch (err) {
			console.error(err);
			// TODO handle err submission (only matters if heuristic on back end)
		}
	}

	// $effect(() => {
	// 	if (showMessage) {
	// 		const alreadyCompleted = storage.value.completed;
	// 		game.completed = true;
	// 		storage.value.completed = true;
	// 		if (complete) submit(alreadyCompleted);
	// 		reveal(500);
	// 	}
	// });
</script>

<p class="skip">
	<small>
		<button class="link" onclick={skip}>just skip to results please</button>
	</small>
</p>

<style>
	.skip {
		text-align: center;
		position: relative;
		z-index: var(--z-top);
		margin: 0 auto;
		margin-top: -24px;
	}

	button.link {
		background: none;
		border: none;
		color: var(--color-fg-light);
		text-transform: lowercase;
		font-weight: normal;
	}
</style>
