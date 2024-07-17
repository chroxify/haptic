import { createFolder } from '@/api/folders';
import { createNote, deleteNote, duplicateNote, saveNote } from '@/api/notes';
import {
	collection,
	editor,
	editorMode,
	editorSearchActive,
	isPageSidebarOpen,
	collectionSearchActive
} from '@/store';
import { get } from 'svelte/store';
import { loadCollection } from '@/api/collection';
import type { IconKey } from '$lib/components/shared/icon.svelte';
import { showInFolder } from '@/utils';
import type { ShortcutParams } from '@/types';
import { SHORTCUTS } from '@/constants';

type Command = {
	title: string;
	icon: IconKey | null;
	shortcut?: ShortcutParams;
	onSelect?: () => string | void;
};

type CommandGroup = {
	name: string;
	commands: Command[];
};

export const mainCommands: CommandGroup[] = [
	{
		name: 'Notes',
		commands: [
			{
				title: 'New note',
				icon: 'notePlus',
				shortcut: SHORTCUTS['notes:create'],
				onSelect: () => {
					createNote(get(collection));
				}
			},
			{
				title: 'New folder',
				icon: 'folderPlus',
				// shortcut: ['cmd', 'shift', 'n'],
				onSelect: () => {
					createFolder(get(collection));
				}
			},
			{
				title: 'Open note',
				icon: 'note',
				shortcut: SHORTCUTS['command:open-note'],
				onSelect: () => {
					return 'open_note';
				}
			},
			{
				title: 'Search collection',
				icon: 'searchDocument',
				shortcut: SHORTCUTS['notes:search'],
				onSelect: () => {
					collectionSearchActive.set(true);
				}
			},
			{
				title: 'Toggle editor mode',
				icon: 'cursorI',
				shortcut: SHORTCUTS['editor:toggle-mode'],
				onSelect: () => {
					get(editor).setEditable(!get(editor).isEditable);
					editorMode.update((mode) => (mode === 'edit' ? 'view' : 'edit'));
				}
			},
			{
				title: 'Find in note',
				icon: 'searchDocument',
				shortcut: SHORTCUTS['editor:search'],
				onSelect: () => {
					editorSearchActive.set(true);
				}
			}
		]
	},
	{
		name: 'Navigation',
		commands: [
			{
				title: 'Go to previous note',
				icon: 'arrowLeft'
				// shortcut: ['cmd', 'up']
			},
			{
				title: 'Go to next note',
				icon: 'arrowRight'
				// shortcut: ['cmd', 'down']
			},
			{
				title: 'Open other collection',
				icon: 'folder',
				shortcut: SHORTCUTS['app:open-collection'],
				onSelect: () => {
					return 'open_collection';
				}
			},
			{
				title: 'Go to settings',
				icon: 'settings',
				shortcut: SHORTCUTS['app:settings']
			},
			{
				title: 'Go to help',
				icon: 'lifebouy'
				// shortcut: ['cmd', 'h']
			},
			{
				title: 'View shortcuts',
				icon: 'bolt',
				shortcut: SHORTCUTS['app:shortcuts']
			},
			{
				title: 'Send feedback',
				icon: 'lifebouy'
				// shortcut: ['cmd', 'shift', 'h']
			},
			{
				title: "Go to What's new",
				icon: 'bolt'
				// shortcut: ['cmd', 'shift', 'n']
			}
		]
	},
	{
		name: 'Appearance',
		commands: [
			{
				title: 'Change theme',
				icon: 'sun',
				// shortcut: ['cmd', 'shift', 't'],
				onSelect: () => {
					return 'change_theme';
				}
			}
		]
	},
	{
		name: 'Layout',
		commands: [
			{
				title: 'Toggle sidebar',
				icon: 'sidebarMenuLeft',
				shortcut: SHORTCUTS['notes:toggle-sidebar'],
				onSelect: () => {
					isPageSidebarOpen.update((open) => !open);
				}
			},
			{
				title: 'Toggle note details',
				icon: 'sidebarMenuRight'
				// shortcut: ['cmd', 'shift', 'e']
			}
		]
	}
];

export const createNoteCommands = (notePath: string): CommandGroup => {
	return {
		name: notePath.split('/').pop() as string,
		commands: [
			{
				title: 'Save note',
				icon: 'floppy',
				shortcut: SHORTCUTS['note:save'],
				onSelect: () => {
					saveNote(notePath);
				}
			},
			{
				title: 'Duplicate note',
				icon: 'copy',
				shortcut: SHORTCUTS['note:duplicate'],
				onSelect() {
					duplicateNote(notePath);
				}
			},
			{
				title: 'Rename note',
				icon: 'editPencil',
				shortcut: SHORTCUTS['note:rename']
			},
			{
				title: 'Delete note',
				icon: 'bin',
				shortcut: SHORTCUTS['note:delete'],
				onSelect: () => {
					deleteNote(notePath);
				}
			},
			{
				title: 'Move note to...',
				icon: 'motionCirclesLines',
				shortcut: SHORTCUTS['command:move-note'],
				onSelect: () => {
					return 'move_note';
				}
			},
			{
				title: 'Copy note path',
				icon: 'copy',
				// shortcut: ['cmd', 'c'],
				onSelect: () => {
					navigator.clipboard.writeText(notePath);
				}
			},
			{
				title: 'Reveal in Finder',
				icon: 'eye',
				shortcut: SHORTCUTS['note:show-in-folder'],
				onSelect: () => {
					showInFolder(notePath);
				}
			}
		]
	};
};
