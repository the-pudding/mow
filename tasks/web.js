import fs from "fs";
import * as d3 from "d3";

const level = "round2";
const usersToWrite = ["tt3aprpgrp"];

// every playable round, oldest → newest. user paths get written per round.
const LEVELS = ["tutorial", "round1", "round2", "bonus1", "bonus2", "bonus3"];

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

	const tests = cleanTests(testsRaw, usersLookup);

	const exampleTests = tests
		.filter((d) => d.level === level)
		.filter((d) => d.result !== "[]")
		.filter((d) => usersLookup[d.user_id]); // only keep users that are in the usersRaw

	exampleTests.sort((a, b) => d3.descending(a.created_at, b.created_at));

	return { usersLookup, testsRaw: tests, exampleTests };
}

// one attempt per user per level: drop empty results and unknown users, then
// resolve duplicate (user, level) rows to the earliest attempt. everything
// downstream counts rows, so without this a user who replayed a level would be
// counted twice there and the per-level totals wouldn't line up.
function cleanTests(testsRaw, usersLookup) {
	const eligible = testsRaw
		.filter((d) => d.result !== "[]")
		.filter((d) => usersLookup[d.user_id])
		.filter((d) => LEVELS.includes(d.level));

	const earliest = new Map();
	eligible.forEach((d) => {
		const key = `${d.level}|${d.user_id}`;
		const prev = earliest.get(key);
		if (!prev || d.created_at < prev.created_at) earliest.set(key, d);
	});

	const tests = Array.from(earliest.values());
	console.log(
		`Cleaned tests: ${tests.length} kept, ${eligible.length - tests.length} duplicate (user, level) rows dropped`
	);

	// per-level counts + how many users have a row on every level
	const byLevel = LEVELS.map((lvl) => ({
		level: lvl,
		users: tests.filter((d) => d.level === lvl).length
	}));
	console.table(byLevel);

	return tests;
}

function setupDirs() {
	// per-round user path folders are created/cleared in writeUserPaths; just
	// make sure the aggregate data folder exists here.
	if (!fs.existsSync("./static/assets/data"))
		fs.mkdirSync("./static/assets/data", { recursive: true });
}

// --- per-step log / write functions -----------------------------------------

// write every user's path for every round, one csv per user under that round's
// folder (assets/round2/<user_id>.csv, assets/round1/<user_id>.csv, ...).
// returns the round2 unique-path-length lookup that the round2 stats still use.
function writeUserPaths(testsRaw, usersLookup) {
	const pathLengths = {};

	LEVELS.forEach((lvl) => {
		const dir = `./static/assets/${lvl}`;
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		fs.readdirSync(dir).forEach((file) => fs.unlinkSync(`${dir}/${file}`));

		const tests = testsRaw
			.filter((d) => d.level === lvl)
			.filter((d) => d.result !== "[]")
			.filter((d) => usersLookup[d.user_id]);
		tests.sort((a, b) => d3.descending(a.created_at, b.created_at));

		tests.forEach(({ user_id, result }) => {
			const parsed = JSON.parse(result);
			// write all of round2 (the "level"); other rounds only the featured users
			if (lvl === level || usersToWrite.includes(user_id)) {
				fs.writeFileSync(`${dir}/${user_id}.csv`, d3.csvFormat(parsed));
			}
			if (lvl === level) {
				const key = parsed.map(({ x, y }) => `${x},${y}`).join("|");
				pathLengths[key] = parsed.length;
			}
		});

		console.log(`Wrote ${tests.length} paths to ${dir}`);
	});

	return pathLengths;
}

// how many users we have, how many unique paths, and the path-length breakdown
function logPathStats(exampleTests, pathLengths, minPathLength) {
	console.log("Round 2");
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

	// filter out pauses over 60 seconds
	const pauseFiltered = firstMovePause.filter((ms) => ms <= 60000);
	console.log(
		`Filtered out ${firstMovePause.length - pauseFiltered.length} pauses over 60s`
	);

	// convert ms -> seconds rounded to half seconds, then bin
	const pauseSeconds = pauseFiltered.map((ms) => Math.round(ms / 500) / 2);
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
		`Wrote ${pauseHistogram.length} bins to ./static/assets/data/round2-first-move-pause-counts.csv`
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

// the first real choice: the opening is forced right along the top row to (4,0)
// (obstacles block y=1 for x<4), so move 6 (index 5) is where players split —
// right to (5,0) or down to (4,1). Feeds the fork viz branch counts.

function writeForkCounts(exampleTests) {
	const forkIndex = 5;
	const paths = exampleTests
		.map(({ result }) => JSON.parse(result))
		.filter((p) => p.length > forkIndex);

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
		.slice(0, 2);

	// log out the percent down/right
	fs.writeFileSync(
		`./static/assets/data/${level}-fork-counts.csv`,
		d3.csvFormat(rows)
	);

	console.log(
		`Wrote ${rows.length} rows to ./static/assets/data/${level}-fork-counts.csv`
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
	const bestLen = new Map(levels.map((l) => [l, new Map()]));
	testsRaw
		.filter((d) => d.result !== "[]")
		.filter((d) => usersLookup[d.user_id])
		.filter((d) => bestLen.has(d.level))
		.forEach((d) => {
			const len = JSON.parse(d.result).length;
			const m = bestLen.get(d.level);
			if (!m.has(d.user_id) || len < m.get(d.user_id)) m.set(d.user_id, len);
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
			.map((d) => ({ user_id: d.user_id, path: JSON.parse(d.result) }))
			.filter(({ path }) => path.length > 1)
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
				.map((d) => JSON.parse(d.result).length);

			return {
				level: lvl,
				optimal,
				n: actual.length,
				...band(
					"efficiency",
					actual.map((a) => optimal / a),
					4
				),
				...band(
					"excess_moves",
					actual.map((a) => a - optimal),
					1
				),
				...band(
					"excess_per_100",
					actual.map((a) => ((a - optimal) / optimal) * 100),
					2
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

	const points = tests
		.map((d) => ({ level: d.level, path: JSON.parse(d.result) }))
		.filter(({ path }) => path.length > 1)
		.map(({ level, path }) => {
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

// every run as a (percentile_optimal, percentile_time) point, binned so
// repeats collapse to a count — feeds a 0-100% x 0-100% scatter of how a
// run's speed ranked against how efficient it was. percentiles are computed
// within each level's own population (not pooled), then rounded to the
// nearest 0.1%.
function writePercentileOptimalityTime(tests) {
	const optLen = loadOptimalLengths();

	const points = tests
		.map((d) => ({ level: d.level, path: JSON.parse(d.result) }))
		.filter(({ path }) => path.length > 1)
		.map(({ level, path }) => ({
			level,
			time: (path.at(-1).t - path[0].t) / 1000,
			optimality: optLen.get(level) / path.length
		}));

	const rounded = LEVELS.flatMap((lvl) => {
		const levelPoints = points.filter((d) => d.level === lvl);
		const optimalPct = percentileRanks(levelPoints.map((d) => d.optimality));
		const timePct = percentileRanks(levelPoints.map((d) => d.time));

		return levelPoints.map((d, i) => ({
			level: d.level,
			percentile_optimal: Math.round(optimalPct[i] * 10) / 10,
			percentile_time: Math.round(timePct[i] * 10) / 10
		}));
	});

	const rows = d3
		.rollups(
			rounded,
			(v) => v.length,
			(d) => d.level,
			(d) => d.percentile_optimal,
			(d) => d.percentile_time
		)
		.flatMap(([lvl, byOpt]) =>
			byOpt.flatMap(([percentile_optimal, byTime]) =>
				byTime.map(([percentile_time, count]) => ({
					level: lvl,
					percentile_optimal,
					percentile_time,
					count
				}))
			)
		)
		.sort(
			(a, b) =>
				LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) ||
				d3.ascending(a.percentile_optimal, b.percentile_optimal) ||
				d3.ascending(a.percentile_time, b.percentile_time)
		);

	fs.writeFileSync(
		"./static/assets/data/percentile-optimality-time.csv",
		d3.csvFormat(rows)
	);
	console.log(
		`Wrote ${rows.length} rows to ./static/assets/data/percentile-optimality-time.csv`
	);
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
// `completed_all` if they have a row for every non-tutorial level -
// percentiles and the top/worst/quick/slow 10% tails are computed only
// within that completed_all pool, so the round set is held fixed and
// easy-round-only players can't skew it.
const COHORT_Q = 0.1;
function writeUserCohorts(tests) {
	const optLen = loadOptimalLengths();
	const nonTutorial = LEVELS.filter((lvl) => lvl !== "tutorial");

	const perRun = tests
		.filter((d) => nonTutorial.includes(d.level))
		.map((d) => {
			const path = JSON.parse(d.result);
			if (path.length <= 1) return null;
			const optimal = optLen.get(d.level);
			const duration_s = (path.at(-1).t - path[0].t) / 1000;
			return {
				user_id: d.user_id,
				level: d.level,
				optimality: optimal / path.length,
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
	const paceSorted = ca
		.filter((d) => d.mean_pace !== undefined)
		.map((d) => d.mean_pace)
		.sort(d3.ascending);

	const optHi = d3.quantile(optSorted, 1 - COHORT_Q);
	const optLo = d3.quantile(optSorted, COHORT_Q);
	const paceLo = d3.quantile(paceSorted, COHORT_Q);
	const paceHi = d3.quantile(paceSorted, 1 - COHORT_Q);

	// only the completed-all cohort ships — that's the fixed-round-set pool the
	// percentiles/thresholds above were computed over in the first place.
	const rows = ca.map((d) => {
		const hasPace = d.mean_pace !== undefined;
		return {
			// user_id: d.user_id,
			// mean_opt: +d.mean_opt.toFixed(4),
			// mean_pace: hasPace ? +d.mean_pace.toFixed(3) : "",
			opt_pct: +ecdfPercent(optSorted, d.mean_opt).toFixed(4),
			pace_pct: hasPace ? +ecdfPercent(paceSorted, d.mean_pace).toFixed(4) : ""
			// top_solver: d.mean_opt >= optHi,
			// worst_solver: d.mean_opt <= optLo,
			// quick_solver: hasPace && d.mean_pace <= paceLo,
			// slow_solver: hasPace && d.mean_pace >= paceHi
		};
	});

	fs.writeFileSync("./static/assets/data/user-cohorts.csv", d3.csvFormat(rows));
	console.log(
		`Wrote ${rows.length} rows to ./static/assets/data/user-cohorts.csv`
	);

	const cohortCols = [
		"top_solver",
		"worst_solver",
		"quick_solver",
		"slow_solver"
	];
	console.log(`cohort sizes (of ${rows.length} completed_all users):`);
	console.table(
		Object.fromEntries(
			cohortCols.map((c) => [c, rows.filter((r) => r[c]).length])
		)
	);
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
function writeSamplePaths(exampleTests, sampleSize = 100) {
	const unique = new Map();
	exampleTests.forEach(({ user_id, result }) => {
		const path = JSON.parse(result).map(({ x, y }) => ({ x, y }));
		const key = path.map(({ x, y }) => `${x},${y}`).join("|");
		if (!unique.has(key)) unique.set(key, { user_id, path });
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

	tests.forEach(({ result }) => {
		const path = JSON.parse(result);
		if (path.length < 2) return;

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
		efficiency: optimal / JSON.parse(d.result).length
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

	const pathLengths = writeUserPaths(testsRaw, usersLookup);
	const allPathLengths = exampleTests.map(
		({ result }) => JSON.parse(result).length
	);
	const minPathLength = d3.min(Object.values(pathLengths));

	logPathStats(exampleTests, pathLengths, minPathLength);
	logShortestProximity(allPathLengths, minPathLength, exampleTests.length);
	writeFirstMovePauseHistogram(exampleTests);
	writeFinishingSpots(exampleTests);
	writeForkCounts(exampleTests);
	logEfficiency(allPathLengths, minPathLength, testsRaw, usersLookup);
	logAllLevels(testsRaw, usersLookup);
	writeLevel2Moves(exampleTests, usersLookup);
	writeLevelTimes(testsRaw);
	writeLevelOptimality(testsRaw);
	writeTimeOptimality(testsRaw);
	writePercentileOptimalityTime(testsRaw);
	writeUserCohorts(testsRaw);
	writeMoveCounts(exampleTests);
	writeSamplePaths(exampleTests);
	writeOptimalSolutionCounts(exampleTests);
	writeOptimalSolutions();
	writePauseHeatmap(testsRaw, "bonus2");
}

main();
