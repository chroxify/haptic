<script lang="ts">
	import { goto } from '$app/navigation';
	import { shortcutToString } from '@/utils';
	import { SHORTCUTS } from '@/constants';
	import Shortcut from '@/components/shared/shortcut.svelte';
	import { getCollections } from '$lib/api/collection';
	import { open as browserOpen } from '@tauri-apps/api/shell';
	import { onMount } from 'svelte';

	let githubShortcut = { command: true, key: 'g' };
	let sponsorShortcut = { command: true, key: 's' };

	async function fetchCollections() {
		const collections = await getCollections();
		return collections;
	}

	onMount(async () => {
		const hasCollections = (await fetchCollections()).length > 0;
		if (hasCollections) {
			goto('/notes');
		}
	});
</script>

<div
	class="flex flex-col items-center justify-center w-full h-full min-h-screen bg-secondary-background"
>
	<div class="flex flex-col items-center gap-2">
		<p class="text-secondary-foreground/85">Open a collection to get started</p>
		<div class="flex gap-5">
			<button
				class="text-sm gap-1.5 flex text-muted-foreground hover:text-secondary-foreground transition-colors items-center justify-center"
				on:click={() => {
					document.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', metaKey: true }));
				}}
			>
				<span
					class="pointer-events-none inline-flex h-[18px] pl-1.5 tracking-widest select-none items-center gap-1 rounded bg-secondary px-1 font-mono text-muted-foreground opacity-100"
				>
					{shortcutToString(SHORTCUTS['app:open-collection'])}
				</span>
				Open Collection</button
			>
			<button
				class="text-sm gap-1.5 flex text-muted-foreground hover:text-secondary-foreground transition-colors items-center justify-center"
				on:click={() => {
					browserOpen('https://go.haptic.md/github');
				}}
			>
				<Shortcut options={githubShortcut} />
				<span
					class="pointer-events-none inline-flex h-[18px] pl-1.5 tracking-widest select-none items-center gap-1 rounded bg-secondary px-1 font-mono text-muted-foreground opacity-100"
				>
					{shortcutToString(githubShortcut)}
				</span>
				Star on GitHub
			</button>

			<button
				class="text-sm gap-1.5 flex text-muted-foreground hover:text-secondary-foreground transition-colors items-center justify-center"
				on:click={() => {
					browserOpen('https://go.haptic.md/sponsor');
				}}
			>
				<Shortcut options={sponsorShortcut} />
				<span
					class="pointer-events-none inline-flex h-[18px] pl-1.5 tracking-widest select-none items-center gap-1 rounded bg-secondary px-1 font-mono text-muted-foreground opacity-100"
				>
					{shortcutToString(sponsorShortcut)}
				</span>
				Become a sponsor
			</button>
		</div>
	</div>
</div>
