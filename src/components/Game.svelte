<script>
	import Grid from "$components/Grid.svelte";
	import GameLayer from "$components/grid/GameLayer.svelte";
	import Keypad from "$components/Keypad.svelte";
	import Button from "$components/ui/Button.svelte";
	import { SvelteSet } from "svelte/reactivity";
	import { classify } from "$utils/classifier.js";
	import { fade } from "svelte/transition";

	// obstacles is an array of [{x,y}]
	let {
		obstacles = [],
		size = 10,
		classifier = false,
		onComplete,
		onStart: onStartProp,
		// display-only mode: no keypad, no start button, no move counter
		controls = true,
		showCharacter = true,
		fill = false
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
	// without controls there is nothing to press, so the lawn shows right away
	let started = $derived(!controls || startTime != null);

	function onStart() {
		startTime = Date.now();
		onStartProp?.();
	}

	// nothing can move without controls, so don't mow the starting cell
	let displayPath = $derived(controls ? path : []);

	let visitedCount = $derived(visited.size);
	let completed = $derived(visitedCount === targetCount);
	let exceeded = $derived(path.length >= maxMoves);
	// once true, the end message overlays and the grid dims
	let revealed = $state(false);
	// once true, the parent has been notified (advances the phase)
	let notified = $state(false);
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
			const id = setTimeout(() => (revealed = true), 100);
			return () => clearTimeout(id);
		}
	});

	// running out of moves ends immediately, no pause
	$effect(() => {
		if (exceeded && !revealed) revealed = true;
	});

	// let the message + dimmed grid sit for a beat before notifying the parent
	$effect(() => {
		if (revealed && !notified) {
			const id = setTimeout(() => {
				notified = true;
				onComplete(completed ? path : undefined);
			}, 1500);
			return () => clearTimeout(id);
		}
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
		{#if controls}
			<div class="steps">
				<span>move: {path.length}</span>
			</div>
		{/if}
		<div class="g">
			<div class="grid">
				<Grid {size} {obstacles} {started} {fill}>
					<GameLayer path={displayPath} {flipCharacter} {showCharacter} />
				</Grid>
			</div>
			{#if showMessage}
				<p class="message" transition:fade={{ duration: 100 }}>
					<strong>{message}</strong>
				</p>
			{/if}
			{#if controls && !startTime}
				<div class="start">
					<Button size="lg" onclick={onStart}>Start</Button>
				</div>
			{/if}
		</div>
		{#if controls && active}<Keypad {onmove} {active}></Keypad>{/if}
	</div>
</div>

<style>
	.c {
		position: relative;
		margin: 2rem auto;
	}

	.g {
		max-width: var(--grid-max-width);
		margin: 0 auto;
		position: relative;
	}

	.disable {
		pointer-events: none;
	}

	.dim .grid {
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
		top: 50%;
		left: 0;
		transform: translate(0, -50%);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.steps {
		margin: 2rem auto 0 auto;
		max-width: var(--grid-max-width);
		text-align: center;
		font-size: var(--14px);
	}
</style>
