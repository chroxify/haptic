import { OS_TRASH_DIR } from '@/constants';
import { collection, collectionSettings, platform } from '@/store';
import { getNextUntitledName } from '@/utils';
import { createDir, readDir, removeFile, renameFile } from '@tauri-apps/api/fs';
import { homeDir } from '@tauri-apps/api/path';
import { get } from 'svelte/store';

// Create a new folder
export const createFolder = async (dirPath: string) => {
	// Read the directory
	const files = await readDir(dirPath);

	// Generate a new name
	const name = getNextUntitledName(files, 'Untitled');

	// Save the new folder
	await createDir(`${dirPath}/${name}`);

	return `${dirPath}/${name}`;
};

// Delete a folder
export const deleteFolder = async (path: string, recursive = false) => {
	const folderName = path.split('/').pop()!;

	if (!recursive) {
		let children = await readDir(path);

		// Remove .DS_Store files from the children
		children = children.filter((child) => child.name !== '.DS_Store');

		// TODO: implement empty children check

		if (children.length > 0) {
			throw new Error('Folder is not empty');
		}
	}

	switch (get(collectionSettings).notes.trash_dir) {
		case 'system':
			await renameFile(path, `${await homeDir()}${OS_TRASH_DIR[get(platform)]}${folderName}`);
			break;
		case 'haptic':
			await renameFile(path, `${get(collection)}/.haptic/trash/${path.split('/').pop()!}`);
			break;
		case 'delete':
			await removeFile(path);
			break;
	}
};

// Rename a folder
export const renameFolder = async (path: string, name: string) => {
	await renameFile(path, `${path.split('/').slice(0, -1).join('/')}/${name}`);
};

// Move a folder
export const moveFolder = async (source: string, target: string) => {
	// Get target directory
	const files = await readDir(target);

	// Make sure there are no name conflicts
	const folderName = source.split('/').pop()!;

	if (files.some((file) => file.name === folderName && file.children !== undefined)) {
		throw new Error('Name conflict');
	}

	await renameFile(source, `${target}/${folderName}`);
};
