/**
 * Normalize a pattern (array of dot indices) to a string suitable for hashing.
 * Uses simple digit concatenation - each index is 0-8.
 */
export function normalizePattern(indices: number[]): string {
	return indices.join('');
}
