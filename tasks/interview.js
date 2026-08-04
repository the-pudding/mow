import fs from "fs";
import * as d3 from "d3";

// --- config ---
const SCORE_MIN = 0.95; // "top of the leaderboard" = score > 99%
const FIRST_MOVE_MAX_MS = 30 * 1000; // first move must always be under 30s

// --- load ---
const usersRaw = d3.csvParse(
	fs.readFileSync("./tasks/mow_users_rows.csv", "utf-8")
);
const testsRaw = d3.csvParse(
	fs.readFileSync("./tasks/mow_test_rows.csv", "utf-8")
);
const leaderboardRaw = d3.csvParse(
	fs.readFileSync("./tasks/mow_leaderboard_rows.csv", "utf-8")
);
const emailsRaw = d3.csvParse(
	fs.readFileSync("./tasks/mow_emails_rows.csv", "utf-8")
);

// --- a) email exists, b) email is unique in the DB ---
// count how many times each email address appears across the whole emails table
const emailCounts = d3.rollup(
	emailsRaw,
	(v) => v.length,
	(d) => d.email.trim().toLowerCase()
);
// user_id -> email (no user has more than one email row in the data)
const emailByUser = new Map(emailsRaw.map((d) => [d.user_id, d.email.trim()]));

// --- c) first move under 30s on every level they played ---
// first move time = t of the first actual move (result[1].t - result[0].t)
const firstMovesByUser = d3.group(
	testsRaw
		.filter((d) => d.result && d.result !== "[]")
		.map((d) => {
			const parsed = JSON.parse(d.result);
			if (parsed.length < 2) return null;
			return { user_id: d.user_id, firstMove: parsed[1].t - parsed[0].t };
		})
		.filter((d) => d),
	(d) => d.user_id
);

// --- perfect round2: a round2 solution of exactly 49 moves ---
const PERFECT_ROUND2_MOVES = 49;
const perfectRound2 = new Set(
	testsRaw
		.filter((d) => d.level === "round2" && d.result && d.result !== "[]")
		.filter((d) => JSON.parse(d.result).length === PERFECT_ROUND2_MOVES)
		.map((d) => d.user_id)
);

// --- top of leaderboard: score > 99% ---
const top = leaderboardRaw
	.map((d) => ({ ...d, score_full: +d.score_full }))
	.filter((d) => d.score_full > SCORE_MIN);

const rows = [];
for (const d of top) {
	if (!perfectRound2.has(d.user_id)) continue; // perfect round2 (49 moves)

	const email = emailByUser.get(d.user_id);
	if (!email) continue; // a) must have an email
	if (emailCounts.get(email.toLowerCase()) !== 1) continue; // b) email unique

	const moves = firstMovesByUser.get(d.user_id);
	if (!moves || !moves.length) continue; // need at least one recorded move
	const times = moves.map((m) => m.firstMove);
	const longest = d3.max(times);
	if (longest >= FIRST_MOVE_MAX_MS) continue; // c) always under 30s

	rows.push({
		id: d.user_id,
		name: d.name,
		email,
		score_full: d.score_full,
		avg_first_move_sec: +(d3.mean(times) / 1000).toFixed(2),
		longest_first_move_sec: +(longest / 1000).toFixed(2)
	});
}

rows.sort((a, b) => d3.descending(a.score_full, b.score_full));

fs.writeFileSync("./tasks/interview.csv", d3.csvFormat(rows));
console.log(
	`Top (>${SCORE_MIN * 100}%): ${top.length} | matched all criteria: ${rows.length}`
);
console.log(`Wrote ./tasks/interview.csv`);
