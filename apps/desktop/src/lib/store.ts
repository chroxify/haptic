import { writable } from 'svelte/store';
import { Editor } from '@tiptap/core';

const editor = writable<Editor>();

const activeFile = writable<string | null>(null);

const collection = writable<string>();

const tooltipsOpen = writable<number>(0);

const isNotesSidebarOpen = writable<boolean>(true);
const notesSidebarWidth = writable<number>(200);
const resizingNotesSidebar = writable<boolean>(false);

export {
	editor,
	activeFile,
	collection,
	tooltipsOpen,
	isNotesSidebarOpen,
	notesSidebarWidth,
	resizingNotesSidebar
};
