export interface SecretMeta {
	length: number;
	charClasses?: {
		lower: boolean;
		upper: boolean;
		digit: boolean;
		symbol: boolean;
	};
	dotCount?: number;
}

export interface Secret {
	/** Verify a candidate against the stored secret */
	verify(candidate: string): Promise<boolean>;

	/** Get visible reference (returns null if hashed) */
	reveal(): string | null;

	/** Get metadata that doesn't expose the secret */
	meta(): SecretMeta;
}
