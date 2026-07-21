<script>
	import { getContext, onDestroy } from "svelte";

	// Lawn-mower sprite layer. Two modes:
	//   live   — follows `path` (prop-driven, e.g. keyboard input)
	//   replay — steps through `replay` on its own timer via play()/stop()
	// startIndex: begin the replay partway through — everything up to it renders
	// as already mowed, and play() animates from there to the end.
	let {
		path = [],
		replay = null,
		startIndex = 0,
		flipCharacter,
		onFinish = null,
		auto = false
	} = $props();

	const grid = getContext("grid");

	const REPLAY_STEP_MS = 250;

	let replayIndex = $state(0);
	let replayFlip = $state(true);
	let intervalId;

	// park at startIndex whenever the replay source or start point changes, so the
	// grass reads as mowed up to that point before play() is called.
	$effect(() => {
		replay;
		replayIndex = startIndex;
	});

	let displayPath = $derived(replay ? replay.slice(0, replayIndex + 1) : path);
	let latest = $derived(displayPath[displayPath.length - 1] || { x: 0, y: 0 });

	// drive the foundation's cell dimming from whatever path we're showing
	$effect(() => {
		grid.setVisited(new Set(displayPath.map(({ x, y }) => `${x},${y}`)));
	});

	export const play = () => {
		if (!replay?.length) return;
		clearTimeout(intervalId);
		replayIndex = startIndex;
		replayFlip = true;

		if (replay.length - startIndex <= 1) {
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
				!auto &&
				typeof stepCurr?.t === "number" &&
				typeof stepNext?.t === "number"
					? stepNext.t - stepCurr.t
					: REPLAY_STEP_MS;
			intervalId = setTimeout(step, delay);
		};

		const first = replay[startIndex];
		const second = replay[startIndex + 1];
		const delay =
			!auto && typeof first?.t === "number" && typeof second?.t === "number"
				? second.t - first.t
				: REPLAY_STEP_MS * 10;
		intervalId = setTimeout(step, delay);
	};

	export const stop = () => clearTimeout(intervalId);

	onDestroy(stop);
</script>

<div class="mower">
	<div
		class="character"
		style="--x: {latest.x}; --y: {latest.y};"
		class:flip={replay ? replayFlip : flipCharacter}
	></div>
</div>

<style>
	.mower {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
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
</style>
