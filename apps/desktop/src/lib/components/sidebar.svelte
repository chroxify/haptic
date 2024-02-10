<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import { cn } from '@haptic/ui/lib/utils';
	import Icon from './shared/icon.svelte';
	import { open } from '@tauri-apps/api/dialog';
	import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
	import { collection } from '@/store';
	import Tooltip from './shared/tooltip.svelte';

	let selected: 'notes' | 'daily' | 'tasks' | null = null;

	const handleSelected = (value: 'notes' | 'daily' | 'tasks' | null) => {
		if (selected === value) {
			return (selected = null);
		}

		selected = value;
	};

	const handleCollection = async () => {
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
</script>

<div class="fixed left-0 h-full flex flex-col justify-between items-center w-12 py-12 border-r">
	<div class="flex flex-col items-center gap-2">
		<Tooltip text="Notes" side="right">
			<a href={selected === 'notes' ? '/notes' : '/'}>
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-foreground/50 hover:fill-foreground',
						selected === 'notes' && 'fill-foreground bg-accent'
					)}
					scale="md"
					on:click={() => handleSelected('notes')}
				>
					<Icon name="inboxFull" class="w-[18px] h-[18px]" />
				</Button>
			</a>
		</Tooltip>
		<Tooltip text="Daily note" side="right">
			<a href="/daily">
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-foreground/50 hover:fill-foreground',
						selected === 'daily' && 'fill-foreground'
					)}
					scale="md"
					on:click={() => handleSelected('daily')}
				>
					<Icon name="calendarEdit" class="w-[18px] h-[18px]" />
				</Button>
			</a>
		</Tooltip>
		<Tooltip text="Tasks" side="right">
			<a href="tasks">
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-foreground/50 hover:fill-foreground',
						selected === 'tasks' && 'fill-foreground'
					)}
					scale="md"
					on:click={() => handleSelected('tasks')}
				>
					<Icon name="checkSquare" class="w-[18px] h-[18px]" />
				</Button>
			</a>
		</Tooltip>
	</div>

	<div class="flex flex-col items-center gap-2">
		<Tooltip text="Open collection" side="right">
			<Button
				size="icon"
				variant="ghost"
				class="h-7 w-7 fill-foreground/50 hover:fill-foreground group relative"
				scale="md"
				on:click={handleCollection}
			>
				<Icon name="folder" class="w-[18px] h-[18px] group-hover:hidden" />
				<Icon name="folderOpen" class="w-[18px] h-[18px] hidden group-hover:block" />
			</Button>
		</Tooltip>
		<Tooltip text="Settings" side="right">
			<Button
				size="icon"
				variant="ghost"
				class="h-7 w-7 fill-foreground/50 hover:fill-foreground"
				scale="md"
			>
				<Icon name="settings" class="w-[18px] h-[18px]" />
			</Button>
		</Tooltip>
	</div>
</div>
