<script lang="ts">
	import type { FileEntry } from '@tauri-apps/api/fs';
	import { readTextFile } from '@tauri-apps/api/fs';
	import Button from '@haptic/ui/components/button/button.svelte';
	import * as Collapsible from '@haptic/ui/components/collapsible';
	import Icon from '@/components/shared/icon.svelte';
	import { activeFile, collection, editor } from '@/store';
	import { cn } from '@haptic/ui/lib/utils';
	import { EditorState } from '@tiptap/pm/state';

	export let entries: FileEntry[];
	let folderOpenStates: boolean[] = new Array(entries.length).fill(false);

	function resetEditorContent(content: string, title: string) {
		// Set document title
		content = `# ${title}\n\n${content}`;

		// Set content of the editor
		$editor.commands.setContent(content);

		// Update the editor state
		const newEditorState = EditorState.create({
			doc: $editor.state.doc,
			plugins: $editor.state.plugins,
			schema: $editor.state.schema
		});
		$editor.view.updateState(newEditorState);

		// Focus first element after heading
		const headingEndPos = content.indexOf('\n\n');
		$editor.chain().focus().setTextSelection(headingEndPos).run();
	}

	async function openFile(path: string) {
		const fileContent = await readTextFile(path);
		resetEditorContent(fileContent, path.split('/').pop()!.split('.').shift()!);
		activeFile.set(path);
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
			<Collapsible.Trigger asChild let:builder>
				<Button
					builders={[builder]}
					size="sm"
					variant="ghost"
					scale="sm"
					class="h-7 w-full fill-foreground/50 hover:fill-foreground transition-all flex items-center gap-2 justify-start"
					style={`padding-left: ${calculateDepth(entry.path)}`}
				>
					<Icon name="folder" class={cn('w-[18px] h-[18px]', folderOpenStates[i] && 'hidden')} />
					<Icon
						name="folderOpen"
						class={cn('w-[18px] h-[18px]', !folderOpenStates[i] && 'hidden')}
					/>
					<span class="text-xs">{entry.name}</span>
				</Button>
			</Collapsible.Trigger>
			<Collapsible.Content class="space-y-1.5 pt-1.5">
				<svelte:self entries={entry.children} />
			</Collapsible.Content>
		</Collapsible.Root>
	{:else}
		<Button
			size="sm"
			variant="ghost"
			scale="sm"
			class={cn(
				'h-7 w-full transition-all flex items-center gap-2 justify-start',
				$activeFile === entry.path && 'bg-accent'
			)}
			style={`padding-left: ${calculateDepth(entry.path)}`}
			on:click={() => openFile(entry.path)}
		>
			<span class="text-xs truncate">{entry.name}</span>
		</Button>
	{/if}
{/each}
