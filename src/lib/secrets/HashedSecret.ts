import type { Secret, SecretMeta } from './Secret.js';
import { verifySecret, type PBKDF2Result } from '$lib/crypto/pbkdf2.js';

export class HashedSecret implements Secret {
	readonly #stored: PBKDF2Result;
	readonly #meta: SecretMeta;

	constructor(stored: PBKDF2Result, meta: SecretMeta) {
		this.#stored = stored;
		this.#meta = meta;
	}

	async verify(candidate: string): Promise<boolean> {
		return verifySecret(candidate, this.#stored);
	}

	reveal(): null {
		return null;
	}

	meta(): SecretMeta {
		return this.#meta;
	}
}
