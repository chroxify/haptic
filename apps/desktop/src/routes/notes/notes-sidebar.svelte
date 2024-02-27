<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import Icon from '@/components/shared/icon.svelte';
	import Folder from './folder.svelte';
	import {
		collection,
		editor,
		isNotesSidebarOpen,
		notesSidebarWidth,
		resizingNotesSidebar
	} from '@/store';
	import { createNote } from '@/api/notes';
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
	let searchActive: boolean;
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
		if (value) {
			if (stopWatching) stopWatching();
			stopWatching = await watchCollection();
		}
	});

	const handleMouseMove = (e: MouseEvent) => {
		resizingNotesSidebar.set(true);

		const x = e.x;

		// Set collapsing bounds
		if (x < 100) {
			resizingNotesSidebar.set(false);
			isNotesSidebarOpen.set(false);
			return;
		} else if (x > 100 && !$isNotesSidebarOpen) {
			resizingNotesSidebar.set(false);
			isNotesSidebarOpen.set(true);
			return;
		}

		// Set width bounds
		if ($notesSidebarWidth + e.movementX < 200 || $notesSidebarWidth + e.movementX > 500) {
			return;
		}

		// Set cursor resize bounds to prevent resizing when cursor is outside of the width bounds
		if (x < 245 || x > 550) {
			return;
		}

		notesSidebarWidth.update((value) => value + e.movementX);
	};

	// Resize sidebar handler
	const resizeHandler = () => {
		// Set resizing state
		resizingNotesSidebar.set(true);

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

			resizingNotesSidebar.set(false);
		};

		// Add event listeners
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};
</script>

<div
	class={cn(
		'fixed left-12 h-[calc(100vh-4.5rem)] flex flex-col justify-start items-center bg-background overflow-y-auto transform transition-transform duration-300',
		!$isNotesSidebarOpen && '-translate-x-52'
	)}
	style={`width: ${$notesSidebarWidth}px`}
>
	<!-- Drag border -->
	<div
		class="h-full w-1 border-r cursor-col-resize absolute top-0 right-0 z-10 hover:bg-foreground/10 hover:delay-75 transition-all duration-200 active:bg-foreground/20 active:!cursor-col-resize"
		on:mousedown={resizeHandler}
		role="presentation"
	/>

	<!-- Controls -->
	<div class="relative top-0 flex flex-col min-h-10 w-full border-b bg-background overflow-hidden">
		<div
			class={cn(
				'flex flex-row items-center w-full h-full px-3.5 gap-2 shrink-0 transform transition-all translate-y-0',
				searchActive && '-translate-y-12'
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
			<Tooltip text="Search" side="bottom">
				<Button
					size="icon"
					variant="ghost"
					scale="md"
					class="h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all"
					on:click={() => {
						searchActive = !searchActive;
					}}
				>
					<Icon name="searchBars" class="w-[18px] h-[18px]" />
				</Button>
			</Tooltip>
		</div>
		<div
			class={cn(
				'absolute pb-[0.5px] flex flex-row items-center justify-center w-full h-full px-3.5 gap-1.5 shrink-0 transform transition-all translate-y-12',
				searchActive && 'translate-y-0'
			)}
		>
			<Input class="w-full h-7" placeholder="Search" spellcheck="false" />
			<Tooltip text="Close" side="bottom">
				<Button
					size="icon"
					variant="ghost"
					scale="md"
					class="h-7 w-7 shrink-0 fill-muted-foreground hover:fill-foreground transition-all"
					on:click={() => {
						searchActive = !searchActive;
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
		class="flex flex-col items-start gap-2 w-full px-2 h-full overflow-auto pt-2 pb-4"
		data-collection-root
		data-path={$collection}
	>
		<Folder {entries} bind:toggleFolderStates bind:toggleState={folderToggleState} />
	</div>
</div>

<style>
	:global(body.cursor-col-resize) {
		/* cursor: col-resize !important;
		user-select: none !important; */
		pointer-events: none;
	}
</style>
