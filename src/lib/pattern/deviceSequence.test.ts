import { describe, it, expect } from 'vitest';
import {
	patternToDeviceDigits,
	formatPatternForDevice,
	androidUnlockCommand
} from './deviceSequence.js';

describe('deviceSequence', () => {
	it('index+1, row-major שלם', () => {
		expect(patternToDeviceDigits([0, 1, 2, 3, 4, 5, 6, 7, 8])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	it('ציור MM→BM→TR = אינדקסים [4,7,2] → "583"', () => {
		expect(formatPatternForDevice([4, 7, 2])).toBe('583');
	});

	it('תבנית ריקה → מחרוזת ריקה', () => {
		expect(formatPatternForDevice([])).toBe('');
	});

	it('פקודה מלאה', () => {
		expect(androidUnlockCommand('pattern', '583', 'liam-tablet')).toBe(
			"android-unlock liam-tablet --pattern '583'"
		);
		expect(androidUnlockCommand('pin', '4721')).toBe("android-unlock <device> --pin '4721'");
	});
});
