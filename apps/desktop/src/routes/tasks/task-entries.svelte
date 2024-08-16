<script lang="ts">
	import { openNote } from '@/api/notes';
	import { activeFile, collection, editor, editorSearchActive, editorSearchValue } from '@/store';
	import * as Collapsible from '@haptic/ui/components/collapsible';
	import Label from '@haptic/ui/components/label/label.svelte';
	import { cn } from '@haptic/ui/lib/utils';
	import { invoke } from '@tauri-apps/api/tauri';
	import { ChevronDown, Loader } from 'lucide-svelte';
	import markdownit from 'markdown-it';
	import { onDestroy, onMount } from 'svelte';

	let tasks: { path: string; context_preview: string }[] = [];
	let loading = false;
	let openState: Record<string, boolean> = {};
	let groupedTasks: Record<string, { context_preview: string }[]> = {};
	$: groupedTasks = groupResults(tasks);

	// Initialize all collapsibles as open
	$: Object.keys(groupedTasks).forEach((path) => {
		if (openState[path] === undefined) {
			openState[path] = true;
		}
	});

	function groupResults(
		results: { path: string; context_preview: string }[]
	): Record<string, { context_preview: string }[]> {
		const grouped: Record<string, { context_preview: string }[]> = {};

		results.forEach((result) => {
			const path = result.path;
			const context_preview = result.context_preview;

			if (!grouped[path]) {
				grouped[path] = [];
			}

			grouped[path].push({ context_preview });
		});

		return grouped;
	}

	function toggleOpen(path: string) {
		openState[path] = !openState[path];
		openState = openState;
	}

	const goToResult = (index: number) => {
		if (!$editor) return;

		const { results } = $editor.storage.searchAndReplace;
		const position: {
			from: number;
			to: number;
		} = results[index];

		if (!position) return;

		$editor.commands.setTextSelection(position);

		const { node } = $editor.view.domAtPos($editor.state.selection.anchor);
		if (node instanceof HTMLElement) {
			const rect = node.getBoundingClientRect();
			const isAboveView = rect.top < 0;
			const isBelowView = rect.bottom > window.innerHeight;

			if (isAboveView || isBelowView) {
				const behavior = isAboveView ? 'auto' : 'smooth';
				node.scrollIntoView({ behavior, block: 'center' });
			}
		}
	};

	async function searchCollection() {
		loading = true;

		try {
			tasks = (await invoke('search_files', {
				dirPath: $collection,
				query: '- [ ]',
				caseSensitive: false,
				matchWord: false,
				recursive: true
			})) as { path: string; context_preview: string }[];

			loading = false;
		} catch (error) {
			console.error('Error searching files:', error);
		}
	}

	// Subscribe to save events
	const unsubscribeSave = editor.subscribeToSaveEvents(async () => {
		// Re-search the collection
		searchCollection();
	});

	onMount(async () => {
		activeFile.set(null);

		await searchCollection();

		// Handle opening file on mount
		const activeFileInResults = tasks.find((task) => task.path === $activeFile);
		if (activeFileInResults) {
			openNote(activeFileInResults.path, true);
		} else if ($activeFile !== tasks[0]?.path) {
			openNote(tasks[0].path, true);
		}
	});

	onDestroy(() => {
		unsubscribeSave();
	});
</script>

<div class="w-full text-xs space-y-1 pl-1">
	<Label class="text-muted-foreground text-xs">{tasks.length} tasks in collection</Label>
</div>

{#if Object.keys(groupedTasks).length > 0}
	{#each Object.keys(groupedTasks) as path (path)}
		<Collapsible.Root open={openState[path]} class="w-full transition-all">
			<Collapsible.Trigger
				class="text-[13px] w-full text-secondary-foreground flex items-center h-7 justify-start gap-1.5 group hover:text-foreground transition-all"
				on:click={() => toggleOpen(path)}
			>
				<ChevronDown
					class={cn(
						'w-3.5 h-3.5 transform transition-all shrink-0 text-muted-foreground group-hover:text-foreground',
						!openState[path] ? '-rotate-90' : 'rotate-0'
					)}
				/>
				<p class="truncate">{path.split('/').pop()}</p>
			</Collapsible.Trigger>
			<Collapsible.Content class="mt-0.5 w-full gap-1.5 flex flex-col">
				{#each groupedTasks[path] as result, index (result.context_preview)}
					<button
						class="flex items-start min-w-full overflow-hidden text-start p-2 bg-secondary-background border rounded-md text-xs hover:bg-accent hover:text-accent-foreground"
						on:click={async () => {
							editorSearchValue.set('');
							if ($activeFile !== path) {
								console.log('File already open');
								openNote(path, true);
							}

							setTimeout(() => {
								if (!$editorSearchActive) editorSearchActive.set(true);
								$editor.commands.blur();
								if ($editorSearchValue !== result.context_preview.replaceAll('- [ ]', '').trim())
									editorSearchValue.set(result.context_preview.replaceAll('- [ ]', '').trim());
								goToResult(index);
								$editor.commands.setSearchResult(index);
							}, 300);
						}}
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html markdownit({
							html: true,
							linkify: true,
							typographer: true
						}).render(result.context_preview.replaceAll('- [ ]', '').trim())}
					</button>
				{/each}
			</Collapsible.Content>
		</Collapsible.Root>
	{/each}
{/if}

{#if tasks.length === 0 && !loading}
	<div class="w-full h-full flex flex-col gap-1 items-center justify-center">
		<Label class="text-muted-foreground text-xs">No tasks found</Label>
	</div>
{/if}

{#if loading && tasks.length === 0}
	<div class="w-full h-full flex flex-col gap-0.5 items-center justify-center">
		<Loader class="w-3.5 h-3.5 animate-spin text-muted-foreground" />
		<Label class="text-muted-foreground text-xs">Searching collection...</Label>
	</div>
{/if}
