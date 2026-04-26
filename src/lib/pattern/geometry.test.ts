import { describe, it, expect } from 'vitest';
import { DOTS, dotAt, lineCrossings } from './geometry.js';

describe('geometry', () => {
	describe('DOTS', () => {
		it('should have 9 dots', () => {
			expect(DOTS).toHaveLength(9);
		});

		it('should have indices 0-8', () => {
			expect(DOTS.map((d) => d.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
		});

		it('should be in a 3x3 grid', () => {
			// Row 1: dots 0,1,2 should have same cy
			expect(DOTS[0].cy).toBe(DOTS[1].cy);
			expect(DOTS[1].cy).toBe(DOTS[2].cy);

			// Column 1: dots 0,3,6 should have same cx
			expect(DOTS[0].cx).toBe(DOTS[3].cx);
			expect(DOTS[3].cx).toBe(DOTS[6].cx);
		});
	});

	describe('dotAt', () => {
		it('should find a dot at its center', () => {
			const dot = DOTS[4]; // center dot
			expect(dotAt({ x: dot.cx, y: dot.cy })).toBe(4);
		});

		it('should find a dot within hit radius', () => {
			const dot = DOTS[0];
			expect(dotAt({ x: dot.cx + 5, y: dot.cy + 5 })).toBe(0);
		});

		it('should return null for empty space', () => {
			expect(dotAt({ x: 50, y: 50 })).toBe(4); // center
			expect(dotAt({ x: 0, y: 0 })).toBe(null); // corner
		});
	});

	describe('lineCrossings', () => {
		it('should detect crossing through center when going 0->2', () => {
			const crossings = lineCrossings(0, 2);
			expect(crossings).toContain(1);
		});

		it('should detect crossing through center when going 0->8', () => {
			const crossings = lineCrossings(0, 8);
			expect(crossings).toContain(4);
		});

		it('should detect crossing through center when going 6->2', () => {
			const crossings = lineCrossings(6, 2);
			expect(crossings).toContain(4);
		});

		it('should detect crossing vertically from 0->6', () => {
			const crossings = lineCrossings(0, 6);
			expect(crossings).toContain(3);
		});

		it('should return empty array for adjacent dots', () => {
			const crossings = lineCrossings(0, 1);
			expect(crossings).toHaveLength(0);
		});

		it('should return empty array for diagonal adjacent', () => {
			const crossings = lineCrossings(0, 4);
			expect(crossings).toHaveLength(0);
		});
	});
});
