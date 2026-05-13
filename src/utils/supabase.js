import { createClient } from "@supabase/supabase-js";
import { page } from "$app/state";
import { browser } from "$app/environment";

let supabase;

const dev = browser && !page.url.hostname.includes("pudding.cool");

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
			user,
			level,
			platform,
			moves: result.length
		});
		return;
	}
	init();
	const { error } = await supabase.from("mow_test").insert({
		user,
		level,
		platform,
		result: JSON.stringify(result)
	});
	if (error) {
		console.log(error);
		throw error;
	}
}

async function upsertUser({ id, email, demographics }) {
	if (dev) {
		console.log("[dev] skipping upsertUser", { id, email, demographics });
		return;
	}
	init();
	const row = {
		user: id,
		email: email ?? null,
		age: demographics?.age ?? null,
		style: demographics?.style ?? null,
		gaming: demographics?.gaming ?? null,
		hand: demographics?.hand ?? null,
		optimization: demographics?.optimization ?? null
	};
	const { error } = await supabase
		.from("mow_users")
		.upsert(row, { onConflict: "id" });
	if (error) {
		console.log(error);
		throw error;
	}
}

export default { init, insertAttempt, upsertUser };
