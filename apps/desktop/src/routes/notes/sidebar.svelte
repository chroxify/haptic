<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import Icon from '@/components/shared/icon.svelte';
	import Entries from './entries.svelte';
	import {
		collection,
		editor,
		collectionSearchActive,
		isPageSidebarOpen,
		pageSidebarWidth,
		resizingPageSidebar
	} from '@/store';
	import { createNote, openNote } from '@/api/notes';
	import { watchImmediate } from 'tauri-plugin-fs-watch-api';
	import type { FileEntry } from '@tauri-apps/api/fs';
	import { fetchCollectionEntries } from '@/api/collection';
	import type { UnlistenFn } from '@tauri-apps/api/event';
	import { createFolder } from '@/api/folders';
	import Tooltip from '@/components/shared/tooltip.svelte';
	import { cn } from '@haptic/ui/lib/utils';
	import { SHORTCUTS } from '@/constants';
	import Shortcut from '@/components/shared/shortcut.svelte';
	import Input from '@haptic/ui/components/input/input.svelte';

	let entries: FileEntry[] = [];
	let folderToggleState: 'collapse' | 'expand';
	let toggleFolderStates: () => void;
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

		// Find first item that is a note (entry.children === undefined)
		const firstNote = entries.find((entry) => !entry.children);

		// Open the first note
		if (firstNote) {
			openNote(firstNote.path);
		}

		if (value) {
			if (stopWatching) stopWatching();
			stopWatching = await watchCollection();
		}
	});

	collectionSearchActive.subscribe((value) => {
		// Should focus inputs when search is active
		if (value) {
			const input = document.querySelector('#notesSearch') as HTMLInputElement;
			if (input) {
				// Wait 250ms for the input to be visible
				setTimeout(() => {
					// Focus the input
					input.focus();
				}, 250);
			}
		}
	});

	const handleMouseMove = (e: MouseEvent) => {
		resizingPageSidebar.set(true);

		const x = e.x;

		// Set collapsing bounds
		if (x < 100) {
			resizingPageSidebar.set(false);
			isPageSidebarOpen.set(false);
			return;
		} else if (x > 100 && !$isPageSidebarOpen) {
			resizingPageSidebar.set(false);
			isPageSidebarOpen.set(true);
			return;
		}

		// Set width bounds
		if ($pageSidebarWidth + e.movementX < 200 || $pageSidebarWidth + e.movementX > 500) {
			return;
		}

		// Set cursor resize bounds to prevent resizing when cursor is outside of the width bounds
		if (x < 245 || x > 550) {
			return;
		}

		pageSidebarWidth.update((value) => value + e.movementX);
	};

	// Resize sidebar handler
	const resizeHandler = () => {
		// Set resizing state
		resizingPageSidebar.set(true);

		// Blur the editor
		$editor.commands.blur();

		// Set cusor-col-resize class to body
		document.body.classList.toggle('cursor-col-resize');

		// Mouse up event listener
		const handleMouseUp = () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);

			// Remove cursor-col-resize class from body
			document.body.classList.remove('cursor-col-resize');

			resizingPageSidebar.set(false);
		};

		// Add event listeners
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};
</script>

<div
	class={cn(
		'fixed left-12 h-[calc(100vh-4.5rem)] flex flex-col justify-start items-center bg-background overflow-y-auto transform transition-transform duration-300',
		!$isPageSidebarOpen && '-translate-x-52'
	)}
	style={`width: ${$pageSidebarWidth}px`}
>
	<!-- Drag border -->
	<div
		class="h-full w-1 border-r cursor-col-resize absolute top-0 right-0 z-10 hover:bg-foreground/10 hover:delay-75 transition-all duration-200 active:bg-foreground/20 active:!cursor-col-resize"
		on:mousedown={resizeHandler}
		role="presentation"
	/>

	<!-- Controls -->
	<div class="relative top-0 flex flex-col min-h-10 w-full border-b bg-background overflow-hidden">
		<!-- Main Actions -->
		<div
			class={cn(
				'flex flex-row items-center justify-center w-full h-full px-3.5 gap-2 shrink-0 transform transition-all translate-y-0',
				$collectionSearchActive && '-translate-y-12'
			)}
		>
			<Tooltip text="New note" side="bottom" shortcut={SHORTCUTS['notes:create']}>
				<Button
					size="icon"
					variant="ghost"
					scale="md"
					class="h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all"
					on:click={async () => createNote($collection)}
				>
					<Shortcut options={SHORTCUTS['notes:create']} />
					<Icon name="notePlus" class="w-[18px] h-[18px]" />
				</Button>
			</Tooltip>
			<Tooltip text="New folder" side="bottom">
				<Button
					size="icon"
					variant="ghost"
					scale="md"
					class="h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all"
					on:click={async () => createFolder($collection)}
				>
					<Icon name="folderPlus" class="w-[18px] h-[18px]" />
				</Button>
			</Tooltip>
			<Tooltip
				text={folderToggleState === 'collapse' ? 'Collapse folders' : 'Expand folders'}
				side="bottom"
			>
				<Button
					size="icon"
					variant="ghost"
					scale="md"
					class="h-7 w-7 fill-muted-foreground hover:fill-foreground"
					on:click={async () => {
						toggleFolderStates();
					}}
				>
					<Icon
						name="collapseCircle"
						class={cn(
							'w-[18px] h-[18px] transition-all transform',
							folderToggleState === 'collapse' && 'hidden'
						)}
					/>
					<Icon
						name="expandCircle"
						class={cn(
							'w-[18px] h-[18px] transition-all transform',
							folderToggleState === 'expand' && 'hidden'
						)}
					/>
				</Button>
			</Tooltip>
			<Tooltip text="Search" side="bottom" shortcut={SHORTCUTS['notes:search']}>
				<Button
					size="icon"
					variant="ghost"
					scale="md"
					class="h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all"
					on:click={() => {
						collectionSearchActive.set(!$collectionSearchActive);
					}}
				>
					<Shortcut options={SHORTCUTS['notes:search']} />
					<Icon name="searchBars" class="w-[18px] h-[18px]" />
				</Button>
			</Tooltip>
		</div>
		<!-- Search -->
		<div
			class={cn(
				'absolute pb-[0.5px] flex flex-row items-center justify-center w-full h-full px-[5px] gap-1 shrink-0 transform transition-all translate-y-12',
				$collectionSearchActive && 'translate-y-0'
			)}
		>
			<Input
				id="notesSearch"
				class="w-full h-[30px] text-[13px]"
				placeholder="Search"
				spellcheck="false"
				disabled={!$collectionSearchActive}
			/>
			<Tooltip text="Close" side="bottom">
				<Button
					size="icon"
					variant="ghost"
					scale="md"
					class="h-7 w-7 shrink-0 fill-muted-foreground hover:fill-foreground transition-all"
					on:click={() => {
						collectionSearchActive.set(!$collectionSearchActive);
					}}
				>
					<Icon name="x" class="w-4 h-4" />
				</Button>
			</Tooltip>
		</div>
	</div>

	<!-- Folders -->
	<!-- Set y paddings here instead of in the parent as gap so scrollbar is not affected -->
	<div
		class="flex flex-col items-start gap-1 w-full px-2 h-full overflow-auto pt-2 pb-4"
		data-collection-root
		data-path={$collection}
	>
		<Entries {entries} bind:toggleFolderStates bind:toggleState={folderToggleState} />
	</div>
</div>

<style>
	:global(body.cursor-col-resize) {
		/* cursor: col-resize !important;
		user-select: none !important; */
		pointer-events: none;
	}
</style>
