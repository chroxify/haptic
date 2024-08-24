import { db } from '@/database/client';
import { entry as entryTable } from '@/database/schema';
import { collection } from '@/store';
import { getNextUntitledName } from '@/utils';
import { and, eq } from 'drizzle-orm';
import { get } from 'svelte/store';
import { moveNote } from './notes';

// Create a new folder
export const createFolder = async (dirPath: string) => {
	// Get the entry matching the path
	const entry = await db.select().from(entryTable).where(eq(entryTable.path, dirPath));

	let files = [];
	if (entry.length === 0) {
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

	// Generate a new name (Untitled, if there are any exiting Untitled folders, increment the number by 1)
	const name = getNextUntitledName(files, 'Untitled');

	// Save the new folder
	await db.insert(entryTable).values({
		name,
		path: `${dirPath}/${name}`.replace('//', '/'),
		parentPath: dirPath,
		collectionPath: get(collection),
		isFolder: true
	});

	return `${dirPath}/${name}`.replace('//', '/');
};

// Delete a folder
export const deleteFolder = async (path: string, recursive = false) => {
	if (!recursive) {
		let children = await db.select().from(entryTable).where(eq(entryTable.parentPath, path));

		// Remove .DS_Store files from the children
		children = children.filter((child) => child.name !== '.DS_Store');

		// TODO: implement empty children check

		if (children.length > 0) {
			throw new Error('Folder is not empty');
		}
	}

	await db.delete(entryTable).where(eq(entryTable.path, path));
};

// Rename a folder
export const renameFolder = async (path: string, name: string) => {
	await db
		.update(entryTable)
		.set({ name, path: `${path.split('/').slice(0, -1).join('/')}/${name}` })
		.where(eq(entryTable.path, path));
};

// Move a folder
export const moveFolder = async (source: string, target: string) => {
	// Get target directory
	const targetFiles = await db.select().from(entryTable).where(eq(entryTable.parentPath, target));

	// Make sure there are no name conflicts
	const folderName = source.split('/').pop()!;

	if (targetFiles.some((file) => file.name === folderName && file.isFolder)) {
		throw new Error('Name conflict');
	}

	// Get all source children
	const sourceFiles = await db.select().from(entryTable).where(eq(entryTable.parentPath, source));

	// Move all children
	for (const file of sourceFiles) {
		if (file.isFolder) {
			await moveFolder(file.path, `${target}/${folderName}`);
		} else {
			await moveNote(file.path, `${target}/${folderName}`);
		}
	}

	await db
		.update(entryTable)
		.set({ path: `${target}/${folderName}`, parentPath: target })
		.where(eq(entryTable.path, source));
};
