import { createDir, readDir, renameFile } from '@tauri-apps/api/fs';
import { homeDir } from '@tauri-apps/api/path';

// Create a new folder
export const createFolder = async (dirPath: string) => {
	// Read the directory
	const files = await readDir(dirPath);

	// Generate a new name (Untitled, if there are any exiting Untitled folders, increment the number by 1)
	const untitledFolders = files.filter(
		(file) => file.name?.toLowerCase().startsWith('untitled') && file.children !== undefined
	);
	const name = `Untitled${untitledFolders.length ? ` ${untitledFolders.length}` : ''}`;

	// Save the new folder
	await createDir(`${dirPath}/${name}`);
};

// Delete a folder
export const deleteFolder = async (path: string, recursive = false) => {
	let folderName = path.split('/').pop()!;

	if (!recursive) {
		let children = await readDir(path);

		// Remove .DS_Store files from the children
		children = children.filter((child) => child.name !== '.DS_Store');

		// TODO: implement empty children check

		if (children.length > 0) {
			throw new Error('Folder is not empty');
		}
	}

	try {
		await renameFile(path, `${await homeDir()}/.trash/${folderName}`);
	} catch (error) {
		if ((error as string).includes('os error 66')) {
			folderName = `${folderName}-${Date.now()}`;
			await renameFile(path, `${await homeDir()}/.trash/${folderName}`);
		}
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
