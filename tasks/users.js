import fs from "fs";
import * as d3 from "d3";

const level = "round2";

const usersRaw = d3.csvParse(
	fs.readFileSync("./tasks/mow_users_rows.csv", "utf-8")
);

// make usersRaw a lookup table by user_id
const usersLookup = {};
usersRaw.forEach((d) => {
	usersLookup[d.user_id] = d;
});

const tests = d3
	.csvParse(fs.readFileSync("./tasks/mow_test_rows.csv", "utf-8"))
	.filter((d) => d.level === level)
	.filter((d) => d.result !== "[]")
	.filter((d) => usersLookup[d.user_id]); // only keep users that are in the usersRaw

tests.sort((a, b) => d3.descending(a.created_at, b.created_at));

// make sure the folder exists
if (!fs.existsSync("./static/assets/users"))
	fs.mkdirSync("./static/assets/users", { recursive: true });

// clear out static/assets/users
fs.readdirSync("./static/assets/users").forEach((file) => {
	fs.unlinkSync(`./static/assets/users/${file}`);
});

const paths = {};
const pathLengths = {};

tests.forEach(({ user_id, result }) => {
	// write to static
	const file = `./static/assets/users/${user_id}.csv`;
	const parsed = JSON.parse(result);
	const temp = parsed.map(({ x, y }) => `${x},${y}`).join("|");
	paths[temp] = parsed.length;
	pathLengths[temp] = parsed.length;
	fs.writeFileSync(file, d3.csvFormat(parsed));
});

// tell me how many users we have, how many unique paths they took on level
console.log(`Users: ${tests.length}`);
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
const pathLengthCountsSorted = Array.from(pathLengthCounts).sort(
	(a, b) => a[0] - b[0]
);
console.log("Path length counts:");
console.table(pathLengthCountsSorted);

// log how many people came within 3 moves, 4 moves, 5 moves of shortest path
const allPathLengths = tests.map(({ result }) => JSON.parse(result).length);
[0, 1, 2, 3, 4, 5].forEach((within) => {
	const count = allPathLengths.filter(
		(length) => length - minPathLength <= within
	).length;
	console.log(`Within ${within} moves of shortest: ${count}`);
});

// average efficiency
const averageEfficiency =
	allPathLengths.reduce((sum, length) => sum + minPathLength / length, 0) /
	allPathLengths.length;
console.log(`Average efficiency: ${averageEfficiency.toFixed(2)}`);
