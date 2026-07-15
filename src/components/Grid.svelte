<script>
	import { setContext } from "svelte";
	import obstacleSpriteData from "$data/obstacles.json";
	import grassSpriteData from "$data/grass.json";

	// Foundation for all grid visualizations: owns size → cell geometry, the
	// grass/wireframe surface + gridlines, and responsive sizing. Provides a
	// reactive "grid" context that layer components (children) build on top of.
	// obstacles is an array of [{x,y}]
	let { size, obstacles = [], started, variant = "grass", children } = $props();

	const obstacleFrames = Object.values(obstacleSpriteData.frames);
	const numObstacleFrames = obstacleFrames.length;

	const grassTags = Object.fromEntries(
		grassSpriteData.meta.frameTags.map((t) => [t.name, t])
	);
	const numGrassFrames = Object.keys(grassSpriteData.frames).length;
	const grassVariants = grassTags.long.to - grassTags.long.from + 1;

	// set of "x,y" keys the active layer marks as visited (drives cell dimming)
	let visitedSet = $state(new Set());

	let defaultCells = $derived(
		Array(size ** 2)
			.fill()
			.map((_, i) => {
				const x = i % size;
				const y = Math.floor(i / size);
				return {
					x,
					y,
					obstacle: obstacles.some((o) => o.x === x && o.y === y),
					spriteFrame: Math.floor(Math.random() * numObstacleFrames),
					grassVariant: Math.floor(Math.random() * grassVariants)
				};
			})
	);

	let cells = $derived(
		defaultCells.map((c) => ({
			...c,
			visited: visitedSet.has(`${c.x},${c.y}`)
		}))
	);

	let offsetWidth = $state(0);
	let visualGridSize = $derived(Math.max(size, 8));
	let figureWidth = $derived(Math.round((size / visualGridSize) * offsetWidth));

	setContext("grid", {
		get size() {
			return size;
		},
		get cells() {
			return cells;
		},
		get obstacles() {
			return obstacles;
		},
		// grid-unit cell center for a shared viewBox="0 0 size size"
		center: (x, y) => ({ cx: x + 0.5, cy: y + 0.5 }),
		// visited write-back so the active layer can drive cell dimming
		get visited() {
			return visitedSet;
		},
		setVisited: (s) => {
			visitedSet = s;
		}
	});
</script>

<div class="measure" bind:offsetWidth aria-hidden="true"></div>
<figure
	style="--size: {size}; width: {figureWidth}px; --grass-bg-size: {numGrassFrames *
		100}% 100%; --obstacle-bg-size: {numObstacleFrames * 100}% 100%;"
	class="figure-grid"
	class:wireframe={variant === "wireframe"}
	class:started
>
	<div class="inner">
		<div class="grid">
			{#each cells as { obstacle, visited, x, y, spriteFrame, grassVariant }}
				{@const grassFrame = visited
					? grassTags.short.from + grassVariant
					: grassTags.long.from + grassVariant}
				<div
					class="cell"
					class:obstacle
					class:visited
					data-x={x}
					data-y={y}
					style={`--grass-x: ${(grassFrame / (numGrassFrames - 1)) * 100}%${obstacle ? `; --sprite-x: ${(spriteFrame / (numObstacleFrames - 1)) * 100}%` : ""}`}
				>
					<div class="fg"></div>
				</div>
			{/each}
		</div>

		<div class="grid gridlines" aria-hidden="true">
			{#each cells as _cell}
				<div class="cell"></div>
			{/each}
		</div>

		{@render children?.()}
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

	.grid.gridlines {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.grid.gridlines .cell {
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

	/* wireframe variant (xray / heatmap / branch) */
	.wireframe {
		background: transparent;
	}

	.wireframe .grid {
		border: 0.5px solid var(--color-gray-700);
	}

	.wireframe .cell {
		border: 0.5px solid var(--color-gray-700);
		background: none;
		filter: brightness(1);
	}

	.wireframe .cell.visited {
		opacity: 1;
	}

	.wireframe .obstacle {
		background: var(--color-gray-500);
		border: 0.5px solid var(--color-bg);
	}

	.wireframe .obstacle .fg {
		display: none;
	}
</style>
