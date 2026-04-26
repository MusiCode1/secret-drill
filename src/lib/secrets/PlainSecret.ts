import type { Secret, SecretMeta } from './Secret.js';
import { analyzePassword } from '$lib/meta/analyzer.js';

export class PlainSecret implements Secret {
	readonly #value: string;
	readonly #meta: SecretMeta;

	constructor(value: string) {
		this.#value = value;
		this.#meta = analyzePassword(value);
	}

	async verify(candidate: string): Promise<boolean> {
		return candidate === this.#value;
	}

	reveal(): string {
		return this.#value;
	}

	meta(): SecretMeta {
		return this.#meta;
	}
}
