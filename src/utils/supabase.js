import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
let supabase;

function init() {
	supabase = createClient(
		"https://dbmtysppmiwwjwaeneex.supabase.co",
		"sb_publishable_FI1g75Q3gDIw-HXVxx_hGA_p8mXjVkz"
	);
}

async function insert(data) {
	const { error } = await supabase.from("mow_test").insert(data);
	if (error) {
		console.log(error);
		throw error;
	}
}

export default { init, insert };
