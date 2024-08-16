import { writable, type Writable } from 'svelte/store';
import type { Editor } from '@tiptap/core';

type SaveListener = () => void;

interface EditorStore extends Writable<Editor> {
	subscribeToSaveEvents: (callback: SaveListener) => () => void;
	notifySaveEvent: () => void;
}

export function createEditorStore(): EditorStore {
	const { subscribe, set, update } = writable<Editor>();
	const saveListeners: SaveListener[] = [];

	return {
		subscribe,
		set,
		update,
		subscribeToSaveEvents: (callback: SaveListener) => {
			saveListeners.push(callback);
			return () => {
				const index = saveListeners.indexOf(callback);
				if (index > -1) {
					saveListeners.splice(index, 1);
				}
			};
		},
		notifySaveEvent: () => {
			saveListeners.forEach((listener) => listener());
		}
	};
}
