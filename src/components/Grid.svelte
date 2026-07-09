<script>
	import { browser } from "$app/environment";
	import { scaleLinear, interpolateRgb, interpolateHcl, max } from "d3";
	import { draw, fade } from "svelte/transition";
	import levels from "$data/levels.json";
	import obstacleSpriteData from "$data/obstacles.json";
	import grassSpriteData from "$data/grass.json";

	// obstacles is an array of [{x,y}]
	let {
		size,
		path = [],
		obstacles = [],
		game = false,
		replay = null,
		xray = false,
		color,
		flipCharacter,
		started,
		onFinish = null
	} = $props();

	let replayIndex = $state(0);
	let replayFlip = $state(true);
	let intervalId;

	let displayPath = $derived(replay ? replay.slice(0, replayIndex + 1) : path);

	const REPLAY_STEP_MS = 120;

	export const play = () => {
		if (!replay?.length) return;
		clearTimeout(intervalId);
		replayIndex = 0;
		replayFlip = true;

		if (replay.length === 1) {
			onFinish?.();
			return;
		}

		const step = () => {
			const curr = replay[replayIndex];
			const next = replay[replayIndex + 1];
			if (next) {
				if (next.x > curr.x) replayFlip = true;
				else if (next.x < curr.x) replayFlip = false;
			}
			replayIndex++;
			if (replayIndex >= replay.length - 1) {
				onFinish?.();
				return;
			}

			const stepCurr = replay[replayIndex];
			const stepNext = replay[replayIndex + 1];
			const delay =
				typeof stepCurr?.t === "number" && typeof stepNext?.t === "number"
					? stepNext.t - stepCurr.t
					: REPLAY_STEP_MS;
			intervalId = setTimeout(step, delay);
		};

		const first = replay[0];
		const second = replay[1];
		const delay =
			typeof first?.t === "number" && typeof second?.t === "number"
				? second.t - first.t
				: REPLAY_STEP_MS;
		intervalId = setTimeout(step, delay);
	};

	export const stop = () => clearTimeout(intervalId);

	const MAX_GRID_SIZE = max(levels, (l) => l.size) || 10;

	const obstacleFrames = Object.values(obstacleSpriteData.frames);
	const numObstacleFrames = obstacleFrames.length;

	const grassTags = Object.fromEntries(
		grassSpriteData.meta.frameTags.map((t) => [t.name, t])
	);
	const numGrassFrames = Object.keys(grassSpriteData.frames).length;
	const grassVariants = grassTags.long.to - grassTags.long.from + 1;

	const colorScale = $state({
		user: scaleLinear().interpolate(interpolateHcl).range(["fff", "#fff"]),
		optimal: scaleLinear().interpolate(interpolateHcl).range(["fff", "#fff"])
	});

	let defaultCells = $derived(
		Array(size ** 2)
			.fill()
			.map((_, i) => ({
				pos: { x: i % size, y: Math.floor(i / size) },
				visited: false
			}))
			.map((c) => ({
				...c,
				obstacle: obstacles.some(({ x, y }) => x === c.pos.x && y === c.pos.y),
				spriteFrame: Math.floor(Math.random() * numObstacleFrames),
				grassVariant: Math.floor(Math.random() * grassVariants)
			}))
	);

	let cells = $derived.by(() => {
		const visitedSet = new Set(displayPath.map(({ x, y }) => `${x},${y}`));
		const all = defaultCells.map((c) => ({
			...c,
			visited: visitedSet.has(`${c.pos.x},${c.pos.y}`)
		}));
		return all;
	});

	let latest = $derived(displayPath[displayPath.length - 1] || { x: 0, y: 0 });
	let offsetWidth = $state(0);
	let visualGridSize = $derived(Math.max(size, 8));
	let figureWidth = $derived(Math.round((size / visualGridSize) * offsetWidth));
	let nodes = $derived(!game);
	let animating = $state(false);

	let pathD = $derived.by(() => {
		const str = displayPath.map(({ x, y }, i) => {
			const x1 = x + 0.5;
			const y1 = y + 0.5;
			const x2 = (displayPath[i + 1] ? displayPath[i + 1].x : x) + 0.5;
			const y2 = (displayPath[i + 1] ? displayPath[i + 1].y : y) + 0.5;
			return `M ${x1} ${y1} L ${x2} ${y2}`;
		});

		return str.join("");
	});

	export const animate = () => {
		animating = true;
	};

	export const reset = () => {
		animating = false;
	};
</script>

<div class="measure" bind:offsetWidth aria-hidden="true"></div>
<figure
	style="--size: {size}; width: {figureWidth}px; --grass-bg-size: {numGrassFrames *
		100}% 100%; --obstacle-bg-size: {numObstacleFrames * 100}% 100%;"
	class:nodes
	class:started
>
	<div class="inner">
		{#if xray && path.length > 1}
			<svg viewBox="0 0 {size} {size}">
				{#if animating}
					{#each path as { x, y }, i (i)}
						{@const x1 = x + 0.5}
						{@const y1 = y + 0.5}
						{@const x2 = (path[i + 1] ? path[i + 1].x : x) + 0.5}
						{@const y2 = (path[i + 1] ? path[i + 1].y : y) + 0.5}
						<path
							in:fade|global={{
								delay: i * REPLAY_STEP_MS,
								duration: REPLAY_STEP_MS
							}}
							out:fade|global={{ duration: 0 }}
							class="line"
							d={`M ${x1} ${y1} L ${x2} ${y2}`}
							style:stroke={colorScale[color](i / path.length)}
						></path>
					{/each}
				{/if}
			</svg>
		{/if}

		<div class="grid">
			{#each cells as { obstacle, visited, pos, spriteFrame, grassVariant }}
				{@const x = pos[0]}
				{@const y = pos[1]}
				{@const active = x === latest.x && y === latest.y}
				{@const grassFrame = visited
					? grassTags.short.from + grassVariant
					: grassTags.long.from + grassVariant}
				<div
					class="cell"
					class:obstacle
					class:visited
					class:active
					data-x={x}
					data-y={y}
					style={`--grass-x: ${(grassFrame / (numGrassFrames - 1)) * 100}%${obstacle ? `; --sprite-x: ${(spriteFrame / (numObstacleFrames - 1)) * 100}%` : ""}`}
				>
					<div class="fg"></div>
				</div>
			{/each}
		</div>

		<div class="grid gridlines" aria-hidden="true">
			{#each cells as { pos }}
				<div class="cell"></div>
			{/each}
		</div>

		{#if game}
			<div class="grid mower">
				<div
					class="character"
					style="--x: {latest.x}; --y: {latest.y};"
					class:flip={replay ? replayFlip : flipCharacter}
				></div>
			</div>
		{/if}
	</div>
</figure>

<style>
	.measure {
		width: 100%;
		height: 0;
		visibility: hidden;
	}

	figure {
		position: relative;
		margin: 1rem auto;
		background: var(--color-green-medium);
	}

	.inner {
		position: relative;
		visibility: hidden;
	}

	.started .inner {
		visibility: visible;
	}

	.grid {
		position: relative;
		aspect-ratio: 1;
		display: grid;
		grid-template-columns: repeat(var(--size), 1fr);
		grid-template-rows: repeat(var(--size), 1fr);
		transition: all 0.5s ease-in-out;
	}

	.grid.mower,
	.grid.gridlines {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.grid.gridlines {
		pointer-events: none;
	}

	.grid.gridlines .cell {
		/* border: 0.5px solid rgba(0, 0, 0, 0.15); */
		box-shadow: inset 0 0 2px 2px rgba(0, 0, 0, 0.1);
		background: none;
	}

	.cell {
		position: relative;
		background-image: url("/assets/images/grass.png");
		background-size: var(--grass-bg-size);
		background-position: var(--grass-x, 0%) 0%;
		/* lighten */
		filter: brightness(1.1);
	}

	.cell.obstacle {
		background-image:
			url("/assets/images/obstacles.png"), url("/assets/images/grass.png");
		background-size: var(--obstacle-bg-size), var(--grass-bg-size);
		background-position:
			var(--sprite-x) 0%,
			var(--grass-x) 0%;
	}

	.cell.visited {
		opacity: 0.4;
	}

	.fg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-size: cover;
		background-repeat: no-repeat;
		pointer-events: none;
		transform: translateY(-10%);
	}

	.character {
		position: absolute;
		left: calc(var(--x) / var(--size) * 100%);
		top: calc(var(--y) / var(--size) * 100%);
		width: calc(100% / var(--size));
		height: calc(100% / var(--size));
		transition:
			left 0.1s,
			top 0.1s;
		background-image: url("/assets/images/mower.png");
		background-size: cover;
		background-repeat: no-repeat;
	}

	.character.flip {
		transform: scaleX(-1);
	}

	/* nodes mode */
	.nodes {
		background: transparent;
	}

	.nodes .grid {
		border: 0.5px solid var(--color-gray-700);
	}

	.nodes .cell {
		border: 0.5px solid var(--color-gray-700);
		background: none;
		filter: brightness(1);
	}

	.nodes .cell.visited {
		opacity: 1;
	}

	/* .nodes .fg {
		background: none;
		width: 20%;
		height: 20%;
		border-radius: 50%;
		border: 1px solid var(--color-gray-500);
		background: var(--color-bg);
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	} */

	.nodes .obstacle {
		background: var(--color-gray-500);
		border: 0.5px solid var(--color-bg);
	}

	.nodes .obstacle .fg {
		display: none;
	}

	svg {
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	path.line {
		stroke-width: 0.25;
		stroke-linecap: round;
		fill: none;
		stroke: var(--path-start);
	}

	/* path.arrow {
		stroke-width: 0.1;
		fill: none;
		stroke: var(--path-start);
	} */
</style>
