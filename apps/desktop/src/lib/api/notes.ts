import { writeTextFile, readDir, readTextFile, renameFile } from '@tauri-apps/api/fs';
import { activeFile } from '@/store';
import { resetEditorContent } from '@/utils';
import { homeDir } from '@tauri-apps/api/path';
import { get } from 'svelte/store';

// Create a new note
export const createNote = async (dirPath: string) => {
	// Read the directory
	const files = await readDir(dirPath);

	// Generate a new name (Untitled.md, if there are any exiting Untitled notes, increment the number by 1)
	const untitledNotes = files.filter(
		(file) => file.name?.toLowerCase().startsWith('untitled') && file.children === undefined
	);
	const name = `Untitled${untitledNotes.length ? ` ${untitledNotes.length}` : ''}.md`;

	// Save the new note
	await writeTextFile(`${dirPath}/${name}`, '');

	// Open the note
	openNote(`${dirPath}/${name}`);
};

// Open a note
export async function openNote(path: string) {
	const fileContent = await readTextFile(path);
	resetEditorContent(fileContent, path.split('/').pop()!.split('.').shift()!);
	activeFile.set(path);
}

// Delete a note
export const deleteNote = async (path: string) => {
	// TODO: Wont work on Windows
	await renameFile(path, `${await homeDir()}.trash/${path.split('/').pop()!}`);
	activeFile.set('');
};

// Rename a note
export const renameNote = async (path: string, name: string) => {
	await renameFile(path, `${path.split('/').slice(0, -1).join('/')}/${name}`);
	activeFile.set(`${path.split('/').slice(0, -1).join('/')}/${name}`);
};

// Save active note
export const saveNote = async (path: string, content: string) => {
	await writeTextFile(path, content);
};
