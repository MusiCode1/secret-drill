/**
 * המרת סוד שתורגל כאן לקלט ש-`android-unlock` מקבל.
 *
 * תבנית: הרכיב מחזיר אינדקסים 0-8 row-major (0 = שמאל-עליון). המכשיר/‏android-unlock
 * מצפים למספור לוח-מקשים 1-9, אף הוא row-major (1 = שמאל-עליון) — ולכן ההמרה היא
 * פשוט `index + 1`. 🔑 אלה מספרי-**מיקום**, לא סדר-הציור שמוצג במסך-האימון.
 */
export function patternToDeviceDigits(indices: number[]): number[] {
	return indices.map((i) => i + 1);
}

/** מחרוזת ספרות למכשיר, למשל [4,7,2] → "583". */
export function formatPatternForDevice(indices: number[]): string {
	return patternToDeviceDigits(indices).join('');
}

export type SecretKind = 'pattern' | 'pin' | 'password';

/** פקודת android-unlock מוכנה-להדבקה. הערך עטוף במרכאות-יחיד לבטיחות-shell. */
export function androidUnlockCommand(kind: SecretKind, value: string, device = '<device>'): string {
	return `android-unlock ${device} --${kind} '${value}'`;
}
