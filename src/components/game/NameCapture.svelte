<script>
	import Button from "$components/ui/Button.svelte";
	import badWords from "$data/bad-words.csv";

	let { onSubmit, onSkip } = $props();

	let name = $state("");
	let error = $state("");

	function hasBadWord(str) {
		const temp = str.toLowerCase().replace(/ /g, "");
		return (
			badWords.includes(temp) || [...badWords].some((w) => temp.includes(w))
		);
	}

	function submit() {
		const trimmed = name.trim();
		if (!trimmed) {
			error = "Please enter a name or skip.";
			return;
		}
		error = "";
		if (hasBadWord(trimmed)) {
			onSkip();
			return;
		}
		onSubmit(trimmed);
	}
</script>

<div class="c">
	<h2>Add your name to the leaderboard</h2>
	<p class="meta">Your name will appear next to your score.</p>

	<div class="row">
		<input
			type="text"
			placeholder="Your name or initials"
			maxlength="15"
			bind:value={name}
			oninput={(e) => {
				const el = e.currentTarget;
				const filtered = el.value.replace(/[^a-z0-9 ]/gi, "").toLowerCase();
				name = filtered;
				el.value = filtered;
			}}
			onkeydown={(e) => e.key === "Enter" && submit()}
		/>
	</div>
	{#if error}<p class="error">{error}</p>{/if}

	<div class="actions">
		<Button size="lg" onclick={submit}>Add me</Button>
		<Button variant="ghost" size="lg" onclick={onSkip}>Skip</Button>
	</div>
</div>

<style>
	.c {
		max-width: 28rem;
		margin: 0 auto;
		text-align: center;
	}

	.row {
		margin-top: 1rem;
	}

	input {
		width: 100%;
		font-size: var(--16px);
		border: 2px solid var(--color-border);
	}

	.error {
		color: var(--color-red);
		font-size: var(--14px);
		margin-top: 0.5rem;
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		justify-content: center;
		margin-top: 1.5rem;
	}
</style>
