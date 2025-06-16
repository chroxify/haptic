import { browser } from '$app/environment';
import { entry as entryTable } from '@/database/schema';
import { EditorState } from '@tiptap/pm/state';
import { clsx, type ClassValue } from 'clsx';
import { setMode, userPrefersMode } from 'mode-watcher';
import { cubicOut } from 'svelte/easing';
import { get, readable } from 'svelte/store';
import type { TransitionConfig } from 'svelte/transition';
import { twMerge } from 'tailwind-merge';
import { pgClient } from './database/client';
import { collection, editor, wordCount } from './store';
import type { FileEntry, SearchResultParams, ShortcutParams } from './types';

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

	// Update word count
	const text = $editor.getText();
	const words = text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0);
	wordCount.set(words.length);

	// Focus first line
	$editor.chain().focus().run();
}

// Shortcut to string
export function shortcutToString(shortcut: ShortcutParams) {
	const keys = [];

	if (shortcut.command) keys.push('⌘');
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

export function toggleTheme() {
	// Theme options
	const themes = ['system', 'light', 'dark'];

	// Current theme
	const currentTheme = get(userPrefersMode);

	// Get index of current theme
	const index = themes.indexOf(currentTheme);

	// Get next theme
	const nextTheme = themes[(index + 1) % themes.length] as 'system' | 'light' | 'dark';

	// Set the next theme
	setMode(nextTheme);
}

export function buildFileTree(
	entries: (typeof entryTable.$inferSelect)[],
	rootPath?: string
): FileEntry[] {
	const entryMap = new Map<string, FileEntry>();

	// First pass: create FileEntry objects for all entries
	entries.forEach((entry) => {
		entryMap.set(entry.path, {
			path: entry.path,
			name: entry.name || undefined,
			children: entry.isFolder ? [] : undefined
		});
	});

	// Second pass: build the tree structure
	const rootEntries: FileEntry[] = [];
	entries.forEach((entry) => {
		const fileEntry = entryMap.get(entry.path)!;

		// If it's a root entry, add it to rootEntries
		if (entry.parentPath === get(collection) || entry.parentPath === rootPath) {
			rootEntries.push(fileEntry);
		} else {
			const parentEntry = entryMap.get(entry.parentPath);
			if (parentEntry && parentEntry.children) {
				parentEntry.children.push(fileEntry);
			}
		}
	});

	return rootEntries;
}

export async function searchEntries(
	collectionPath: string,
	query: string,
	caseSensitive: boolean = false,
	matchWord: boolean = false
): Promise<SearchResultParams[]> {
	const escapedQuery = query.replace(/'/g, "''");
	const likeOperator = caseSensitive ? 'LIKE' : 'ILIKE';
	const wordBoundary = matchWord ? ' ' : '';
	const searchPattern = `%${wordBoundary}${escapedQuery}${wordBoundary}%`;
	const sqlQuery = `
    WITH matched_entries AS (
      SELECT path, content
      FROM entry
      WHERE collection_path = $1
        AND content ${likeOperator} $2
    )
    SELECT path, content
    FROM matched_entries
  `;
	const results = await pgClient.query<{ path: string; content: string }>(sqlQuery, [
		collectionPath,
		searchPattern
	]);
	const searchResults: SearchResultParams[] = [];
	results.rows.forEach((row) => {
		const contexts = extractAllContexts(row.content, escapedQuery, caseSensitive, matchWord);
		contexts.forEach((context) => {
			searchResults.push({
				path: row.path,
				context_preview: context
			});
		});
	});
	return searchResults;
}

function extractAllContexts(
	content: string,
	query: string,
	caseSensitive: boolean,
	matchWord: boolean
): string[] {
	const lines = content.split('\n');
	const contexts: string[] = [];
	lines.forEach((line, index) => {
		const compareLine = caseSensitive ? line : line.toLowerCase();
		const compareQuery = caseSensitive ? query : query.toLowerCase();
		if (matchWord) {
			const regex = new RegExp(`(^|\\s)${compareQuery}($|\\s)`, caseSensitive ? '' : 'i');
			if (regex.test(compareLine)) {
				const startLine = Math.max(0, index - 1);
				const endLine = Math.min(lines.length - 1, index + 1);
				contexts.push(lines.slice(startLine, endLine + 1).join('\n'));
			}
		} else if (compareLine.includes(compareQuery)) {
			const startLine = Math.max(0, index - 1);
			const endLine = Math.min(lines.length - 1, index + 1);
			contexts.push(lines.slice(startLine, endLine + 1).join('\n'));
		}
	});
	return contexts;
}

// Helper function to get the next available untitled name
export const getNextUntitledName = (
	files: (typeof entryTable.$inferSelect)[],
	prefix: string,
	extension: string = ''
) => {
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

interface DeviceInfo {
	isDesktop: boolean;
	isMobileOrTablet: boolean;
}

export function createDeviceDetector() {
	return readable<DeviceInfo>(
		{
			isDesktop: false,
			isMobileOrTablet: false
		},
		(set) => {
			if (!browser) return;

			const detectDevice = () => {
				// Check for touch capability
				const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

				// Check for laptop-specific indicators
				const hasMouseEvents = 'onmousemove' in window;
				const hasKeyboard = 'onkeydown' in window;

				// Check for mobile-specific browser features
				const hasMobileUserAgent =
					/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
						navigator.userAgent
					);

				// Check screen size and pixel ratio
				const smallScreen = window.screen.width < 768 || window.screen.height < 768;
				const highPixelRatio = window.devicePixelRatio > 1.5;

				const isMobileOrTablet = (() => {
					if (hasTouch && hasMobileUserAgent) {
						return true; // Definitely mobile or tablet
					} else if (hasTouch && (smallScreen || highPixelRatio)) {
						// Additional checks for touchscreen laptops
						if (hasMouseEvents && hasKeyboard) {
							return false; // Likely a touchscreen laptop
						} else {
							return true; // Likely mobile or tablet
						}
					} else {
						return false; // Likely not mobile or tablet
					}
				})();

				set({
					isDesktop: !isMobileOrTablet,
					isMobileOrTablet: isMobileOrTablet
				});
			};

			// Initial detection
			detectDevice();

			// Listener for orientation change and resize
			window.addEventListener('orientationchange', detectDevice);
			window.addEventListener('resize', detectDevice);

			// Cleanup listeners
			return () => {
				window.removeEventListener('orientationchange', detectDevice);
				window.removeEventListener('resize', detectDevice);
			};
		}
	);
}

export const sortFileEntry = (a: FileEntry, b: FileEntry): number => {
	const isDirectory = (file: FileEntry) => file.children != null;

	if (isDirectory(a) && isDirectory(b)) {
		return naturalSort(a.name!, b.name!);
	}
	if (isDirectory(a)) return -1;
	if (isDirectory(b)) return 1;

	return naturalSort(a.name!, b.name!);
};

const naturalSort = (a: string, b: string): number => {
	return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};
