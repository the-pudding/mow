import fs from "fs";
import * as d3 from "d3";
import path from "path";

// sarah, cheesepuff, mysterybear, seamus
const USERS_TO_WRITE = ["tt3aprpgrp", "nkdu4xxevi", "2a826e0mz7", "cpt1csrzxq"];

// every level in order
const LEVELS = ["tutorial", "round1", "round2", "bonus1", "bonus2", "bonus3"];
const EXAMPLE_LEVEL = LEVELS[2];
const EXAMPLE2_LEVEL = LEVELS[4];

const COHORT_Q = 0.1;

function setupDirs() {
	if (!fs.existsSync("./static/assets/data"))
		fs.mkdirSync("./static/assets/data", { recursive: true });
}

// one attempt per user per level: drop empty results and unknown users, then
// resolve duplicate (user, level) rows to the earliest attempt. everything
// downstream counts rows, so without this a user who replayed a level would be
// counted twice there and the per-level totals wouldn't line up.
function cleanTests(testsRaw, usersLookup) {
	console.log(testsRaw.length, "raw tests");

	// TODO - decide if we want to include folks who DIDNT play at least round2 or not
	const eligible = testsRaw.filter((d) => LEVELS.includes(d.level));
	// const eligible = e2.filter((d) => usersLookup[d.user_id]);

	const earliest = new Map();
	eligible.forEach((d) => {
		const key = `${d.level}|${d.user_id}`;
		const prev = earliest.get(key);
		if (!prev || d.created_at < prev.created_at) earliest.set(key, d);
	});

	// a level only counts for a user if they also have a valid row on every
	// earlier level in LEVELS order — no skipping ahead. walk LEVELS in
	// order, per level keeping only users who cleared every level before it.
	let eligibleUsers = new Set([...new Set(eligible.map((d) => d.user_id))]);

	const gated = [];

	LEVELS.forEach((lvl) => {
		const nextEligibleUsers = new Set();
		eligibleUsers.forEach((user_id) => {
			const row = earliest.get(`${lvl}|${user_id}`);
			if (row) {
				gated.push(row);
				nextEligibleUsers.add(user_id);
			}
		});
		eligibleUsers = nextEligibleUsers;
	});

	// parse json once up front instead of every function
	const tests = gated
		.map((d) => ({
			...d,
			path: JSON.parse(d.result)
		}))
		.map((d) => ({
			...d,
			path: d.path,
			pathKey: d.path.map(({ x, y }) => `${x},${y}`).join("|")
		}))
		.filter((d) => d.path.length > 1); // drop empty paths

	console.log(
		`Cleaned tests: ${tests.length} kept, ${eligible.length - tests.length} duplicate/skipped-ahead dropped`
	);

	// per-level counts + how many users have a row on every level
	const byLevel = LEVELS.map((lvl) => ({
		level: lvl,
		users: tests.filter((d) => d.level === lvl).length
	}));

	console.table(byLevel);

	return tests;
}

// data loading
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

	testsRaw.sort((a, b) => d3.descending(a.created_at, b.created_at));

	const tests = cleanTests(testsRaw, usersLookup);
	const exampleTests = tests.filter((d) => d.level === EXAMPLE_LEVEL);

	return { usersLookup, testsRaw: tests, exampleTests };
}

// per-step log / write functions

// write every user path for every round, one csv per user under that round's
// folder (assets/round2/<user_id>.csv, assets/round1/<user_id>.csv, ...).
// returns the round unique-path-length lookup that the round stats still use.
function writeUserPaths(testsRaw, usersLookup) {
	const uniquePathsLength = {};

	LEVELS.forEach((lvl) => {
		const dir = `./static/assets/${lvl}`;
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		fs.readdirSync(dir).forEach((file) => fs.unlinkSync(`${dir}/${file}`));

		const tests = testsRaw.filter((d) => d.level === lvl);

		tests.forEach(({ user_id, path, pathKey }) => {
			// write all of round2, other rounds only the featured hard-coded users
			if (lvl === EXAMPLE_LEVEL || USERS_TO_WRITE.includes(user_id)) {
				fs.writeFileSync(`${dir}/${user_id}.csv`, d3.csvFormat(path));
			}
			if (lvl === EXAMPLE_LEVEL) uniquePathsLength[pathKey] = path.length;
		});

		console.log(`Wrote ${tests.length} paths to ${dir}`);
	});

	return uniquePathsLength;
}

// how many users we have, how many unique paths, and the path-length breakdown
function logPathStats(exampleTests, pathLengths, minPathLength) {
	console.log(`----- ${EXAMPLE_LEVEL} -----`);
	console.log(`Users: ${exampleTests.length}`);
	console.log(`Unique paths: ${Object.keys(pathLengths).length}`);

	// table of number of paths by length, sorted
	const pathLengthCounts = d3.rollup(
		Object.values(pathLengths),
		(v) => v.length,
		(d) => d
	);

	// const pathLengthCountsSorted = Array.from(pathLengthCounts)
	// 	.sort((a, b) => a[0] - b[0])
	// 	.slice(0, 5);

	console.log("\n");
}

// how many people came within 0..5 moves of the shortest path
function logShortestProximity(allPathLengths, minPathLength, total) {
	[0, 1, 2, 3, 4, 5].forEach((within) => {
		const count = allPathLengths.filter(
			(length) => length - minPathLength <= within
		).length;
		const percent = d3.format(".2%")(count / total);
		console.log(`Within ${within} moves of shortest: ${count} (${percent})`);
	});
}

// median pause before the first move, plus a binned histogram csv for it
function writeFirstMovePauseHistogram(exampleTests) {
	const firstMovePause = exampleTests.map(({ path }) => path[1].t - path[0].t);
	const medianFirstMovePause = d3.median(firstMovePause);
	console.log(`Median pause time on first move: ${medianFirstMovePause}ms`);

	// convert ms -> seconds rounded to half seconds, then bin
	const pauseSeconds = firstMovePause.map((ms) => Math.round(ms / 500) / 2);
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
		"./static/assets/data/round2-first-move-pause-counts.csv",
		d3.csvFormat(pauseHistogram)
	);
	console.log(
		`Wrote ${pauseHistogram.length} rows to ./static/assets/data/round2-first-move-pause-counts.csv`
	);
}

// finishing spots: player count per (move-count, last square) — feeds the
// left/right "where everyone ended up" heatmaps. Counts every attempt.
function writeFinishingSpots(exampleTests) {
	const last = exampleTests.map(({ path }) => {
		const last = path.at(-1);
		return { moves: path.length, x: last.x, y: last.y };
	});

	const lastMove = d3
		.rollups(
			last,
			(v) => v.length,
			(d) => d.moves,
			(d) => `${d.x},${d.y}`
		)
		.flatMap(([moves, squares]) =>
			squares.map(([xy, count]) => {
				const [x, y] = xy.split(",").map(Number);
				return { moves, x, y, count };
			})
		)
		.sort(
			(a, b) =>
				d3.ascending(a.moves, b.moves) || d3.descending(a.count, b.count)
		);

	fs.writeFileSync(
		`./static/assets/data/${EXAMPLE_LEVEL}-last-move.csv`,
		d3.csvFormat(lastMove)
	);
	console.log(
		`Wrote ${lastMove.length} rows to ./static/assets/data/${EXAMPLE_LEVEL}-last-move.csv`
	);
}

// the first real choice: the opening is forced right along the top row to (4,0)
// (obstacles block y=1 for x<4), so move 6 (index 5) is where players split —
// right to (5,0) or down to (4,1). Feeds the fork viz branch counts.
function writeForkCounts(exampleTests) {
	const forkIndex = 5;
	const paths = exampleTests.map(({ path }) => path);

	const moves = paths.map((p) => {
		const from = p[forkIndex - 1];
		const to = p[forkIndex];
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const direction =
			dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up";
		return { direction, x: to.x, y: to.y };
	});

	const rows = d3
		.rollups(
			moves,
			(v) => v.length,
			(d) => d.direction,
			(d) => `${d.x},${d.y}`
		)
		.flatMap(([direction, squares]) =>
			squares.map(([xy, count]) => {
				const [x, y] = xy.split(",").map(Number);
				return { direction, x, y, count };
			})
		)
		.sort((a, b) => d3.descending(a.count, b.count))
		.slice(0, 2); // only care about the real choice not the backtrack oops

	// write out the percent down/right
	fs.writeFileSync(
		`./static/assets/data/${EXAMPLE_LEVEL}-fork-counts.csv`,
		d3.csvFormat(rows)
	);

	console.log(
		`Wrote ${rows.length} rows to ./static/assets/data/${EXAMPLE_LEVEL}-fork-counts.csv`
	);

	const total = d3.sum(rows, (d) => d.count);
	rows.forEach((d) => {
		d.pct = (d.count / total) * 100;
	});
	console.table(rows);
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
	const lenByLevelUser = new Map(levels.map((l) => [l, new Map()]));

	testsRaw.forEach((d) => {
		lenByLevelUser.get(d.level).set(d.user_id, d.path.length);
	});

	const completedAll = Object.keys(usersLookup).filter((u) =>
		levels.every((l) => lenByLevelUser.get(l).has(u))
	);
	console.log(`Users completing all levels: ${completedAll.length}`);

	const perLevel = levels.map((l) => {
		const effs = completedAll.map(
			(u) => optLen.get(l) / lenByLevelUser.get(l).get(u)
		);
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
	const allTests = testsRaw.filter((d) => d.level === LEVELS.at(-1));

	const medianFirstMovePauseAllLevels = d3.median(
		allTests.map(({ path }) => path[1].t - path[0].t)
	);
	console.log(
		`Median pause time on first move (all levels): ${medianFirstMovePauseAllLevels}ms`
	);
	console.log(`Completed all rounds: ${allTests.length}`);
}

// number of moves for level 2 with user name + id (named users only)
function writeExampleLevelMoves(exampleTests, usersLookup) {
	const moves = exampleTests
		.map(({ user_id, path }) => ({
			user_id,
			name: usersLookup[user_id]?.name,
			moves: path.length
		}))
		.filter(({ name }) => name);

	fs.writeFileSync(`./tasks/${EXAMPLE_LEVEL}_moves.csv`, d3.csvFormat(moves));
	console.log(
		`Wrote ${moves.length} rows to ./tasks/${EXAMPLE_LEVEL}_moves.csv`
	);
}

// the set of users with a run on every level (tests are already one per user
// per level, so "has a row" and "completed" are the same thing here)
function getCompletedAll(tests) {
	const completed = new Map(LEVELS.map((l) => [l, new Set()]));
	tests.forEach((d) => completed.get(d.level).add(d.user_id));

	return new Set(
		Array.from(completed.get(LEVELS[0])).filter((u) =>
			LEVELS.every((l) => completed.get(l).has(u))
		)
	);
}

// one row per completed run: how long the player sat before their first move,
// how long the whole run took, and the mowing time with that opening pause
// removed. completed_all flags runs by players who finished every level.
function writeLevelTimes(tests) {
	const completedAll = getCompletedAll(tests);

	const rows = LEVELS.flatMap((lvl) =>
		tests
			.filter((d) => d.level === lvl)
			.map(({ user_id, path }) => {
				const first_move_ms = path[1].t - path[0].t;
				const total_ms = path.at(-1).t - path[0].t;
				return {
					level: lvl,
					first_move_ms,
					total_ms,
					after_first_move_ms: total_ms - first_move_ms,
					completed_all: completedAll.has(user_id)
				};
			})
	);

	fs.writeFileSync("./tasks/level_times.csv", d3.csvFormat(rows));
	console.log(`Wrote ${rows.length} rows to ./tasks/level_times.csv`);
	console.log(`Users completing all levels: ${completedAll.size}`);

	// sanity check: the completed_all count should be identical on every level.
	// median pause is the wait before the first move, in ms.
	console.table(
		LEVELS.map((lvl) => {
			const atLevel = rows.filter((d) => d.level === lvl);
			const finishers = atLevel.filter((d) => d.completed_all);
			return {
				level: lvl,
				rows: atLevel.length,
				completed_all: finishers.length,
				median_pause_ms: d3.median(atLevel, (d) => d.first_move_ms),
				median_pause_finishers_ms: d3.median(finishers, (d) => d.first_move_ms),
				median_total_ms: d3.median(atLevel, (d) => d.total_ms)
			};
		})
	);
}

// optimality per level, one row per level, p10 / median / p90 of three metrics:
//   efficiency     optimal / actual — 1 is perfect, lower is worse
//   excess_moves   actual - optimal — raw wasted steps, grows with level size
//   excess_per_100 wasted steps per 100 optimal moves — size-adjusted
// quantiles always run low → high, so p10 is the *worst* efficiency but the
// *best* excess. written twice: -completed.csv is only users who finished every
// level (same people in all six rows), -all.csv is everyone who played that
// level (bigger n, but a different crowd per row).
// level -> shortest optimal path length
function loadOptimalLengths() {
	const optimalRaw = d3.csvParse(
		fs.readFileSync("./tasks/optimal_solutions_multi.csv", "utf-8")
	);
	return d3.rollup(
		optimalRaw,
		(v) => d3.min(v, (d) => JSON.parse(d.path_json).length),
		(d) => d.level
	);
}

function writeLevelOptimality(tests) {
	const optLen = loadOptimalLengths();
	const completedAll = getCompletedAll(tests);

	// {label}_p10 / _median / _p90 for one metric, ready to spread into a row
	const band = (label, values, digits) => {
		const sorted = values.slice().sort(d3.ascending);
		const at = (p) => {
			const v = d3.quantile(sorted, p);
			return v === undefined ? "" : +v.toFixed(digits);
		};
		return {
			[`${label}_p10`]: at(0.1),
			[`${label}_median`]: at(0.5),
			[`${label}_p90`]: at(0.9)
		};
	};

	const bands = (keep) =>
		LEVELS.map((lvl) => {
			const optimal = optLen.get(lvl);
			const actual = tests
				.filter((d) => d.level === lvl)
				.filter(keep)
				.map((d) => d.path.length);

			return {
				level: lvl,
				optimal,
				n: actual.length,
				...band(
					"efficiency",
					actual.map((a) => optimal / a),
					4
				)
			};
		});

	const cohorts = [
		{
			file: "level-optimality-completed.csv",
			keep: (d) => completedAll.has(d.user_id)
		},
		{ file: "level-optimality-all.csv", keep: () => true }
	];

	cohorts.forEach(({ file, keep }) => {
		const rows = bands(keep);
		fs.writeFileSync(`./static/assets/data/${file}`, d3.csvFormat(rows));
		console.log(`Wrote ${rows.length} rows to ./static/assets/data/${file}`);
		console.table(rows);
	});
}

// every run as a (time, optimality) point, binned so repeats collapse to a
// count — feeds a scatter/heatmap of "how long did it take vs how good was it".
// time is total run seconds rounded to a tenth; optimality is efficiency
// (optimal / actual) rounded to 0.1% (three decimals). one row per distinct
// (level, time, optimality) cell.
function writeTimeOptimality(tests) {
	const optLen = loadOptimalLengths();

	const points = tests.map(({ level, path }) => {
		const total_ms = path.at(-1).t - path[0].t;
		return {
			level,
			time: Math.round(total_ms / 100) / 10,
			optimality: Math.round((optLen.get(level) / path.length) * 1000) / 1000
		};
	});

	const rows = d3
		.rollups(
			points,
			(v) => v.length,
			(d) => d.level,
			(d) => d.time,
			(d) => d.optimality
		)
		.flatMap(([lvl, byTime]) =>
			byTime.flatMap(([time, byOpt]) =>
				byOpt.map(([optimality, count]) => ({
					level: lvl,
					time,
					optimality,
					count
				}))
			)
		)
		.sort(
			(a, b) =>
				LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) ||
				d3.ascending(a.time, b.time) ||
				d3.ascending(a.optimality, b.optimality)
		);

	fs.writeFileSync(
		"./static/assets/data/level-time-optimality.csv",
		d3.csvFormat(rows)
	);
	console.log(
		`Wrote ${rows.length} rows to ./static/assets/data/level-time-optimality.csv`
	);
}

// empirical percentile rank (0-100) of each value within `values`, aligned to
// the input order. ties share the average rank of the tied block so equal
// values land on the same percentile.
function percentileRanks(values) {
	const n = values.length;
	const order = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
	const ranks = new Array(n);
	let i = 0;
	while (i < n) {
		let j = i;
		while (j + 1 < n && order[j + 1][0] === order[i][0]) j++;
		const pct = n > 1 ? (((i + j) / 2) * 100) / (n - 1) : 0;
		for (let k = i; k <= j; k++) ranks[order[k][1]] = pct;
		i = j + 1;
	}
	return ranks;
}

// fraction of `sorted` (ascending) at or below `v` — R's ecdf(), i.e. percentile
// rank as "how many finished at or below me", not the tie-averaged rank
// percentileRanks() above uses. Ties all land on the same (higher) percentile.
function ecdfPercent(sorted, v) {
	return sorted.length ? d3.bisectRight(sorted, v) / sorted.length : undefined;
}

// one row per user, collapsing every non-tutorial level they played into two
// numbers: mean optimality and mean pace. pace is duration_s / optimal length
// (seconds per required square, not per move they actually took) — dividing
// by their own path length would entangle pace with optimality, since a
// meandering path both lowers optimality and inflates the move count that's
// diluting the per-move time. dividing by optimal length keeps pace an
// independent axis, and normalizes across levels of different sizes the same
// way the optimality ratio does. zero-duration rows are dropped before
// averaging (skipped instant/auto-submitted attempts). a user only counts as
// `completed_all` if they have a row for every non-tutorial level - only that
// pool is written out, and each user's mean_opt/mean_pace is converted to an
// ECDF percentile (opt_pct/pace_pct) within that same pool, so the round set
// is held fixed and easy-round-only players can't skew it.
function writePercentileOptimalityTime(tests) {
	const optLen = loadOptimalLengths();
	const nonTutorial = LEVELS.filter((lvl) => lvl !== "tutorial");

	const perRun = tests
		.filter((d) => nonTutorial.includes(d.level))
		.map((d) => {
			const optimal = optLen.get(d.level);
			const duration_s = (d.path.at(-1).t - d.path[0].t) / 1000;
			return {
				user_id: d.user_id,
				level: d.level,
				optimality: optimal / d.path.length,
				pace_s: duration_s / optimal,
				duration_s
			};
		})
		.filter(Boolean);

	const userAgg = d3
		.groups(perRun, (d) => d.user_id)
		.map(([user_id, rows]) => {
			const completed_all =
				new Set(rows.map((r) => r.level)).size === nonTutorial.length;
			const mean_opt = d3.mean(rows, (r) => r.optimality);
			const paces = rows.filter((r) => r.duration_s > 0).map((r) => r.pace_s);
			const mean_pace = paces.length ? d3.mean(paces) : undefined;
			return { user_id, completed_all, mean_opt, mean_pace };
		});

	// thresholds/percentiles taken only over the completed-all pool
	const ca = userAgg.filter((d) => d.completed_all);
	const optSorted = ca.map((d) => d.mean_opt).sort(d3.ascending);
	const paceSorted = ca.map((d) => d.mean_pace).sort(d3.ascending);

	const rows = ca.map((d) => {
		const hasPace = d.mean_pace !== undefined;
		return {
			// user_id: d.user_id,
			opt_pct: +ecdfPercent(optSorted, d.mean_opt).toFixed(4),
			pace_pct: hasPace ? +ecdfPercent(paceSorted, d.mean_pace).toFixed(4) : ""
		};
	});

	fs.writeFileSync(
		"./static/assets/data/percentile-optimality-time.csv",
		d3.csvFormat(rows)
	);
	console.log(
		`Wrote ${rows.length} rows to ./static/assets/data/percentile-optimality-time.csv`
	);
}

// distribution of path lengths: how many players took each number of moves
function writeMoveCounts(exampleTests) {
	const rows = d3
		.rollups(
			exampleTests,
			(v) => v.length,
			({ path }) => path.length
		)
		.map(([moves, count]) => ({ moves, count }))
		.sort((a, b) => d3.ascending(a.moves, b.moves));

	fs.writeFileSync(
		`./static/assets/data/${EXAMPLE_LEVEL}-move-counts.csv`,
		d3.csvFormat(rows)
	);
	console.log(
		`Wrote ${rows.length} rows to ./static/assets/data/${EXAMPLE_LEVEL}-move-counts.csv`
	);
}

// an evenly-spaced sample of unique paths for drawing on the grid. dedupes,
// sorts by length, then takes every Nth so the sample spans short -> long runs
// and comes out identical on every run. one column of JSON: [{"x":0,"y":0},...]
function writeSamplePaths(exampleTests, sampleSize = 100) {
	const unique = new Map();
	exampleTests.forEach(({ user_id, path, pathKey }) => {
		const pathNoT = path.map(({ x, y }) => ({ x, y }));
		if (!unique.has(pathKey)) unique.set(pathKey, { user_id, path });
	});

	const paths = Array.from(unique.values()).sort((a, b) =>
		d3.ascending(a.path.length, b.path.length)
	);
	const step = Math.max(1, Math.floor(paths.length / sampleSize));
	const rows = d3
		.range(sampleSize)
		.map((i) => paths[i * step])
		.filter(Boolean)
		.map(({ user_id, path }) => ({ user_id, path: JSON.stringify(path) }));

	fs.writeFileSync(
		`./static/assets/data/${EXAMPLE_LEVEL}-sample-paths.csv`,
		d3.csvFormat(rows)
	);
	console.log(
		`Wrote ${rows.length} of ${paths.length} unique paths to ./static/assets/data/${EXAMPLE_LEVEL}-sample-paths.csv`
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
		.filter((d) => d.level === EXAMPLE_LEVEL)
		.forEach((d) => {
			const key = JSON.parse(d.path_json)
				.map(({ x, y }) => `${x},${y}`)
				.join("|");
			solutionByPath.set(key, d.solution_index);
		});

	const counts = new Map(
		Array.from(solutionByPath.values(), (idx) => [idx, 0])
	);
	exampleTests.forEach(({ pathKey }) => {
		const idx = solutionByPath.get(pathKey);
		if (idx !== undefined) counts.set(idx, counts.get(idx) + 1);
	});

	const rows = Array.from(counts, ([solution_index, count]) => ({
		solution_index: +solution_index,
		count
	})).sort((a, b) => d3.ascending(a.solution_index, b.solution_index));

	fs.writeFileSync(
		`./static/assets/data/${EXAMPLE_LEVEL}-optimal-solution-counts.csv`,
		d3.csvFormat(rows)
	);
	console.log(
		`Wrote ${rows.length} rows to ./static/assets/data/${EXAMPLE_LEVEL}-optimal-solution-counts.csv`
	);
	console.table(rows);
}

// TODO revisit or flag in methodlogy
// aggregate pause heatmap: for every cell on `lvl`'s lawn, how long players
// lingered there across all their runs. per-player dwell at a cell is summed
// across revisits (same as the Tour's single-path dwellHeatmap), then the
// per-cell mean/median is taken across every player who visited that cell.
// steps over 60s are dropped as AFK, not a real pause (same cutoff
// writeFirstMovePauseHistogram uses for the first-move pause).
const PAUSE_STEP_CAP_S = 60;

// per-cell mean/median dwell seconds across `tests` (already filtered to the
// cohort of interest); one seconds-value per player per cell they visited.
function dwellRows(tests) {
	const perCell = new Map(); // "x,y" -> seconds[], one entry per player who visited

	tests.forEach(({ path }) => {
		const dwell = new Map();
		for (let i = 0; i < path.length - 1; i++) {
			const dt = (path[i + 1].t - path[i].t) / 1000;
			if (dt > PAUSE_STEP_CAP_S) continue;
			const key = `${path[i].x},${path[i].y}`;
			dwell.set(key, (dwell.get(key) ?? 0) + dt);
		}
		dwell.forEach((seconds, key) => {
			if (!perCell.has(key)) perCell.set(key, []);
			perCell.get(key).push(seconds);
		});
	});

	return Array.from(perCell, ([key, values]) => {
		const [x, y] = key.split(",").map(Number);
		return {
			x,
			y,
			players: values.length,
			mean_seconds: +d3.mean(values).toFixed(2),
			median_seconds: +d3.median(values).toFixed(2)
		};
	}).sort((a, b) => d3.ascending(a.y, b.y) || d3.ascending(a.x, b.x));
}

// writes the pause heatmap for `lvl` three ways: everyone, the top cohort
// (efficiency >= 90th percentile for that level), and the worst cohort
// (efficiency <= 10th percentile). efficiency here is optimal / actual path
// length for that single (earliest) attempt, same metric writeUserCohorts
// ranks players on, just computed within this level instead of averaged
// across all of them.
function writePauseHeatmap(testsRaw, lvl) {
	const optLen = loadOptimalLengths();
	const optimal = optLen.get(lvl);
	const tests = testsRaw.filter((d) => d.level === lvl);

	const withEfficiency = tests.map((d) => ({
		...d,
		efficiency: optimal / d.path.length
	}));
	const effSorted = withEfficiency.map((d) => d.efficiency).sort(d3.ascending);
	const topCutoff = d3.quantile(effSorted, 1 - COHORT_Q);
	const bottomCutoff = d3.quantile(effSorted, COHORT_Q);

	const cohorts = [
		{ suffix: "", tests },
		{
			suffix: "-top",
			tests: withEfficiency.filter((d) => d.efficiency >= topCutoff)
		},
		{
			suffix: "-bottom",
			tests: withEfficiency.filter((d) => d.efficiency <= bottomCutoff)
		}
	];

	cohorts.forEach(({ suffix, tests: cohortTests }) => {
		const rows = dwellRows(cohortTests);
		const file = `./static/assets/data/${lvl}-pause-heatmap${suffix}.csv`;
		fs.writeFileSync(file, d3.csvFormat(rows));
		console.log(
			`Wrote ${rows.length} rows (${cohortTests.length} players) to ${file}`
		);
	});
}

// --- sandbox heatmaps -------------------------------------------------------

// The three aggregate views the reader toggles between in the Sandbox, written
// for every level as {lvl}-heatmap-{name}.csv. Every file is x,y,value — value
// is what HeatmapLayer colors — plus supporting columns for reference.
//   pause     median seconds a player lingered on that square
//   ending    players whose last square was that one
//   backtrack players who mowed that square more than once

// counts keyed "x,y" -> rows, with value = count and its share of `total`
function heatmapRows(counts, total) {
	return Array.from(counts, ([key, count]) => {
		const [x, y] = key.split(",").map(Number);
		return {
			x,
			y,
			value: count,
			pct: total ? +((count / total) * 100).toFixed(1) : 0
		};
	}).sort((a, b) => d3.ascending(a.y, b.y) || d3.ascending(a.x, b.x));
}

// median dwell per cell, reusing the same per-player dwell math (and 60s AFK
// cutoff) as the cohort pause heatmaps
function pauseHeatmapRows(tests) {
	return dwellRows(tests).map(
		({ x, y, players, median_seconds, mean_seconds }) => ({
			x,
			y,
			value: median_seconds,
			players,
			mean_seconds
		})
	);
}

function endingHeatmapRows(tests) {
	const counts = new Map();
	tests.forEach(({ path }) => {
		const { x, y } = path.at(-1);
		const key = `${x},${y}`;
		counts.set(key, (counts.get(key) ?? 0) + 1);
	});
	return heatmapRows(counts, tests.length);
}

// one player counts once per square they revisited, however many times they
// revisited it — this is "how many people got sent back here", not total steps
function backtrackHeatmapRows(tests) {
	const counts = new Map();
	tests.forEach(({ path }) => {
		const visits = new Map();
		path.forEach(({ x, y }) => {
			const key = `${x},${y}`;
			visits.set(key, (visits.get(key) ?? 0) + 1);
		});
		visits.forEach((n, key) => {
			if (n > 1) counts.set(key, (counts.get(key) ?? 0) + 1);
		});
	});
	return heatmapRows(counts, tests.length);
}

function writeSandboxHeatmaps(testsRaw) {
	const builders = {
		pause: pauseHeatmapRows,
		ending: endingHeatmapRows,
		backtrack: backtrackHeatmapRows
	};

	LEVELS.forEach((lvl) => {
		const tests = testsRaw.filter((d) => d.level === lvl);
		if (!tests.length) {
			console.log(`No tests for ${lvl}, skipping sandbox heatmaps`);
			return;
		}

		Object.entries(builders).forEach(([name, build]) => {
			const rows = build(tests);
			const file = `./static/assets/data/${lvl}-heatmap-${name}.csv`;
			fs.writeFileSync(file, d3.csvFormat(rows));
			console.log(
				`Wrote ${rows.length} rows (${tests.length} players) to ${file}`
			);
		});
	});
}

// one row per player who ran `lvl`: their id, optimality (optimal / actual
// path length), and the timestamp of their last move.
function writeLevelSummary(testsRaw, usersLookup, lvl) {
	const optLen = loadOptimalLengths();
	const optimal = optLen.get(lvl);
	const tests = testsRaw.filter((d) => d.level === lvl);

	const rows = tests.map((d) => {
		return {
			user_id: d.user_id,
			name: usersLookup[d.user_id]?.name,
			optimality: +(optimal / d.path.length).toFixed(4),
			first_move_t: d.path.length > 1 ? d.path[1].t : null,
			last_move_t: d.path.at(-1).t
		};
	});

	const file = `./tasks/${lvl}-summary.csv`;
	fs.writeFileSync(file, d3.csvFormat(rows));
	console.log(`Wrote ${rows.length} rows to ${file}`);
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

function writeSanitized(testsRaw, usersLookup) {
	const tests = testsRaw.map(({ user_id, level, platform, result }) => ({
		user_id,
		level,
		result,
		platform
	}));
	fs.writeFileSync("./tasks/sanitized-tests.csv", d3.csvFormat(tests));

	const users = Object.entries(usersLookup).map(
		([user_id, { age, style, gaming, hand, optimization }]) => ({
			user_id,
			age,
			style,
			gaming,
			hand,
			optimization
		})
	);
	fs.writeFileSync("./tasks/sanitized-demographics.csv", d3.csvFormat(users));
}

// mean optimality (optimal / actual, averaged across all levels) for users who
// completed every level, split by gaming survey answer — "Regularly" vs
// "Rarely or never" (the "Sometimes" / blank answers are excluded).
function logGamers(testsRaw, usersLookup) {
	const optLen = loadOptimalLengths();
	const completedAll = getCompletedAll(testsRaw);

	const byLevelUser = new Map(LEVELS.map((l) => [l, new Map()]));
	testsRaw.forEach((d) =>
		byLevelUser.get(d.level).set(d.user_id, d.path.length)
	);

	const meanOptByUser = new Map(
		Array.from(completedAll).map((user_id) => {
			const optimalities = LEVELS.map(
				(l) => optLen.get(l) / byLevelUser.get(l).get(user_id)
			);
			return [user_id, d3.mean(optimalities)];
		})
	);

	const GAMING_GROUPS = ["Regularly", "Rarely or never"];

	const rows = GAMING_GROUPS.map((gaming) => {
		const values = Array.from(meanOptByUser)
			.filter(([user_id]) => usersLookup[user_id]?.gaming === gaming)
			.map(([, v]) => v);

		return {
			gaming,
			n: values.length,
			mean_optimality: +d3.mean(values).toFixed(4),
			median_optimality: +d3.median(values).toFixed(4)
		};
	});

	console.log(
		"Mean optimality by gaming frequency (users who completed all levels):"
	);
	console.table(rows);
}

function main() {
	setupDirs();
	const { usersLookup, testsRaw, exampleTests } = loadData();

	// logGamers(testsRaw, usersLookup);
	process.exit();
	const exampleUniquePathsLengths = writeUserPaths(testsRaw, usersLookup);

	const exampleAllPathLengths = exampleTests.map(({ path }) => path.length);

	const minPathLength = d3.min(exampleAllPathLengths);
	logPathStats(exampleTests, exampleUniquePathsLengths, minPathLength);

	logShortestProximity(
		exampleAllPathLengths,
		minPathLength,
		exampleTests.length
	);

	writeFirstMovePauseHistogram(exampleTests);
	writeFinishingSpots(exampleTests);
	writeForkCounts(exampleTests);
	logEfficiency(exampleAllPathLengths, minPathLength, testsRaw, usersLookup);

	logAllLevels(testsRaw, usersLookup);
	writeExampleLevelMoves(exampleTests, usersLookup);
	writeLevelTimes(testsRaw);
	writeLevelOptimality(testsRaw);
	writeTimeOptimality(testsRaw);
	writePercentileOptimalityTime(testsRaw);
	writeMoveCounts(exampleTests);
	writeSamplePaths(exampleTests);
	writeOptimalSolutionCounts(exampleTests);
	writeOptimalSolutions();
	writePauseHeatmap(testsRaw, EXAMPLE2_LEVEL);
	writeSandboxHeatmaps(testsRaw);
	writeLevelSummary(testsRaw, usersLookup, EXAMPLE2_LEVEL);

	writeSanitized(testsRaw, usersLookup);
}

main();
