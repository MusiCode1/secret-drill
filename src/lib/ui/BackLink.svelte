<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';

	interface Props {
		href?: string;
	}

	let { href = '/' }: Props = $props();
</script>

<a href={localizeHref(href)} class="inline-flex items-center gap-1 text-sm text-(--color-text-muted) hover:text-(--color-text) no-underline transition-colors">
	<svg class="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
		<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
	</svg>
	{m.action_back()}
</a>
