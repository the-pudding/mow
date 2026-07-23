<script>
	import { getContext } from "svelte";

	// Blinking "choice" overlay: highlights a set of candidate cells with a
	// pulsing outline so the reader's eye lands on the decision options.
	// cells: array of { x, y }. Cells blink with a slight per-cell stagger so
	// they don't pulse in lockstep. Use over variant="wireframe".
	let { cells = [], color = "var(--color-yellow)" } = $props();

	const grid = getContext("grid");
</script>

<svg viewBox="0 0 {grid.size} {grid.size}">
	{#each cells as { x, y, label }, i (`${x},${y}`)}
		<rect
			class="pulse"
			{x}
			{y}
			width="1"
			height="1"
			rx="0.08"
			style:fill={color}
			style:stroke={color}
			style:animation-delay={`${i * 250}ms`}
		/>
		{#if label}
			<text
				x={x + 0.5}
				y={y + 0.5}
				text-anchor="middle"
				dominant-baseline="central">{label}</text
			>
		{/if}
	{/each}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		overflow: visible;
	}

	rect {
		shape-rendering: crispEdges;
	}

	rect.pulse {
		fill-opacity: 0.4;
		stroke-width: 0.08;
		transform-box: fill-box;
		transform-origin: center;
		animation: pulse 1.2s ease-in-out infinite;
	}

	text {
		font-family: var(--font-mono);
		font-size: 0.2px;
		font-weight: 700;
		fill: var(--color-bg);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.25;
			transform: scale(0.9);
		}
		50% {
			opacity: 0.85;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		rect.pulse {
			animation: none;
			opacity: 0.6;
		}
	}
</style>
