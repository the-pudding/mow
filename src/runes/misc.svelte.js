import { MediaQuery } from "svelte/reactivity";

const hover = new MediaQuery("hover: hover");
const pointer = new MediaQuery("pointer: fine");

const platform = hover.current && pointer.current ? "desktop" : "mobile";

export const game = $state({ active: true, completed: false, path: [] });

export const session = $state({
	phase: "intro",
	userId: null,
	platform,
	demographics: null,
	email: null
});

export function resetSession() {
	session.phase = "intro";
	session.platform = platform;
	session.userId = null;
	session.demographics = null;
	session.email = null;
}
