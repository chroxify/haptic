<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import Icon from '@/components/shared/icon.svelte';
	import { readDir } from '@tauri-apps/api/fs';
	import type { FileEntry } from '@tauri-apps/api/fs';
	import Folder from './folder.svelte';
	let entries: FileEntry[] = [];

	// Set paths to the entries in the given directory
	async function processEntries(path: string, sort: 'name' | 'date' = 'name') {
		entries = await readDir(path, { recursive: true });

		if (sort === 'name') {
			entries.sort((a, b) => a.name!.localeCompare(b.name!));
		}

		// Remove hidden files
		function filterEntries(entries: FileEntry[]): FileEntry[] {
			return entries.filter((entry) => {
				if (entry.name!.startsWith('.')) {
					return false;
				}
				if (entry.children) {
					entry.children = filterEntries(entry.children);
				}
				return true;
			});
		}

		entries = filterEntries(entries);
	}

	processEntries('').then(() => {
		console.log(entries);
	});
</script>

<div
	class="fixed left-12 h-full flex flex-col justify-start items-center w-52 border-r gap-2 bg-background"
>
	<!-- Controls -->
	<div class="flex flex-row items-center justify-start gap-2 w-full px-3.5 py-1.5 border-b">
		<Button
			size="icon"
			variant="ghost"
			class="h-7 w-7 fill-foreground/50 hover:fill-foreground transition-all"
		>
			<Icon name="notePlus" class="w-[18px] h-[18px]" />
		</Button>
		<Button
			size="icon"
			variant="ghost"
			class="h-7 w-7 fill-foreground/50 hover:fill-foreground transition-all"
		>
			<Icon name="folderPlus" class="w-[18px] h-[18px]" />
		</Button>
		<Button
			size="icon"
			variant="ghost"
			class="h-7 w-7 fill-foreground/50 hover:fill-foreground transition-all"
		>
			<Icon name="reload" class="w-[18px] h-[18px]" />
		</Button>
		<Button
			size="icon"
			variant="ghost"
			class="h-7 w-7 fill-foreground/50 hover:fill-foreground transition-all"
		>
			<Icon name="searchBars" class="w-[18px] h-[18px]" />
		</Button>
	</div>

	<!-- Folders -->
	<div class="flex flex-col items-start gap-2 w-full px-2">
		<Folder {entries} />
	</div>
</div>
