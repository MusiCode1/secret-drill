<script lang="ts">
	import '../app.css';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import ThemeSwitcher from '$lib/ui/ThemeSwitcher.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>{m.app_title()}</title>
	<meta name="description" content={m.app_description()} />
</svelte:head>

<div class="min-h-screen bg-(--color-surface-dim)">
	<header class="border-b border-(--color-surface-border) bg-(--color-surface)">
		<div class="max-w-2xl mx-auto px-(--spacing-page) py-3 flex items-center justify-between">
			<a href={localizeHref('/')} class="text-lg font-semibold text-(--color-text) no-underline hover:text-(--color-primary) transition-colors">
				{m.app_title()}
			</a>
			<div class="flex items-center gap-3">
				<a href={localizeHref('/about')} class="text-sm text-(--color-text-muted) hover:text-(--color-text) transition-colors no-underline">
					{m.about_title()}
				</a>
				<ThemeSwitcher />
				<LanguageSwitcher />
			</div>
		</div>
	</header>

	<main class="max-w-2xl mx-auto px-(--spacing-page) py-8">
		{@render children()}
	</main>
</div>
