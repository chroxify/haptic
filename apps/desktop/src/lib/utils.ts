import { emit } from '@tauri-apps/api/event';
import { createDir, readDir, type FileEntry } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api/tauri';
import { EditorState } from '@tiptap/pm/state';
import { clsx, type ClassValue } from 'clsx';
import { cubicOut } from 'svelte/easing';
import { get } from 'svelte/store';
import type { TransitionConfig } from 'svelte/transition';
import { twMerge } from 'tailwind-merge';
import { appTheme, editor, platform } from './store';
import type { ShortcutParams } from './types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

// Filter out all hidden file entries (dotfiles)
export function hideDotFiles(entries: FileEntry[]) {
	return entries.filter((entry) => {
		if (entry.name!.startsWith('.')) {
			return false;
		}
		if (entry.children) {
			entry.children = hideDotFiles(entry.children);
		}
		return true;
	});
}

/**
 * Resets the editors document title, updating the editor state, and focusing on the
 * first element after the heading.
 */
export function setEditorContent(content: string) {
	const $editor = get(editor);

	// Set content of the editor
	$editor.commands.setContent(content);

	// Update the editor state
	const newEditorState = EditorState.create({
		doc: $editor.state.doc,
		plugins: $editor.state.plugins,
		schema: $editor.state.schema
	});
	$editor.view.updateState(newEditorState);

	// Focus first line
	$editor.chain().focus().run();
}

// Show in folder
export async function showInFolder(path: string) {
	await invoke('show_in_folder', { path });
}

// Shortcut to string
export function shortcutToString(shortcut: ShortcutParams) {
	const keys = [];
	const isDarwin = get(platform) === 'darwin';

	if (shortcut.command) keys.push(isDarwin ? '⌘' : '⌃');
	if (shortcut.alt) keys.push('⌥');
	if (shortcut.shift) keys.push('⇧');

	switch (shortcut.key) {
		case 'Backspace':
			keys.push('⌫');
			break;
		case 'Enter':
			keys.push('⏎');
			break;
		case 'Tab':
			keys.push('⇥');
			break;
		case 'Delete':
			keys.push('⌦');
			break;
		case 'Escape':
			keys.push('⎋');
			break;
		case 'ArrowUp':
			keys.push('↑');
			break;
		case 'ArrowDown':
			keys.push('↓');
			break;
		case 'ArrowLeft':
			keys.push('←');
			break;
		case 'ArrowRight':
			keys.push('→');
			break;
		default:
			keys.push(shortcut.key.toUpperCase());
			break;
	}

	return keys.join('');
}

export async function validateHapticFolder(path: string) {
	if (path === null) return;

	const hapticFolder = await readDir(path + '/.haptic').catch(() => null);

	if (!hapticFolder) {
		// Create .haptic folder
		await createDir(path + '/.haptic');

		// Create trash folder
		await createDir(path + '/.haptic/trash');

		// Create daily folder
		await createDir(path + '/.haptic/daily');
	}
}

// Function to calculate average reading time
export function calculateReadingTime(wordCount: number): string {
	const wordsPerMinute = 200;
	const totalSeconds = Math.round((wordCount / wordsPerMinute) * 60);

	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	if (minutes > 0) {
		return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
	} else {
		return `${seconds}s`;
	}
}

export function formatTimeAgo(date: Date | undefined) {
	if (!date) return '';

	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `${days} day${days > 1 ? 's' : ''} ago`;
	} else if (hours > 0) {
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	} else if (minutes > 0) {
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	} else {
		return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
	}
}

export function formatFileSize(bytes: number) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	// Adjust to start from 'Bytes'
	const sizeInUnit = bytes / Math.pow(k, i);

	if (i >= 3) {
		// Display with decimal places for GB or bigger
		return Math.ceil(sizeInUnit) + ' ' + sizes[i];
	} else {
		// Display without decimal places for Bytes, KB, and MB
		return Math.ceil(sizeInUnit) + ' ' + sizes[i];
	}
}

function hslToHex(hsl: string): string {
	// Extract the H, S, and L values from the HSL string
	const [h, sPercent, lPercent] = hsl
		.replace(/%/g, '') // Remove percentage signs
		.split(' ')
		.map(Number);

	const s = sPercent / 100;
	const l = lPercent / 100;

	const a = s * Math.min(l, 1 - l);
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, '0'); // Convert to hex and ensure two digits
	};

	return `#${f(0)}${f(8)}${f(4)}`;
}

export function updateWindowTheme() {
	// Get theme background color - (num num% num%)
	const hsl = getComputedStyle(document.documentElement).getPropertyValue('--background');

	// Convert to hex
	const hex = hslToHex(hsl);

	// Set window theme
	emit('haptic-bg-changed', hex).catch((error) => {
		console.error('Failed to emit event:', error);
	});
}

export function toggleTheme() {
	// Theme options
	const themes = ['auto', 'light', 'dark'];

	// Current theme
	const currentTheme = get(appTheme);

	// Get index of current theme
	const index = themes.indexOf(currentTheme);

	// Get next theme
	const nextTheme = themes[(index + 1) % themes.length] as 'auto' | 'light' | 'dark';

	// Update theme
	appTheme.set(nextTheme);
}

// Helper function to get the next available untitled name
export const getNextUntitledName = (files: FileEntry[], prefix: string, extension: string = '') => {
	const untitledItems = files
		.filter(
			(file) =>
				file.name?.toLowerCase().startsWith(prefix.toLowerCase()) &&
				(extension ? file.name?.toLowerCase().endsWith(extension.toLowerCase()) : true)
		)
		.map((file) => file.name!);

	let maxNumber = 0;
	const numberPattern = new RegExp(`^${prefix}(?: (\\d+))?${extension}$`, 'i');

	untitledItems.forEach((name) => {
		const match = name.match(numberPattern);
		if (match) {
			const num = match[1] ? parseInt(match[1]) : 0;
			maxNumber = Math.max(maxNumber, num);
		}
	});

	for (let i = 0; i <= maxNumber + 1; i++) {
		const newName = i === 0 ? `${prefix}${extension}` : `${prefix} ${i}${extension}`;
		if (!untitledItems.includes(newName)) {
			return newName;
		}
	}

	// This should never happen, but just in case
	return `${prefix} ${maxNumber + 1}${extension}`;
};
