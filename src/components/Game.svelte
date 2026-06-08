<script>
	import Grid from "$components/Grid.svelte";
	import Keypad from "$components/Keypad.svelte";
	import Button from "$components/ui/Button.svelte";
	import { SvelteSet } from "svelte/reactivity";
	import { classify } from "$utils/classifier.js";

	// obstacles is an array of [{x,y}]
	let {
		obstacles = [],
		size = 10,
		classifier = false,
		onComplete,
		onStart: onStartProp
	} = $props();

	// const predictionMoves = 15;

	let maxMoves = $derived(size * size * 2);
	let targetCount = $derived(size * size - obstacles.length);
	let startTime = $state(null);
	let path = $state([{ x: 0, y: 0, t: 0 }]);
	let position = $derived(path[path.length - 1]);
	let visited = new SvelteSet(["0,0"]);
	let revisited = new SvelteSet();
	let flipCharacter = $state(true);
	let started = $derived(startTime != null);

	function onStart() {
		startTime = Date.now();
		onStartProp?.();
	}

	let visitedCount = $derived(visited.size);
	let completed = $derived(visitedCount === targetCount);
	let exceeded = $derived(path.length >= maxMoves);
	// once true, the grid is revealed and the end message + onComplete fire
	let revealed = $state(false);
	// no longer accepting input (completed or exceeded)
	let active = $derived(!completed && !exceeded);
	// brief pause showing the finished grid before the message appears
	let finishing = $derived(completed && !revealed);
	let showMessage = $derived(revealed);
	let message = $derived(
		showMessage ? (completed ? "Complete!" : "Too many moves!") : ""
	);
	let classification = $derived(classify(path));

	// pause on the completed grid before revealing the result
	$effect(() => {
		if (completed && !revealed) {
			const id = setTimeout(() => (revealed = true), 500);
			return () => clearTimeout(id);
		}
	});

	// running out of moves ends immediately, no pause
	$effect(() => {
		if (exceeded && !revealed) revealed = true;
	});

	$effect(() => {
		if (revealed) onComplete(completed ? path : undefined);
	});

	function onmove(key) {
		if (!startTime) return;

		let dir;

		if (key === "ArrowUp") dir = [0, -1];
		else if (key === "ArrowDown") dir = [0, 1];
		else if (key === "ArrowLeft") {
			dir = [-1, 0];
			flipCharacter = false;
		} else if (key === "ArrowRight") {
			dir = [1, 0];
			flipCharacter = true;
		}

		let tempX = position.x + dir[0];
		let tempY = position.y + dir[1];

		// boundaries
		tempX = Math.max(0, Math.min(size - 1, tempX));
		tempY = Math.max(0, Math.min(size - 1, tempY));

		// don't allow movement over obstacles
		if (obstacles.some(({ x, y }) => x === tempX && y === tempY)) return;

		// don't allow movement if it doesn't change position
		if (tempX === position.x && tempY === position.y) return;

		const cellKey = `${tempX},${tempY}`;
		const t = Date.now() - startTime;
		path.push({ x: tempX, y: tempY, t });
		if (visited.has(cellKey)) revisited.add(cellKey);
		visited.add(cellKey);
	}
</script>

<div class="c" class:disable={!active} class:dim={showMessage}>
	<div class="inner">
		<div class="steps">
			<span>moves: {path.length}</span>
			<!-- {#if classifier}
				<span>
					{#if path.length > predictionMoves}
						predicted: {classification.label}
					{:else}
						make at least {predictionMoves} moves to get a prediction
					{/if}
				</span>
			{/if} -->
		</div>
		<div class="g">
			<Grid
				{size}
				{path}
				{revisited}
				perspective={false}
				{obstacles}
				game={true}
				{flipCharacter}
				{started}
			></Grid>
		</div>
		{#if active}<Keypad {onmove} {active}></Keypad>{/if}
	</div>
	{#if showMessage}
		<p class="message"><strong>{message}</strong></p>
	{/if}
	{#if !startTime}
		<div class="start">
			<Button size="lg" onclick={onStart}>Start</Button>
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
		margin: 0 auto;
	}

	.disable {
		pointer-events: none;
	}

	.dim .inner {
		opacity: 0.2;
		transition: opacity 0.3s ease;
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
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.start p {
		margin-top: 0.5rem;
	}

	.steps {
		margin: 2rem auto 0 auto;
		max-width: var(--grid-max-width);
		text-align: center;
		font-size: var(--14px);
	}
</style>
