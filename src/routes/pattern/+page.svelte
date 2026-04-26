<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { createPracticeState, type StorageMode } from '$lib/practice/practiceState.svelte.js';
	import { PlainSecret } from '$lib/secrets/PlainSecret.js';
	import { HashedSecret } from '$lib/secrets/HashedSecret.js';
	import { hashSecret } from '$lib/crypto/pbkdf2.js';
	import { analyzePattern } from '$lib/meta/analyzer.js';
	import { normalizePattern } from '$lib/pattern/normalize.js';
	import Stats from '$lib/practice/Stats.svelte';
	import StorageSelect from '$lib/practice/StorageSelect.svelte';
	import BackLink from '$lib/ui/BackLink.svelte';
	import Button from '$lib/ui/Button.svelte';
	import PatternLock from './PatternLock.svelte';
	import type { PatternMode } from '$lib/pattern/types.js';

	const trainer = createPracticeState();
	trainer.selectMode('pattern');

	// Setup state
	let pattern1: number[] = $state([]);
	let pattern2: number[] = $state([]);
	let isHashing = $state(false);
	let setupPatternMode: PatternMode = $state('input');

	// Practice state
	let feedbackTimeout: ReturnType<typeof setTimeout> | undefined;
	let isPeeking = $state(false);
	let peekTimeout: ReturnType<typeof setTimeout> | undefined;

	// Hint display toggles
	let showNumbers = $state(true);
	let showArrows = $state(true);

	// Responsive size
	let containerEl: HTMLDivElement | undefined = $state();
	let patternSize = $state(280);

	$effect(() => {
		if (!containerEl) return;
		const updateSize = () => {
			patternSize = Math.min(400, containerEl!.clientWidth - 32);
		};
		updateSize();
		const observer = new ResizeObserver(updateSize);
		observer.observe(containerEl);
		return () => observer.disconnect();
	});

	const patternsMatch = $derived(
		pattern1.length >= 2 &&
		pattern2.length >= 2 &&
		pattern1.length === pattern2.length &&
		pattern1.every((v, i) => v === pattern2[i])
	);

	const isVisible = $derived(trainer.storageMode === 'visible');

	function selectStorage(mode: StorageMode) {
		trainer.selectStorage(mode);
		pattern1 = [];
		pattern2 = [];
		setupPatternMode = 'input';
	}

	function handleSetup1Pattern(indices: number[]) {
		pattern1 = indices;
		setupPatternMode = 'success';
		setTimeout(() => {
			trainer.submitSetup1();
			setupPatternMode = 'input';
		}, 500);
	}

	function handleSetup2Pattern(indices: number[]) {
		pattern2 = indices;
		const match = pattern1.length === indices.length && pattern1.every((v, i) => v === indices[i]);
		setupPatternMode = match ? 'success' : 'error';
		setTimeout(() => {
			setupPatternMode = 'input';
		}, 800);
	}

	async function handleStartPractice() {
		if (!patternsMatch) return;

		const normalized = normalizePattern(pattern1);
		if (trainer.storageMode === 'hashed') {
			isHashing = true;
			try {
				const result = await hashSecret(normalized);
				const meta = analyzePattern(pattern1);
				trainer.setupComplete(new HashedSecret(result, meta));
			} finally {
				isHashing = false;
			}
		} else {
			trainer.setupComplete(new PlainSecret(normalized));
		}
	}

	async function handlePracticePattern(indices: number[]) {
		if (trainer.feedback === 'verifying') return;

		const normalized = normalizePattern(indices);
		const result = await trainer.attempt(normalized);

		clearTimeout(feedbackTimeout);
		feedbackTimeout = setTimeout(() => {
			trainer.clearFeedback();
		}, result ? 800 : 1200);
	}

	function handlePeek() {
		if (trainer.stats.currentLevel !== 2) return;
		trainer.peek();
		isPeeking = true;
		clearTimeout(peekTimeout);
		peekTimeout = setTimeout(() => {
			isPeeking = false;
		}, 3000);
	}

	const practicePatternMode: PatternMode = $derived.by(() => {
		if (trainer.feedback === 'correct') return 'success';
		if (trainer.feedback === 'incorrect') return 'error';
		return 'input';
	});

	const levelNames = $derived({
		1: m.level_1_name(),
		2: m.level_2_name(),
		3: m.level_3_name()
	} as Record<number, string>);

	const hintPattern = $derived.by(() => {
		const revealed = trainer.secret?.reveal();
		if (!revealed) return [];
		return revealed.split('').map(Number);
	});
</script>

<div class="space-y-6" bind:this={containerEl}>
	<BackLink />

	{#if trainer.topState === 'MODE_SELECT'}
		<StorageSelect onSelect={selectStorage} />

	{:else if trainer.topState === 'SETUP_1'}
		<div class="space-y-4">
			<h1 class="text-2xl font-bold">{m.setup_draw_pattern()}</h1>
			<div class="flex justify-center">
				<PatternLock mode={setupPatternMode} onPattern={handleSetup1Pattern} size={patternSize} />
			</div>
		</div>

	{:else if trainer.topState === 'SETUP_2'}
		<div class="space-y-4">
			<h1 class="text-2xl font-bold">{m.setup_confirm_pattern()}</h1>
			<div class="flex justify-center">
				<PatternLock mode={setupPatternMode} onPattern={handleSetup2Pattern} size={patternSize} />
			</div>

			{#if pattern2.length > 0}
				<p class="text-sm text-center {patternsMatch ? 'text-(--color-success)' : 'text-(--color-error)'}">
					{patternsMatch ? m.setup_passwords_match() : m.setup_passwords_mismatch()}
				</p>
			{/if}

			{#if isHashing}
				<div class="flex items-center justify-center gap-2 text-sm text-(--color-text-muted)">
					<div class="w-4 h-4 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin"></div>
					{m.setup_computing_hash()}
				</div>
			{:else if patternsMatch}
				<div class="flex justify-center">
					<Button onclick={handleStartPractice}>
						{m.setup_start_practice()}
					</Button>
				</div>
			{/if}
		</div>

	{:else if trainer.topState === 'PRACTICE'}
		<div class="space-y-6">
			<!-- Level badge + meta -->
			<div class="flex items-center justify-between">
				{#if isVisible}
					<span class="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-(--color-primary)/10 text-(--color-primary)">
						L{trainer.stats.currentLevel}: {levelNames[trainer.stats.currentLevel]}
					</span>
				{/if}
				{#if trainer.secret}
					{@const meta = trainer.secret.meta()}
					<span class="text-sm text-(--color-text-muted) {isVisible ? '' : 'ms-auto'}">
						{m.meta_dot_count()}: {meta.dotCount ?? meta.length}
					</span>
				{/if}
			</div>

			<!-- Pattern input -->
			<div class="flex justify-center">
				{#if isVisible && trainer.stats.currentLevel === 1 && hintPattern.length > 0}
					<div class="relative">
						<PatternLock mode="preview" hint={hintPattern} size={patternSize} {showNumbers} {showArrows} />
						<div class="absolute inset-0">
							<PatternLock mode={practicePatternMode} onPattern={handlePracticePattern} size={patternSize} hint={hintPattern} {showNumbers} />
						</div>
					</div>
				{:else if isVisible && isPeeking && hintPattern.length > 0}
					<PatternLock mode="preview" hint={hintPattern} size={patternSize} {showNumbers} {showArrows} />
				{:else}
					<PatternLock
						mode={practicePatternMode}
						onPattern={handlePracticePattern}
						disabled={trainer.feedback === 'verifying'}
						size={patternSize}
					/>
				{/if}
			</div>

			<!-- Hint toggles (visible mode, L1/L2 only) -->
			{#if isVisible && trainer.stats.currentLevel <= 2}
				<div class="flex justify-center gap-4">
					<label class="flex items-center gap-2 text-sm text-(--color-text-muted) cursor-pointer">
						<input type="checkbox" bind:checked={showNumbers} class="accent-(--color-primary)" />
						{m.toggle_show_numbers()}
					</label>
					<label class="flex items-center gap-2 text-sm text-(--color-text-muted) cursor-pointer">
						<input type="checkbox" bind:checked={showArrows} class="accent-(--color-primary)" />
						{m.toggle_show_arrows()}
					</label>
				</div>
			{/if}

			<!-- Feedback -->
			{#if trainer.feedback === 'verifying'}
				<div class="flex items-center justify-center gap-2 text-sm text-(--color-text-muted)">
					<div class="w-4 h-4 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin"></div>
					{m.practice_verifying()}
				</div>
			{:else if trainer.feedback === 'correct'}
				<p class="text-sm font-medium text-center text-(--color-success)">{m.practice_correct()}</p>
			{:else if trainer.feedback === 'incorrect'}
				<p class="text-sm font-medium text-center text-(--color-error)">{m.practice_incorrect()}</p>
			{:else}
				<p class="text-sm text-center text-(--color-text-muted)">{m.practice_draw_pattern()}</p>
			{/if}

			<Stats stats={trainer.stats} accuracy={trainer.accuracy} />

			<!-- Controls -->
			<div class="flex flex-wrap justify-center gap-2">
				{#if isVisible && trainer.stats.currentLevel === 2}
					<Button variant="secondary" onclick={handlePeek} disabled={isPeeking}>
						{m.action_peek()}
					</Button>
				{/if}
				{#if isVisible && trainer.stats.currentLevel > 1}
					<Button variant="ghost" onclick={() => trainer.setLevel((trainer.stats.currentLevel - 1) as 1 | 2)}>
						{m.action_level_down()}
					</Button>
				{/if}
				{#if isVisible && trainer.stats.currentLevel < 3}
					<Button variant="ghost" onclick={() => trainer.setLevel((trainer.stats.currentLevel + 1) as 2 | 3)}>
						{m.action_level_up()}
					</Button>
				{/if}
				<Button variant="danger" onclick={trainer.reset}>
					{m.action_reset()}
				</Button>
			</div>
		</div>
	{/if}
</div>
