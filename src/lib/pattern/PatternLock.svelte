<script lang="ts">
	import { DOTS, DOT_RADIUS, HIT_RADIUS, clientToSvg, dotAt, lineCrossings } from './geometry.js';
	import type { PatternMode } from './types.js';

	interface Props {
		mode?: PatternMode;
		hint?: number[];
		disabled?: boolean;
		onPattern?: (indices: number[]) => void;
		size?: number;
	}

	let { mode = 'input', hint = [], disabled = false, onPattern, size = 280 }: Props = $props();

	let svgEl: SVGSVGElement | undefined = $state();
	let activeIndices: number[] = $state([]);
	let currentPointer: { x: number; y: number } | null = $state(null);
	let isDrawing = $state(false);

	const selected = $derived(new Set(activeIndices));

	function addDot(index: number) {
		if (selected.has(index)) return;

		// Auto-add crossed dots (Android behavior)
		if (activeIndices.length > 0) {
			const lastIndex = activeIndices[activeIndices.length - 1];
			const crossings = lineCrossings(lastIndex, index);
			for (const crossed of crossings) {
				if (!selected.has(crossed)) {
					activeIndices.push(crossed);
				}
			}
		}

		activeIndices.push(index);

		// Haptic feedback
		if (navigator.vibrate) {
			navigator.vibrate(10);
		}
	}

	function handlePointerDown(e: PointerEvent) {
		if (disabled || mode !== 'input' || !svgEl) return;

		svgEl.setPointerCapture(e.pointerId);
		isDrawing = true;
		activeIndices = [];
		currentPointer = null;

		const point = clientToSvg(svgEl, e.clientX, e.clientY);
		const dot = dotAt(point);
		if (dot !== null) {
			addDot(dot);
		}
		currentPointer = point;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDrawing || !svgEl) return;

		const point = clientToSvg(svgEl, e.clientX, e.clientY);
		currentPointer = point;

		const dot = dotAt(point);
		if (dot !== null) {
			addDot(dot);
		}
	}

	function handlePointerUp() {
		if (!isDrawing) return;
		isDrawing = false;
		currentPointer = null;

		if (activeIndices.length >= 2 && onPattern) {
			onPattern([...activeIndices]);
		}
		// Clear after a short delay for visual feedback
		if (mode === 'input') {
			setTimeout(() => {
				activeIndices = [];
			}, 200);
		}
	}

	function dotColor(index: number): string {
		if (mode === 'success') return 'var(--color-success)';
		if (mode === 'error') return 'var(--color-error)';
		if (selected.has(index)) return 'var(--color-primary)';
		return 'var(--color-text-muted)';
	}

	function lineColor(): string {
		if (mode === 'success') return 'var(--color-success)';
		if (mode === 'error') return 'var(--color-error)';
		return 'var(--color-primary)';
	}

	const hintSet = $derived(new Set(hint));

	const linePairs = $derived.by(() => {
		const displayIndices = mode === 'preview' ? hint : activeIndices;
		const pairs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
		for (let i = 1; i < displayIndices.length; i++) {
			const from = DOTS[displayIndices[i - 1]];
			const to = DOTS[displayIndices[i]];
			pairs.push({ x1: from.cx, y1: from.cy, x2: to.cx, y2: to.cy });
		}
		return pairs;
	});

	const trailingLine = $derived.by(() => {
		if (!isDrawing || !currentPointer || activeIndices.length === 0) return null;
		const last = DOTS[activeIndices[activeIndices.length - 1]];
		return { x1: last.cx, y1: last.cy, x2: currentPointer.x, y2: currentPointer.y };
	});
</script>

<svg
	bind:this={svgEl}
	viewBox="0 0 100 100"
	width={size}
	height={size}
	class="pattern-lock select-none"
	style="touch-action: none;"
	role="application"
	aria-label="Pattern lock grid"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
>
	<!-- Lines between selected dots -->
	{#each linePairs as line}
		<line
			x1={line.x1}
			y1={line.y1}
			x2={line.x2}
			y2={line.y2}
			stroke={lineColor()}
			stroke-width="2.5"
			stroke-linecap="round"
			opacity={mode === 'preview' ? 0.3 : 0.8}
		/>
	{/each}

	<!-- Trailing line to current pointer -->
	{#if trailingLine}
		<line
			x1={trailingLine.x1}
			y1={trailingLine.y1}
			x2={trailingLine.x2}
			y2={trailingLine.y2}
			stroke={lineColor()}
			stroke-width="1.5"
			stroke-linecap="round"
			opacity="0.4"
		/>
	{/if}

	<!-- Dots -->
	{#each DOTS as dot}
		<!-- Hit area (invisible, larger) -->
		<circle cx={dot.cx} cy={dot.cy} r={HIT_RADIUS} fill="transparent" />

		<!-- Visible dot -->
		<circle
			cx={dot.cx}
			cy={dot.cy}
			r={selected.has(dot.index) ? DOT_RADIUS * 1.4 : DOT_RADIUS}
			fill={dotColor(dot.index)}
			opacity={mode === 'preview' && hintSet.has(dot.index) ? 0.3 : 1}
			class="transition-[r] duration-100"
		/>

		<!-- Outer ring for selected dots -->
		{#if selected.has(dot.index)}
			<circle
				cx={dot.cx}
				cy={dot.cy}
				r={DOT_RADIUS * 2.5}
				fill="none"
				stroke={dotColor(dot.index)}
				stroke-width="1"
				opacity="0.3"
			/>
		{/if}
	{/each}
</svg>
