import model from "$data/model.json";

const pathToAlphabet = new Map([
	["0, -1", "u"],
	["0, 1", "d"],
	["-1, 0", "l"],
	["1, 0", "r"]
]);

function pathToAlphabetString(path) {
	let prev = [0, 0];
	let pathString = "";
	for (const { x, y } of path) {
		const [dx, dy] = [x - prev[0], y - prev[1]];
		if (!(dx === 0 && dy === 0))
			pathString += pathToAlphabet.get(`${x - prev[0]}, ${y - prev[1]}`);
		prev = [x, y];
	}

	return pathString;
}

function countStringsWithPrefix(prefixLength, min, max, alphabetSize) {
	let total = 0;
	for (let length = Math.max(min, prefixLength); length <= max; length++) {
		total += alphabetSize ** (length - prefixLength);
	}
	return total;
}

function buildCharToDigit(chars) {
	const charToDigit = {};
	chars.forEach((char, index) => {
		charToDigit[char] = index;
	});
	return charToDigit;
}

function ngramIndex(ngram, chars, charToDigit, min, max) {
	let rank = 0;
	const alphabetSize = chars.length;

	for (let i = 0; i < ngram.length; i++) {
		const ch = ngram[i];
		const digit = charToDigit[ch];
		if (digit === undefined) {
			return undefined;
		}

		const prefixLength = i + 1;
		for (const candidate of chars) {
			if (charToDigit[candidate] >= digit) {
				break;
			}
			rank += countStringsWithPrefix(prefixLength, min, max, alphabetSize);
		}

		if (prefixLength >= min && i < ngram.length - 1) {
			rank += 1;
		}
	}

	return rank;
}

function charNgrams(path, min, max) {
	if (typeof path !== "string") {
		throw new TypeError("classify path must be a string");
	}

	const ngrams = [];
	for (let n = min; n <= max; n++) {
		for (let i = 0; i <= path.length - n; i++) {
			ngrams.push(path.slice(i, i + n));
		}
	}
	return ngrams;
}

function vectorize(ngrams, chars, min, max) {
	const vec = new Map();
	const charToDigit = buildCharToDigit(chars);
	for (const ng of ngrams) {
		if (ng.length < min || ng.length > max) {
			continue;
		}
		const idx = ngramIndex(ng, chars, charToDigit, min, max);
		if (idx !== undefined) {
			vec.set(idx, (vec.get(idx) ?? 0) + 1);
		}
	}
	return vec;
}

function predict(vec, coef, intercept, classes) {
	const nClasses = classes.length;
	const scores = new Float64Array(nClasses);

	for (let c = 0; c < nClasses; c++) {
		let sum = intercept[c];
		for (const [idx, count] of vec) {
			sum += coef[c][idx] * count;
		}
		scores[c] = sum;
	}

	const maxScore = Math.max(...scores);
	const exps = scores.map((s) => Math.exp(s - maxScore));
	const sumExp = exps.reduce((a, b) => a + b, 0);
	const probs = exps.map((e) => e / sumExp);

	let bestIdx = 0;
	for (let i = 1; i < nClasses; i++) {
		if (probs[i] > probs[bestIdx]) bestIdx = i;
	}

	const probabilities = {};
	for (let i = 0; i < nClasses; i++) {
		probabilities[classes[i]] = probs[i];
	}

	return { label: classes[bestIdx], probabilities };
}

export function classify(path) {
	const pathString = pathToAlphabetString(path);
	const [min, max] = model.ngram_range;
	const ngrams = charNgrams(pathString, min, max);
	const vec = vectorize(ngrams, model.chars, min, max);
	return predict(vec, model.coef, model.intercept, model.classes);
}
