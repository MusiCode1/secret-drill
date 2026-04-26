import { describe, it, expect } from 'vitest';
import { DOTS, dotAt, lineCrossings, arrowPoints } from './geometry.js';

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

	describe('arrowPoints', () => {
		function parsePoints(s: string): Array<{ x: number; y: number }> {
			return s.split(' ').map((p) => {
				const [x, y] = p.split(',').map(Number);
				return { x, y };
			});
		}

		it('should return a valid polygon points string with 3 points', () => {
			const result = arrowPoints(0, 0, 100, 0, 0.5, 10);
			const points = parsePoints(result);
			expect(points).toHaveLength(3);
			points.forEach((p) => {
				expect(Number.isFinite(p.x)).toBe(true);
				expect(Number.isFinite(p.y)).toBe(true);
			});
		});

		it('should place arrow at specified position along a horizontal line', () => {
			const result = arrowPoints(0, 50, 100, 50, 0.5, 10);
			const points = parsePoints(result);
			// Tip (first point) should be near x=50 (center of line)
			expect(points[0].x).toBeGreaterThan(45);
			expect(points[0].x).toBeLessThan(60);
			expect(points[0].y).toBeCloseTo(50, 0);
		});

		it('should place arrow at specified position along a vertical line', () => {
			const result = arrowPoints(50, 0, 50, 100, 0.7, 10);
			const points = parsePoints(result);
			// Tip should be near y=70
			expect(points[0].y).toBeGreaterThan(65);
			expect(points[0].y).toBeLessThan(80);
			expect(points[0].x).toBeCloseTo(50, 0);
		});

		it('should handle diagonal lines', () => {
			const result = arrowPoints(0, 0, 100, 100, 0.5, 10);
			const points = parsePoints(result);
			// Tip should be near (50,50)
			expect(points[0].x).toBeGreaterThan(45);
			expect(points[0].x).toBeLessThan(60);
			expect(points[0].y).toBeGreaterThan(45);
			expect(points[0].y).toBeLessThan(60);
		});

		it('should point in the direction of the line (left to right)', () => {
			const result = arrowPoints(0, 50, 100, 50, 0.5, 10);
			const points = parsePoints(result);
			// Tip (first point) should have larger x than base points
			expect(points[0].x).toBeGreaterThan(points[1].x);
			expect(points[0].x).toBeGreaterThan(points[2].x);
		});

		it('should point in the direction of the line (right to left)', () => {
			const result = arrowPoints(100, 50, 0, 50, 0.5, 10);
			const points = parsePoints(result);
			// Tip should have smaller x than base points
			expect(points[0].x).toBeLessThan(points[1].x);
			expect(points[0].x).toBeLessThan(points[2].x);
		});

		it('should handle zero-length line gracefully', () => {
			const result = arrowPoints(50, 50, 50, 50, 0.5, 10);
			const points = parsePoints(result);
			expect(points).toHaveLength(3);
		});
	});
});
