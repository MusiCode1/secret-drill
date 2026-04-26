import { describe, it, expect } from 'vitest';
import { analyzePassword, analyzePattern } from './analyzer.js';

describe('analyzePassword', () => {
	it('should detect all character classes', () => {
		const meta = analyzePassword('Abc123!@');
		expect(meta.length).toBe(8);
		expect(meta.charClasses?.lower).toBe(true);
		expect(meta.charClasses?.upper).toBe(true);
		expect(meta.charClasses?.digit).toBe(true);
		expect(meta.charClasses?.symbol).toBe(true);
	});

	it('should detect only lowercase', () => {
		const meta = analyzePassword('hello');
		expect(meta.charClasses?.lower).toBe(true);
		expect(meta.charClasses?.upper).toBe(false);
		expect(meta.charClasses?.digit).toBe(false);
		expect(meta.charClasses?.symbol).toBe(false);
	});

	it('should detect only digits', () => {
		const meta = analyzePassword('12345');
		expect(meta.length).toBe(5);
		expect(meta.charClasses?.lower).toBe(false);
		expect(meta.charClasses?.digit).toBe(true);
	});

	it('should handle empty string', () => {
		const meta = analyzePassword('');
		expect(meta.length).toBe(0);
		expect(meta.charClasses?.lower).toBe(false);
	});
});

describe('analyzePattern', () => {
	it('should count dots correctly', () => {
		const meta = analyzePattern([0, 1, 2, 5, 8]);
		expect(meta.length).toBe(5);
		expect(meta.dotCount).toBe(5);
	});

	it('should handle minimum pattern', () => {
		const meta = analyzePattern([0, 4]);
		expect(meta.length).toBe(2);
		expect(meta.dotCount).toBe(2);
	});
});
