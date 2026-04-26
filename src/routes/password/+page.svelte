<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { createPracticeState, type StorageMode, type FeedbackState } from '$lib/practice/practiceState.svelte.js';
	import { PlainSecret } from '$lib/secrets/PlainSecret.js';
	import { HashedSecret } from '$lib/secrets/HashedSecret.js';
	import { hashSecret } from '$lib/crypto/pbkdf2.js';
	import { analyzePassword } from '$lib/meta/analyzer.js';
	import Stats from '$lib/practice/Stats.svelte';
	import Button from '$lib/ui/Button.svelte';
	import Card from '$lib/ui/Card.svelte';

	const trainer = createPracticeState();

	// Setup fields
	let password1 = $state('');
	let password2 = $state('');
	let showPassword = $state(false);
	let isHashing = $state(false);

	// Practice fields
	let practiceInput = $state('');
	let showPracticePassword = $state(false);
	let isPeeking = $state(false);
	let peekTimeout: ReturnType<typeof setTimeout> | undefined;

	const passwordsMatch = $derived(password1.length > 0 && password1 === password2);
	const canStartPractice = $derived(passwordsMatch);

	function selectStorage(mode: StorageMode) {
		trainer.selectStorage(mode);
		password1 = '';
		password2 = '';
	}

	function handleSetup1Submit() {
		if (password1.length === 0) return;
		trainer.submitSetup1();
	}

	async function handleSetup2Submit() {
		if (!passwordsMatch) return;

		if (trainer.storageMode === 'hashed') {
			isHashing = true;
			try {
				const result = await hashSecret(password1);
				const meta = analyzePassword(password1);
				trainer.setupComplete(new HashedSecret(result, meta));
			} finally {
				isHashing = false;
			}
		} else {
			trainer.setupComplete(new PlainSecret(password1));
		}
	}

	async function handlePracticeSubmit() {
		if (practiceInput.length === 0 || trainer.feedback === 'verifying') return;

		const result = await trainer.attempt(practiceInput);
		practiceInput = '';

		// Clear feedback after a delay
		setTimeout(() => {
			trainer.clearFeedback();
		}, result ? 800 : 1200);
	}

	function handlePeek() {
		if (trainer.stats.currentLevel !== 2 || !trainer.secret) return;
		trainer.peek();
		isPeeking = true;
		clearTimeout(peekTimeout);
		peekTimeout = setTimeout(() => {
			isPeeking = false;
		}, 3000);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handlePracticeSubmit();
		}
	}

	function feedbackClass(fb: FeedbackState): string {
		if (fb === 'correct') return 'border-(--color-success) bg-(--color-success-bg)';
		if (fb === 'incorrect') return 'border-(--color-error) bg-(--color-error-bg)';
		return 'border-(--color-surface-border)';
	}

	const levelNames = $derived({
		1: m.level_1_name(),
		2: m.level_2_name(),
		3: m.level_3_name()
	} as Record<number, string>);
</script>

<div class="space-y-6">
	<!-- Back button -->
	<a href="/" class="inline-flex items-center gap-1 text-sm text-(--color-text-muted) hover:text-(--color-text) no-underline transition-colors">
		<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
		</svg>
		{m.action_back()}
	</a>

	{#if trainer.topState === 'MODE_SELECT'}
		<!-- Storage mode selection -->
		<div class="space-y-4">
			<h1 class="text-2xl font-bold">{m.storage_select_title()}</h1>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Card interactive onclick={() => selectStorage('visible')}>
					<div class="space-y-2">
						<h3 class="font-semibold text-lg">{m.storage_visible()}</h3>
						<p class="text-sm text-(--color-text-muted)">{m.storage_visible_desc()}</p>
					</div>
				</Card>
				<Card interactive onclick={() => selectStorage('hashed')}>
					<div class="space-y-2">
						<h3 class="font-semibold text-lg">{m.storage_hashed()}</h3>
						<p class="text-sm text-(--color-text-muted)">{m.storage_hashed_desc()}</p>
					</div>
				</Card>
			</div>
		</div>

	{:else if trainer.topState === 'SETUP_1'}
		<!-- Enter password -->
		<div class="space-y-4">
			<h1 class="text-2xl font-bold">{m.setup_enter_password()}</h1>
			<div class="relative">
				<input
					type={showPassword ? 'text' : 'password'}
					dir="ltr"
					class="w-full px-4 py-3 text-start border border-(--color-surface-border) rounded-(--radius-button) bg-(--color-surface) text-(--color-text) focus:outline-2 focus:outline-(--color-primary)"
					bind:value={password1}
					autofocus
					onkeydown={(e) => e.key === 'Enter' && handleSetup1Submit()}
				/>
				<button
					type="button"
					class="absolute end-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text) cursor-pointer"
					onclick={() => showPassword = !showPassword}
				>
					{showPassword ? '🔒' : '👁'}
				</button>
			</div>
			<Button onclick={handleSetup1Submit} disabled={password1.length === 0}>
				{m.action_continue()}
			</Button>
		</div>

	{:else if trainer.topState === 'SETUP_2'}
		<!-- Confirm password -->
		<div class="space-y-4">
			<h1 class="text-2xl font-bold">{m.setup_confirm_password()}</h1>
			<div class="relative">
				<input
					type={showPassword ? 'text' : 'password'}
					dir="ltr"
					class="w-full px-4 py-3 text-start border border-(--color-surface-border) rounded-(--radius-button) bg-(--color-surface) text-(--color-text) focus:outline-2 focus:outline-(--color-primary)"
					bind:value={password2}
					autofocus
					onkeydown={(e) => e.key === 'Enter' && handleSetup2Submit()}
				/>
				<button
					type="button"
					class="absolute end-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text) cursor-pointer"
					onclick={() => showPassword = !showPassword}
				>
					{showPassword ? '🔒' : '👁'}
				</button>
			</div>

			{#if password2.length > 0}
				<p class="text-sm {passwordsMatch ? 'text-(--color-success)' : 'text-(--color-error)'}">
					{passwordsMatch ? m.setup_passwords_match() : m.setup_passwords_mismatch()}
				</p>
			{/if}

			{#if isHashing}
				<div class="flex items-center gap-2 text-sm text-(--color-text-muted)">
					<div class="w-4 h-4 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin"></div>
					{m.setup_computing_hash()}
				</div>
			{:else}
				<Button onclick={handleSetup2Submit} disabled={!canStartPractice}>
					{m.setup_start_practice()}
				</Button>
			{/if}
		</div>

	{:else if trainer.topState === 'PRACTICE'}
		<!-- Practice mode -->
		<div class="space-y-6">
			<!-- Level badge + reference -->
			<div class="flex items-center justify-between">
				<span class="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-(--color-primary)/10 text-(--color-primary)">
					L{trainer.stats.currentLevel}: {levelNames[trainer.stats.currentLevel]}
				</span>

				{#if trainer.secret}
					{@const meta = trainer.secret.meta()}
					<div class="text-sm text-(--color-text-muted)">
						{m.meta_length()}: {meta.length}
						{#if meta.charClasses}
							{#if meta.charClasses.upper} | {m.meta_has_uppercase()}{/if}
							{#if meta.charClasses.lower} | {m.meta_has_lowercase()}{/if}
							{#if meta.charClasses.digit} | {m.meta_has_digits()}{/if}
							{#if meta.charClasses.symbol} | {m.meta_has_symbols()}{/if}
						{/if}
					</div>
				{/if}
			</div>

			<!-- Visible reference (L1 in visible mode) -->
			{#if trainer.stats.currentLevel === 1 && trainer.secret?.reveal()}
				<div class="bg-(--color-surface) border border-(--color-surface-border) rounded-(--radius-card) p-4 text-center">
					<code class="text-lg font-mono tracking-wider" dir="ltr">{trainer.secret.reveal()}</code>
				</div>
			{/if}

			<!-- Peek reference (L2) -->
			{#if isPeeking && trainer.secret?.reveal()}
				<div class="bg-(--color-surface) border border-(--color-primary)/30 rounded-(--radius-card) p-4 text-center animate-pulse">
					<code class="text-lg font-mono tracking-wider" dir="ltr">{trainer.secret.reveal()}</code>
				</div>
			{/if}

			<!-- Input area -->
			<div class="space-y-3">
				<label class="text-sm font-medium text-(--color-text-muted)" for="practice-input">
					{m.practice_enter_password()}
				</label>
				<div class="relative">
					<input
						id="practice-input"
						type={showPracticePassword ? 'text' : 'password'}
						dir="ltr"
						class="w-full px-4 py-3 text-start border-2 rounded-(--radius-button) bg-(--color-surface) text-(--color-text) focus:outline-2 focus:outline-(--color-primary) transition-colors {feedbackClass(trainer.feedback)}"
						bind:value={practiceInput}
						onkeydown={handleKeydown}
						disabled={trainer.feedback === 'verifying'}
						autofocus
					/>
					<button
						type="button"
						class="absolute end-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text) cursor-pointer"
						onclick={() => showPracticePassword = !showPracticePassword}
					>
						{showPracticePassword ? '🔒' : '👁'}
					</button>
				</div>

				<!-- Feedback -->
				{#if trainer.feedback === 'verifying'}
					<div class="flex items-center gap-2 text-sm text-(--color-text-muted)">
						<div class="w-4 h-4 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin"></div>
						{m.practice_verifying()}
					</div>
				{:else if trainer.feedback === 'correct'}
					<p class="text-sm font-medium text-(--color-success)">{m.practice_correct()}</p>
				{:else if trainer.feedback === 'incorrect'}
					<p class="text-sm font-medium text-(--color-error)">{m.practice_incorrect()}</p>
				{/if}
			</div>

			<!-- Stats -->
			<Stats stats={trainer.stats} accuracy={trainer.accuracy} />

			<!-- Controls -->
			<div class="flex flex-wrap gap-2">
				{#if trainer.stats.currentLevel === 2 && trainer.storageMode === 'visible'}
					<Button variant="secondary" onclick={handlePeek} disabled={isPeeking}>
						{m.action_peek()}
					</Button>
				{/if}
				{#if trainer.stats.currentLevel > 1}
					<Button variant="ghost" onclick={() => trainer.setLevel((trainer.stats.currentLevel - 1) as 1 | 2)}>
						{m.action_level_down()}
					</Button>
				{/if}
				{#if trainer.stats.currentLevel < 3}
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
