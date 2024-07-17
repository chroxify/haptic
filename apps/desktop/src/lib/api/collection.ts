import { activeFile, collection, noteHistory } from '@/store';
import { hideDotFiles, validateHapticFolder } from '@/utils';
import { readDir } from '@tauri-apps/api/fs';
import { get } from 'svelte/store';
import { open } from '@tauri-apps/api/dialog';
import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import type { CollectionParams } from '@/types';

// Fetch the collection entries
export const fetchCollectionEntries = async (
	dirPath?: string,
	sort: 'name' | 'date' = 'name',
	showDotfiles = false
) => {
	dirPath = dirPath || get(collection);

	if (!dirPath) new Error('No directory path provided');

	let files = await readDir(dirPath, { recursive: true });

	if (sort === 'name') {
		files.sort((a, b) => a.name!.localeCompare(b.name!));
	}

	// Hide dotfiles
	if (!showDotfiles) {
		files = hideDotFiles(files);
	}

	return files;
};

export const loadCollection = async (path?: string | undefined) => {
	// If no path is provided, open a dialog
	if (!path) {
		path = (await open({ directory: true })) as string;
	}

	// Return if no path is provided
	if (!path) return;

	// Set collection path
	collection.set(path);

	// Reset all collection states
	noteHistory.set([]);
	activeFile.set(null);

	// Validate .haptic folder
	await validateHapticFolder(path);

	// Add collection to collections data
	const collectionObj = {
		path: path,
		name: path.split('/').pop(),
		lastOpened: new Date().toISOString()
	};

	const collections = await readTextFile('collections.json', {
		dir: BaseDirectory.AppData
	}).catch(() => null);

	if (!collections) {
		await writeTextFile('collections.json', JSON.stringify([collectionObj]), {
			dir: BaseDirectory.AppData
		});
	} else {
		const collectionsArray = JSON.parse(collections);
		const index = collectionsArray.findIndex((item: { path: string }) => item.path === path);

		if (index !== -1) {
			collectionsArray.splice(index, 1);
		}

		collectionsArray.push(collectionObj);
		await writeTextFile('collections.json', JSON.stringify(collectionsArray), {
			dir: BaseDirectory.AppData
		});
	}
};

// Get all collections
export const getCollections = async (): Promise<CollectionParams[]> => {
	const collections = await readTextFile('collections.json', {
		dir: BaseDirectory.AppData
	}).catch(() => null);

	if (!collections) return [];

	return JSON.parse(collections);
};
