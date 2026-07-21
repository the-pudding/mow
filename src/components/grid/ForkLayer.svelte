<script>
	import { getContext } from "svelte";
	import { scaleLinear, max } from "d3";

	// Weighted two-branch split: from a single fork cell, draw one arrow per
	// outgoing branch with stroke width scaled to how many players took it, plus
	// a percentage label. Supersedes the old BranchLayer stub. Use over
	// variant="wireframe".
	//
	// origin:  { x, y } — the decision cell.
	// branches: [{ to: {x,y}, count, label? }] — one per option.
	// chosen:   index of the branch this player took (accent color); others gray.
	let {
		origin = { x: 0, y: 0 },
		branches = [],
		chosen = null,
		accent = "var(--color-yellow)",
		muted = "var(--color-gray-700)"
	} = $props();

	const grid = getContext("grid");

	let total = $derived(branches.reduce((s, b) => s + (b.count ?? 0), 0) || 1);

	// stroke width in grid units, scaled by each branch's share of players
	let widthFor = $derived(
		scaleLinear()
			.domain([0, max(branches, (b) => b.count) ?? 1])
			.range([0.08, 0.5])
	);

	// geometry per branch: line endpoints (shortened so the arrowhead sits inside
	// the target cell), an arrowhead polygon, and a label anchor just past the tip.
	let arrows = $derived.by(() => {
		const o = grid.center(origin.x, origin.y);
		return branches.map((b, i) => {
			const t = grid.center(b.to.x, b.to.y);
			const dx = t.cx - o.cx;
			const dy = t.cy - o.cy;
			const len = Math.hypot(dx, dy) || 1;
			const ux = dx / len;
			const uy = dy / len;
			// stop the shaft short of the tip to leave room for the arrowhead
			const tipX = t.cx - ux * 0.1;
			const tipY = t.cy - uy * 0.1;
			const baseX = tipX - ux * 0.28;
			const baseY = tipY - uy * 0.28;
			// perpendicular for the arrowhead wings
			const px = -uy;
			const py = ux;
			const wing = 0.16;
			const head = [
				[tipX, tipY],
				[baseX + px * wing, baseY + py * wing],
				[baseX - px * wing, baseY - py * wing]
			]
				.map(([x, y]) => `${x},${y}`)
				.join(" ");
			const pct = Math.round(((b.count ?? 0) / total) * 100);
			return {
				i,
				x1: o.cx,
				y1: o.cy,
				x2: baseX,
				y2: baseY,
				head,
				width: widthFor(b.count ?? 0),
				color: chosen === i ? accent : muted,
				label: b.label ?? `${pct}%`,
				labelX: t.cx + ux * 0.3,
				labelY: t.cy + uy * 0.3
			};
		});
	});

	let originC = $derived(grid.center(origin.x, origin.y));
</script>

<svg viewBox="0 0 {grid.size} {grid.size}">
	{#each arrows as a (a.i)}
		<line
			x1={a.x1}
			y1={a.y1}
			x2={a.x2}
			y2={a.y2}
			stroke={a.color}
			stroke-width={a.width}
			stroke-linecap="round"
		/>
		<polygon points={a.head} fill={a.color} />
		<text
			x={a.labelX}
			y={a.labelY}
			fill={a.color}
			text-anchor="middle"
			dominant-baseline="middle">{a.label}</text
		>
	{/each}

	<circle class="origin" cx={originC.cx} cy={originC.cy} r="0.14" />
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		overflow: visible;
	}

	circle.origin {
		fill: var(--color-fg, #000);
	}

	text {
		font-family: var(--font-mono);
		font-size: 0.34px;
		font-weight: 700;
		paint-order: stroke;
		stroke: var(--color-bg);
		stroke-width: 0.06px;
	}
</style>
