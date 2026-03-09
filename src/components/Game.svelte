<script>
	import Grid from "$components/Grid.svelte";
	import Keypad from "$components/Keypad.svelte";
	import { game } from "$runes/misc.svelte.js";
	import localStore from "$runes/localStore.svelte.js";
	import server from "$utils/server.js";
	import obstacles from "$data/obstacles.json";

	const MAX_LENGTH = 1000;
	const MAX_MOVES = 200;
	const size = 10;

	const targetCount = size * size - obstacles.length;
	let storage = localStore("pudding_mowing", {});
	let position = $state([0, 0]);
	let path = $state([[0, 0]]);
	let visited = $state({ "0,0": true });
	let visitedCount = $derived(Object.keys(visited).length);
	let complete = $derived(visitedCount === targetCount);
	let exceeded = $derived(path.length >= MAX_MOVES);
	let showMessage = $derived(complete || exceeded);
	let message = $derived(
		showMessage ? (complete ? "Good job!" : "Too many moves!") : ""
	);

	function reveal(delay = 17) {
		game.active = false;
		if (complete)
			document
				.querySelectorAll("span.you")
				.forEach((el) => el.classList.add("visible"));
		else
			document
				.querySelectorAll("span.skip")
				.forEach((el) => el.classList.add("visible"));

		document.getElementById("results").classList.add("visible");

		setTimeout(() => {
			document.getElementById("results").scrollIntoView();
		}, delay);
	}

	function skip() {
		storage.value.skipped = true;
		reveal();
	}

	function onmove(key) {
		let dir;

		if (key === "ArrowUp") dir = [0, -1];
		else if (key === "ArrowDown") dir = [0, 1];
		else if (key === "ArrowLeft") dir = [-1, 0];
		else if (key === "ArrowRight") dir = [1, 0];

		let tempX = position[0] + dir[0];
		let tempY = position[1] + dir[1];

		// boundaries
		tempX = Math.max(0, Math.min(size - 1, tempX));
		tempY = Math.max(0, Math.min(size - 1, tempY));

		// don't allow movement over obstacles
		if (obstacles.includes(tempY * size + tempX)) return;

		position = [tempX, tempY];

		path.push([...position]);
		visited[position.join(",")] = true;
	}

	async function submit(alreadyCompleted) {
		try {
			const str = path.map((p) => p.join(",")).join("|");
			// TODO remove
			window.russell = JSON.stringify(path);
			if (str.length < MAX_LENGTH) {
				storage.value.path = path;
				game.path = $state.snapshot(path);
				if (!alreadyCompleted) {
					// TODO if we can do heuristic on front end, only submit if not already completed
					// const response = await server("submit", str);
					// storage.value.heuristic = response?.heuristic;
				}
			} else {
				// TODO handle too long
			}
		} catch (err) {
			console.error(err);
			// TODO handle err submission (only matters if heuristic on back end)
		}
	}

	$effect(() => {
		if (showMessage) {
			const alreadyCompleted = storage.value.completed;
			game.completed = true;
			storage.value.completed = true;
			if (complete) submit(alreadyCompleted);
			reveal(500);
		}
	});
</script>

<p class="skip">
	<small>
		<button class="link" onclick={skip}>just skip to results please</button>
	</small>
</p>

<div class="c" class:disable={!game.active}>
	<div class="inner">
		<p class="steps">moves: {path.length}</p>
		<div class="g">
			<Grid {size} {path} perspective={true} {obstacles} game={true}></Grid>
		</div>
		{#if game.active}<Keypad {onmove} active={game.active}></Keypad>{/if}
	</div>
	{#if showMessage}
		<p class="message"><strong>{message}</strong></p>
	{/if}
</div>

<style>
	.skip {
		text-align: center;
		position: relative;
		z-index: var(--z-top);
		margin: 0 auto;
		margin-top: -24px;
	}

	.c {
		position: relative;
	}

	.g {
		width: var(--grid-width);
		margin: 0 auto;
	}

	.disable {
		pointer-events: none;
	}

	.disable .inner {
		opacity: 0.2;
	}

	.message {
		position: absolute;
		top: 33%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.steps {
		margin: 32px auto 0 auto;
		max-width: var(--grid-max-width);
		text-align: center;
		font-size: var(--14px);
		color: var(--color-fg-light);
	}

	button.link {
		background: none;
		border: none;
		color: var(--color-fg-light);
		text-transform: lowercase;
		font-weight: normal;
	}
</style>
