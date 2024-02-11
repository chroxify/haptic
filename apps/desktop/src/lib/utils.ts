import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { type FileEntry } from '@tauri-apps/api/fs';
import { get } from 'svelte/store';
import { editor } from './store';
import { EditorState } from '@tiptap/pm/state';
import { invoke } from '@tauri-apps/api/tauri';

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
export function resetEditorContent(content: string, title: string) {
	const $editor = get(editor);

	// Set document title
	content = `# ${title}\n\n${content}`;

	// Set content of the editor
	$editor.commands.setContent(content);

	// Update the editor state
	const newEditorState = EditorState.create({
		doc: $editor.state.doc,
		plugins: $editor.state.plugins,
		schema: $editor.state.schema
	});
	$editor.view.updateState(newEditorState);

	// Focus first element after heading
	const headingEndPos = content.indexOf('\n\n');
	$editor.chain().focus().setTextSelection(headingEndPos).run();
}

// Show in folder
export async function showInFolder(path: string) {
	await invoke('show_in_folder', { path });
}
