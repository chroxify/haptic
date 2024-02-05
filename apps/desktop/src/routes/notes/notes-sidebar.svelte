<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import Icon from '@/components/shared/icon.svelte';
	import { readDir } from '@tauri-apps/api/fs';
	import type { FileEntry } from '@tauri-apps/api/fs';
	let entries: FileEntry[] = [];

	// Set paths to the entries in the given directory
	async function processEntries(path: string) {
		const entries = await readDir(path, { recursive: true });

		return entries.forEach((entry) => {
			entries.push(entry);
		});
	}

	processEntries('/Users/christo/Documents/Obsidian/Personal');

	console.log(entries);
</script>

<div
	class="fixed left-12 h-full flex flex-col justify-between items-center w-52 py-12 border-r px-4"
>
	<!-- Controls -->
	<div class="flex flex-row items-center justify-start gap-2 w-full">
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
</div>
