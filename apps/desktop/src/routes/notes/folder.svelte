<script lang="ts">
	import type { FileEntry } from '@tauri-apps/api/fs';
	import { readTextFile } from '@tauri-apps/api/fs';
	import Button from '@haptic/ui/components/button/button.svelte';
	import * as Collapsible from '@haptic/ui/components/collapsible';
	import Icon from '@/components/shared/icon.svelte';
	import { activeFile, editor } from '@/store';
	import { cn } from '@haptic/ui/lib/utils';
	import { EditorState } from '@tiptap/pm/state';

	export let entries: FileEntry[];

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
</script>

{#each entries as entry}
	{#if entry.children}
		<Collapsible.Root class="w-full">
			<Collapsible.Trigger asChild let:builder>
				<Button
					builders={[builder]}
					size="sm"
					variant="ghost"
					scale="sm"
					class="h-7 w-full fill-foreground/50 hover:fill-foreground transition-all flex items-center gap-2 justify-start"
				>
					<Icon name="folder" class="w-[18px] h-[18px]" />
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
				'h-7 w-full transition-all flex items-center gap-2 justify-start pl-10',
				$activeFile === entry.path && 'bg-accent'
			)}
			on:click={() => openFile(entry.path)}
		>
			<span class="text-xs truncate">{entry.name}</span>
		</Button>
	{/if}
{/each}
