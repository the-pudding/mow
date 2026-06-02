<script>
	// shadow, plain, line, bubble
	import wordmark from "$svg/wordmark-script-stacked-plain.svg";
	import citizen from "$svg/logo-citizen.svg";

	const flip = import.meta.env.VITE_SITE == "citizencodex";
</script>

<header class:flip>
	<div class="wordmark">
		<a href="https://pudding.cool" aria-label="The Pudding" target="_self"
			>{@html wordmark}</a
		>
		<span>x</span>
		<a href="https://citizencodex.com" aria-label="Citizen Codex" target="_self"
			>{@html citizen}</a
		>
	</div>
</header>

<style>
	header {
		position: relative;
		z-index: var(--z-top);
	}

	.wordmark {
		max-width: 10em;
		margin: 0 auto;
		padding: 32px 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* transform: rotate(-4deg); */
	}

	.flip .wordmark {
		flex-direction: column-reverse;
	}

	.wordmark a {
		border: none;
		display: block;
		color: var(--color-fg);
	}

	.wordmark a:hover {
		background-color: transparent;
	}

	span {
		display: block;
		text-align: center;
		margin-bottom: 8px;
	}

	.flip span {
		margin-bottom: 0;
		margin-top: 8px;
	}
</style>
