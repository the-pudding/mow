<script>
	import { MediaQuery } from "svelte/reactivity";

	let { onmove, active } = $props();

	const hover = new MediaQuery("hover: hover");
	const pointer = new MediaQuery("pointer: fine");
	let desktop = $derived(hover && pointer);

	function onKeydown(e) {
		if (!active) return;
		const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
		if (!keys.includes(e.key)) return;
		onmove(e.key);

		// TODO only do this if game is being played
		e.preventDefault();
	}
	let offsetWidth = $state(0);
</script>

<svelte:window onkeydown={onKeydown} />

<div class="c" bind:offsetWidth style="--margin: {offsetWidth * -0.25}px;">
	<div class="keypad">
		<div class="row">
			<button onpointerdown={() => onmove("ArrowUp")}>&uarr;</button>
		</div>
		<div class="row">
			<button onpointerdown={() => onmove("ArrowLeft")}>&larr;</button>
			<div class="spacer"></div>
			<button onpointerdown={() => onmove("ArrowRight")}>&rarr;</button>
		</div>
		<div class="row">
			<button onpointerdown={() => onmove("ArrowDown")}>&darr;</button>
		</div>
	</div>

	<div class="keyboard">
		<p><small>use the arrow keys to move</small></p>
	</div>
</div>

<style>
	.c {
		margin: 0 auto;
		width: var(--grid-width);
		max-width: var(--grid-max-width);
		margin-top: var(--margin);
	}

	.keypad {
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: var(--z-top);
	}

	.keyboard {
		display: none;
		text-align: center;
		color: var(--color-fg-light);
		transform: translateY(-100%);
	}

	.keyboard p {
		margin: 0;
	}

	.row {
		display: flex;
		justify-content: center;
	}
	/* 
	.row:nth-of-type(2) {
		transform: translate(0, -50%);
	}

	.row:nth-of-type(3) {
		transform: translate(0, -100%);
	} */

	button,
	.spacer {
		width: 2em;
		aspect-ratio: 1;
	}

	@media (hover: hover) and (pointer: fine) {
		.keyboard {
			display: block;
		}

		.keypad {
			display: none;
		}
	}
</style>
