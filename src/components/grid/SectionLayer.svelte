<script>
	import { getContext } from "svelte";

	// Region-annotation overlay: shades named sections of the lawn (e.g. left vs
	// right), highlights a one-way corridor of cells, and can draw a directional
	// arrow to show the forced traversal direction. Use over variant="wireframe".
	//
	// regions:  [{ cells: [{x,y}...], label, fill, labelAt? }] — translucent section
	//           fills. labelAt is an optional {x,y} cell for the label; without it
	//           the label sits at the region's centroid.
	// corridor: [{x,y}...] — cells to emphasize as the one-way passage.
	// arrow:    { from:{x,y}, to:{x,y} } — optional direction indicator.
	let {
		regions = [],
		corridor = [],
		arrow = null,
		corridorColor = "var(--color-yellow)"
	} = $props();

	const grid = getContext("grid");

	// label anchor: explicit labelAt cell if given, else the region's centroid
	function labelPos(region) {
		if (region.labelAt)
			return { x: region.labelAt.x + 0.5, y: region.labelAt.y + 0.5 };
		const cells = region.cells;
		const n = cells.length || 1;
		const sx = cells.reduce((s, c) => s + c.x + 0.5, 0) / n;
		const sy = cells.reduce((s, c) => s + c.y + 0.5, 0) / n;
		return { x: sx, y: sy };
	}

	let arrowGeom = $derived.by(() => {
		if (!arrow) return null;
		const a = grid.center(arrow.from.x, arrow.from.y);
		const b = grid.center(arrow.to.x, arrow.to.y);
		const dx = b.cx - a.cx;
		const dy = b.cy - a.cy;
		const len = Math.hypot(dx, dy) || 1;
		const ux = dx / len;
		const uy = dy / len;
		const px = -uy;
		const py = ux;
		const wing = 0.18;
		const head = [
			[b.cx, b.cy],
			[b.cx - ux * 0.32 + px * wing, b.cy - uy * 0.32 + py * wing],
			[b.cx - ux * 0.32 - px * wing, b.cy - uy * 0.32 - py * wing]
		]
			.map(([x, y]) => `${x},${y}`)
			.join(" ");
		return {
			x1: a.cx,
			y1: a.cy,
			x2: b.cx - ux * 0.2,
			y2: b.cy - uy * 0.2,
			head
		};
	});
</script>

<svg viewBox="0 0 {grid.size} {grid.size}">
	<!-- region fills -->
	{#each regions as region (region.label)}
		{#each region.cells as { x, y } (`${x},${y}`)}
			<rect {x} {y} width="1" height="1" fill={region.fill} />
		{/each}
	{/each}

	<!-- corridor highlight -->
	{#each corridor as { x, y } (`${x},${y}`)}
		<rect
			class="corridor"
			{x}
			{y}
			width="1"
			height="1"
			rx="0.08"
			style:stroke={corridorColor}
		/>
	{/each}

	<!-- one-way direction arrow -->
	{#if arrowGeom}
		<line
			class="arrow"
			x1={arrowGeom.x1}
			y1={arrowGeom.y1}
			x2={arrowGeom.x2}
			y2={arrowGeom.y2}
			style:stroke={corridorColor}
		/>
		<polygon points={arrowGeom.head} fill={corridorColor} />
	{/if}

	<!-- region labels -->
	{#each regions as region (region.label)}
		{@const c = labelPos(region)}
		<text x={c.x} y={c.y} text-anchor="middle" dominant-baseline="middle"
			>{region.label}</text
		>
	{/each}
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

	rect {
		fill-opacity: 1;
	}

	rect.corridor {
		fill: none;
		stroke-width: 0.1;
	}

	line.arrow {
		stroke-width: 0.12;
		stroke-linecap: round;
	}

	text {
		font-family: var(--font-mono);
		font-size: 0.6px;
		font-weight: 700;
		text-transform: uppercase;
		fill: var(--color-bg);
		paint-order: stroke;
		stroke-width: 0.12px;
	}
</style>
