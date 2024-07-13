<script lang="ts">
	import {
		collection,
		editor,
		isPageSidebarOpen,
		pageSidebarWidth,
		resizingPageSidebar
	} from '@/store';
	import { createNote, openNote } from '@/api/notes';
	import { watchImmediate } from 'tauri-plugin-fs-watch-api';
	import type { FileEntry } from '@tauri-apps/api/fs';
	import { fetchCollectionEntries } from '@/api/collection';
	import type { UnlistenFn } from '@tauri-apps/api/event';
	import { cn } from '@haptic/ui/lib/utils';
	import Entries from './entries.svelte';

	let entries: FileEntry[] = [];
	let stopWatching: UnlistenFn;

	// Watch for changes in the collection
	async function watchCollection() {
		const stopWatching = await watchImmediate(
			$collection + '/.haptic/daily',
			async () => {
				entries = await fetchCollectionEntries($collection + '/.haptic/daily');
			},
			{ recursive: true }
		);

		return stopWatching;
	}

	collection.subscribe(async (value) => {
		entries = await fetchCollectionEntries(value + '/.haptic/daily');

		// Validate if there is a note for today
		const today = new Date().toISOString().split('T')[0];
		const dailyExists = entries.some((entry) => entry.path.includes(today));

		if (!dailyExists) {
			await createNote(value + '/.haptic/daily', today + '.md');
		}

		// Open today's note
		openNote(value + '/.haptic/daily/' + today + '.md', true);

		if (value) {
			if (stopWatching) stopWatching();
			stopWatching = await watchCollection();
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

	<!-- Note Entries -->
	<div
		class="flex flex-col items-start gap-2 w-full px-2 h-full overflow-auto pt-2 pb-4"
		data-collection-root
		data-path={$collection + '/.haptic/daily'}
	>
		<Entries {entries} />
	</div>
</div>

<style>
	:global(body.cursor-col-resize) {
		/* cursor: col-resize !important;
		user-select: none !important; */
		pointer-events: none;
	}
</style>
