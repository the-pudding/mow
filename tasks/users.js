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

const exampleTests = d3
	.csvParse(fs.readFileSync("./tasks/mow_test_rows.csv", "utf-8"))
	.filter((d) => d.level === level)
	.filter((d) => d.result !== "[]")
	.filter((d) => usersLookup[d.user_id]); // only keep users that are in the usersRaw

exampleTests.sort((a, b) => d3.descending(a.created_at, b.created_at));

// make sure the folder exists
if (!fs.existsSync("./static/assets/users"))
	fs.mkdirSync("./static/assets/users", { recursive: true });

// clear out static/assets/users
fs.readdirSync("./static/assets/users").forEach((file) => {
	fs.unlinkSync(`./static/assets/users/${file}`);
});

const paths = {};
const pathLengths = {};

// log level 2 numbers and save each path
exampleTests.forEach(({ user_id, result }) => {
	// write to static
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

// efficiency
const efficiencies = allPathLengths.map((length) => minPathLength / length);
const meanEfficiency = d3.mean(efficiencies);
const medianEfficiency = d3.median(efficiencies);
console.log(`Mean efficiency: ${meanEfficiency.toFixed(4)}`);
console.log(`Median efficiency: ${medianEfficiency.toFixed(4)}`);

const allTests = d3
	.csvParse(fs.readFileSync("./tasks/mow_test_rows.csv", "utf-8"))
	.filter((d) => d.level === "bonus3")
	.filter((d) => d.result !== "[]")
	.filter((d) => usersLookup[d.user_id]);

console.log(`Completed all rounds: ${allTests.length}`);
