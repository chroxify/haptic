import { db } from '@/database/client';
import { entry as entryTable } from '@/database/schema';
import { activeFile, collection, editor, noteHistory } from '@/store';
import type { NoteMetadataParams } from '@/types';
import { calculateReadingTime, getNextUntitledName, setEditorContent } from '@/utils';
import { eq, and } from 'drizzle-orm';
import { get } from 'svelte/store';

// Create a new note
export const createNote = async (dirPath: string, name?: string) => {
	// Read the directory
	const dirEntry = await db.select().from(entryTable).where(eq(entryTable.path, dirPath));

	let files = [];
	if (dirEntry.length === 0) {
		files = await db
			.select()
			.from(entryTable)
			.where(eq(entryTable.collectionPath, get(collection)));
	} else {
		files = await db
			.select()
			.from(entryTable)
			.where(
				and(eq(entryTable.parentPath, dirPath), eq(entryTable.collectionPath, get(collection)))
			);
	}

	// Generate a new name (Untitled.md, if there are any exiting Untitled notes, increment the number by 1)
	if (!name) {
		name = getNextUntitledName(files, 'Untitled', '.md');
	}

	// Save the new note
	await db.insert(entryTable).values({
		name,
		path: `${dirPath}/${name}`.replace('//', '/'),
		content: '',
		parentPath: dirPath,
		collectionPath: get(collection)
	});

	// Open the note
	openNote(`${dirPath}/${name}`.replace('//', '/'));
};

// Open a note
export async function openNote(path: string, skipHistory = false) {
	const file = await db.select().from(entryTable).where(eq(entryTable.path, path));
	setEditorContent(file[0].content ?? '');
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
	await db.delete(entryTable).where(eq(entryTable.path, path));
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

	// Get the note
	const entry = await db.select().from(entryTable).where(eq(entryTable.path, path));

	// Get all files in the directory
	const files = await db
		.select()
		.from(entryTable)
		.where(eq(entryTable.parentPath, entry[0].parentPath!));

	// Make sure there are no name conflicts
	if (files.some((file) => file.name?.toLowerCase() === name.toLowerCase() && !file.isFolder)) {
		throw new Error('Name conflict');
	}

	// Rename the file
	await db
		.update(entryTable)
		.set({ name, path: `${path.split('/').slice(0, -1).join('/')}/${name}` })
		.where(eq(entryTable.path, path));
	activeFile.set(`${path.split('/').slice(0, -1).join('/')}/${name}`);
};

// Save active note
export const saveNote = async (path: string) => {
	// Get note content
	let content = get(editor).storage.markdown.getMarkdown();

	// Remove the first heading title
	content = content.replace(/^# .*\n/, '');

	// Calculate file size in bytes
	const size = new TextEncoder().encode(content).length;

	await db
		.update(entryTable)
		.set({ content, updatedAt: new Date(), size })
		.where(eq(entryTable.path, path));
};

export const moveNote = async (source: string, target: string) => {
	// Get target directory
	const targetDir = await db.select().from(entryTable).where(eq(entryTable.path, target));

	let targetFiles = [];
	if (targetDir.length === 0) {
		targetFiles = await db.select().from(entryTable);
	} else {
		targetFiles = await db
			.select()
			.from(entryTable)
			.where(eq(entryTable.parentPath, targetDir[0].path));
	}

	// Make sure there are no name conflicts
	const noteName = source.split('/').pop()!;

	if (
		targetFiles.some(
			(file) => file.name === noteName && !file.isFolder && file.parentPath === target
		)
	) {
		throw new Error('Name conflict');
	}

	// Update the note
	await db
		.update(entryTable)
		.set({ path: `${target}/${noteName}`.replace('//', '/'), parentPath: target })
		.where(eq(entryTable.path, source));

	// Open the note
	openNote(target + '/' + noteName);
};

// Duplicate a note (format: "<name> (<number>).<ext>") - <number> is incremented if there are any existing notes with the same name
export const duplicateNote = async (path: string) => {
	// Fetch the content of the note
	const entry = await db.select().from(entryTable).where(eq(entryTable.path, path));

	// Extract the name and extension of the note
	const ext = path.split('.').pop()!;

	// Get current index of the note
	const files = await db
		.select()
		.from(entryTable)
		.where(eq(entryTable.parentPath, entry[0].parentPath!));
	const notes = files.filter((file) => file.name?.startsWith(entry[0].name!) && !file.isFolder);

	// Write the new note
	const newName = `${entry[0].name?.replace(`.${ext}`, '')} (${notes.length}).${ext}`;
	await db.insert(entryTable).values({
		name: newName,
		path: `${path.split('/').slice(0, -1).join('/')}/${newName}`,
		parentPath: entry[0].parentPath,
		collectionPath: entry[0].collectionPath,
		content: entry[0].content
	});

	// Open the new note
	openNote(`${path.split('/').slice(0, -1).join('/')}/${newName}`);
};

export const getNoteMetadataParams = async (path: string): Promise<NoteMetadataParams> => {
	// General file metadata
	const fileMetadata = await db.select().from(entryTable).where(eq(entryTable.path, path));

	// Get editor metadata
	const editorWordCount = get(editor).storage.characterCount.words();
	const editorCharacterCount = get(editor).storage.characterCount.characters();

	// Calculate average reading time (in seconds if < 1min and in minutes if >= 1min)
	const avgReadingTime = calculateReadingTime(editorWordCount);

	return {
		fileMetadata: {
			createdAt: fileMetadata[0].createdAt,
			modifiedAt: fileMetadata[0].updatedAt,
			size: fileMetadata[0].size ?? 0
		},
		editorMetadata: {
			words: editorWordCount,
			characters: editorCharacterCount,
			avgReadingTime: avgReadingTime
		}
	};
};
