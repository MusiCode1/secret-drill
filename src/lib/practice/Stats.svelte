<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import type { Stats as StatsType } from './practiceState.svelte.js';

	interface Props {
		stats: StatsType;
		accuracy: number;
	}

	let { stats, accuracy }: Props = $props();
</script>

<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
	<div class="bg-(--color-surface) border border-(--color-surface-border) rounded-(--radius-card) p-3 text-center">
		<div class="text-2xl font-bold text-(--color-primary)">{stats.currentStreak}</div>
		<div class="text-xs text-(--color-text-muted)">{m.stats_streak()}</div>
	</div>
	<div class="bg-(--color-surface) border border-(--color-surface-border) rounded-(--radius-card) p-3 text-center">
		<div class="text-2xl font-bold text-(--color-primary)">{stats.bestStreak}</div>
		<div class="text-xs text-(--color-text-muted)">{m.stats_best_streak()}</div>
	</div>
	<div class="bg-(--color-surface) border border-(--color-surface-border) rounded-(--radius-card) p-3 text-center">
		<div class="text-2xl font-bold text-(--color-primary)">{stats.totalCorrect}</div>
		<div class="text-xs text-(--color-text-muted)">{m.stats_correct()}</div>
	</div>
	<div class="bg-(--color-surface) border border-(--color-surface-border) rounded-(--radius-card) p-3 text-center">
		<div class="text-2xl font-bold text-(--color-primary)">{accuracy}%</div>
		<div class="text-xs text-(--color-text-muted)">{m.stats_accuracy()}</div>
	</div>
</div>
