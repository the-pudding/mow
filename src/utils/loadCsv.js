import { csvParse } from "d3";

export default async function loadCsv(url) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${response.status} fetching ${url}`);
	const csv = await response.text();
	const data = csvParse(csv);
	return data;
}
