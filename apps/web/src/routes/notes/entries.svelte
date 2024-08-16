<script lang="ts">
	import { createFolder, deleteFolder, moveFolder, renameFolder } from '@/api/folders';
	import { createNote, deleteNote, duplicateNote, moveNote, openNote } from '@/api/notes';
	import Icon from '@/components/shared/icon.svelte';
	import Shortcut from '@/components/shared/shortcut.svelte';
	import { SHORTCUTS } from '@/constants';
	import { activeFile, collection, editor } from '@/store';
	import type { FileEntry } from '@/types';
	import { shortcutToString } from '@/utils';
	import Button from '@haptic/ui/components/button/button.svelte';
	import * as Collapsible from '@haptic/ui/components/collapsible';
	import * as ContextMenu from '@haptic/ui/components/context-menu';
	import { cn } from '@haptic/ui/lib/utils';
	import { get } from 'svelte/store';

	export let entries: FileEntry[];
	export let toggleState: 'collapse' | 'expand';
	let folderOpenStates: boolean[] = [];
	let dragItem: HTMLElement | null = null; // Reference to the original element being dragged
	let dragPreviewItem: HTMLElement | null = null; // Reference to the custom drag preview element
	let previousHighlightedElement: HTMLElement | null = null;
	let isRenaming = false;

	$: toggleState = folderOpenStates.every((state) => state === false) ? 'expand' : 'collapse';

	// Watch for entries changes and update folderOpenStates array
	// This is necessary as the folderOpenStates array would be empty until collapsible is used to set the initial state
	$: {
		if (folderOpenStates.length !== entries.length) {
			folderOpenStates = new Array(entries.length).fill(false);
		}
	}

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

	export function toggleFolderStates() {
		folderOpenStates = folderOpenStates.map(() => (toggleState === 'expand' ? true : false));
	}

	// Rename note
	// BUG: Currently shortcuts prevent from typing when ur on hover fix that
	async function handleRename(entry: FileEntry, type: 'note' | 'folder') {
		// Set the isRenaming variable to true
		isRenaming = true;

		if (type === 'note') {
			// Open the note
			await openNote(entry.path);

			// Blur the editor
			get(editor).commands.blur();

			// Get the inline title input (#inline-title-input)
			const inlineTitleInput = document.getElementById('inline-title-input') as HTMLInputElement;

			// Focus the input and select all text
			window.setTimeout(() => {
				inlineTitleInput?.focus();
				inlineTitleInput?.select();
			}, 50);

			// Add blur event listener to the input
			inlineTitleInput?.addEventListener('blur', async () => {
				// Set the isRenaming variable to false
				isRenaming = false;

				// Remove the blur event listener
				inlineTitleInput?.removeEventListener('blur', () => {});
			});
		} else {
			// Get the element with the same data-path attribute as the current entry
			const element = document.querySelector(`[data-path="${entry.path}"]`);

			// Get the span within the div > button > div
			const span = element?.querySelector('span');

			// Set the contenteditable attribute to true
			window.setTimeout(() => {
				span?.setAttribute('contenteditable', 'true');

				// Focus the span
				span?.focus();

				// Select all text
				document.execCommand('selectAll');
			}, 100);

			// Add blur event listener to the span
			span?.addEventListener('blur', () => {
				// Set the contenteditable attribute to false
				span?.setAttribute('contenteditable', 'false');

				// Rename the folder
				if (isRenaming) {
					renameFolder(entry.path, span?.textContent || '');
				}

				// Set the isRenaming variable to false
				isRenaming = false;

				// Remove the blur event listener
				span?.removeEventListener('blur', () => {});
			});

			// Add keydown event listener to the span
			span?.addEventListener('keydown', (event) => {
				// Check if the key pressed is the Enter key
				if (event.key === 'Enter') {
					// Prevent the default action
					event.preventDefault();

					// Remove the focus from the span
					span?.blur();
				} else if (event.key === 'Escape') {
					// Prevent the default action
					event.preventDefault();

					// Set the contenteditable attribute to false
					span?.setAttribute('contenteditable', 'false');

					// Set the isRenaming variable to false
					isRenaming = false;

					// Reset the text content of the span
					span.textContent = entry.name ?? '';

					// Remove the blur event listener
					span?.removeEventListener('blur', () => {});
				} else if (event.key === 'Space') {
					// Prevent the default action
					event.preventDefault();
					event.stopPropagation();
				}
			});
		}
	}

	// Function to handle drag start
	function handleDragStart(event: DragEvent, filename: string) {
		// Specify the effect allowed for the drag
		event.dataTransfer!.effectAllowed = 'move';

		// Set dragItem to the original element being dragged
		dragItem = event.currentTarget as HTMLElement;

		// Create a custom drag preview element
		dragPreviewItem = document.createElement('div');
		dragPreviewItem.classList.add('drag-item');
		dragPreviewItem.textContent = filename;
		document.body.appendChild(dragPreviewItem);

		// Set the opacity of the original element
		(event.currentTarget as HTMLElement).style.opacity = '0.5';

		// Set the drag image to the custom element
		event.dataTransfer?.setDragImage(dragPreviewItem, 0, 0);

		// Add dragover event listener to document
		document.addEventListener('dragover', handleDragOver);
	}

	// Function to handle drag over
	function handleDragOver(event: DragEvent) {
		const element = event.target as HTMLElement;
		let highlightElement: HTMLElement | null = null;

		// Check for collapsible root
		const collapsibleTriggerElement = element.closest('[data-collapsible-root]');
		if (collapsibleTriggerElement) {
			if (
				dragItem?.hasAttribute('data-is-folder') &&
				collapsibleTriggerElement === dragItem?.closest('[data-collapsible-root]')
			) {
				// Select the next collapsible root parent, if none select the collection root itself
				let parentElement: HTMLElement | null = collapsibleTriggerElement.parentElement;

				// Loop through the parent elements until finding a root collapsible parent
				while (parentElement) {
					if (parentElement !== dragItem?.closest('[data-collapsible-root]')) {
						if (parentElement.hasAttribute('data-collection-root')) {
							highlightElement = parentElement;
						} else {
							highlightElement = parentElement.parentElement as HTMLElement;
						}
						break;
					}
					parentElement = parentElement.parentElement;
				}
			} else {
				highlightElement = collapsibleTriggerElement as HTMLElement;
			}
		} else {
			// Check for collection folder only if collapsible root is not present
			const collectionFolderElement = element.closest('[data-collection-root]');
			highlightElement = collectionFolderElement as HTMLElement;
		}

		if (highlightElement) {
			// If any parent or ancestor of the current element has the attribute data-collapsible-root or data-collection-root
			if (previousHighlightedElement && previousHighlightedElement !== highlightElement) {
				// Reset the background color of the previously highlighted element
				previousHighlightedElement.removeAttribute('data-highlighted');
			}
			// Highlight the element by setting a custom attribute
			highlightElement.setAttribute('data-highlighted', 'true');
			// Update the previousHighlightedElement variable
			previousHighlightedElement = highlightElement;
		} else {
			// If no element with the attribute data-collapsible-root or data-collection-root is found, reset the background color & previousHighlightedElement
			if (previousHighlightedElement) {
				previousHighlightedElement.removeAttribute('data-highlighted');
				previousHighlightedElement = null;
			}
		}
	}

	// Function to handle drag end
	function handleDragEnd(event: DragEvent, path: string, isFolder: boolean = false) {
		if (dragPreviewItem) {
			// Remove the custom element
			document.body.removeChild(dragPreviewItem);
			dragPreviewItem = null;
		}

		// Reset the dragItem
		dragItem = null;

		// Reset the opacity of the original element
		(event.currentTarget as HTMLElement).style.opacity = '';

		if (previousHighlightedElement) {
			// Check if the note is not being dropped in the same folder it's currently in
			const isSameFolder =
				previousHighlightedElement.getAttribute('data-path') ===
					path.split('/').slice(0, -1).join('/') ||
				previousHighlightedElement.firstElementChild?.getAttribute('data-path') ===
					path.split('/').slice(0, -1).join('/');

			if (!isSameFolder) {
				// Move the note to the folder
				if (previousHighlightedElement.hasAttribute('data-collection-root')) {
					if (isFolder) {
						moveFolder(path, previousHighlightedElement.getAttribute('data-path')!);
					} else {
						moveNote(path, previousHighlightedElement.getAttribute('data-path')!);
					}
				} else if (previousHighlightedElement.firstElementChild?.getAttribute('data-path')) {
					if (isFolder) {
						moveFolder(
							path,
							previousHighlightedElement.firstElementChild.getAttribute('data-path')!
						);
					} else {
						moveNote(path, previousHighlightedElement.firstElementChild.getAttribute('data-path')!);
					}
				}
			}

			// Reset background color & previousHighlightedElement
			previousHighlightedElement.removeAttribute('data-highlighted');
			previousHighlightedElement = null;
		}

		// Remove dragover event listener from document
		document.removeEventListener('dragover', handleDragOver);
	}
</script>

{#each entries as entry, i}
	{#if entry.children}
		<Collapsible.Root class="w-full" bind:open={folderOpenStates[i]}>
			<ContextMenu.Root>
				<ContextMenu.Trigger data-path={entry.path}>
					<div
						class="w-full h-full"
						role="button"
						on:dragstart={(e) => handleDragStart(e, entry.name || '')}
						tabindex="0"
						on:dragend={(e) => {
							handleDragEnd(e, entry.path, true);
						}}
						data-is-folder
					>
						<Collapsible.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								size="sm"
								variant="ghost"
								scale="sm"
								class="h-7 w-full fill-muted-foreground hover:fill-foreground text-secondary-foreground/80 hover:text-foreground transition-all flex items-center justify-between"
								style={`padding-left: ${calculateDepth(entry.path)}`}
								draggable
							>
								<Shortcut
									options={SHORTCUTS['folder:create']}
									callback={() => {
										!isRenaming && createFolder(entry.path);
									}}
								/>
								<Shortcut
									options={SHORTCUTS['folder:rename']}
									callback={() => !isRenaming && handleRename(entry, 'folder')}
								/>
								<Shortcut
									options={SHORTCUTS['folder:create-note']}
									callback={() => !isRenaming && createNote(entry.path)}
								/>
								<Shortcut
									options={SHORTCUTS['folder:delete']}
									callback={() => !isRenaming && deleteFolder(entry.path)}
								/>
								<div class="flex items-center w-[calc(100%-20px)] gap-2">
									<Icon
										name="folder"
										class={cn('w-[18px] h-[18px] shrink-0', folderOpenStates[i] && 'hidden')}
									/>
									<Icon
										name="folderOpen"
										class={cn('w-[18px] h-[18px] shrink-0', !folderOpenStates[i] && 'hidden')}
									/>
									<span class="text-xs truncate outline-none" autocorrect="off" spellcheck="false"
										>{entry.name}</span
									>
								</div>
								<!-- TODO: Make this an optional feature -->
								<span class="text-xs text-foreground/40">{entry.children.length}</span>
							</Button>
						</Collapsible.Trigger>
					</div>
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
						<ContextMenu.Shortcut
							>{shortcutToString(SHORTCUTS['folder:create-note'])}</ContextMenu.Shortcut
						>
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
						<ContextMenu.Shortcut
							>{shortcutToString(SHORTCUTS['folder:create'])}</ContextMenu.Shortcut
						>
					</ContextMenu.Item>
					<ContextMenu.Separator />
					<ContextMenu.Item
						class="flex items-center gap-2 font-base group"
						on:click={async () => {
							handleRename(entry, 'folder');
						}}
					>
						<Icon
							name="editPencil"
							class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
						/>
						Rename
						<ContextMenu.Shortcut>{shortcutToString(SHORTCUTS['note:rename'])}</ContextMenu.Shortcut
						>
					</ContextMenu.Item>
					<ContextMenu.Sub>
						<ContextMenu.SubTrigger class="flex items-center gap-2 font-base group">
							<Icon name="motionCirclesLines" class="w-3.5 h-3.5 fill-foreground/70" />
							Move folder to...
						</ContextMenu.SubTrigger>
						<ContextMenu.SubContent class="w-40">
							{#each getDirectories(entries) as directory}
								{#if directory.name !== entry.name}
									<ContextMenu.Item
										class="flex items-center gap-2 font-base group"
										on:click={() => moveFolder(entry.path, directory.path)}
									>
										<Icon
											name="folder"
											class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
										/>
										{directory.name}
									</ContextMenu.Item>
								{/if}
							{/each}

							{#if getDirectories(entries).filter((directory) => directory.name !== entry.name).length === 0}
								<ContextMenu.Item
									class="flex items-center gap-2 font-base group"
									on:click={async () => {
										// Create a new folder in parent directory
										const dirPath = await createFolder(
											entry.path.split('/').slice(0, -1).join('/')
										);

										// Move the folder to the new directory
										moveFolder(entry.path, dirPath);
									}}
								>
									<Icon
										name="folderPlus"
										class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
									/>
									New folder
									<ContextMenu.Shortcut
										>{shortcutToString(SHORTCUTS['folder:create'])}</ContextMenu.Shortcut
									>
								</ContextMenu.Item>
							{/if}
						</ContextMenu.SubContent>
					</ContextMenu.Sub>
					<ContextMenu.Separator />
					<ContextMenu.Item
						class="flex text-destructive data-[highlighted]:bg-destructive/20 data-[highlighted]:text-destructive items-center gap-2 font-base group"
						on:click={() => deleteFolder(entry.path)}
					>
						<Icon name="bin" class="w-3.5 h-3.5 fill-destructive/70 group-hover:fill-destructive" />
						Delete
						<ContextMenu.Shortcut class="text-destructive/60"
							>{shortcutToString(SHORTCUTS['folder:delete'])}</ContextMenu.Shortcut
						>
					</ContextMenu.Item>
				</ContextMenu.Content>
			</ContextMenu.Root>
			<Collapsible.Content
				class={cn('space-y-1.5 pt-1.5', entry.children.length === 0 && 'hidden')}
			>
				<svelte:self entries={entry.children} />
			</Collapsible.Content>
		</Collapsible.Root>
	{:else}
		<ContextMenu.Root>
			<ContextMenu.Trigger class="w-full" data-file-path={entry.path}>
				<div
					class="w-full h-full"
					role="button"
					on:dragstart={(e) => handleDragStart(e, entry.name || '')}
					tabindex="0"
					on:dragend={(e) => {
						handleDragEnd(e, entry.path);
					}}
				>
					<Button
						size="sm"
						variant="ghost"
						scale="sm"
						class={cn(
							'h-7 w-full transition-all text-secondary-foreground/80 hover:text-foreground flex items-center gap-2 justify-start',
							$activeFile === entry.path && 'bg-accent text-foreground'
						)}
						style={`padding-left: ${calculateDepth(entry.path)}`}
						on:click={() => openNote(entry.path)}
						draggable
					>
						<Shortcut
							options={SHORTCUTS['note:rename']}
							callback={() => !isRenaming && handleRename(entry, 'note')}
						/>
						<Shortcut
							options={SHORTCUTS['note:duplicate']}
							callback={() => !isRenaming && duplicateNote(entry.path)}
						/>
						<Shortcut
							options={SHORTCUTS['note:delete']}
							callback={() => !isRenaming && deleteNote(entry.path)}
						/>
						<span class="text-xs truncate" autocorrect="off" spellcheck="false">{entry.name}</span>
					</Button>
				</div>
			</ContextMenu.Trigger>
			<ContextMenu.Content class="w-44">
				<ContextMenu.Item
					class="flex items-center gap-2 font-base group"
					on:click={async () => {
						handleRename(entry, 'note');
					}}
				>
					<Icon
						name="editPencil"
						class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
					/>
					Rename
					<ContextMenu.Shortcut>{shortcutToString(SHORTCUTS['note:rename'])}</ContextMenu.Shortcut>
				</ContextMenu.Item>
				<ContextMenu.Item
					class="flex items-center gap-2 font-base group"
					on:click={() => duplicateNote(entry.path)}
				>
					<Icon name="copy" class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground" />
					Duplicate
					<ContextMenu.Shortcut
						>{shortcutToString(SHORTCUTS['note:duplicate'])}</ContextMenu.Shortcut
					>
				</ContextMenu.Item>
				<ContextMenu.Separator />
				<ContextMenu.Sub>
					<ContextMenu.SubTrigger class="flex items-center gap-2 font-base group">
						<Icon name="motionCirclesLines" class="w-3.5 h-3.5 fill-foreground/70" />

						Move note to...
					</ContextMenu.SubTrigger>
					<ContextMenu.SubContent class="w-40">
						{#each getDirectories(entries) as directory}
							{#if directory.name !== entry.name}
								<ContextMenu.Item
									class="flex items-center gap-2 font-base group"
									on:click={() => moveNote(entry.path, directory.path)}
								>
									<Icon
										name="folder"
										class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
									/>
									{directory.name}
								</ContextMenu.Item>
							{/if}
						{/each}

						{#if getDirectories(entries).length === 0}
							<ContextMenu.Item
								class="flex items-center gap-2 font-base group"
								on:click={async () => {
									// Create a new folder in parent directory
									await createFolder(entry.path.split('/').slice(0, -1).join('/'));

									// Move the folder to the new folder
									moveNote(entry.path, entry.path.split('/').slice(0, -1).join('/') + '/Untitled');
								}}
							>
								<Icon
									name="folderPlus"
									class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
								/>
								New folder
								<ContextMenu.Shortcut
									>{shortcutToString(SHORTCUTS['folder:create'])}</ContextMenu.Shortcut
								>
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
					<ContextMenu.Shortcut class="text-destructive/60"
						>{shortcutToString(SHORTCUTS['note:delete'])}</ContextMenu.Shortcut
					>
				</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	{/if}
{/each}

<style>
	:global(.drag-item) {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: hsl(var(--secondary));
		border: 1px solid hsl(var(--border));
		padding-top: 5px;
		padding-bottom: 3px;
		padding-right: 10px;
		padding-left: 20px;
		font-size: 12px;
		width: fit-content;
		height: fit-content;
		border-radius: calc(var(--radius) - 2px);
		z-index: 100;
	}

	:global([data-highlighted]) {
		background-color: hsl(var(--accent));
	}

	:global([data-collapsible-root]) {
		border-radius: calc(var(--radius) - 2px);
	}
</style>
