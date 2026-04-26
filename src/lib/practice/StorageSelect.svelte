<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import Card from '$lib/ui/Card.svelte';
	import type { StorageMode } from './practiceState.svelte.js';

	interface Props {
		onSelect: (mode: StorageMode) => void;
	}

	let { onSelect }: Props = $props();
</script>

<div class="space-y-4">
	<h1 class="text-2xl font-bold">{m.storage_select_title()}</h1>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<Card interactive onclick={() => onSelect('visible')}>
			<div class="space-y-2">
				<h3 class="font-semibold text-lg">{m.storage_visible()}</h3>
				<p class="text-sm text-(--color-text-muted)">{m.storage_visible_desc()}</p>
			</div>
		</Card>
		<Card interactive onclick={() => onSelect('hashed')}>
			<div class="space-y-2">
				<h3 class="font-semibold text-lg">{m.storage_hashed()}</h3>
				<p class="text-sm text-(--color-text-muted)">{m.storage_hashed_desc()}</p>
			</div>
		</Card>
	</div>
</div>
