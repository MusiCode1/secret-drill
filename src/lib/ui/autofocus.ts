/** Svelte action that focuses the element when it mounts. Pass `false` to skip. */
export function autofocus(node: HTMLElement, enabled: boolean = true) {
	if (!enabled) return;
	requestAnimationFrame(() => node.focus());
}
