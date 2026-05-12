<script>
	let { onmove, active } = $props();

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
		max-width: var(--grid-max-width);
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
	}

	.keyboard p {
		margin: 0;
	}

	.row {
		display: flex;
		justify-content: center;
	}

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
