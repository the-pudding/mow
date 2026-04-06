<script>
	import Meta from "$components/Meta.svelte";
	import Game from "$components/Game.svelte";
	import db from "$utils/supabase.js";
	import localStore from "$runes/localStore.svelte.js";
	import tests from "$data/tests.json";
	import generateId from "$utils/generateId.js";
	let storage = localStore("pudding_mow_test", {});

	const title = "test";
	const description = "test";

	let config = $state(0);

	let test = $derived(tests[config]);

	let size = $derived(test.size);
	let obstacles = $derived(test.obstacles);

	let completed = $state(false);

	let startMessage = $derived.by(() => {
		if (config === 0) return "Warm up round.";
		if (config === 1) return "Same lawn, but now we're recording.";
		if (config === 2) return "A little bigger now.";
		if (config === 3) return "Last one!";
	});

	async function onComplete(path) {
		try {
			await db.insert({
				user: storage.value.user,
				config,
				result: JSON.stringify(path)
			});
			setTimeout(() => {
				if (config < tests.length - 1) {
					config += 1;
					storage.value.config = config;
				} else {
					completed = true;
					storage.value.completed = true;
				}
			}, 2000);
		} catch (error) {
			console.error("Error inserting data:", error);
		}
	}

	$effect(() => {
		if (!storage.value.user)
			storage.value = { user: generateId(), config: 0, completed: false };

		config = storage.value.config;
		completed = storage.value.completed;

		if (!completed) db.init();
	});
</script>

<Meta {title} {description} />

<div class="c">
	<div class="intro">
		<h1>Lawn mowing experiment</h1>
		<p>
			This is a lawn-mowing simulation. Your task will be to mow a series of
			different lawn scenarios. It should only take a few minutes. Thanks!
		</p>
		{#if completed}
			<p>
				<em> You've completed all the tests! Thanks for participating. </em>
			</p>
		{:else}
			<p><strong>How efficiently can you mow this lawn?</strong></p>
			<p class="test">
				<em>Test {config + 1} of {tests.length}</em>
			</p>
			{#key config}
				<Game {size} {obstacles} {onComplete} {startMessage}></Game>
			{/key}
		{/if}
	</div>
</div>

<style>
	.c {
		margin-bottom: 4rem;
		padding: 1rem;
	}

	.intro {
		max-width: var(--grid-max-width);
		margin: 1rem auto;
	}

	.test span {
		color: var(--color-purple);
	}
</style>
