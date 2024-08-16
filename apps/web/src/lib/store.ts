import { writable } from 'svelte/store';
import { createEditorStore } from './components/shared/editor/editor-store';
import { BASE_APP_SETTINGS, BASE_COLLECTION_SETTINGS } from './constants';
import type {
	AppSettingsParams,
	CollectionSettingsParams,
	FileEntry,
	SettingsStateParams
} from './types';

const editor = createEditorStore();

const activeFile = writable<string | null>(null);
const noteHistory = writable<string[]>([]);
const editorMode = writable<'edit' | 'view'>('edit');
const editorSearchValue = writable<string>('');
const editorSearchActive = writable<boolean>(false);

const collection = writable<string>();
const collectionEntries = writable<FileEntry[]>([]);

const tooltipsOpen = writable<number>(0);

const collectionSearchActive = writable<boolean>(false);
const isPageSidebarOpen = writable<boolean>(true);
const pageSidebarWidth = writable<number>(210);
const resizingPageSidebar = writable<boolean>(false);
const isNoteDetailSidebarOpen = writable<boolean>(false);
const noteDetailSidebarWidth = writable<number>(210);
const resizingNoteDetailSidebar = writable<boolean>(false);
export const settingsStore = writable<SettingsStateParams>({
	isOpen: false,
	activePage: 'general'
});

const appSettings = writable<AppSettingsParams>(BASE_APP_SETTINGS);
const collectionSettings = writable<CollectionSettingsParams>(BASE_COLLECTION_SETTINGS);

export {
	activeFile,
	appSettings,
	collection,
	collectionEntries,
	collectionSearchActive,
	collectionSettings,
	editor,
	editorMode,
	editorSearchActive,
	editorSearchValue,
	isNoteDetailSidebarOpen,
	isPageSidebarOpen,
	noteDetailSidebarWidth,
	noteHistory,
	pageSidebarWidth,
	resizingNoteDetailSidebar,
	resizingPageSidebar,
	tooltipsOpen
};
