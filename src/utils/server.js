import { dev } from "$app/environment";
import urlParams from "$utils/urlParams.js";

export default async function server(endpoint, data) {
	const base = "http://localhost:3000";
	// const base = "https://pudding-mowing-server-335031567fcb.herokuapp.com";
	const url = `${base}/${endpoint}`;

	const token = dev ? urlParams.get("token") : "";

	try {
		const start = Date.now();
		const body = JSON.stringify({ data });
		const options = {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"X-Pudding-Token": token
			},
			credentials: "include",
			body
		};

		const response = await fetch(url, options);
		if (response.status === 404) throw Error(response.statusText);
		else {
			const result = await response.json();
			const end = Date.now();
			const duration = `${end - start}ms`;
			return { ...result, duration };
		}
	} catch (err) {
		console.log(err?.message);
		throw err;
	}
}
