<script>
	import Grid from "$components/Grid.svelte";
	import Keypad from "$components/Keypad.svelte";
	import { SvelteSet } from "svelte/reactivity";
	import { classify } from "$utils/classifier.js";

	// obstacles is an array of [{x,y}]
	let {
		obstacles = [],
		size = 10,
		classifier = false,
		onComplete,
		onExceed
	} = $props();

	const predictionMoves = 15;

	let maxMoves = $derived(size * size * 2);
	let targetCount = $derived(size * size - obstacles.length);
	let startTime = $state(null);
	let path = $state([{ x: 0, y: 0, t: 0 }]);
	let position = $derived(path[path.length - 1]);
	let visited = new SvelteSet(["0,0"]);

	function onStart() {
		startTime = Date.now();
	}

	let visitedCount = $derived(visited.size);
	let completed = $derived(visitedCount === targetCount);
	let exceeded = $derived(path.length >= maxMoves);
	let active = $derived(!completed && !exceeded);
	let showMessage = $derived(!active);
	let message = $derived(
		showMessage ? (completed ? "Complete!" : "Too many moves!") : ""
	);
	let classification = $derived(classify(path));

	$effect(() => {
		if (completed) onComplete(path);
	});

	$effect(() => {
		if (exceeded) onExceed();
	});

	function onmove(key) {
		if (!startTime) return;

		let dir;

		if (key === "ArrowUp") dir = [0, -1];
		else if (key === "ArrowDown") dir = [0, 1];
		else if (key === "ArrowLeft") dir = [-1, 0];
		else if (key === "ArrowRight") dir = [1, 0];

		let tempX = position.x + dir[0];
		let tempY = position.y + dir[1];

		// boundaries
		tempX = Math.max(0, Math.min(size - 1, tempX));
		tempY = Math.max(0, Math.min(size - 1, tempY));

		// don't allow movement over obstacles
		if (obstacles.some(({ x, y }) => x === tempX && y === tempY)) return;

		// don't allow movement if it doesn't change position
		if (tempX === position.x && tempY === position.y) return;

		const t = Date.now() - startTime;
		path.push({ x: tempX, y: tempY, t });
		visited.add(`${tempX},${tempY}`);
	}
</script>

<div class="c" class:disable={!active}>
	<div class="inner">
		<div class="steps">
			<span>moves: {path.length}</span>
			{#if classifier}
				<span>
					{#if path.length > predictionMoves}
						predicted: {classification.label}
					{:else}
						make at least {predictionMoves} moves to get a prediction
					{/if}
				</span>
			{/if}
		</div>
		<div class="g">
			<Grid {size} {path} perspective={false} {obstacles} game={true}></Grid>
		</div>
		{#if active}<Keypad {onmove} {active}></Keypad>{/if}
	</div>
	{#if showMessage}
		<p class="message"><strong>{message}</strong></p>
	{/if}
	{#if !startTime}
		<div class="start">
			<button onclick={onStart}>Start</button>
		</div>
	{/if}
</div>

<style>
	.c {
		position: relative;
		margin: 2rem auto;
	}

	.g {
		max-width: var(--grid-max-width);
		width: var(--grid-width);
		margin: 0 auto;
		display: flex;
		justify-content: center;
	}

	.disable {
		pointer-events: none;
	}

	.disable .inner {
		opacity: 0.2;
	}

	.message {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.start {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(255, 255, 255, 0.9);
	}

	.steps {
		margin: 2rem auto 0 auto;
		max-width: var(--grid-max-width);
		text-align: center;
		font-size: var(--14px);
		color: var(--color-fg-light);
	}
</style>
