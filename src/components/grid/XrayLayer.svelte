<script>
	import { getContext } from "svelte";
	import { scaleLinear, interpolateHcl } from "d3";
	import { fade } from "svelte/transition";

	// Animated "xray" path overlay: draws each path segment as a colored line,
	// fading them in one after another when animate() is called.
	// showBacktracks: mark cells crossed more than once with a circle that
	// grows with each additional pass (the 2nd/3rd/... time it was mowed).
	// realtime: pace the reveal by each point's actual timestamp (t) instead
	// of a fixed step per segment.
	let {
		path = [],
		color = "user",
		showBacktracks = false,
		realtime = false,
		shouldAnimate = true
	} = $props();

	const grid = getContext("grid");

	const REPLAY_STEP_MS = 120;

	// reveal delay (ms from start) for the point at index i
	let delayFor = $derived((i) =>
		realtime && typeof path[i]?.t === "number" && typeof path[0]?.t === "number"
			? path[i].t - path[0].t
			: i * REPLAY_STEP_MS
	);

	const colorScale = {
		user: scaleLinear()
			.interpolate(interpolateHcl)
			.range(["#fee761", "#f77622"]),
		optimal: scaleLinear()
			.interpolate(interpolateHcl)
			.range(["#63c74d", "#2e7251"])
	};

	// count passes per cell → circles for anything visited more than once.
	// lastIndex drives reveal timing + color so each circle matches the path
	// at the moment it's crossed for the final time.
	let backtracks = $derived.by(() => {
		if (!showBacktracks) return [];
		const counts = new Map();
		path.forEach(({ x, y }, i) => {
			const key = `${x},${y}`;
			const prev = counts.get(key);
			counts.set(key, { passes: (prev?.passes ?? 0) + 1, lastIndex: i });
		});
		return [...counts.entries()]
			.filter(([, { passes }]) => passes > 1)
			.map(([key, { passes, lastIndex }]) => {
				const [x, y] = key.split(",").map(Number);
				const { cx, cy } = grid.center(x, y);
				// 1st backtrack ~0.18r, growing with each extra pass, capped to cell
				const r = Math.min(0.25 + (passes - 2) * 0.1, 0.5);
				return { cx, cy, r, passes, lastIndex };
			});
	});

	let animating = $state(false);

	// when shouldAnimate is false, render the whole path immediately (no reveal).
	let show = $derived(animating || !shouldAnimate);
	// transition params: staggered reveal while animating, instant otherwise.
	let revealIn = $derived((delay) =>
		shouldAnimate && animating
			? { delay, duration: REPLAY_STEP_MS }
			: { duration: 0 }
	);

	export const animate = () => {
		animating = true;
	};

	export const reset = () => {
		animating = false;
	};
</script>

{#if path.length > 1}
	<svg viewBox="0 0 {grid.size} {grid.size}">
		{#if show}
			{@const start = grid.center(path[0].x, path[0].y)}
			<circle
				class="start"
				cx={start.cx}
				cy={start.cy}
				r="0.125"
				in:fade|global={revealIn(0)}
				out:fade|global={{ duration: 0 }}
				style:fill={colorScale[color](0)}
			></circle>

			{#each path.slice(0, -1) as { x, y }, i (i)}
				{@const from = grid.center(x, y)}
				{@const to = grid.center(path[i + 1].x, path[i + 1].y)}
				<path
					in:fade|global={revealIn(delayFor(i + 1))}
					out:fade|global={{ duration: 0 }}
					class="line"
					d={`M ${from.cx} ${from.cy} L ${to.cx} ${to.cy}`}
					style:stroke={colorScale[color](i / path.length)}
				></path>
			{/each}

			{#if showBacktracks}
				{#each backtracks as { cx, cy, r, passes, lastIndex } (`${cx},${cy}`)}
					<circle
						class="backtrack"
						{cx}
						{cy}
						{r}
						in:fade|global={revealIn(delayFor(lastIndex))}
						out:fade|global={{ duration: 0 }}
						style:stroke={colorScale[color](lastIndex / path.length)}
						style:fill={colorScale[color](lastIndex / path.length)}
					>
						<title>{passes} passes</title>
					</circle>
				{/each}
			{/if}
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

	circle.backtrack {
		stroke-width: 0.1;
	}
</style>
