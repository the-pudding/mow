import fs from "fs";
import * as d3 from "d3";

const level = "round2";
const raw = d3
	.csvParse(fs.readFileSync("./tasks/mow_test_rows.csv", "utf-8"))
	.filter((d) => (d.level = level));

raw.sort((a, b) => d3.descending(a.created_at, b.created_at));

// make sure the folder exists
if (!fs.existsSync("./static/assets/users"))
	fs.mkdirSync("./static/assets/users", { recursive: true });

raw.forEach(({ user_id, result }) => {
	// write to static
	const file = `./static/assets/users/${user_id}.csv`;
	const parsed = JSON.parse(result);
	fs.writeFileSync(file, d3.csvFormat(parsed));
});
