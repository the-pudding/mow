<script>
	import Button from "$components/ui/Button.svelte";

	let { onSubmit, onSkip } = $props();

	const questions = [
		{
			key: "age",
			label: "How old are you?",
			options: ["Under 18", "18-29", "30-44", "45-59", "60+"]
		},
		{
			key: "style",
			label: "How would you describe the way you mow a lawn or vacuum?",
			options: [
				"I follow a set pattern",
				"I have a rough approach but adapt as I go",
				"I just start and figure it out",
				"I've never done either"
			]
		},
		{
			key: "gaming",
			label: "How often do you play video games?",
			options: ["Regularly", "Sometimes", "Rarely or never"]
		},
		{
			key: "hand",
			label: "Are you left or right handed?",
			options: ["Left", "Right", "Ambidextrous"]
		},
		{
			key: "optimization",
			label:
				"Does your work or studies involve solving optimization or routing problems?",
			options: ["Regularly", "Sometimes", "Rarely or never"]
		}
	];

	const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	let answers = $state({});
	let email = $state("");
	let emailError = $state("");

	function submit() {
		const trimmed = email.trim();
		if (trimmed && !emailRe.test(trimmed)) {
			emailError = "That doesn't look like an email.";
			return;
		}
		emailError = "";
		onSubmit({ answers, email: trimmed || null });
	}
</script>

<div class="c">
	<h2>
		Answer these quick questions, then see how you did compared to others.
	</h2>
	<p><em>All optional.</em></p>

	{#each questions as q}
		<fieldset>
			<legend>{q.label}</legend>
			<div class="options">
				{#each q.options as opt}
					<label>
						<input
							type="radio"
							name={q.key}
							value={opt}
							bind:group={answers[q.key]}
						/>
						<span>{opt}</span>
					</label>
				{/each}
			</div>
		</fieldset>
	{/each}

	<fieldset>
		<legend>Get notified when the story drops? </legend>
		<div>
			<small
				><em
					>Your email won’t be used for anything else and will be deleted after
					the story is released.</em
				></small
			>
		</div>

		<input
			class="email"
			type="email"
			placeholder="you@example.com"
			bind:value={email}
			onkeydown={(e) => e.key === "Enter" && submit()}
		/>
		{#if emailError}<p class="error">{emailError}</p>{/if}
	</fieldset>

	<div class="actions">
		<Button variant="primary" onclick={submit}>Submit</Button>
		<Button variant="ghost" onclick={onSkip}>Skip to results</Button>
	</div>
</div>

<style>
	.c {
		max-width: 32rem;
		margin: 0 auto;
	}

	.meta {
		color: var(--color-fg-light);
		font-size: var(--14px);
	}

	fieldset {
		border: none;
		padding: 0;
		margin: 1.25rem 0;
	}

	legend {
		font-weight: bold;
		margin-bottom: 0.5rem;
		padding: 0;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.email {
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: var(--16px);
		border: 1px solid var(--color-gray-500);
	}

	.error {
		color: var(--color-red);
		font-size: var(--14px);
		margin-top: 0.5rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		margin-top: 1.5rem;
	}
</style>
