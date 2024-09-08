<script lang="ts">
	import { Input } from '@haptic/ui/components/input';
	import Icon from '@/components/shared/icon.svelte';
	import * as Collapsible from '@haptic/ui/components/collapsible';
	import { Button } from '@haptic/ui/components/button';
	import { Replace, ReplaceAll, WholeWord, ALargeSmall } from 'lucide-svelte';
	import {
		collectionSettings,
		editor,
		editorSearchActive,
		editorSearchValue,
		isNoteDetailSidebarOpen,
		noteDetailSidebarWidth,
		platform
	} from '@/store';
	import { cn } from '@haptic/ui/lib/utils';
	import Shortcut from '@/components/shared/shortcut.svelte';
	import { SHORTCUTS } from '@/constants';
	import Tooltip from '@/components/shared/tooltip.svelte';

	let replaceValue = '';
	let caseSensitive = false;
	let wholeWord = false;
	let expanded = false;

	$: {
		if ($editor) {
			$editor.commands.setReplaceTerm(replaceValue);
			$editor.commands.setCaseSensitive(caseSensitive);
		}
	}

	const goToSelection = () => {
		if (!$editor) return;

		const { results, resultIndex } = $editor.storage.searchAndReplace;
		const position: {
			from: number;
			to: number;
		} = results[resultIndex];

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

	const getCurrentTextSelection = () => {
		if (!$editor) return;

		const { from, to } = $editor.state.selection;
		return $editor.state.doc.textBetween(from, to);
	};

	const close = () => {
		editorSearchValue.set('');
		replaceValue = '';
		caseSensitive = false;
		wholeWord = false;
		expanded = false;
		$editor.commands.resetIndex();
		editorSearchActive.set(false);
	};

	editorSearchActive.subscribe((value) => {
		// Should focus inputs when search is active
		if (value) {
			const input = document.querySelector('#editorSearch') as HTMLInputElement;
			if (input) {
				input.focus();
			}
		}
	});

	editorSearchValue.subscribe((value) => {
		if ($editor) {
			// Filter out regex special characters
			// TODO: Find a fix for this, for some reason regex characters throw an error and makes app unresponsive
			const filteredValue = value.replace(/[.*+?^${}()|[\]\\]/g, '');

			if (wholeWord) {
				$editor.commands.setSearchTerm(`\\b${filteredValue}\\b`);
			} else {
				$editor.commands.setSearchTerm(filteredValue);
			}

			try {
				goToSelection();
			} catch (error) {
				// This is usually triggered while search active is true and page is navigated
				console.error('Error selecting search result:', error);
			}
		}
	});
</script>

<div
	class={cn(
		'fixed w-96 min-h-10 bg-secondary-background border z-30 rounded-md flex items-center px-1 py-1.5 transition-all duration-200',
		$editorSearchActive ? 'translate-y-0' : '-translate-y-96',
		$platform === 'darwin'
			? $collectionSettings.editor.show_toolbar
				? 'top-[80px]'
				: 'top-[48px]'
			: $collectionSettings.editor.show_toolbar
				? 'top-[44px]'
				: 'top-[12px]'
	)}
	style={`right: ${$isNoteDetailSidebarOpen ? $noteDetailSidebarWidth + 16 : 16}px`}
>
	<Shortcut
		options={SHORTCUTS['editor:search']}
		callback={() => {
			if ($editorSearchActive) {
				close();
			} else {
				editorSearchValue.set(getCurrentTextSelection() || '');
				editorSearchActive.set(true);
			}
		}}
	/>
	<Shortcut
		options={{ key: 'Escape' }}
		callback={() => {
			if ($editorSearchActive) {
				close();
			}
		}}
	/>
	<Shortcut
		options={{ key: 'Enter' }}
		callback={() => {
			if ($editorSearchActive) {
				$editor.commands.nextSearchResult();
				goToSelection();
			}
		}}
	/>
	<Shortcut
		options={{ shift: true, key: 'Enter' }}
		callback={() => {
			if ($editorSearchActive) {
				$editor.commands.previousSearchResult();
				goToSelection();
			}
		}}
	/>
	<Collapsible.Root
		class="flex relative flex-col gap-1 items-center justify-between w-full h-full pl-7"
		bind:open={expanded}
	>
		<Collapsible.Trigger class="absolute left-0 flex items-center h-full w-7">
			<Button
				size="icon"
				variant="ghost"
				scale="md"
				class="h-full w-6 fill-muted-foreground hover:fill-foreground"
			>
				<Icon name="chevron" class={cn('w-4 h-4', expanded ? 'transform rotate-90' : '')} />
			</Button>
		</Collapsible.Trigger>
		<div class="flex flex-row items-center justify-between h-full w-full gap-1 -mt-[1px]">
			<Input
				id="editorSearch"
				class="w-full h-7"
				placeholder="Find"
				spellcheck="false"
				bind:value={$editorSearchValue}
			/>
			<div class="flex items-center h-full gap-0.5">
				<Tooltip text="Case sensitive" side="bottom">
					<Button
						size="icon"
						variant="ghost"
						scale="md"
						class={cn('h-7 w-7 group', caseSensitive ? 'bg-accent' : '')}
						on:click={() => {
							caseSensitive = !caseSensitive;
						}}
					>
						<ALargeSmall
							class={cn(
								'w-18px] h-[18px] stroke-muted-foreground group-hover:stroke-foreground transition-all stroke-[1.5px]',
								caseSensitive ? 'stroke-foreground' : ''
							)}
						/>
					</Button>
				</Tooltip>
				<Tooltip text="Whole word" side="bottom">
					<Button
						size="icon"
						variant="ghost"
						scale="md"
						class={cn('h-7 w-7 group', wholeWord ? 'bg-accent' : '')}
						on:click={() => {
							wholeWord = !wholeWord;
						}}
					>
						<WholeWord
							class={cn(
								'w-4 h-4 stroke-muted-foreground group-hover:stroke-foreground transition-all stroke-[1.5px]',
								wholeWord ? 'stroke-foreground' : ''
							)}
						/>
					</Button>
				</Tooltip>
				<Tooltip text="Previous" side="bottom" shortcut={{ shift: true, key: 'Enter' }}>
					<Button
						size="icon"
						variant="ghost"
						scale="md"
						class="h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all"
						on:click={() => {
							$editor.commands.previousSearchResult();
							goToSelection();
						}}
					>
						<Icon name="arrowUp" class="w-4 h-4" />
					</Button>
				</Tooltip>
				<Tooltip text="Next" side="bottom" shortcut={{ key: 'Enter' }}>
					<Button
						size="icon"
						variant="ghost"
						scale="md"
						class="h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all"
						on:click={() => {
							$editor.commands.nextSearchResult();
							goToSelection();
						}}
					>
						<Icon name="arrowDown" class="w-4 h-4" />
					</Button>
				</Tooltip>
				<Tooltip text="Close" side="bottom">
					<Button
						size="icon"
						variant="ghost"
						scale="md"
						class="h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all"
						on:click={() => {
							close();
						}}
					>
						<Icon name="x" class="w-4 h-4" />
					</Button>
				</Tooltip>
			</div>
		</div>
		<Collapsible.Content class="w-full">
			<div class="flex flex-row items-center justify-between h-full w-full gap-1">
				<Input
					class="w-full h-7"
					placeholder="Replace"
					spellcheck="false"
					bind:value={replaceValue}
				/>
				<div class="flex items-center h-full pr-[90px] gap-0.5">
					<Tooltip text="Replace" side="bottom">
						<Button
							size="icon"
							variant="ghost"
							scale="md"
							class="h-7 w-7 group"
							on:click={() => {
								$editor.commands.replace();
								goToSelection();
							}}
						>
							<Replace
								class="w-4 h-4 stroke-muted-foreground group-hover:stroke-foreground transition-all stroke-[1.5px]"
							/>
						</Button>
					</Tooltip>
					<Tooltip text="Replace all" side="bottom">
						<Button
							size="icon"
							variant="ghost"
							scale="md"
							class="h-7 w-7 group"
							on:click={() => {
								$editor.commands.replaceAll();
								goToSelection();
							}}
						>
							<ReplaceAll
								class="w-4 h-4 stroke-muted-foreground group-hover:stroke-foreground transition-all stroke-[1.5px]"
							/>
						</Button>
					</Tooltip>
				</div>
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
</div>
