<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import Card from '$lib/ui/Card.svelte';
</script>

<div class="space-y-8">
	<a href="/" class="inline-flex items-center gap-1 text-sm text-(--color-text-muted) hover:text-(--color-text) no-underline transition-colors">
		<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
		</svg>
		{m.action_back()}
	</a>

	<h1 class="text-3xl font-bold">{m.about_title()}</h1>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold">{m.about_security_model()}</h2>

		<div class="space-y-3">
			<Card>
				<div class="flex items-start gap-3">
					<div class="mt-0.5 text-(--color-success)">
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
						</svg>
					</div>
					<div>
						<p class="font-medium">{m.about_no_data_sent()}</p>
						<p class="text-sm text-(--color-text-muted) mt-1">{m.about_csp_enforced()}</p>
					</div>
				</div>
			</Card>

			<Card>
				<div class="flex items-start gap-3">
					<div class="mt-0.5 text-(--color-success)">
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
						</svg>
					</div>
					<p class="font-medium">{m.about_no_storage()}</p>
				</div>
			</Card>

			<Card>
				<div class="flex items-start gap-3">
					<div class="mt-0.5 text-(--color-success)">
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
						</svg>
					</div>
					<p class="font-medium">{m.about_open_source()}</p>
				</div>
			</Card>
		</div>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">PBKDF2-SHA256</h2>
		<p class="text-(--color-text-muted)">
			{m.about_pbkdf2_explanation({ iterations: '600,000' })}
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-semibold">Content Security Policy</h2>
		<div class="bg-(--color-surface-dim) border border-(--color-surface-border) rounded-(--radius-card) p-4 overflow-x-auto">
			<code class="text-xs whitespace-pre" dir="ltr">
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
connect-src 'none';
font-src 'self';
form-action 'none';
base-uri 'self';
frame-ancestors 'none';
			</code>
		</div>
	</section>
</div>
