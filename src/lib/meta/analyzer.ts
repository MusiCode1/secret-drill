import type { SecretMeta } from '$lib/secrets/Secret.js';

const HAS_LOWER = /[a-z]/;
const HAS_UPPER = /[A-Z]/;
const HAS_DIGIT = /\d/;
const HAS_SYMBOL = /[^a-zA-Z0-9]/;

export function analyzePassword(password: string): SecretMeta {
	return {
		length: password.length,
		charClasses: {
			lower: HAS_LOWER.test(password),
			upper: HAS_UPPER.test(password),
			digit: HAS_DIGIT.test(password),
			symbol: HAS_SYMBOL.test(password)
		}
	};
}

export function analyzePattern(indices: number[]): SecretMeta {
	return {
		length: indices.length,
		dotCount: indices.length
	};
}
