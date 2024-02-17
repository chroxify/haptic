export interface ShortcutParams {
	alt?: boolean;
	shift?: boolean;
	command?: boolean;
	key: string;
	code?: string; // overwritting the key if set
	hover?: boolean;
}

export const SHORTCUTS: Record<string, ShortcutParams> = {
	'editor:toggle-mode': { command: true, key: 'e' },
	'editor:search': { command: true, key: 'f' },
	'notes:toggle-sidebar': { command: true, shift: true, key: 's' },
	'notes:create': { command: true, key: 'n' },
	'note:duplicate': { key: 'd', hover: true },
	'note:rename': { key: 'r', hover: true },
	'note:delete': { command: true, key: 'Backspace', hover: true },
	'note:show-in-folder': { shift: true, key: 'f', hover: true },
	'folder:create': { key: 'f', hover: true },
	'folder:create-note': { key: 'n', hover: true },
	'folder:rename': { key: 'r', hover: true },
	'folder:show-in-folder': { shift: true, key: 'f', hover: true },
	'folder:delete': { command: true, key: 'Backspace', hover: true }
};
