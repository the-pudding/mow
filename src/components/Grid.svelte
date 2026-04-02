<script>
	import { browser } from "$app/environment";
	import { scaleLinear, interpolateRgb, interpolateHcl } from "d3";
	import { draw, fade } from "svelte/transition";

	// obstacles is an array of [{x,y}]
	let {
		size,
		path = [],
		perspective,
		obstacles = [],
		game = false,
		color
	} = $props();

	const MAX_GRID_SIZE = 14;

	const colorScale = $state({
		user: scaleLinear()
			.interpolate(interpolateHcl)
			.range(["#eb6d72", "#9e2835"]),
		solution: scaleLinear()
			.interpolate(interpolateHcl)
			.range(["#4ca658", "#265c42"])
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
				obstacle: obstacles.some(({ x, y }) => x === c.pos.x && y === c.pos.y)
			}))
	);

	let cells = $derived.by(() => {
		const visitedSet = new Set(path.map(({ x, y }) => `${x},${y}`));
		const all = defaultCells.map((c) => ({
			...c,
			visited: visitedSet.has(`${c.pos.x},${c.pos.y}`)
		}));
		return all;
	});

	let latest = $derived(path[path.length - 1] || { x: 0, y: 0 });
	let offsetWidth = $state(0);
	let nodes = $derived(!game);
	let animating = $state(false);

	let pathD = $derived.by(() => {
		const str = path.map(({ x, y }, i) => {
			const x1 = x + 0.5;
			const y1 = y + 0.5;
			const x2 = (path[i + 1] ? path[i + 1].x : x) + 0.5;
			const y2 = (path[i + 1] ? path[i + 1].y : y) + 0.5;
			return `M ${x1} ${y1} L ${x2} ${y2}`;
		});

		return str.join("");
	});

	export const animate = () => {
		animating = true;
	};
</script>

<figure
	style="--size: {size}; --max-size: {MAX_GRID_SIZE}; --margin: {offsetWidth *
		-0.25}px; --face: {(offsetWidth / size) * 0.4}px;"
	class:perspective
	class:nodes
	bind:offsetWidth
>
	<div class="inner">
		{#if !game && path.length > 1}
			<svg viewbox="0 0 10 10">
				{#if animating}
					{#each path as { x, y }, i (i)}
						{@const x1 = x + 0.5}
						{@const y1 = y + 0.5}
						{@const x2 = (path[i + 1] ? path[i + 1].x : x) + 0.5}
						{@const y2 = (path[i + 1] ? path[i + 1].y : y) + 0.5}
						<path
							transition:fade|global={{ delay: 500 + i * 50, duration: 50 }}
							class="line"
							d={`M ${x1} ${y1} L ${x2} ${y2}`}
							style:stroke={colorScale[color](i / path.length)}
						></path>
					{/each}
				{/if}
			</svg>
		{/if}

		<div class="grid">
			{#each cells as { obstacle, visited, pos }}
				{@const x = pos[0]}
				{@const y = pos[1]}
				{@const active = x === latest.x && y === latest.y}
				<div
					class="cell"
					class:obstacle
					class:visited
					class:active
					data-x={x}
					data-y={y}
				>
					<div class="texture"></div>
					<div class="fg"></div>
				</div>
			{/each}
		</div>

		{#if game}
			<div class="grid mower">
				<div class="character" style="--x: {latest.x}; --y: {latest.y};"></div>
			</div>
		{/if}
	</div>
</figure>

<style>
	figure {
		width: calc(var(--size) / var(--max-size) * 100%);
		/* perspective: calc(var(--grid-width) * 1); */
		transition: all 0.5s ease-in-out;
		position: relative;
		margin: 1rem auto;
	}

	.inner {
		position: relative;
		transform-origin: center center;
		transform-style: preserve-3d;
	}

	figure.perspective {
		perspective-origin: 50% 50%;
	}

	.perspective .inner {
		transform: rotateX(60deg) scale(0.85);
	}

	.grid {
		position: relative;
		aspect-ratio: 1;
		display: grid;
		grid-template-columns: repeat(var(--size), 1fr);
		grid-template-rows: repeat(var(--size), 1fr);
		transition: all 0.5s ease-in-out;
	}

	.grid.mower {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
	}

	.cell {
		position: relative;
		background: linear-gradient(135deg, var(--color-green), var(--color-green));
	}

	.cell.visited {
		background: linear-gradient(
			135deg,
			var(--color-yellow),
			var(--color-yellow)
		);
	}

	.cell.obstacle {
		background: linear-gradient(
			135deg,
			var(--color-gray-700),
			var(--color-gray-700)
		);
	}

	.texture {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		/* background-image: url("/assets/images/texture.png"); */
		background-size: cover;
		background-repeat: no-repeat;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
		pointer-events: none;
		opacity: 0.75;
	}

	.fg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		/* background-image: url("/assets/images/grass.png"); */
		background-size: cover;
		background-repeat: no-repeat;
		pointer-events: none;
		transform: translateY(-10%);
	}

	.visited .fg {
		/* background-image: url("/assets/images/grass-cut.png"); */
	}

	.obstacle .fg {
		/* background-image: url("/assets/images/rock.png"); */
		transform: translateY(0%);
	}

	.obstacle.visited .fg {
		/* background-image: url("/assets/images/rock.png"); */
	}

	.character {
		grid-row: calc(var(--y) + 1);
		grid-column: calc(var(--x) + 1);
		width: 100%;
		height: 100%;
		background: var(--color-purple);
		/* transform-origin: center bottom;
		transform: rotateX(-60deg) translateZ(1px); */
	}

	/* nodes mode */
	.nodes .grid {
		border: 0.5px solid var(--color-gray-500);
	}

	.nodes .cell {
		border: 0.5px solid var(--color-gray-100);
		background: none;
	}

	.nodes .texture {
		display: none;
	}

	.nodes .fg {
		background: none;
		width: 20%;
		height: 20%;
		border-radius: 50%;
		border: 1px solid var(--color-gray-500);
		background: var(--color-bg);
		/* opacity: 0.5; */
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

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
		stroke-width: 0.4;
		stroke-linecap: round;
		/* stroke-opacity: 0.2; */
		fill: none;
		stroke: var(--path-start);
	}

	path.arrow {
		stroke-width: 0.1;
		/* stroke-linecap: round; */
		fill: none;
		stroke: var(--path-start);
	}
</style>
