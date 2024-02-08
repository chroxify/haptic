import { writable } from 'svelte/store';
import { Editor } from '@tiptap/core';

const editor = writable<Editor>();

const activeFile = writable<string | null>(null);

const collection = writable<string>();

export { editor, activeFile, collection };
