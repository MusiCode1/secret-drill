const ITERATIONS = 600_000;
const HASH_BYTES = 32;
const SALT_BYTES = 16;
const ALGORITHM = 'PBKDF2-SHA256' as const;

export interface PBKDF2Result {
	saltB64: string;
	hashB64: string;
	iterations: number;
	algorithm: typeof ALGORITHM;
}

function toBase64(buffer: ArrayBuffer | Uint8Array): string {
	const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
	let binary = '';
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

async function deriveKey(plaintext: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
	const safeSalt = new Uint8Array(salt);
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(plaintext),
		'PBKDF2',
		false,
		['deriveBits']
	);

	return crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			hash: 'SHA-256',
			salt: safeSalt,
			iterations
		},
		keyMaterial,
		HASH_BYTES * 8
	);
}

export async function hashSecret(plaintext: string): Promise<PBKDF2Result> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
	const hash = await deriveKey(plaintext, salt, ITERATIONS);

	return {
		saltB64: toBase64(salt),
		hashB64: toBase64(hash),
		iterations: ITERATIONS,
		algorithm: ALGORITHM
	};
}

export async function verifySecret(plaintext: string, stored: PBKDF2Result): Promise<boolean> {
	const salt = fromBase64(stored.saltB64);
	const candidateHash = await deriveKey(plaintext, salt, stored.iterations);
	const storedHash = fromBase64(stored.hashB64);
	const candidateBytes = new Uint8Array(candidateHash);

	if (candidateBytes.length !== storedHash.length) return false;

	// Constant-time comparison to prevent timing attacks
	let diff = 0;
	for (let i = 0; i < candidateBytes.length; i++) {
		diff |= candidateBytes[i] ^ storedHash[i];
	}
	return diff === 0;
}
