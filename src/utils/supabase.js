import { createClient } from "@supabase/supabase-js";
import { browser } from "$app/environment";

let supabase;

const dev = browser
	? !window.location.hostname.includes("pudding.cool") &&
		!window.location.hostname.includes("citizencodex.com")
	: true;

if (dev) console.log("Supabase dev mode");

function init() {
	if (supabase || !browser) return;
	supabase = createClient(
		"https://dbmtysppmiwwjwaeneex.supabase.co",
		"sb_publishable_FI1g75Q3gDIw-HXVxx_hGA_p8mXjVkz"
	);
}

async function insertAttempt({ user, level, platform, result }) {
	if (dev) {
		console.log("[dev] skipping insertAttempt", {
			user_id: user,
			level,
			platform,
			moves: result.length
		});
		return;
	}
	init();
	const { error } = await supabase.from("mow_test").insert({
		user_id: user,
		level,
		platform,
		result: JSON.stringify(result)
	});
	if (error) {
		console.log(error);
		throw error;
	}
}

async function upsertUser({ id, email, name, demographics }) {
	if (dev) {
		console.log("[dev] skipping upsertUser", { id, email, name, demographics });
		return;
	}
	init();
	const row = {
		user_id: id,
		name: name ?? null,
		age: demographics?.age ?? null,
		style: demographics?.style ?? null,
		gaming: demographics?.gaming ?? null,
		hand: demographics?.hand ?? null,
		optimization: demographics?.optimization ?? null
	};
	const { error } = await supabase.from("mow_users").upsert(row, {
		onConflict: "user_id"
	});

	if (error) {
		console.log(error);
		throw error;
	}
}

async function insertEmail({ id, email }) {
	if (dev) {
		console.log("[dev] skipping insertEmail", { user_id: id, email });
		return;
	}

	init();
	if (email) {
		const { error: emailError } = await supabase.from("mow_emails").insert({
			user_id: id,
			email
		});
		if (emailError) {
			console.log(emailError);
			throw emailError;
		}
	}
}

async function submitScore({ userId, name, scoreStart, scoreFull }) {
	if (dev) {
		console.log("[dev] skipping submitScore", {
			userId,
			name,
			scoreStart,
			scoreFull
		});
		return;
	}
	init();
	const { error } = await supabase.from("mow_leaderboard").upsert(
		{
			user_id: userId,
			name,
			score_start: scoreStart,
			score_full: scoreFull
		},
		{ onConflict: "user_id", count: "exact" }
	);
	if (error) {
		console.log(error);
		throw error;
	}
}

async function getTopScores(limit = 10) {
	if (dev) {
		console.log("[dev] skipping getTopScores");
		return [];
	}
	init();
	const { data, error } = await supabase
		.from("mow_leaderboard")
		.select("name, score_start, score_full")
		.order("score_full", { ascending: false })
		.limit(limit);
	if (error) {
		console.log(error);
		throw error;
	}
	return data;
}

export default {
	init,
	insertAttempt,
	insertEmail,
	upsertUser,
	submitScore,
	getTopScores
};
