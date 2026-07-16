import fs from "fs";
import * as d3 from "d3";

// --- config ---
const OUT_DIR = "./explore";
const MAIN_LEVELS = ["tutorial", "round1", "round2"];

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const write = (name, rows) => {
	fs.writeFileSync(`${OUT_DIR}/${name}`, d3.csvFormat(rows));
	console.log(`${name}: ${rows.length} rows`);
};

// --- load ---
const usersRaw = d3.csvParse(
	fs.readFileSync("./tasks/mow_users_rows.csv", "utf-8")
);
const testsRaw = d3.csvParse(
	fs.readFileSync("./tasks/mow_test_rows.csv", "utf-8")
);

// --- baseline: users who completed all main levels ---
// keep every row for those users (bonus rounds included)
const levelsByUser = d3.rollup(
	testsRaw,
	(v) => new Set(v.map((d) => d.level)),
	(d) => d.user_id
);
const knownUsers = new Set(usersRaw.map((d) => d.user_id));
const completedUsers = new Set(
	[...levelsByUser]
		.filter(([u, s]) => knownUsers.has(u) && MAIN_LEVELS.every((l) => s.has(l)))
		.map(([u]) => u)
);

const tests = testsRaw.filter((d) => completedUsers.has(d.user_id));

// write("baseline.csv", tests);
console.log(`baseline users: ${completedUsers.size}`);

// --- round2: last move by move-count bucket ---
// one record per player (their latest round2 attempt)
const round2ByUser = d3.rollup(
	tests.filter((d) => d.level === "round2"),
	(v) => v.sort((a, b) => d3.ascending(a.created_at, b.created_at)).at(-1),
	(d) => d.user_id
);

const round2 = [...round2ByUser.values()].map((d) => {
	const path = JSON.parse(d.result);
	const last = path.at(-1);
	return { moves: path.length, x: last.x, y: last.y };
});

// count players per (moves, last-square)
const lastMove = d3
	.rollups(
		round2,
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
	.sort((a, b) => d3.ascending(a.moves, b.moves) || d3.descending(a.players, b.players));

write("round2_last_move.csv", lastMove);

// --- round2: sequence of moves 6,7,8 (indices 5,6,7) by move-count bucket ---
const round2Seq = [...round2ByUser.values()]
	.map((d) => {
		const path = JSON.parse(d.result);
		const seq = path.slice(5, 8);
		return seq.length === 3 ? { moves: path.length, seq } : null;
	})
	.filter((d) => d);

const seqMoves = d3
	.rollups(
		round2Seq,
		(v) => v.length,
		(d) => d.moves,
		(d) => d.seq.map((s) => `${s.x},${s.y}`).join(";")
	)
	.flatMap(([moves, seqs]) =>
		seqs.map(([key, players]) => {
			const [[x6, y6], [x7, y7], [x8, y8]] = key
				.split(";")
				.map((s) => s.split(",").map(Number));
			return { moves, x6, y6, x7, y7, x8, y8, players };
		})
	)
	.sort((a, b) => d3.ascending(a.moves, b.moves) || d3.descending(a.players, b.players));

write("round2_moves678.csv", seqMoves);

// --- round2: player count for every unique full x/y sequence (drop t) ---
const round2Paths = [...round2ByUser.values()].map((d) =>
	JSON.parse(d.result).map(({ x, y }) => ({ x, y }))
);

const uniqueSeqs = d3
	.rollups(
		round2Paths,
		(v) => v.length,
		(d) => JSON.stringify(d)
	)
	.map(([key, players]) => ({ players, path: JSON.parse(key) }))
	.sort((a, b) => d3.descending(a.players, b.players));

fs.writeFileSync(
	`${OUT_DIR}/round2_sequences.json`,
	JSON.stringify(uniqueSeqs)
);
console.log(`round2_sequences.json: ${uniqueSeqs.length} unique sequences`);
