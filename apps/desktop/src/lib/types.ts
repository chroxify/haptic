import type { Metadata } from 'tauri-plugin-fs-extra-api';

export interface ShortcutParams {
	alt?: boolean;
	shift?: boolean;
	command?: boolean;
	key: string;
	code?: string; // overwritting the key if set
	hover?: boolean;
}

export interface AppSettingsParams {
	theme: string;
	theme_mode: string;
	interface_font: string;
}

export interface CollectionSettingsParams {
	editor: {
		font: string;
		size: number;
		auto_save: boolean;
		auto_save_debounce: number;
		auto_correct: boolean;
		spell_check: boolean;
		show_inline_title: boolean;
		show_line_numbers: boolean;
		show_toolbar: boolean;
	};
	notes: {
		trash_dir: 'system' | 'haptic' | 'delete';
		excluded_files: string[];
	};
}

export interface CollectionParams {
	path: string;
	name: string;
	lastOpened: string;
}

export interface NoteMetadataParams {
	fileMetadata: Metadata;
	editorMetadata: {
		words: number;
		characters: number;
		avgReadingTime: string;
	};
}

export interface SettingsStateParams {
	isOpen: boolean;
	activePage: string;
}
