<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import Card from '$lib/ui/Card.svelte';
</script>

<div class="space-y-8">
	<div class="text-center">
		<h1 class="text-3xl font-bold mb-2">{m.mode_select_title()}</h1>
		<p class="text-(--color-text-muted)">{m.app_description()}</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<a href="/password" class="no-underline">
			<Card interactive>
				<div class="text-center space-y-3">
					<div class="text-4xl">
						<svg class="w-12 h-12 mx-auto text-(--color-primary)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
						</svg>
					</div>
					<h2 class="text-xl font-semibold text-(--color-text)">{m.mode_password()}</h2>
					<p class="text-sm text-(--color-text-muted)">{m.mode_password_desc()}</p>
				</div>
			</Card>
		</a>

		<a href="/pattern" class="no-underline">
			<Card interactive>
				<div class="text-center space-y-3">
					<div class="text-4xl">
						<svg class="w-12 h-12 mx-auto text-(--color-primary)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
						</svg>
					</div>
					<h2 class="text-xl font-semibold text-(--color-text)">{m.mode_pattern()}</h2>
					<p class="text-sm text-(--color-text-muted)">{m.mode_pattern_desc()}</p>
				</div>
			</Card>
		</a>
	</div>
</div>
