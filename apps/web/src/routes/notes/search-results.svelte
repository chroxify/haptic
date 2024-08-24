<script lang="ts">
	import { openNote } from '@/api/notes';
	import { activeFile, editor, editorSearchActive, editorSearchValue } from '@/store';
	import * as Collapsible from '@haptic/ui/components/collapsible';
	import Label from '@haptic/ui/components/label/label.svelte';
	import { cn } from '@haptic/ui/lib/utils';
	import { ChevronDown, Loader } from 'lucide-svelte';
	import markdownit from 'markdown-it';

	export let query: string;
	export let searchSettings: { caseSensitive: boolean; wholeWord: boolean };
	export let results: { path: string; context_preview: string }[] = [];
	export let loading = false;
	let openState: Record<string, boolean> = {};
	let groupedResults: Record<string, { context_preview: string }[]> = {};
	$: groupedResults = groupResults(results);

	// group results function which groups all the results from the same path together in an array
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

	// Initialize all collapsibles as open
	$: {
		Object.keys(groupedResults).forEach((path) => {
			if (openState[path] === undefined) {
				openState[path] = true;
			}
		});
	}

	function toggleOpen(path: string) {
		openState[path] = !openState[path];
		openState = openState; // Trigger reactivity
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
				// Smooth scroll doesn't seem to work well from bottom to top
				const behavior = isAboveView ? 'auto' : 'smooth';
				node.scrollIntoView({ behavior, block: 'center' });
			}
		}
	};
</script>

<div class="w-full text-xs space-y-1 pl-1">
	<Label class="text-muted-foreground text-xs"
		>{results.length} results in {Object.keys(groupedResults).length} files</Label
	>
</div>

{#if Object.keys(groupedResults).length > 0 && !loading}
	{#each Object.keys(groupedResults) as path}
		<Collapsible.Root open={openState[path]} class="w-full">
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
				{#each groupedResults[path] as result, index}
					<button
						class="flex items-start min-w-full overflow-hidden text-start p-2 bg-secondary-background border rounded-md text-xs hover:bg-accent hover:text-accent-foreground"
						on:click={async () => {
							// set search term
							editorSearchValue.set('');

							// Open the file
							if ($activeFile !== path) {
								openNote(path, true);
							}

							setTimeout(() => {
								// set search active
								if (!$editorSearchActive) editorSearchActive.set(true);

								// blur editor - this helps the search in focusing the result later
								$editor.commands.blur();

								// set search term
								if ($editorSearchValue !== query) editorSearchValue.set(query);

								// go to result
								goToResult(index);

								// highlight result
								$editor.commands.setSearchResult(index);
							}, 300);
						}}
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html markdownit({
							html: true,
							linkify: false,
							typographer: true
						})
							.render(result.context_preview)
							.replace(
								new RegExp(`(${query})`, searchSettings.caseSensitive ? 'g' : 'gi'),
								(match) => `<span class="bg-[#f8a01e80] text-foreground/60">${match}</span>`
							)
							.replace(/<a/g, '<span')
							.replace(/<\/a>/g, '</span>')}
					</button>
				{/each}
			</Collapsible.Content>
		</Collapsible.Root>
	{/each}
{/if}

{#if results.length === 0 && !loading}
	<div class="w-full h-full flex flex-col gap-1 items-center justify-center">
		<Label class="text-muted-foreground text-xs">No results found</Label>
	</div>
{/if}

{#if loading}
	<div class="w-full h-full flex flex-col gap-0.5 items-center justify-center">
		<Loader class="w-4 h-4 animate-spin text-muted-foreground" />
		<Label class="text-muted-foreground text-xs">Searching collection...</Label>
	</div>
{/if}
