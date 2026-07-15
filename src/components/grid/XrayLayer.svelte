<script>
	import { getContext } from "svelte";
	import { scaleLinear, interpolateHcl } from "d3";
	import { fade } from "svelte/transition";

	// Animated "xray" path overlay: draws each path segment as a colored line,
	// fading them in one after another when animate() is called.
	let { path = [], color = "user" } = $props();

	const grid = getContext("grid");

	const REPLAY_STEP_MS = 120;

	const colorScale = {
		user: scaleLinear()
			.interpolate(interpolateHcl)
			.range(["#fee761", "#f77622"]),
		optimal: scaleLinear()
			.interpolate(interpolateHcl)
			.range(["#63c74d", "#265c42"])
	};

	let animating = $state(false);

	export const animate = () => {
		animating = true;
	};

	export const reset = () => {
		animating = false;
	};
</script>

{#if path.length > 1}
	<svg viewBox="0 0 {grid.size} {grid.size}">
		{#if animating}
			{#each path as { x, y }, i (i)}
				{@const from = grid.center(x, y)}
				{@const nextPt = path[i + 1] ?? { x, y }}
				{@const to = grid.center(nextPt.x, nextPt.y)}
				<path
					in:fade|global={{
						delay: i * REPLAY_STEP_MS,
						duration: REPLAY_STEP_MS
					}}
					out:fade|global={{ duration: 0 }}
					class="line"
					d={`M ${from.cx} ${from.cy} L ${to.cx} ${to.cy}`}
					style:stroke={colorScale[color](i / path.length)}
				></path>
			{/each}
		{/if}
	</svg>
{/if}

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	path.line {
		stroke-width: 0.25;
		stroke-linecap: round;
		fill: none;
	}
</style>
