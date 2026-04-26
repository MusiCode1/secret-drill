import { describe, it, expect } from 'vitest';
import { normalizePattern } from './normalize.js';

describe('normalizePattern', () => {
	it('should convert indices to string', () => {
		expect(normalizePattern([0, 1, 2])).toBe('012');
	});

	it('should handle all 9 dots', () => {
		expect(normalizePattern([0, 1, 2, 3, 4, 5, 6, 7, 8])).toBe('012345678');
	});

	it('should handle reversed pattern differently', () => {
		const forward = normalizePattern([0, 1, 2]);
		const backward = normalizePattern([2, 1, 0]);
		expect(forward).not.toBe(backward);
	});

	it('should handle single digit', () => {
		expect(normalizePattern([5])).toBe('5');
	});
});
