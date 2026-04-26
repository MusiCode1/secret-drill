<script lang="ts">
	import '../app.css';
	import { m } from '$lib/paraglide/messages.js';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>{m.app_title()}</title>
	<meta name="description" content={m.app_description()} />
</svelte:head>

<div class="min-h-screen bg-(--color-surface-dim)">
	<header class="border-b border-(--color-surface-border) bg-(--color-surface)">
		<div class="max-w-2xl mx-auto px-(--spacing-page) py-3 flex items-center justify-between">
			<a href="/" class="text-lg font-semibold text-(--color-text) no-underline hover:text-(--color-primary) transition-colors">
				{m.app_title()}
			</a>
			<div class="flex items-center gap-4">
				<a href="/about" class="text-sm text-(--color-text-muted) hover:text-(--color-text) transition-colors no-underline">
					{m.about_title()}
				</a>
				<LanguageSwitcher />
			</div>
		</div>
	</header>

	<main class="max-w-2xl mx-auto px-(--spacing-page) py-8">
		{@render children()}
	</main>
</div>
