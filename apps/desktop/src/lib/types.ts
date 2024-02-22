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
		auto_correct: boolean;
		spell_check: boolean;
		show_inline_title: boolean;
		show_line_numbers: boolean;
		show_editor_toolbar: boolean;
	};
	notes: {
		auto_save: boolean;
		auto_save_debounce: number;
		trash_dir: 'system' | 'haptic' | null;
		excluded_files: string[];
	};
}
