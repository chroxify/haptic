<script lang="ts">
	import Icon, { type IconKey } from '$lib/components/shared/icon.svelte';
	import { SHORTCUTS } from '@/constants';
	import { settingsStore } from '@/store';
	import { Button } from '@haptic/ui/components/button';
	import * as Dialog from '@haptic/ui/components/dialog';
	import { Label } from '@haptic/ui/components/label';
	import { Separator } from '@haptic/ui/components/separator';
	import * as Tabs from '@haptic/ui/components/tabs';
	import type { ComponentType } from 'svelte';
	import Shortcut from '../shared/shortcut.svelte';
	import Appearance from './appearance.svelte';
	import Editor from './editor.svelte';
	import General from './general.svelte';
	import HapticSync from './haptic-sync.svelte';

	$: ({ isOpen, activePage } = $settingsStore);

	const settings: Record<string, { name: string; icon: IconKey; content: ComponentType }[]> = {
		App: [
			{
				name: 'General',
				icon: 'settingsSolid',
				content: General
			},
			{
				name: 'Appearance',
				icon: 'opactiySolid',
				content: Appearance
			},
			{
				name: 'Editor',
				icon: 'editPencilSolid',
				content: Editor
			}
		],
		Syncronization: [
			{
				name: 'Haptic Sync',
				icon: 'cloudSolid',
				content: HapticSync
			}
		]
	};
</script>

<Dialog.Root
	open={isOpen}
	onOpenChange={(value) => {
		settingsStore.set({ isOpen: value, activePage: 'general' });
	}}
>
	<Dialog.Trigger>
		<Button
			size="icon"
			variant="ghost"
			class="h-7 w-7 fill-muted-foreground hover:fill-foreground"
			scale="md"
		>
			<Shortcut options={SHORTCUTS['app:settings']} />
			<Icon name="settings" class="w-[18px] h-[18px]" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content
		class="flex items-center justify-center !w-[90%] !h-[90%] !top-[5%] !right-[5%] !bottom-[5%] !left-[5%] pt-16"
	>
		<Tabs.Root
			value={activePage}
			onValueChange={(value) => {
				settingsStore.update((store) => {
					store.activePage = value ?? 'general';
					return store;
				});
			}}
			class="flex items-center justify-center h-full w-full gap-10"
		>
			<!-- Categories as label, rest as tabtrigger & corresponding content -->
			<div class="flex flex-col items-center gap-4 h-full justify-start min-w-[160px]">
				{#each Object.keys(settings) as setting}
					<div class="flex flex-col items-start gap-2 w-full">
						<Label class="text-foreground/70 text-xs pl-2">
							{setting}
						</Label>
						<Tabs.List
							class="flex items-center justify-start flex-col w-full h-fit bg-transparent p-0 gap-1.5"
						>
							{#each settings[setting] as tab}
								<Tabs.Trigger
									value={tab.name.toLocaleLowerCase()}
									class="w-full h-7 rounded-lg px-3 hover:bg-accent hover:text-accent-foreground transition-transform active:scale-[98%] data-[state=active]:bg-accent text-foreground data-[state=active]:fill-foreground fill-muted-foreground/80 text-foreground/70 hover:fill-foreground items-center justify-start gap-2 text-sm font-normal"
								>
									<Icon name={tab.icon} class="w-4 h-4" />
									{tab.name}
								</Tabs.Trigger>
							{/each}
						</Tabs.List>
					</div>
					{#if setting !== Object.keys(settings)[Object.keys(settings).length - 1]}
						<Separator />
					{/if}
				{/each}
			</div>
			<div class="flex flex-col items-center justify-center gap-2 h-full w-2/4">
				{#each Object.keys(settings) as setting}
					{#each settings[setting] as tab}
						<Tabs.Content
							value={tab.name.toLocaleLowerCase()}
							class="w-full h-full -mt-2.5 overflow-y-auto pb-10"
						>
							<div class="flex flex-col items-start justify-start h-full w-full gap-3 px-1">
								<h1 class="text-lg font-medium">{tab.name}</h1>
								<svelte:component this={tab.content} />
							</div>
						</Tabs.Content>
					{/each}
				{/each}
			</div>
		</Tabs.Root>
	</Dialog.Content>
</Dialog.Root>
