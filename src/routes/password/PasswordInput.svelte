<script lang="ts">
	import { autofocus as autofocusAction } from '$lib/ui/autofocus.js';

	interface Props {
		value: string;
		show: boolean;
		disabled?: boolean;
		extraClass?: string;
		useAutofocus?: boolean;
		onkeydown?: (e: KeyboardEvent) => void;
		onSubmit?: () => void;
	}

	let {
		value = $bindable(),
		show = $bindable(),
		disabled = false,
		extraClass = '',
		useAutofocus = false,
		onkeydown,
		onSubmit
	}: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && onSubmit) {
			onSubmit();
		}
		onkeydown?.(e);
	}
</script>

<!-- dir="ltr" on wrapper ensures toggle button stays on the right side,
     aligned with the end of the LTR password text, regardless of page direction -->
<div class="relative" dir="ltr">
	<input
		type={show ? 'text' : 'password'}
		dir="ltr"
		class="w-full px-4 py-3 pe-20 text-start border border-(--color-surface-border) rounded-(--radius-button) bg-(--color-surface) text-(--color-text) focus:outline-2 focus:outline-(--color-primary) {extraClass}"
		bind:value
		{disabled}
		onkeydown={handleKeydown}
		use:autofocusAction={useAutofocus}
	/>
	<!-- Toggle visibility -->
	<button
		type="button"
		class="absolute right-10 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-text) cursor-pointer"
		onclick={() => (show = !show)}
		tabindex={-1}
	>
		{show ? '🔒' : '👁'}
	</button>
	<!-- Submit -->
	{#if onSubmit}
		<button
			type="button"
			class="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) hover:text-(--color-primary) cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
			onclick={onSubmit}
			disabled={disabled || value.length === 0}
			aria-label="Submit"
		>
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
			</svg>
		</button>
	{/if}
</div>
