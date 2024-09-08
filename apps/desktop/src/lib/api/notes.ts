import { OS_TRASH_DIR } from '@/constants';
import { activeFile, collection, collectionSettings, editor, noteHistory, platform } from '@/store';
import type { NoteMetadataParams } from '@/types';
import { calculateReadingTime, getNextUntitledName, setEditorContent } from '@/utils';
import { readDir, readTextFile, removeFile, renameFile, writeTextFile } from '@tauri-apps/api/fs';
import { homeDir } from '@tauri-apps/api/path';
import { get } from 'svelte/store';
import { metadata } from 'tauri-plugin-fs-extra-api';

// Create a new note
export const createNote = async (dirPath: string, name?: string) => {
	// Read the directory
	const files = await readDir(dirPath);

	// Generate a new name (Untitled.md, if there are any exiting Untitled notes, increment the number by 1)
	if (!name) {
		name = getNextUntitledName(files, 'Untitled', '.md');
	}

	// Save the new note
	await writeTextFile(`${dirPath}/${name}`, '');

	// Open the note
	openNote(`${dirPath}/${name}`);
};

// Open a note
export async function openNote(path: string, skipHistory = false) {
	const fileContent = await readTextFile(path);
	setEditorContent(fileContent);
	activeFile.set(path);
	if (!skipHistory) {
		noteHistory.update((history) => {
			if (history[history.length - 1] !== path) {
				return [...history, path];
			}
			return history;
		});
	}
}

// Delete a note
export const deleteNote = async (path: string) => {
	switch (get(collectionSettings).notes.trash_dir) {
		case 'system':
			await renameFile(
				path,
				`${await homeDir()}${OS_TRASH_DIR[get(platform)]}${path.split('/').pop()!}`
			);
			break;
		case 'haptic':
			await renameFile(path, `${get(collection)}/.haptic/trash/${path.split('/').pop()!}`);
			break;
		case 'delete':
			await removeFile(path);
			break;
	}
	activeFile.set(null);
};

// Rename a note
export const renameNote = async (path: string, name: string) => {
	// Make sure file extension is included
	if (!name.endsWith('.md')) {
		name += '.md';
	}

	// Remove breaking characters
	name = name.replace(/[/\\?%*:|"<>]/g, '');

	// Read the directory
	const files = await readDir(path.split('/').slice(0, -1).join('/'));

	// Make sure there are no name conflicts
	if (
		files.some(
			(file) => file.name?.toLowerCase() === name.toLowerCase() && file.children === undefined
		)
	) {
		throw new Error('Name conflict');
	}

	// Rename the file
	await renameFile(path, `${path.split('/').slice(0, -1).join('/')}/${name}`);
	activeFile.set(`${path.split('/').slice(0, -1).join('/')}/${name}`);
};

// Save active note
export const saveNote = async (path: string) => {
	// Get note content
	let content = get(editor).storage.markdown.getMarkdown();

	// Remove the first heading title
	content = content.replace(/^# .*\n/, '');

	await writeTextFile(path, content);
};

export const moveNote = async (source: string, target: string) => {
	// Get target directory
	const files = await readDir(target);

	// Make sure there are no name conflicts
	const noteName = source.split('/').pop()!;

	if (files.some((file) => file.name === noteName && file.children === undefined)) {
		throw new Error('Name conflict');
	}

	await renameFile(source, target + '/' + noteName);
	openNote(target + '/' + noteName);
};

// Duplicate a note (format: "<name> (<number>).<ext>") - <number> is incremented if there are any existing notes with the same name
export const duplicateNote = async (path: string) => {
	// Fetch the content of the note
	const content = await readTextFile(path);

	// Extract the name and extension of the note
	const name = path
		.split('/')
		.pop()!
		.split('.')
		.shift()!
		.replace(/\s\(\d+\)$/, '');
	const ext = path.split('.').pop()!;

	// Get current index of the note
	const files = await readDir(path.split('/').slice(0, -1).join('/'));
	const notes = files.filter((file) => file.name?.startsWith(name) && file.children === undefined);

	// Write the new note
	const newName = `${name} (${notes.length}).${ext}`;
	await writeTextFile(`${path.split('/').slice(0, -1).join('/')}/${newName}`, content);

	// Open the new note
	openNote(`${path.split('/').slice(0, -1).join('/')}/${newName}`);
};

export const getNoteMetadataParams = async (path: string): Promise<NoteMetadataParams> => {
	// General file metadata
	const fileMetadata = await metadata(path);

	// Get editor metadata
	const editorWordCount = get(editor).storage.characterCount.words();
	const editorCharacterCount = get(editor).storage.characterCount.characters();

	// Calculate average reading time (in seconds if < 1min and in minutes if >= 1min)
	const avgReadingTime = calculateReadingTime(editorWordCount);

	return {
		fileMetadata,
		editorMetadata: {
			words: editorWordCount,
			characters: editorCharacterCount,
			avgReadingTime: avgReadingTime
		}
	};
};
