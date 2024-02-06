import { writable } from 'svelte/store';
import { Editor } from '@tiptap/core';

const editor = writable<Editor>();

export { editor };
