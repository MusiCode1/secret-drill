<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { formatPatternForDevice, androidUnlockCommand, type SecretKind } from '$lib/pattern/deviceSequence.js';
	import BackLink from '$lib/ui/BackLink.svelte';
	import Button from '$lib/ui/Button.svelte';
	import PatternLock from '../pattern/PatternLock.svelte';

	let kind: SecretKind = $state('pattern');
	let deviceName = $state('');

	// pattern
	let drawn: number[] = $state([]);
	let patternResetKey = $state(0);
	let showNumbers = $state(true);
	let showArrows = $state(true);

	// pin / password
	let pinValue = $state('');
	let passwordValue = $state('');

	let copied: 'value' | 'command' | null = $state(null);
	let copyTimeout: ReturnType<typeof setTimeout> | undefined;

	// responsive pattern size
	let containerEl: HTMLDivElement | undefined = $state();
	let patternSize = $state(280);
	$effect(() => {
		if (!containerEl) return;
		const updateSize = () => {
			patternSize = Math.min(360, containerEl!.clientWidth - 32);
		};
		updateSize();
		const observer = new ResizeObserver(updateSize);
		observer.observe(containerEl);
		return () => observer.disconnect();
	});

	const value = $derived(
		kind === 'pattern' ? formatPatternForDevice(drawn) : kind === 'pin' ? pinValue : passwordValue
	);
	const command = $derived(androidUnlockCommand(kind, value, deviceName.trim() || '<device>'));
	const hasValue = $derived(value.length > 0);

	function selectKind(k: SecretKind) {
		kind = k;
	}

	function handlePattern(indices: number[]) {
		drawn = indices;
	}

	function clearPattern() {
		drawn = [];
		patternResetKey += 1;
	}

	async function copy(what: 'value' | 'command', text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = what;
			clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => (copied = null), 1500);
		} catch {
			/* clipboard unavailable */
		}
	}
</script>

<div class="space-y-6" bind:this={containerEl}>
	<BackLink />

	<div class="space-y-1">
		<h1 class="text-2xl font-bold">{m.device_title()}</h1>
		<p class="text-sm text-(--color-text-muted)">{m.device_desc()}</p>
	</div>

	<!-- Kind selector -->
	<div class="flex flex-wrap gap-2">
		<Button variant={kind === 'pattern' ? 'primary' : 'secondary'} size="sm" onclick={() => selectKind('pattern')}>
			{m.mode_pattern()}
		</Button>
		<Button variant={kind === 'pin' ? 'primary' : 'secondary'} size="sm" onclick={() => selectKind('pin')}>
			{m.device_pin()}
		</Button>
		<Button variant={kind === 'password' ? 'primary' : 'secondary'} size="sm" onclick={() => selectKind('password')}>
			{m.mode_password()}
		</Button>
	</div>

	<!-- Device name -->
	<div class="space-y-2">
		<label class="text-sm font-medium text-(--color-text-muted)" for="device-name">{m.device_name_label()}</label>
		<input
			id="device-name"
			type="text"
			bind:value={deviceName}
			placeholder="liam-tablet"
			dir="ltr"
			class="w-full px-3 py-2 font-mono text-sm bg-(--color-surface) border border-(--color-surface-border) rounded-(--radius-button) focus-visible:outline-2 focus-visible:outline-(--color-primary)"
		/>
	</div>

	<!-- Input by kind -->
	{#if kind === 'pattern'}
		<div class="space-y-3">
			<p class="text-sm text-center text-(--color-text-muted)">{m.setup_draw_pattern()}</p>
			<div class="flex justify-center">
				{#key patternResetKey}
					<PatternLock mode="input" onPattern={handlePattern} size={patternSize} {showNumbers} {showArrows} />
				{/key}
			</div>
			<div class="flex flex-wrap items-center justify-center gap-4">
				<label class="flex items-center gap-2 text-sm text-(--color-text-muted) cursor-pointer">
					<input type="checkbox" bind:checked={showNumbers} class="accent-(--color-primary)" />
					{m.toggle_show_numbers()}
				</label>
				<label class="flex items-center gap-2 text-sm text-(--color-text-muted) cursor-pointer">
					<input type="checkbox" bind:checked={showArrows} class="accent-(--color-primary)" />
					{m.toggle_show_arrows()}
				</label>
				<Button variant="ghost" size="sm" onclick={clearPattern} disabled={drawn.length === 0}>
					{m.action_clear()}
				</Button>
			</div>
		</div>
	{:else if kind === 'pin'}
		<div class="space-y-2">
			<label class="text-sm font-medium text-(--color-text-muted)" for="pin-input">{m.device_pin_label()}</label>
			<input
				id="pin-input"
				type="text"
				inputmode="numeric"
				bind:value={pinValue}
				dir="ltr"
				class="w-full px-3 py-2 font-mono text-lg tracking-widest bg-(--color-surface) border border-(--color-surface-border) rounded-(--radius-button) focus-visible:outline-2 focus-visible:outline-(--color-primary)"
			/>
		</div>
	{:else}
		<div class="space-y-2">
			<label class="text-sm font-medium text-(--color-text-muted)" for="password-input">{m.device_password_label()}</label>
			<input
				id="password-input"
				type="text"
				bind:value={passwordValue}
				dir="ltr"
				class="w-full px-3 py-2 font-mono text-lg bg-(--color-surface) border border-(--color-surface-border) rounded-(--radius-button) focus-visible:outline-2 focus-visible:outline-(--color-primary)"
			/>
		</div>
	{/if}

	<!-- Output -->
	{#if hasValue}
		<div class="space-y-4">
			{#if kind === 'pattern'}
				<div class="space-y-2">
					<div class="text-sm font-medium text-(--color-text-muted)">{m.device_sequence_label()}</div>
					<div class="flex items-center gap-3">
						<code class="text-2xl font-mono tracking-[0.3em] text-(--color-primary)" dir="ltr">{value}</code>
						<Button variant="secondary" size="sm" onclick={() => copy('value', value)}>
							{copied === 'value' ? m.action_copied() : m.action_copy()}
						</Button>
					</div>
					<p class="text-xs text-(--color-text-muted)">{m.device_position_note()}</p>
				</div>
			{/if}

			<div class="space-y-2">
				<div class="text-sm font-medium text-(--color-text-muted)">{m.device_command_label()}</div>
				<div class="flex items-center gap-3">
					<code class="flex-1 px-3 py-2 overflow-x-auto text-sm font-mono bg-(--color-surface) border border-(--color-surface-border) rounded-(--radius-button)" dir="ltr">{command}</code>
					<Button variant="secondary" size="sm" onclick={() => copy('command', command)}>
						{copied === 'command' ? m.action_copied() : m.action_copy()}
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>
