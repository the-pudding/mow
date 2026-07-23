<script>
	// Dev harness: render everything we have for a single player across every
	// round. For each round the player finished we show two grids side by side —
	// their run replayed in realtime (the xray animates paced by the actual move
	// timestamps) and a pause heatmap of how long they lingered on each square.
	// Temporarily render this from a route (e.g. Index.svelte) via `npm run dev`.
	import { onMount, tick } from "svelte";
	import { interpolateHcl } from "d3";
	import { base } from "$app/paths";
	import Grid from "$components/Grid.svelte";
	import XrayLayer from "$components/grid/XrayLayer.svelte";
	import HeatmapLayer from "$components/grid/HeatmapLayer.svelte";
	import Overlay from "$components/grid/Overlay.svelte";
	import loadCsv from "$utils/loadCsv.js";
	import levels from "$data/levels.json";
	import variables from "$data/variables.json";

	const USER_ID = "tt3aprpgrp";

	// pause heatmap ramp: short dwell = dark green, long dwell = light yellow
	const interpolatePause = interpolateHcl(
		variables.category["purple-dark"],
		variables.category["yellow-light"]
	);

	// Per-cell dwell time (seconds) from a path's timestamps: dwell at a cell is
	// how long before the player moved off it (t of the next point − t of this
	// one), summed across revisits.
	function dwellHeatmap(path) {
		const totals = new Map();
		for (let i = 0; i < path.length - 1; i++) {
			const key = `${path[i].x},${path[i].y}`;
			const dt = (path[i + 1].t - path[i].t) / 1000;
			totals.set(key, (totals.get(key) ?? 0) + dt);
		}
		return [...totals].map(([key, value]) => {
			const [x, y] = key.split(",").map(Number);
			return { x, y, value: +value.toFixed(1) };
		});
	}

	// one entry per round the player has a recorded run for
	let rounds = $state([]);
	// XrayLayer refs, parallel to `rounds`, so we can (re)fire each reveal
	let xrayLayers = $state([]);

	async function loadRound(level) {
		try {
			const rows = await loadCsv(`${base}/assets/${level.id}/${USER_ID}.csv`);
			if (!rows.length || rows[0].x === undefined) return null;
			const path = rows.map((r) => ({ x: +r.x, y: +r.y, t: +r.t }));
			return {
				id: level.id,
				size: level.size,
				obstacles: level.obstacles ?? [],
				path,
				heat: dwellHeatmap(path),
				moves: path.length,
				seconds: +((path.at(-1).t - path[0].t) / 1000).toFixed(1),
				// shortest possible run for this round, and how close they got to it
				// (optimal moves / actual). tutorial has no optimal, so both stay null.
				optimal: level.optimal ?? null,
				optimalPct: level.optimal
					? Math.round((level.optimal / path.length) * 100)
					: null
			};
		} catch (err) {
			console.warn(`No run for ${USER_ID} on ${level.id}`, err);
			return null;
		}
	}

	// (re)start a single round's realtime xray reveal
	async function replay(i) {
		xrayLayers[i]?.reset();
		await tick();
		xrayLayers[i]?.animate();
	}

	onMount(async () => {
		const loaded = await Promise.all(levels.map(loadRound));
		rounds = loaded.filter(Boolean);
		await tick();
		rounds.forEach((_, i) => xrayLayers[i]?.animate());
	});
</script>

<div class="sandbox">
	<h1>Player <code>{USER_ID}</code> — every round</h1>

	{#each rounds as round, i (round.id)}
		<section>
			<header>
				<h2>{round.id}</h2>
				<span class="meta"
					>{round.moves} moves · {round.seconds}s{#if round.optimalPct != null}
						· {round.optimalPct}% optimal ({round.optimal}){/if}</span
				>
				<button onclick={() => replay(i)}>replay ▸</button>
			</header>

			<div class="grids">
				<figure>
					<figcaption>realtime xray</figcaption>
					<div class="grid-wrap">
						<Grid
							size={round.size}
							obstacles={round.obstacles}
							started={true}
							variant="wireframe"
						>
							<XrayLayer
								bind:this={xrayLayers[i]}
								path={round.path}
								realtime={true}
								showBacktracks={true}
							/>
						</Grid>
					</div>
				</figure>

				<figure>
					<figcaption>pause heatmap (seconds per square)</figcaption>
					<div class="grid-wrap">
						<Grid
							size={round.size}
							obstacles={round.obstacles}
							started={true}
							variant="wireframe"
						>
							<HeatmapLayer data={round.heat} interpolate={interpolatePause} />
							<Overlay />
						</Grid>
					</div>
				</figure>
			</div>
		</section>
	{/each}

	{#if !rounds.length}
		<p>Loading runs for {USER_ID}…</p>
	{/if}
</div>

<style>
	.sandbox {
		max-width: 900px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	h1 {
		font-size: 1.25rem;
		margin-bottom: 2rem;
	}

	section {
		margin-bottom: 3rem;
	}

	header {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	h2 {
		font-size: 1rem;
		text-transform: uppercase;
		font-family: var(--font-mono);
		margin: 0;
	}

	.meta {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--color-gray-500);
	}

	button {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		cursor: pointer;
	}

	.grids {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		align-items: start;
	}

	figcaption {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-align: center;
		margin-bottom: 0.5rem;
		color: var(--color-gray-500);
	}

	.grid-wrap {
		max-width: 360px;
		margin: 0 auto;
	}

	@media (max-width: 640px) {
		.grids {
			grid-template-columns: 1fr;
		}
	}
</style>
