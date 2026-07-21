import fs from "fs";
import * as d3 from "d3";

const level = "round2";

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

// make sure the folders exist
if (!fs.existsSync("./static/assets/users"))
	fs.mkdirSync("./static/assets/users", { recursive: true });
if (!fs.existsSync("./static/assets/data"))
	fs.mkdirSync("./static/assets/data", { recursive: true });

// clear out static/assets/users
fs.readdirSync("./static/assets/users").forEach((file) => {
	fs.unlinkSync(`./static/assets/users/${file}`);
});

const paths = {};
const pathLengths = {};

// log level 2 numbers and save each path
exampleTests.forEach(({ user_id, result }) => {
	const file = `./static/assets/users/${user_id}.csv`;
	const parsed = JSON.parse(result);
	const temp = parsed.map(({ x, y }) => `${x},${y}`).join("|");
	paths[temp] = parsed.length;
	pathLengths[temp] = parsed.length;
	fs.writeFileSync(file, d3.csvFormat(parsed));
});

// tell me how many users we have, how many unique paths they took on level
console.log(`Users: ${exampleTests.length}`);
console.log(`Unique paths: ${Object.keys(paths).length}`);

const minPathLength = d3.min(Object.values(pathLengths));
// how many paths are of length minPathLength
const minPathCount = Object.values(pathLengths).filter(
	(length) => length === minPathLength
).length;

console.log(`Min path length: ${minPathLength}`);
console.log(`Min path count: ${minPathCount}`);

// log table of number of paths by length, sorted
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

// log how many people came within 3 moves, 4 moves, 5 moves of shortest path
const allPathLengths = exampleTests.map(
	({ result }) => JSON.parse(result).length
);
[0, 1, 2, 3, 4, 5].forEach((within) => {
	const count = allPathLengths.filter(
		(length) => length - minPathLength <= within
	).length;
	const percent = (count / exampleTests.length).toFixed(4);
	console.log(`Within ${within} moves of shortest: ${count} (${percent})`);
});

// log the median pause time on the first move, for level 2
const firstMovePause = exampleTests
	.map(({ result }) => JSON.parse(result))
	.filter((parsed) => parsed.length > 1)
	.map((parsed) => parsed[1].t - parsed[0].t);
const medianFirstMovePause = d3.median(firstMovePause);
console.log(`Median pause time on first move: ${medianFirstMovePause}ms`);

// use firstMovePause make pause time .1 fix, bin values, output csv (for histogram)
// filter out pauses over 15 seconds
const pauseFiltered = firstMovePause.filter((ms) => ms <= 15000);
console.log(
	`Filtered out ${firstMovePause.length - pauseFiltered.length} pauses over 15s`
);
// convert ms -> seconds rounded to quarter seconds
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

// finishing spots: player count per (move-count, last square) — feeds the
// left/right "where everyone ended up" heatmaps. Counts every attempt.
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

// efficiency
const efficiencies = allPathLengths.map((length) => minPathLength / length);
const meanEfficiency = d3.mean(efficiencies);
const medianEfficiency = d3.median(efficiencies);
console.log(`Mean efficiency: ${meanEfficiency.toFixed(4)}`);
console.log(`Median efficiency: ${medianEfficiency.toFixed(4)}`);

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

// write a new file (into tasks folder) that has the number of moves for level 2, user name, user id (and filter out users that don't have a name)
const level2Moves = exampleTests
	.map(({ user_id, result }) => ({
		user_id,
		name: usersLookup[user_id].name,
		moves: JSON.parse(result).length
	}))
	.filter(({ name }) => name);

fs.writeFileSync("./tasks/level2_moves.csv", d3.csvFormat(level2Moves));
console.log(`Wrote ${level2Moves.length} rows to ./tasks/level2_moves.csv`);

// load optimal_moves_multi for each level 2 solution, write out a csv of x/y to a assets/optimal/[index].csv file
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
