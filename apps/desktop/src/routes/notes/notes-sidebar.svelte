<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import Icon from '@/components/shared/icon.svelte';
	import Folder from './folder.svelte';
	import { collection } from '@/store';
	import { createNote } from '@/api/notes';
	import { watchImmediate } from 'tauri-plugin-fs-watch-api';
	import type { FileEntry } from '@tauri-apps/api/fs';
	import { fetchCollectionEntries } from '@/api/collection';
	import type { UnlistenFn } from '@tauri-apps/api/event';
	import { createFolder } from '@/api/folders';

	let entries: FileEntry[] = [];
	let stopWatching: UnlistenFn;

	// Watch for changes in the collection
	async function watchCollection() {
		const stopWatching = await watchImmediate(
			$collection,
			async () => {
				entries = await fetchCollectionEntries($collection);
			},
			{ recursive: true }
		);

		return stopWatching;
	}

	collection.subscribe(async (value) => {
		entries = await fetchCollectionEntries(value);

		if (value) {
			if (stopWatching) stopWatching();
			stopWatching = await watchCollection();
		}
	});
</script>

<div
	class="fixed left-12 h-[calc(100vh-4.5rem)] flex flex-col justify-start items-center w-52 border-r gap-2 bg-background overflow-y-auto pb-4"
>
	<!-- Controls -->
	<div
		class="sticky top-0 flex flex-row items-center justify-start gap-2 w-full px-3.5 py-1.5 border-b bg-background"
	>
		<Button
			size="icon"
			variant="ghost"
			class="h-7 w-7 fill-foreground/50 hover:fill-foreground transition-all"
			on:click={async () => createNote($collection)}
		>
			<Icon name="notePlus" class="w-[18px] h-[18px]" />
		</Button>
		<Button
			size="icon"
			variant="ghost"
			class="h-7 w-7 fill-foreground/50 hover:fill-foreground transition-all"
			on:click={async () => createFolder($collection)}
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
