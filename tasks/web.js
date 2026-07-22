import fs from "fs";
import * as d3 from "d3";

const level = "round2";

// --- data loading -----------------------------------------------------------

function loadData() {
	const usersRaw = d3.csvParse(
		fs.readFileSync("./tasks/mow_users_rows.csv", "utf-8")
	);
	const testsRaw = d3.csvParse(
		fs.readFileSync("./tasks/mow_test_rows.csv", "utf-8")
	);

	// make usersRaw a lookup table by user_id
	const usersLookup = {};
	usersRaw.forEach((d) => {
		usersLookup[d.user_id] = d;
	});

	const exampleTests = testsRaw
		.filter((d) => d.level === level)
		.filter((d) => d.result !== "[]")
		.filter((d) => usersLookup[d.user_id]); // only keep users that are in the usersRaw

	exampleTests.sort((a, b) => d3.descending(a.created_at, b.created_at));

	return { usersLookup, testsRaw, exampleTests };
}

function setupDirs() {
	// make sure the folders exist
	if (!fs.existsSync("./static/assets/users"))
		fs.mkdirSync("./static/assets/users", { recursive: true });
	if (!fs.existsSync("./static/assets/data"))
		fs.mkdirSync("./static/assets/data", { recursive: true });

	// clear out static/assets/users
	fs.readdirSync("./static/assets/users").forEach((file) => {
		fs.unlinkSync(`./static/assets/users/${file}`);
	});
}

// --- per-step log / write functions -----------------------------------------

// save each path and return the length of every unique path taken on the level
function writeUserPaths(exampleTests) {
	const pathLengths = {};
	exampleTests.forEach(({ user_id, result }) => {
		const file = `./static/assets/users/${user_id}.csv`;
		const parsed = JSON.parse(result);
		const temp = parsed.map(({ x, y }) => `${x},${y}`).join("|");
		pathLengths[temp] = parsed.length;
		fs.writeFileSync(file, d3.csvFormat(parsed));
	});
	return pathLengths;
}

// how many users we have, how many unique paths, and the path-length breakdown
function logPathStats(exampleTests, pathLengths, minPathLength) {
	console.log(`Users: ${exampleTests.length}`);
	console.log(`Unique paths: ${Object.keys(pathLengths).length}`);

	// how many paths are of length minPathLength
	const minPathCount = Object.values(pathLengths).filter(
		(length) => length === minPathLength
	).length;
	console.log(`Min path length: ${minPathLength}`);
	console.log(`Min path count: ${minPathCount}`);

	// table of number of paths by length, sorted
	const pathLengthCounts = d3.rollup(
		Object.values(pathLengths),
		(v) => v.length,
		(d) => d
	);
	const pathLengthCountsSorted = Array.from(pathLengthCounts)
		.sort((a, b) => a[0] - b[0])
		.slice(0, 20);
	console.log("Path length counts:");
	console.table(pathLengthCountsSorted);
}

// how many people came within 0..5 moves of the shortest path
function logShortestProximity(allPathLengths, minPathLength, total) {
	[0, 1, 2, 3, 4, 5].forEach((within) => {
		const count = allPathLengths.filter(
			(length) => length - minPathLength <= within
		).length;
		const percent = (count / total).toFixed(4);
		console.log(`Within ${within} moves of shortest: ${count} (${percent})`);
	});
}

// median pause before the first move, plus a binned histogram csv for it
function writeFirstMovePauseHistogram(exampleTests) {
	const firstMovePause = exampleTests
		.map(({ result }) => JSON.parse(result))
		.filter((parsed) => parsed.length > 1)
		.map((parsed) => parsed[1].t - parsed[0].t);
	const medianFirstMovePause = d3.median(firstMovePause);
	console.log(`Median pause time on first move: ${medianFirstMovePause}ms`);

	// filter out pauses over 15 seconds
	const pauseFiltered = firstMovePause.filter((ms) => ms <= 15000);
	console.log(
		`Filtered out ${firstMovePause.length - pauseFiltered.length} pauses over 15s`
	);

	// convert ms -> seconds rounded to quarter seconds, then bin
	const pauseSeconds = pauseFiltered.map((ms) => Math.round(ms / 250) / 4);
	const pauseBinCounts = d3.rollup(
		pauseSeconds,
		(v) => v.length,
		(d) => d
	);
	const pauseHistogram = Array.from(pauseBinCounts, ([seconds, count]) => ({
		seconds,
		count
	})).sort((a, b) => d3.ascending(a.seconds, b.seconds));

	fs.writeFileSync(
		"./static/assets/data/first-move-pause-histogram.csv",
		d3.csvFormat(pauseHistogram)
	);
	console.log(
		`Wrote ${pauseHistogram.length} bins to ./static/assets/data/first-move-pause-histogram.csv`
	);
}

// finishing spots: player count per (move-count, last square) — feeds the
// left/right "where everyone ended up" heatmaps. Counts every attempt.
function writeFinishingSpots(exampleTests) {
	const round2Last = exampleTests.map(({ result }) => {
		const path = JSON.parse(result);
		const last = path.at(-1);
		return { moves: path.length, x: last.x, y: last.y };
	});

	const lastMove = d3
		.rollups(
			round2Last,
			(v) => v.length,
			(d) => d.moves,
			(d) => `${d.x},${d.y}`
		)
		.flatMap(([moves, squares]) =>
			squares.map(([xy, players]) => {
				const [x, y] = xy.split(",").map(Number);
				return { moves, x, y, players };
			})
		)
		.sort(
			(a, b) =>
				d3.ascending(a.moves, b.moves) || d3.descending(a.players, b.players)
		);

	fs.writeFileSync(
		"./static/assets/data/round2-last-move.csv",
		d3.csvFormat(lastMove)
	);
	console.log(
		`Wrote ${lastMove.length} rows to ./static/assets/data/round2-last-move.csv`
	);
}

// mean / median efficiency (shortest path length / actual path length)
function logEfficiency(allPathLengths, minPathLength, testsRaw, usersLookup) {
	const efficiencies = allPathLengths.map((length) => minPathLength / length);
	console.log(`Mean efficiency: ${d3.mean(efficiencies).toFixed(4)}`);
	console.log(`Median efficiency: ${d3.median(efficiencies).toFixed(4)}`);

	// median efficiency per level, for users who completed every level.
	// efficiency = optimal path length / that user's best (shortest) path
	const levels = ["tutorial", "round1", "round2", "bonus1", "bonus2", "bonus3"];

	const optimalRaw = d3.csvParse(
		fs.readFileSync("./tasks/optimal_solutions_multi.csv", "utf-8")
	);
	const optLen = d3.rollup(
		optimalRaw,
		(v) => d3.min(v, (d) => JSON.parse(d.path_json).length),
		(d) => d.level
	);

	// level -> user_id -> shortest path length across their attempts
	const bestLen = new Map(levels.map((l) => [l, new Map()]));
	testsRaw
		.filter((d) => d.result !== "[]")
		.filter((d) => usersLookup[d.user_id])
		.filter((d) => bestLen.has(d.level))
		.forEach((d) => {
			const len = JSON.parse(d.result).length;
			const m = bestLen.get(d.level);
			if (!m.has(d.user_id) || len < m.get(d.user_id))
				m.set(d.user_id, len);
		});

	const completedAll = Object.keys(usersLookup).filter((u) =>
		levels.every((l) => bestLen.get(l).has(u))
	);
	console.log(`Users completing all levels: ${completedAll.length}`);

	const perLevel = levels.map((l) => {
		const effs = completedAll.map((u) => optLen.get(l) / bestLen.get(l).get(u));
		return {
			level: l,
			optimal: optLen.get(l),
			median: +d3.median(effs).toFixed(4),
			mean: +d3.mean(effs).toFixed(4)
		};
	});
	console.log("Median efficiency per level (users who completed all levels):");
	console.table(perLevel);
}

// stats for players who reached the final level (bonus3)
function logAllLevels(testsRaw, usersLookup) {
	const allTests = testsRaw
		.filter((d) => d.level === "bonus3")
		.filter((d) => d.result !== "[]")
		.filter((d) => usersLookup[d.user_id]);

	const medianFirstMovePauseAllLevels = d3.median(
		allTests
			.map(({ result }) => JSON.parse(result))
			.filter((parsed) => parsed.length > 1)
			.map((parsed) => parsed[1].t - parsed[0].t)
	);
	console.log(
		`Median pause time on first move (all levels): ${medianFirstMovePauseAllLevels}ms`
	);
	console.log(`Completed all rounds: ${allTests.length}`);
}

// number of moves for level 2 with user name + id (named users only)
function writeLevel2Moves(exampleTests, usersLookup) {
	const level2Moves = exampleTests
		.map(({ user_id, result }) => ({
			user_id,
			name: usersLookup[user_id].name,
			moves: JSON.parse(result).length
		}))
		.filter(({ name }) => name);

	fs.writeFileSync("./tasks/level2_moves.csv", d3.csvFormat(level2Moves));
	console.log(`Wrote ${level2Moves.length} rows to ./tasks/level2_moves.csv`);
}

// distribution of path lengths: how many players took each number of moves
function writeMoveCounts(exampleTests) {
	const rows = d3
		.rollups(
			exampleTests,
			(v) => v.length,
			({ result }) => JSON.parse(result).length
		)
		.map(([moves, count]) => ({ moves, count }))
		.sort((a, b) => d3.ascending(a.moves, b.moves));

	fs.writeFileSync(
		`./static/assets/data/${level}-move-counts.csv`,
		d3.csvFormat(rows)
	);
	console.log(
		`Wrote ${rows.length} rows to ./static/assets/data/${level}-move-counts.csv`
	);
}

// an evenly-spaced sample of unique paths for drawing on the grid. dedupes,
// sorts by length, then takes every Nth so the sample spans short -> long runs
// and comes out identical on every run. one column of JSON: [{"x":0,"y":0},...]
function writeSamplePaths(exampleTests, sampleSize = 50) {
	const unique = new Map();
	exampleTests.forEach(({ result }) => {
		const path = JSON.parse(result).map(({ x, y }) => ({ x, y }));
		const key = path.map(({ x, y }) => `${x},${y}`).join("|");
		if (!unique.has(key)) unique.set(key, path);
	});

	const paths = Array.from(unique.values()).sort((a, b) =>
		d3.ascending(a.length, b.length)
	);
	const step = Math.max(1, Math.floor(paths.length / sampleSize));
	const rows = d3
		.range(sampleSize)
		.map((i) => paths[i * step])
		.filter(Boolean)
		.map((path) => ({ path: JSON.stringify(path) }));

	fs.writeFileSync(
		`./static/assets/data/${level}-sample-paths.csv`,
		d3.csvFormat(rows)
	);
	console.log(
		`Wrote ${rows.length} of ${paths.length} unique paths to ./static/assets/data/${level}-sample-paths.csv`
	);
}

// how many players matched each optimal solution exactly (12 round2 solutions).
// writes solution_index + count for every optimal solution of the current level.
function writeOptimalSolutionCounts(exampleTests) {
	const optimalRaw = d3.csvParse(
		fs.readFileSync("./tasks/optimal_solutions_multi.csv", "utf-8")
	);

	// exact-path lookup: "x,y|x,y|..." -> solution_index (for this level only)
	const solutionByPath = new Map();
	optimalRaw
		.filter((d) => d.level === level)
		.forEach((d) => {
			const key = JSON.parse(d.path_json)
				.map(({ x, y }) => `${x},${y}`)
				.join("|");
			solutionByPath.set(key, d.solution_index);
		});

	const counts = new Map(
		Array.from(solutionByPath.values(), (idx) => [idx, 0])
	);
	exampleTests.forEach(({ result }) => {
		const key = JSON.parse(result)
			.map(({ x, y }) => `${x},${y}`)
			.join("|");
		const idx = solutionByPath.get(key);
		if (idx !== undefined) counts.set(idx, counts.get(idx) + 1);
	});

	const rows = Array.from(counts, ([solution_index, count]) => ({
		solution_index: +solution_index,
		count
	})).sort((a, b) => d3.ascending(a.solution_index, b.solution_index));

	fs.writeFileSync(
		"./static/assets/data/round2-optimal-solution-counts.csv",
		d3.csvFormat(rows)
	);
	console.log(
		`Wrote ${rows.length} rows to ./static/assets/data/round2-optimal-solution-counts.csv`
	);
	console.table(rows);
}

// write each optimal solution path out to assets/optimal/[level]-[index].csv
function writeOptimalSolutions() {
	const optimalRaw = d3.csvParse(
		fs.readFileSync("./tasks/optimal_solutions_multi.csv", "utf-8")
	);

	// make sure the folder exists and is empty
	if (!fs.existsSync("./static/assets/optimal"))
		fs.mkdirSync("./static/assets/optimal", { recursive: true });
	fs.readdirSync("./static/assets/optimal").forEach((file) => {
		fs.unlinkSync(`./static/assets/optimal/${file}`);
	});

	optimalRaw.forEach(({ level: solutionLevel, solution_index, path_json }) => {
		const parsed = JSON.parse(path_json).map(({ x, y }) => ({ x, y }));
		fs.writeFileSync(
			`./static/assets/optimal/${solutionLevel}-${solution_index}.csv`,
			d3.csvFormat(parsed)
		);
	});

	console.log(`Wrote ${optimalRaw.length} optimal solutions`);
}

// --- main --------------------------------------------------------------------

function main() {
	const { usersLookup, testsRaw, exampleTests } = loadData();
	setupDirs();

	const pathLengths = writeUserPaths(exampleTests);
	const allPathLengths = exampleTests.map(
		({ result }) => JSON.parse(result).length
	);
	const minPathLength = d3.min(Object.values(pathLengths));

	logPathStats(exampleTests, pathLengths, minPathLength);
	logShortestProximity(allPathLengths, minPathLength, exampleTests.length);
	writeFirstMovePauseHistogram(exampleTests);
	writeFinishingSpots(exampleTests);
	logEfficiency(allPathLengths, minPathLength, testsRaw, usersLookup);
	logAllLevels(testsRaw, usersLookup);
	writeLevel2Moves(exampleTests, usersLookup);
	writeMoveCounts(exampleTests);
	writeSamplePaths(exampleTests);
	writeOptimalSolutionCounts(exampleTests);
	writeOptimalSolutions();
}

main();
