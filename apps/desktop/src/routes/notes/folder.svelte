<script lang="ts">
	import type { FileEntry } from '@tauri-apps/api/fs';
	import { readTextFile } from '@tauri-apps/api/fs';
	import Button from '@haptic/ui/components/button/button.svelte';
	import * as Collapsible from '@haptic/ui/components/collapsible';
	import Icon from '@/components/shared/icon.svelte';
	import { editor } from '@/store';

	export let entries: FileEntry[];

	async function openFile(path: string) {
		const file = await readTextFile(path);
		$editor.commands.setContent(file);
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
					class="h-7 w-full fill-foreground/50 hover:fill-foreground transition-all flex items-center gap-2 justify-start"
				>
					<Icon name="folder" class="w-[18px] h-[18px]" />
					<span class="text-xs">{entry.name}</span>
				</Button>
			</Collapsible.Trigger>
			<Collapsible.Content class="space-y-2">
				<svelte:self entries={entry.children} />
			</Collapsible.Content>
		</Collapsible.Root>
	{:else}
		<Button
			size="sm"
			variant="ghost"
			class="h-7 w-full fill-foreground/50 hover:fill-foreground transition-all flex items-center gap-2 justify-start pl-10"
			on:click={() => openFile(entry.path)}
		>
			<span class="text-xs truncate">{entry.name}</span>
		</Button>
	{/if}
{/each}
