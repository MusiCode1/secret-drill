<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { createPracticeState, type StorageMode, type FeedbackState } from '$lib/practice/practiceState.svelte.js';
	import { PlainSecret } from '$lib/secrets/PlainSecret.js';
	import { HashedSecret } from '$lib/secrets/HashedSecret.js';
	import { hashSecret } from '$lib/crypto/pbkdf2.js';
	import { analyzePassword } from '$lib/meta/analyzer.js';
	import Stats from '$lib/practice/Stats.svelte';
	import StorageSelect from '$lib/practice/StorageSelect.svelte';
	import BackLink from '$lib/ui/BackLink.svelte';
	import Button from '$lib/ui/Button.svelte';
	import PasswordInput from './PasswordInput.svelte';

	const trainer = createPracticeState();

	// Setup fields
	let password1 = $state('');
	let password2 = $state('');
	let showPassword = $state(false);
	let isHashing = $state(false);
	let autoVerify = $state(true);

	// Practice fields
	let practiceInput = $state('');
	let showPracticePassword = $state(false);
	let isPeeking = $state(false);
	let peekTimeout: ReturnType<typeof setTimeout> | undefined;

	const passwordsMatch = $derived(password1.length > 0 && password1 === password2);
	const isVisible = $derived(trainer.storageMode === 'visible');

	// Auto-verify in SETUP_2: when passwords match and auto-verify is on
	$effect(() => {
		if (
			trainer.topState === 'SETUP_2' &&
			autoVerify &&
			isVisible &&
			password2.length > 0 &&
			password2 === password1
		) {
			handleSetup2Submit();
		}
	});

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

	function feedbackClass(fb: FeedbackState): string {
		if (fb === 'correct') return 'border-(--color-success) bg-(--color-success-bg)';
		if (fb === 'incorrect') return 'border-(--color-error) bg-(--color-error-bg)';
		return '';
	}

	const levelNames = $derived({
		1: m.level_1_name(),
		2: m.level_2_name(),
		3: m.level_3_name()
	} as Record<number, string>);
</script>

<div class="space-y-6">
	<BackLink />

	{#if trainer.topState === 'MODE_SELECT'}
		<StorageSelect onSelect={selectStorage} />

	{:else if trainer.topState === 'SETUP_1'}
		<div class="space-y-4">
			<h1 class="text-2xl font-bold">{m.setup_enter_password()}</h1>
			<PasswordInput
				bind:value={password1}
				bind:show={showPassword}
				useAutofocus={true}
				onSubmit={handleSetup1Submit}
			/>
			<Button onclick={handleSetup1Submit} disabled={password1.length === 0}>
				{m.action_continue()}
			</Button>
		</div>

	{:else if trainer.topState === 'SETUP_2'}
		<div class="space-y-4">
			<h1 class="text-2xl font-bold">{m.setup_confirm_password()}</h1>
			<PasswordInput
				bind:value={password2}
				bind:show={showPassword}
				useAutofocus={true}
				onSubmit={handleSetup2Submit}
			/>

			{#if password2.length > 0}
				<p class="text-sm {passwordsMatch ? 'text-(--color-success)' : 'text-(--color-error)'}">
					{passwordsMatch ? m.setup_passwords_match() : m.setup_passwords_mismatch()}
				</p>
			{/if}

			<!-- Auto-verify toggle (visible mode only) -->
			{#if isVisible}
				<label class="flex items-center gap-2 text-sm text-(--color-text-muted) cursor-pointer">
					<input type="checkbox" bind:checked={autoVerify} class="accent-(--color-primary)" />
					{m.toggle_auto_verify()}
				</label>
			{/if}

			{#if isHashing}
				<div class="flex items-center gap-2 text-sm text-(--color-text-muted)">
					<div class="w-4 h-4 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin"></div>
					{m.setup_computing_hash()}
				</div>
			{:else}
				<Button onclick={handleSetup2Submit} disabled={!passwordsMatch}>
					{m.setup_start_practice()}
				</Button>
			{/if}
		</div>

	{:else if trainer.topState === 'PRACTICE'}
		<div class="space-y-6">
			<!-- Level badge + meta (visible mode only) -->
			<div class="flex items-center justify-between">
				{#if isVisible}
					<span class="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-(--color-primary)/10 text-(--color-primary)">
						L{trainer.stats.currentLevel}: {levelNames[trainer.stats.currentLevel]}
					</span>
				{/if}

				{#if trainer.secret}
					{@const meta = trainer.secret.meta()}
					<div class="text-sm text-(--color-text-muted) {isVisible ? '' : 'ms-auto'}">
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

			<!-- Visible reference (L1) -->
			{#if isVisible && trainer.stats.currentLevel === 1 && trainer.secret?.reveal()}
				<div class="bg-(--color-surface) border border-(--color-surface-border) rounded-(--radius-card) p-4 text-center">
					<code class="text-lg font-mono tracking-wider" dir="ltr">{trainer.secret.reveal()}</code>
				</div>
			{/if}

			<!-- Peek reference (L2) -->
			{#if isVisible && isPeeking && trainer.secret?.reveal()}
				<div class="bg-(--color-surface) border border-(--color-primary)/30 rounded-(--radius-card) p-4 text-center animate-pulse">
					<code class="text-lg font-mono tracking-wider" dir="ltr">{trainer.secret.reveal()}</code>
				</div>
			{/if}

			<!-- Input -->
			<div class="space-y-3">
				<label class="text-sm font-medium text-(--color-text-muted)" for="practice-input">
					{m.practice_enter_password()}
				</label>
				<PasswordInput
					bind:value={practiceInput}
					bind:show={showPracticePassword}
					disabled={trainer.feedback === 'verifying'}
					useAutofocus={true}
					extraClass="border-2 transition-colors {feedbackClass(trainer.feedback)}"
					onSubmit={handlePracticeSubmit}
				/>

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

			<Stats stats={trainer.stats} accuracy={trainer.accuracy} />

			<!-- Controls -->
			<div class="flex flex-wrap gap-2">
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
