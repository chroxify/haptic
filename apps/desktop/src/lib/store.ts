import { writable } from 'svelte/store';
import { Editor } from '@tiptap/core';
import type { CollectionSettingsParams, AppSettingsParams } from './types';
import { BASE_APP_SETTINGS, BASE_COLLECTION_SETTINGS } from './constants';

const editor = writable<Editor>();

const activeFile = writable<string | null>(null);
const noteHistory = writable<string[]>([]);
const editorMode = writable<'edit' | 'view'>('edit');
const editorSearchActive = writable<boolean>(false);

const collection = writable<string>();

const tooltipsOpen = writable<number>(0);

const collectionSearchActive = writable<boolean>(false);
const isPageSidebarOpen = writable<boolean>(true);
const pageSidebarWidth = writable<number>(200);
const resizingPageSidebar = writable<boolean>(false);

const appSettings = writable<AppSettingsParams>(BASE_APP_SETTINGS);
const collectionSettings = writable<CollectionSettingsParams>(BASE_COLLECTION_SETTINGS);

export {
	editor,
	activeFile,
	collection,
	tooltipsOpen,
	collectionSearchActive,
	isPageSidebarOpen,
	pageSidebarWidth,
	resizingPageSidebar,
	noteHistory,
	editorMode,
	editorSearchActive,
	appSettings,
	collectionSettings
};
