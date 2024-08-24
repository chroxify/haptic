<script lang="ts">
	import { getNoteMetadataParams } from '@/api/notes';
	import Icon from '@/components/shared/icon.svelte';
	import Tooltip from '@/components/shared/tooltip.svelte';
	import {
		activeFile,
		editor,
		isNoteDetailSidebarOpen,
		noteDetailSidebarWidth,
		resizingNoteDetailSidebar
	} from '@/store';
	import { type NoteMetadataParams } from '@/types';
	import { formatFileSize, formatTimeAgo } from '@/utils';
	import { Button } from '@haptic/ui/components/button';
	import Label from '@haptic/ui/components/label/label.svelte';
	import { cn } from '@haptic/ui/lib/utils';
	import type { NodePos } from '@tiptap/core';
	import { onDestroy, onMount } from 'svelte';

	let tab: 'metadata' | 'toc' = 'metadata';
	let nodeHeadings: NodePos[] | null = null;
	let activeNoteMetadataParams: NoteMetadataParams | null = null;

	// Reactive variables
	let createdTimeAgo: string;
	let modifiedTimeAgo: string;
	let timeUpdateInterval: NodeJS.Timeout;

	// Sidebar handlers
	const handleMouseMove = (e: MouseEvent) => {
		resizingNoteDetailSidebar.set(true);
		const x = e.x;
		const clientWidth = document.body.clientWidth;

		// Set collapsing bounds
		if (clientWidth - x < 100) {
			resizingNoteDetailSidebar.set(false);
			isNoteDetailSidebarOpen.set(false);
			return;
		} else if (x > 100 && !$isNoteDetailSidebarOpen) {
			resizingNoteDetailSidebar.set(false);
			isNoteDetailSidebarOpen.set(true);
			return;
		}

		// Set cursor resize bounds to prevent resizing when cursor is outside of the width bounds
		if (clientWidth - x < 245 || clientWidth - x > 500) {
			return;
		}

		// Resize sidebar
		if (
			$noteDetailSidebarWidth - e.movementX >= 210 &&
			$noteDetailSidebarWidth - e.movementX <= 500
		) {
			noteDetailSidebarWidth.update((value) => value - e.movementX);
		}
	};

	// Resize sidebar handler
	const resizeHandler = () => {
		// Set resizing state
		resizingNoteDetailSidebar.set(true);

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

			resizingNoteDetailSidebar.set(false);
		};

		// Add event listeners
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	// Handle reactivity for time ago values
	function updateTimes() {
		if (activeNoteMetadataParams && tab === 'metadata') {
			createdTimeAgo = formatTimeAgo(activeNoteMetadataParams.fileMetadata.createdAt);
			modifiedTimeAgo = formatTimeAgo(activeNoteMetadataParams.fileMetadata.modifiedAt);
		}
	}

	$: if (activeNoteMetadataParams && tab === 'metadata') {
		updateTimes();
	}

	// Calculate TOC items
	$: tocItems = tab === 'toc' && nodeHeadings ? calculateTocItems(nodeHeadings) : [];

	function calculateTocItems(headings: NodePos[]) {
		let minLevel = Math.min(...headings.map((h) => h.attributes.level));
		return headings.map((heading) => ({
			text: heading.textContent,
			indent: Math.max(0, heading.attributes.level - minLevel)
		}));
	}

	// Watch for active file changes
	const stopWatching = activeFile.subscribe(async (filePath) => {
		if (filePath) {
			nodeHeadings = $editor.$nodes('heading');
			activeNoteMetadataParams = await getNoteMetadataParams(filePath);
		} else {
			nodeHeadings = null;
			activeNoteMetadataParams = null;
		}
	});

	// Subscribe to save events
	const unsubscribeSave = editor.subscribeToSaveEvents(async () => {
		if (tab === 'metadata') {
			activeNoteMetadataParams = await getNoteMetadataParams($activeFile!);
		} else if (tab === 'toc') {
			nodeHeadings = $editor.$nodes('heading');
			if (nodeHeadings) {
				tocItems = calculateTocItems(nodeHeadings);
			}
		}
	});

	onMount(() => {
		timeUpdateInterval = setInterval(updateTimes, 1000);
	});

	onDestroy(() => {
		unsubscribeSave();
		stopWatching();
		clearInterval(timeUpdateInterval);
	});
</script>

<div
	class={cn(
		'fixed right-0 h-[calc(100vh-4.5rem)] flex flex-col justify-start items-center bg-background overflow-y-auto transform transition-transform duration-300',
		!$isNoteDetailSidebarOpen && 'translate-x-full'
	)}
	style={`width: ${$noteDetailSidebarWidth}px`}
>
	<!-- Drag border -->
	<div
		class="h-full w-1 border-l cursor-col-resize absolute top-0 left-0 z-10 hover:bg-foreground/10 hover:delay-75 transition-all duration-200 active:bg-foreground/20 active:!cursor-col-resize"
		on:mousedown={resizeHandler}
		role="presentation"
	/>

	<!-- Controls -->
	<div
		class="relative top-0 flex flex-row h-10 w-full border-b bg-background overflow-hidden items-center justify-center px-3.5 gap-2 shrink-0 transform transition-all translate-y-0"
	>
		<Tooltip text="Metadata" side="bottom">
			<Button
				size="icon"
				variant="ghost"
				scale="md"
				class={cn(
					'h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all',
					tab === 'metadata' && 'fill-foreground bg-accent'
				)}
				on:click={() => {
					tab = 'metadata';
				}}
			>
				<Icon name="identityGhost" class="w-[18px] h-[18px]" />
			</Button>
		</Tooltip>
		<Tooltip text="Table of Contents" side="bottom">
			<Button
				size="icon"
				variant="ghost"
				scale="md"
				class={cn(
					'h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all',
					tab === 'toc' && 'fill-foreground bg-accent'
				)}
				on:click={() => {
					tab = 'toc';
				}}
			>
				<Icon name="layer" class="w-[16px] h-[16px]" />
			</Button>
		</Tooltip>
	</div>

	<!-- Metadata -->
	{#if activeNoteMetadataParams && tab === 'metadata'}
		<div class="flex flex-col gap-1.5 items-start w-full px-4 py-2.5 h-full overflow-auto">
			<!-- Created -->
			<div class="flex flex-row items-center justify-between w-full h-6 cursor-default">
				<Label class="text-[13px] font-normal text-muted-foreground">Created</Label>
				<Tooltip text={new Date(activeNoteMetadataParams.fileMetadata.createdAt).toLocaleString()}>
					<span class="text-[13px] text-secondary-foreground">{createdTimeAgo}</span>
				</Tooltip>
			</div>

			<!-- Modified -->
			<div class="flex flex-row items-center justify-between w-full h-6 cursor-default">
				<Label class="text-[13px] font-normal text-muted-foreground">Modified</Label>
				<Tooltip text={new Date(activeNoteMetadataParams.fileMetadata.modifiedAt).toLocaleString()}>
					<span class="text-[13px] text-secondary-foreground">{modifiedTimeAgo}</span>
				</Tooltip>
			</div>

			<!-- File size -->
			<div class="flex flex-row items-center justify-between w-full h-6 cursor-default">
				<Label class="text-[13px] font-normal text-muted-foreground">File Size</Label>

				<span class="text-[13px] text-secondary-foreground"
					>{formatFileSize(activeNoteMetadataParams.fileMetadata.size)}</span
				>
			</div>

			<!-- Character count -->
			<div class="flex flex-row items-center justify-between w-full h-6 cursor-default">
				<Label class="text-[13px] font-normal text-muted-foreground">Characters</Label>
				<span class="text-[13px] text-secondary-foreground"
					>{activeNoteMetadataParams.editorMetadata.characters}</span
				>
			</div>

			<!-- Word count -->
			<div class="flex flex-row items-center justify-between w-full h-6 cursor-default">
				<Label class="text-[13px] font-normal text-muted-foreground">Words</Label>
				<span class="text-[13px] text-secondary-foreground"
					>{activeNoteMetadataParams.editorMetadata.words}</span
				>
			</div>

			<!-- Read time -->
			<div class="flex flex-row items-center justify-between w-full h-6 cursor-default">
				<Label class="text-[13px] font-normal text-muted-foreground">Read Time</Label>
				<Tooltip text="Estimated read time based on 200 words per minute">
					<span class="text-[13px] text-secondary-foreground"
						>{activeNoteMetadataParams.editorMetadata.avgReadingTime}</span
					>
				</Tooltip>
			</div>
		</div>
	{:else if tab === 'toc' && nodeHeadings && nodeHeadings.length > 0 && tocItems.length > 0}
		<div class="w-full h-full overflow-auto">
			<!-- TOC -->
			<div class="flex flex-col gap-1.5 items-start w-full h-full overflow-auto px-4 py-2.5">
				{#each tocItems as item}
					<button
						type="button"
						class="flex flex-row items-center justify-between w-full min-h-[24px] h-6 text-[13px] truncate font-normal text-muted-foreground hover:text-primary transition-all"
						style="padding-left: {item.indent}rem"
						on:click={() => {
							if (!nodeHeadings) return;

							// Set cursor focus to the heading
							$editor
								.chain()
								.focus('end', { scrollIntoView: false })
								.setTextSelection(nodeHeadings[tocItems.indexOf(item)].pos)
								.run();

							const { node } = $editor.view.domAtPos($editor.state.selection.anchor);
							if (node instanceof HTMLElement) {
								const rect = node.getBoundingClientRect();
								const isAboveView = rect.top < 0;
								const isBelowView = rect.bottom > window.innerHeight;
								if (isAboveView || isBelowView) {
									// Smooth scroll doesn't seem to work well from bottom to top
									const behavior = isAboveView ? 'auto' : 'smooth';
									node.scrollIntoView({ behavior, block: 'center' });
								}
							}
						}}
					>
						<p class="truncate">{item.text}</p>
					</button>
				{/each}
			</div>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center w-full h-full">
			<p class="text-[13px] text-muted-foreground">
				{tab === 'metadata' ? 'No metadata available' : 'No headings found'}
			</p>
		</div>
	{/if}
</div>

<style>
	:global(body.cursor-col-resize) {
		pointer-events: none;
	}
</style>
