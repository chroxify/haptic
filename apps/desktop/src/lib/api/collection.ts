import { hideDotFiles } from '@/utils';
import { readDir } from '@tauri-apps/api/fs';

// Fetch the collection entries
export const fetchCollectionEntries = async (
	dirPath: string,
	sort: 'name' | 'date' = 'name',
	showDotfiles = false
) => {
	if (!dirPath) return [];

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
