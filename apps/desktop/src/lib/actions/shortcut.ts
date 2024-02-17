import { onDestroy, onMount, afterUpdate } from 'svelte';

// Interface for shortcut parameters
export interface ShortcutParams {
	alt?: boolean;
	shift?: boolean;
	command?: boolean;
	key: string;
	code?: string;
	callback?: () => void;
	hover?: boolean;
	node?: HTMLElement;
}

// Registry for shortcuts
const shortcuts: ShortcutParams[] = [];

// Global event listener
window.addEventListener('keydown', (e: KeyboardEvent) => {
	for (const shortcut of shortcuts) {
		if (
			!!shortcut.alt !== e.altKey ||
			!!shortcut.shift !== e.shiftKey ||
			!!shortcut.command !== (e.ctrlKey || e.metaKey) ||
			(shortcut.key.toLowerCase() !== e.key.toLowerCase() &&
				!(shortcut.code && shortcut.code === e.code)) ||
			(shortcut.hover && !(shortcut.node?.parentNode as Element)?.matches(':hover'))
		)
			continue;

		e.preventDefault();
		shortcut.callback ? shortcut.callback() : shortcut.node?.click();
	}
});

// Function to handle shortcut
const handleShortcut = (
	node: HTMLElement | (HTMLElement & { click: () => void }),
	params: ShortcutParams
): { destroy: () => void } => {
	params.node = node;

	// Add shortcut to registry on mount and after every update
	onMount(() => {
		shortcuts.push(params);
	});

	afterUpdate(() => {
		const index = shortcuts.indexOf(params);
		if (index === -1) {
			shortcuts.push(params);
		}
	});

	// Remove shortcut from registry on destroy
	onDestroy(() => {
		const index = shortcuts.indexOf(params);
		if (index > -1) {
			shortcuts.splice(index, 1);
		}
	});

	return {
		destroy: () => {
			const index = shortcuts.indexOf(params);
			if (index > -1) {
				shortcuts.splice(index, 1);
			}
		}
	};
};

export default handleShortcut;
