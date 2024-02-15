import { collection } from '@/store';
import { hideDotFiles } from '@/utils';
import { readDir } from '@tauri-apps/api/fs';
import { get } from 'svelte/store';
import { open } from '@tauri-apps/api/dialog';
import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/api/fs';

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

// TODO: Move loadCollection from sidebar to here
export const loadCollection = async () => {
	const path = (await open({ directory: true })) as string;
	if (!path) return;

	// Set collection path
	collection.set(path);

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
