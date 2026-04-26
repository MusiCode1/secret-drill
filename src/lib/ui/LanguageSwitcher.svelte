<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref, getLocale } from '$lib/paraglide/runtime.js';

	const LOCALE_LABELS: Record<string, string> = {
		en: 'EN',
		he: 'HE'
	};

	function routeForPath(pathname: string): '/' | '/about' | '/password' | '/pattern' {
		const normalized = pathname.replace(/^\/he(?=\/|$)/, '') || '/';

		if (normalized === '/about') return '/about';
		if (normalized === '/password') return '/password';
		if (normalized === '/pattern') return '/pattern';

		return '/';
	}

	const currentLocale = $derived(getLocale());
</script>

<nav aria-label="Language" class="flex gap-1">
	{#each locales as locale}
		<a
			href={localizeHref(routeForPath(page.url.pathname), { locale })}
			data-sveltekit-reload
			class="px-2 py-1 text-sm rounded transition-colors
				{locale === currentLocale
					? 'bg-(--color-primary) text-white font-medium'
					: 'text-(--color-text-muted) hover:bg-(--color-surface-dim)'}"
			aria-current={locale === currentLocale ? 'true' : undefined}
		>
			{LOCALE_LABELS[locale] ?? locale}
		</a>
	{/each}
</nav>
