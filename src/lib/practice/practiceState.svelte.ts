import type { Secret } from '$lib/secrets/Secret.js';

export type TopState = 'MODE_SELECT' | 'SETUP_1' | 'SETUP_2' | 'PRACTICE';
export type StorageMode = 'visible' | 'hashed';
export type PracticeLevel = 1 | 2 | 3;
export type InputType = 'password' | 'pattern';
export type FeedbackState = 'idle' | 'verifying' | 'correct' | 'incorrect';

const L1_TO_L2_STREAK = 3;
const L2_TO_L3_STREAK = 5;

export interface Stats {
	currentStreak: number;
	bestStreak: number;
	totalCorrect: number;
	totalAttempts: number;
	currentLevel: PracticeLevel;
}

export function createPracticeState() {
	let topState = $state<TopState>('MODE_SELECT');
	let storageMode = $state<StorageMode>('visible');
	let inputType = $state<InputType>('password');
	let secret = $state<Secret | null>(null);
	let feedback = $state<FeedbackState>('idle');

	let stats = $state<Stats>({
		currentStreak: 0,
		bestStreak: 0,
		totalCorrect: 0,
		totalAttempts: 0,
		currentLevel: 1
	});

	const accuracy = $derived(
		stats.totalAttempts > 0 ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) : 0
	);

	function selectMode(type: InputType) {
		inputType = type;
		topState = 'MODE_SELECT';
	}

	function selectStorage(mode: StorageMode) {
		storageMode = mode;
		topState = 'SETUP_1';
	}

	function submitSetup1() {
		topState = 'SETUP_2';
	}

	function setupComplete(s: Secret) {
		secret = s;
		stats = {
			currentStreak: 0,
			bestStreak: 0,
			totalCorrect: 0,
			totalAttempts: 0,
			currentLevel: 1
		};
		feedback = 'idle';
		topState = 'PRACTICE';
	}

	async function attempt(candidate: string): Promise<boolean> {
		if (!secret || feedback === 'verifying') return false;

		feedback = 'verifying';
		const isCorrect = await secret.verify(candidate);
		stats.totalAttempts++;

		if (isCorrect) {
			stats.totalCorrect++;
			stats.currentStreak++;
			if (stats.currentStreak > stats.bestStreak) {
				stats.bestStreak = stats.currentStreak;
			}
			feedback = 'correct';
			maybeAutoLevelUp();
		} else {
			stats.currentStreak = 0;
			feedback = 'incorrect';
		}

		return isCorrect;
	}

	function maybeAutoLevelUp() {
		if (stats.currentLevel === 1 && stats.currentStreak >= L1_TO_L2_STREAK) {
			stats.currentLevel = 2;
		} else if (stats.currentLevel === 2 && stats.currentStreak >= L2_TO_L3_STREAK) {
			stats.currentLevel = 3;
		}
	}

	function peek() {
		if (stats.currentLevel !== 2) return;
		stats.currentStreak = 0;
	}

	function setLevel(level: PracticeLevel) {
		stats.currentLevel = level;
		stats.currentStreak = 0;
	}

	function clearFeedback() {
		feedback = 'idle';
	}

	function reset() {
		topState = 'MODE_SELECT';
		secret = null;
		feedback = 'idle';
		stats = {
			currentStreak: 0,
			bestStreak: 0,
			totalCorrect: 0,
			totalAttempts: 0,
			currentLevel: 1
		};
	}

	function goBackToModeSelect() {
		topState = 'MODE_SELECT';
	}

	return {
		get topState() { return topState; },
		get storageMode() { return storageMode; },
		get inputType() { return inputType; },
		get secret() { return secret; },
		get feedback() { return feedback; },
		get stats() { return stats; },
		get accuracy() { return accuracy; },
		selectMode,
		selectStorage,
		submitSetup1,
		setupComplete,
		attempt,
		peek,
		setLevel,
		clearFeedback,
		reset,
		goBackToModeSelect
	};
}
