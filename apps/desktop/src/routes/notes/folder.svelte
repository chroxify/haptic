<script lang="ts">
	import type { FileEntry } from '@tauri-apps/api/fs';
	import Button from '@haptic/ui/components/button/button.svelte';
	import * as Collapsible from '@haptic/ui/components/collapsible';
	import * as ContextMenu from '@haptic/ui/components/context-menu';
	import Icon from '@/components/shared/icon.svelte';
	import { activeFile, collection } from '@/store';
	import { cn } from '@haptic/ui/lib/utils';
	import { createNote, deleteNote, openNote } from '@/api/notes';
	import { createFolder, deleteFolder } from '@/api/folders';

	export let entries: FileEntry[];
	let folderOpenStates: boolean[] = new Array(entries.length).fill(false);

	// Get all directories in the collection
	function getDirectories(entries: FileEntry[]): FileEntry[] {
		return entries.filter((entry) => entry.children);
	}

	// Root padding is 0.75rem
	// Each level of nesting adds 0.75rem
	// Subtract file path length from collection path length for relative path depth
	function calculateDepth(path: string) {
		return `${(path.split('/').length - $collection.split('/').length) * 0.75}rem`;
	}
</script>

{#each entries as entry, i}
	{#if entry.children}
		<Collapsible.Root class="w-full" bind:open={folderOpenStates[i]}>
			<ContextMenu.Root>
				<ContextMenu.Trigger>
					<Collapsible.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							size="sm"
							variant="ghost"
							scale="sm"
							class="h-7 w-full fill-foreground/50 hover:fill-foreground transition-all flex items-center gap-2 justify-start"
							style={`padding-left: ${calculateDepth(entry.path)}`}
						>
							<Icon
								name="folder"
								class={cn('w-[18px] h-[18px]', folderOpenStates[i] && 'hidden')}
							/>
							<Icon
								name="folderOpen"
								class={cn('w-[18px] h-[18px]', !folderOpenStates[i] && 'hidden')}
							/>
							<span class="text-xs">{entry.name}</span>
						</Button>
					</Collapsible.Trigger>
				</ContextMenu.Trigger>
				<ContextMenu.Content class="w-44">
					<ContextMenu.Item
						class="flex items-center gap-2 font-base group"
						on:click={() => {
							createNote(entry.path);
							folderOpenStates[i] = true;
						}}
					>
						<Icon
							name="notePlus"
							class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
						/>
						New note
						<ContextMenu.Shortcut>N</ContextMenu.Shortcut>
					</ContextMenu.Item>
					<ContextMenu.Item
						class="flex items-center gap-2 font-base group"
						on:click={() => {
							createFolder(entry.path);
							folderOpenStates[i] = true;
						}}
					>
						<Icon
							name="folderPlus"
							class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
						/>
						New folder
						<ContextMenu.Shortcut>F</ContextMenu.Shortcut>
					</ContextMenu.Item>
					<ContextMenu.Separator />
					<ContextMenu.Item class="flex items-center gap-2 font-base group">
						<Icon
							name="editPencil"
							class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
						/>
						Rename
						<ContextMenu.Shortcut>R</ContextMenu.Shortcut>
					</ContextMenu.Item>
					<ContextMenu.Sub>
						<ContextMenu.SubTrigger class="flex items-center gap-2 font-base group">
							<Icon name="motionCirclesLines" class="w-3.5 h-3.5 fill-foreground/70" />
							Move folder to...
						</ContextMenu.SubTrigger>
						<ContextMenu.SubContent class="w-40">
							{#each getDirectories(entries) as directory}
								{#if directory.name !== entry.name}
									<ContextMenu.Item class="flex items-center gap-2 font-base group">
										<Icon
											name="folder"
											class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
										/>
										{directory.name}
									</ContextMenu.Item>
								{/if}
							{/each}
						</ContextMenu.SubContent>
					</ContextMenu.Sub>
					<ContextMenu.Separator />
					<ContextMenu.Item class="flex items-center gap-2 font-base group">
						<Icon name="eye" class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground" />
						Show in Finder
						<ContextMenu.Shortcut>⌘E</ContextMenu.Shortcut>
					</ContextMenu.Item>
					<ContextMenu.Separator />
					<ContextMenu.Item
						class="flex text-destructive data-[highlighted]:bg-destructive/20 data-[highlighted]:text-destructive items-center gap-2 font-base group"
						on:click={() => deleteFolder(entry.path)}
					>
						<Icon name="bin" class="w-3.5 h-3.5 fill-destructive/70 group-hover:fill-destructive" />
						Delete
						<ContextMenu.Shortcut class="text-destructive/60">⌘⌫</ContextMenu.Shortcut>
					</ContextMenu.Item>
				</ContextMenu.Content>
			</ContextMenu.Root>
			<Collapsible.Content class="space-y-1.5 pt-1.5">
				<svelte:self entries={entry.children} />
			</Collapsible.Content>
		</Collapsible.Root>
	{:else}
		<ContextMenu.Root>
			<ContextMenu.Trigger class="w-full">
				<Button
					size="sm"
					variant="ghost"
					scale="sm"
					class={cn(
						'h-7 w-full transition-all flex items-center gap-2 justify-start',
						$activeFile === entry.path && 'bg-accent'
					)}
					style={`padding-left: ${calculateDepth(entry.path)}`}
					on:click={() => openNote(entry.path)}
				>
					<span class="text-xs truncate">{entry.name}</span>
				</Button>
			</ContextMenu.Trigger>
			<ContextMenu.Content class="w-44">
				<ContextMenu.Item class="flex items-center gap-2 font-base group">
					<Icon
						name="editPencil"
						class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
					/>
					Rename
					<ContextMenu.Shortcut>R</ContextMenu.Shortcut>
				</ContextMenu.Item>
				<ContextMenu.Item class="flex items-center gap-2 font-base group">
					<Icon name="copy" class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground" />
					Duplicate
					<ContextMenu.Shortcut>D</ContextMenu.Shortcut>
				</ContextMenu.Item>
				<ContextMenu.Separator />
				<ContextMenu.Item class="flex items-center gap-2 font-base group">
					<Icon name="eye" class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground" />
					Show in Finder
					<ContextMenu.Shortcut>⌘E</ContextMenu.Shortcut>
				</ContextMenu.Item>
				<ContextMenu.Sub>
					<ContextMenu.SubTrigger class="flex items-center gap-2 font-base group">
						<Icon name="motionCirclesLines" class="w-3.5 h-3.5 fill-foreground/70" />

						Move note to...
					</ContextMenu.SubTrigger>
					<ContextMenu.SubContent class="w-40">
						{#each getDirectories(entries) as directory}
							{#if directory.name !== entry.name}
								<ContextMenu.Item class="flex items-center gap-2 font-base group">
									<Icon
										name="folder"
										class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
									/>
									{directory.name}
								</ContextMenu.Item>
							{/if}
						{/each}

						{#if getDirectories(entries).length === 0}
							<ContextMenu.Item class="flex items-center gap-2 font-base group">
								<Icon
									name="folderPlus"
									class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
								/>
								New folder
								<ContextMenu.Shortcut>F</ContextMenu.Shortcut>
							</ContextMenu.Item>
						{/if}
					</ContextMenu.SubContent>
				</ContextMenu.Sub>
				<ContextMenu.Separator />
				<ContextMenu.Item
					class="flex text-destructive data-[highlighted]:bg-destructive/20 data-[highlighted]:text-destructive items-center gap-2 font-base group"
					on:click={() => deleteNote(entry.path)}
				>
					<Icon name="bin" class="w-3.5 h-3.5 fill-destructive/70 group-hover:fill-destructive" />
					Delete
					<ContextMenu.Shortcut class="text-destructive/60">⌘⌫</ContextMenu.Shortcut>
				</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	{/if}
{/each}
