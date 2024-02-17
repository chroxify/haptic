import { createFolder } from '@/api/folders';
import { createNote, deleteNote, duplicateNote, saveNote } from '@/api/notes';
import { collection, editor, editorMode, editorSearchActive, isNotesSidebarOpen } from '@/store';
import { get } from 'svelte/store';
import { loadCollection } from '@/api/collection';
import type { IconKey } from '../shared/icon.svelte';
import { showInFolder } from '@/utils';

type Command = {
	title: string;
	icon: IconKey | null;
	shortcut: string[];
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
				shortcut: ['cmd', 'n'],
				onSelect: () => {
					createNote(get(collection));
				}
			},
			{
				title: 'New folder',
				icon: 'folderPlus',
				shortcut: ['cmd', 'shift', 'n'],
				onSelect: () => {
					createFolder(get(collection));
				}
			},
			{
				title: 'Open note',
				icon: 'note',
				shortcut: ['cmd', 'j'],
				onSelect: () => {
					return 'open_note';
				}
			},
			{
				title: 'Search collection',
				icon: 'searchDocument',
				shortcut: ['cmd', 'shift', 'f']
			},
			{
				title: 'Toggle editor mode',
				icon: 'cursorI',
				shortcut: ['cmd', 'e'],
				onSelect: () => {
					get(editor).setEditable(!get(editor).isEditable);
					editorMode.update((mode) => (mode === 'edit' ? 'view' : 'edit'));
				}
			},
			{
				title: 'Find in note',
				icon: 'searchDocument',
				shortcut: ['cmd', 'f'],
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
				icon: 'arrowLeft',
				shortcut: ['cmd', 'up']
			},
			{
				title: 'Go to next note',
				icon: 'arrowRight',
				shortcut: ['cmd', 'down']
			},
			{
				title: 'Open other collection',
				icon: 'folder',
				shortcut: ['cmd', 'o'],
				onSelect: () => {
					loadCollection();
				}
			},
			{
				title: 'Go to settings',
				icon: 'settings',
				shortcut: ['cmd', ',']
			},
			{
				title: 'Go to help',
				icon: 'lifebouy',
				shortcut: ['cmd', 'h']
			},
			{
				title: 'Send feedback',
				icon: 'lifebouy',
				shortcut: ['cmd', 'shift', 'h']
			},
			{
				title: "Go to What's new",
				icon: 'bolt',
				shortcut: ['cmd', 'shift', 'n']
			}
		]
	},
	{
		name: 'Appearance',
		commands: [
			{
				title: 'Change theme',
				icon: 'sun',
				shortcut: ['cmd', 'shift', 't'],
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
				shortcut: ['cmd', 'shift', 's'],
				onSelect: () => {
					isNotesSidebarOpen.update((open) => !open);
				}
			},
			{
				title: 'Toggle note details',
				icon: 'sidebarMenuRight',
				shortcut: ['cmd', 'shift', 'e']
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
				shortcut: ['cmd', 's'],
				onSelect: () => {
					saveNote(notePath);
				}
			},
			{
				title: 'Duplicate note',
				icon: 'copy',
				shortcut: ['cmd', 'shift', 'd'],
				onSelect() {
					duplicateNote(notePath);
				}
			},
			{
				title: 'Rename note',
				icon: 'editPencil',
				shortcut: ['cmd', 'r']
			},
			{
				title: 'Delete note',
				icon: 'bin',
				shortcut: ['cmd', 'd'],
				onSelect: () => {
					deleteNote(notePath);
				}
			},
			{
				title: 'Move note to...',
				icon: 'motionCirclesLines',
				shortcut: ['cmd', 'shift', 'm'],
				onSelect: () => {
					return 'move_note';
				}
			},
			{
				title: 'Copy note path',
				icon: 'copy',
				shortcut: ['cmd', 'c'],
				onSelect: () => {
					navigator.clipboard.writeText(notePath);
				}
			},
			{
				title: 'Reveal in Finder',
				icon: 'eye',
				shortcut: ['cmd', 'o'],
				onSelect: () => {
					showInFolder(notePath);
				}
			}
		]
	};
};
