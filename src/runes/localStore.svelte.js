import { browser } from "$app/environment";

export class LocalStore {
	value = $state();
	key = "";

	constructor(key, value) {
		this.key = key;
		this.value = value;

		if (browser) {
			const item = localStorage.getItem(key);
			if (item) this.value = this.deserialize(item);
		}

		$effect(() => {
			localStorage.setItem(this.key, this.serialize(this.value));
		});
	}

	serialize(value) {
		return JSON.stringify(value);
	}

	deserialize(item) {
		return JSON.parse(item);
	}
}

export default function localStore(key, value) {
	return new LocalStore(key, value);
}
