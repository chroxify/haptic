<script lang="ts">
	import { openNote } from '@/api/notes';
	import Icon from '@/components/shared/icon.svelte';
	import Shortcut from '@/components/shared/shortcut.svelte';
	import Tooltip from '@/components/shared/tooltip.svelte';
	import { SHORTCUTS } from '@/constants';
	import {
		activeFile,
		collection,
		editor,
		editorMode,
		editorSearchActive,
		isNoteDetailSidebarOpen,
		isPageSidebarOpen,
		noteHistory
	} from '@/store';
	import Button from '@haptic/ui/components/button/button.svelte';
	import { cn } from '@haptic/ui/lib/utils';

	export let hideHistory: boolean = false;
	export let hideParentDirectories: boolean = false;

	let historyIndex: number = 0;

	noteHistory.subscribe((value) => {
		historyIndex = value.length - 1;
	});
</script>

<div
	class="sticky gap-2 min-h-10 top-0 px-3 z-50 flex items-center justify-between w-full bg-secondary-background"
>
	<div class="flex gap-1.5 select-none">
		<Tooltip
			text={$isPageSidebarOpen ? 'Collapse' : 'Expand'}
			side="bottom"
			shortcut={SHORTCUTS['notes:toggle-sidebar']}
		>
			<Button
				size="icon"
				variant="ghost"
				scale="md"
				class="h-6 w-6 fill-muted-foreground hover:fill-foreground transition-all"
				on:click={() => {
					isPageSidebarOpen.update((state) => !state);
				}}
			>
				<Shortcut options={SHORTCUTS['notes:toggle-sidebar']} />
				<Icon
					name="sidebarArrow"
					class={cn(
						'w-4 h-4 transform transition-transform',
						$isPageSidebarOpen ? 'rotate-180' : ''
					)}
				/>
			</Button>
		</Tooltip>
		{#if !hideHistory}
			<Tooltip text="Previous note" side="bottom" shortcut={SHORTCUTS['notes:history-back']}>
				<Button
					size="icon"
					variant="ghost"
					scale="md"
					class="h-6 w-6 fill-muted-foreground hover:fill-foreground transition-all"
					disabled={!$noteHistory?.length || $noteHistory?.length === 1 || historyIndex === 0}
					on:click={() => {
						// Decrement the history index
						historyIndex--;

						// Set the active file to the previous note
						openNote($noteHistory[historyIndex], true);
					}}
				>
					<Shortcut
						options={SHORTCUTS['notes:history-back']}
						callback={() => {
							// Make sure the history index is not out of bounds / button is not disabled
							if (!$noteHistory?.length || $noteHistory?.length === 1 || historyIndex === 0) {
								return;
							}

							// Decrement the history index
							historyIndex--;

							// Set the active file to the previous note
							openNote($noteHistory[historyIndex], true);
						}}
					/>
					<Icon name="arrowLeft" class="w-4 h-4" />
				</Button>
			</Tooltip>
			<Tooltip text="Next note" side="bottom" shortcut={SHORTCUTS['notes:history-forward']}>
				<Button
					size="icon"
					variant="ghost"
					scale="md"
					class="h-6 w-6 fill-muted-foreground hover:fill-foreground transition-all"
					disabled={!$noteHistory?.length ||
						$noteHistory?.length === 1 ||
						historyIndex === $noteHistory?.length - 1}
					on:click={() => {
						// Increment the history index
						historyIndex++;

						// Set the active file to the next note
						openNote($noteHistory[historyIndex], true);
					}}
				>
					<Shortcut
						options={SHORTCUTS['notes:history-forward']}
						callback={() => {
							// Make sure the history index is not out of bounds / button is not disabled
							if (
								!$noteHistory?.length ||
								$noteHistory?.length === 1 ||
								historyIndex === $noteHistory?.length - 1
							) {
								return;
							}

							// Increment the history index
							historyIndex++;

							// Set the active file to the next note
							openNote($noteHistory[historyIndex], true);
						}}
					/>
					<Icon name="arrowRight" class="w-4 h-4" />
				</Button>
			</Tooltip>
		{:else}
			<div class="w-6" />
			<div class="w-6" />
		{/if}
	</div>
	<div class="flex gap-1.5">
		<p class="text-xs flex items-center text-muted-foreground fill-muted-foreground">
			{#if !hideParentDirectories}
				{#each $activeFile?.replace($collection, '').split('/') ?? [] as folder, i}
					{#if i !== 0}
						<Button
							size="sm"
							variant="ghost"
							scale="sm"
							class={cn(
								'h-6 text-[13px] w-fit px-1.5 fill-muted-foreground hover:fill-foreground transition-all font-normal',
								i === ($activeFile?.replace($collection, '').split('/') ?? [])?.length - 1 &&
									'text-foreground font-medium'
							)}
						>
							{folder}
						</Button>
						{#if i !== ($activeFile?.replace($collection, '').split('/') ?? [])?.length - 1}
							<Icon name="chevron" class="w-3.5 h-3.5 inline-block" />
						{/if}
					{/if}
				{/each}
			{:else}
				<Button
					size="sm"
					variant="ghost"
					scale="sm"
					class="h-6 text-[13px] w-fit px-1.5 text-foreground transition-all font-medium"
				>
					{$activeFile?.replace($collection, '').split('/')?.slice(-1)[0] ?? ''}
				</Button>
			{/if}
		</p>
	</div>
	<div class="flex gap-1.5">
		<Tooltip
			text={$editorMode === 'edit' ? 'View mode' : 'Edit mode'}
			side="bottom"
			shortcut={SHORTCUTS['editor:toggle-mode']}
		>
			<Button
				size="icon"
				variant="ghost"
				scale="md"
				class="h-6 w-6 fill-muted-foreground hover:fill-foreground transition-all"
				on:click={() => {
					// TODO: Implement source mode in future
					// Set the mode
					if ($editorMode === 'edit') {
						$editor.setEditable(false);
						editorMode.set('view');
					} else if ($editorMode === 'view') {
						$editor.setEditable(true);
						editorMode.set('edit');
					}
				}}
			>
				<Shortcut options={SHORTCUTS['editor:toggle-mode']} />
				<Icon name="editPencil" class={cn('w-4 h-4', $editorMode === 'edit' && 'hidden')} />
				<Icon name="glasses" class={cn('w-4 h-4', $editorMode === 'view' && 'hidden')} />
			</Button>
		</Tooltip>
		<Tooltip text="Search" side="bottom" shortcut={SHORTCUTS['editor:search']}>
			<Button
				size="icon"
				variant="ghost"
				scale="md"
				class="h-6 w-6 fill-muted-foreground hover:fill-foreground transition-all"
				on:click={() => {
					editorSearchActive.set($editorSearchActive ? false : true);
				}}
			>
				<Icon name="searchDocument" class={cn('w-4 h-4')} />
			</Button>
		</Tooltip>
		<Tooltip text="Expand" side="bottom" shortcut={SHORTCUTS['notes:toggle-details']}>
			<Button
				size="icon"
				variant="ghost"
				scale="md"
				class="h-6 w-6 fill-muted-foreground hover:fill-foreground transition-all"
				on:click={() => {
					isNoteDetailSidebarOpen.update((state) => !state);
				}}
			>
				<Shortcut options={SHORTCUTS['notes:toggle-details']} />
				<Icon
					name="sidebarArrow"
					class={cn(
						'w-4 h-4 transform transition-transform',
						$isNoteDetailSidebarOpen ? '' : 'rotate-180'
					)}
				/>
			</Button>
		</Tooltip>
	</div>
</div>
