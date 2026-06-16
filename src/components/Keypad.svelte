<script>
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import ArrowUp from "@lucide/svelte/icons/arrow-up";
	import ArrowDown from "@lucide/svelte/icons/arrow-down";
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
			<button onpointerdown={() => onmove("ArrowUp")}><ArrowUp /></button>
		</div>
		<div class="row">
			<button onpointerdown={() => onmove("ArrowLeft")}><ArrowLeft /></button>
			<div class="spacer"></div>
			<button onpointerdown={() => onmove("ArrowRight")}><ArrowRight /></button>
		</div>
		<div class="row">
			<button onpointerdown={() => onmove("ArrowDown")}><ArrowDown /></button>
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
	}

	.keyboard p {
		margin: 0;
	}

	button {
		font-weight: bold;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		/* margin: 0.125rem; */
	}

	.row {
		display: flex;
		justify-content: center;
	}

	button,
	.spacer {
		width: 3rem;
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
