import { describe, it, expect } from 'vitest';
import { hashSecret, verifySecret } from './pbkdf2.js';

describe('pbkdf2', () => {
	it('should hash and verify a password correctly', async () => {
		const result = await hashSecret('test-password-123');
		expect(result.algorithm).toBe('PBKDF2-SHA256');
		expect(result.iterations).toBe(600_000);
		expect(result.saltB64).toBeTruthy();
		expect(result.hashB64).toBeTruthy();

		const isValid = await verifySecret('test-password-123', result);
		expect(isValid).toBe(true);
	});

	it('should reject wrong password', async () => {
		const result = await hashSecret('correct-password');
		const isValid = await verifySecret('wrong-password', result);
		expect(isValid).toBe(false);
	});

	it('should produce different salts each time', async () => {
		const r1 = await hashSecret('same-password');
		const r2 = await hashSecret('same-password');
		expect(r1.saltB64).not.toBe(r2.saltB64);
		expect(r1.hashB64).not.toBe(r2.hashB64);
	});

	it('should handle empty string', async () => {
		const result = await hashSecret('');
		const isValid = await verifySecret('', result);
		expect(isValid).toBe(true);

		const isInvalid = await verifySecret('not-empty', result);
		expect(isInvalid).toBe(false);
	});

	it('should handle unicode characters', async () => {
		const result = await hashSecret('סיסמה-בעברית-123');
		const isValid = await verifySecret('סיסמה-בעברית-123', result);
		expect(isValid).toBe(true);
	});
});
