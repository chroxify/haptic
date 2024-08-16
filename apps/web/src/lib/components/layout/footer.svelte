<script lang="ts">
	import { SHORTCUTS } from '@/constants';
	import { activeFile } from '@/store';
	import { shortcutToString, toggleTheme } from '@/utils';
	import { Button } from '@haptic/ui/components/button';
	import * as Collapsible from '@haptic/ui/components/collapsible';
	import { Input } from '@haptic/ui/components/input';
	import * as Sheet from '@haptic/ui/components/sheet';
	import { cn } from '@haptic/ui/lib/utils';
	import { ChevronDown } from 'lucide-svelte';
	import { userPrefersMode } from 'mode-watcher';
	import { mainCommands as commands, createNoteCommands } from '../shared/command-menu/commands';
	import Icon from '../shared/icon.svelte';
	import Tooltip from '../shared/tooltip.svelte';

	import { settingsStore } from '@/store';
	import Shortcut from '../shared/shortcut.svelte';

	let open = false;
	let searchValue = '';
	let collapsedCategories: string[] = [];
	let filteredCommands = [...commands];

	activeFile.subscribe((notePath) => {
		// Remove last note specific commands
		if (filteredCommands[0].name !== 'Notes') {
			filteredCommands.shift();
		}

		if (notePath) {
			// Add notePath specific commands to the top of the list
			filteredCommands.unshift(createNoteCommands(notePath));
		}
	});

	// Filter commands based on search value
	$: filteredCommands = commands
		.map((group) => ({
			...group,
			commands: group.commands.filter((command) =>
				command.title.toLowerCase().includes(searchValue.toLowerCase())
			)
		}))
		.filter((group) => group.commands.length > 0);
</script>

<footer
	class="fixed bottom-0 w-full flex justify-between items-center h-9 border-t pb-0.5 px-1.5 bg-background z-20"
>
	<div class="cursor-default space-x-0.5">
		<Tooltip text="Toggle theme" shortcut={SHORTCUTS['settings:toggle-theme']}>
			<Button
				on:click={toggleTheme}
				size="icon"
				variant="ghost"
				class="h-6 w-6 fill-muted-foreground hover:fill-foreground transition-all"
				scale="md"
			>
				{#if $userPrefersMode === 'dark'}
					<Icon name="moon" class="w-4 h-4" />
				{:else if $userPrefersMode === 'light'}
					<Icon name="sun" class="w-4 h-4" />
				{:else}
					<Icon name="monitor" class="w-4 h-4" />
				{/if}
			</Button>
		</Tooltip>

		<Tooltip text="Haptic Sync">
			<Button
				size="icon"
				variant="ghost"
				class="h-6 w-6 fill-muted-foreground hover:fill-foreground transition-all"
				scale="md"
				on:click={() => {
					settingsStore.set({ isOpen: true, activePage: 'haptic sync' });
				}}
			>
				<Icon name="cloudX" class="w-4 h-4" />
			</Button>
		</Tooltip>
	</div>

	<div class="cursor-default space-x-0.5">
		<Tooltip text="Help & feedback" shortcut={SHORTCUTS['app:help']}>
			<Button
				size="icon"
				variant="ghost"
				class="h-6 w-6 fill-muted-foreground hover:fill-foreground transition-all"
				scale="md"
				on:click={() => {
					document.dispatchEvent(
						new KeyboardEvent('keydown', { key: 'h', metaKey: true, shiftKey: true })
					);
				}}
			>
				<Icon name="lifebouy" class="w-4 h-4" />
			</Button>
		</Tooltip>
		<Sheet.Root bind:open>
			<Sheet.Trigger
				><Tooltip text="Shortcuts" shortcut={SHORTCUTS['app:shortcuts']}>
					<Button
						size="icon"
						variant="ghost"
						class="h-6 w-6 fill-muted-foreground hover:fill-foreground transition-all"
						scale="md"
					>
						<Shortcut options={SHORTCUTS['app:shortcuts']} callback={() => (open = !open)} />
						<Icon name="bolt" class="w-4 h-4" />
					</Button>
				</Tooltip>
			</Sheet.Trigger>
			<Sheet.Content class="px-0 overflow-y-auto">
				<Sheet.Header>
					<Sheet.Title class="px-5">Shortcuts</Sheet.Title>
					<Sheet.Description class="px-5 py-1">
						<Input
							placeholder="Search shortcuts"
							autocorrect="off"
							autocomplete="off"
							class="w-full text-foreground font-light"
							bind:value={searchValue}
						/>
					</Sheet.Description>
				</Sheet.Header>

				<div>
					{#each filteredCommands as group}
						<div class="w-full h-full py-3 px-5">
							<Collapsible.Root
								open={!collapsedCategories.includes(group.name)}
								onOpenChange={(open) => {
									// Append or remove the category from the list of expanded categories
									collapsedCategories = open
										? collapsedCategories.filter((category) => category !== group.name)
										: [...collapsedCategories, group.name];
								}}
							>
								<Collapsible.Trigger
									class="flex items-center gap-2 group w-full text-sm font-normal"
								>
									<!-- Chevron -->
									<ChevronDown
										class={cn(
											'w-4 h-4 transition-all text-muted-foreground group-hover:text-foreground',
											collapsedCategories.includes(group.name) && 'transform -rotate-90'
										)}
									/>
									{group.name}
								</Collapsible.Trigger>
								<Collapsible.Content class="text-sm text-muted-foreground pt-3 space-y-3">
									<!-- Shortcuts -->
									{#each group.commands as command}
										<div class="flex items-center justify-between gap-2">
											<span class="font-light">{command.title}</span>
											{#if command.shortcut}
												<span
													class="pointer-events-none inline-flex h-[18px] pl-1.5 tracking-widest -mr-2 select-none items-center gap-1 rounded bg-secondary px-1 font-mono text-muted-foreground opacity-100"
												>
													{shortcutToString(command.shortcut)}
												</span>
											{/if}
										</div>
									{/each}
								</Collapsible.Content>
							</Collapsible.Root>
						</div>
					{/each}

					<!-- Empty State -->
					{#if filteredCommands.length === 0}
						<div class="w-full h-full flex flex-col gap-1 items-center justify-center pt-14">
							<Icon name="searchBars" class="w-5 h-5 fill-muted-foreground" />
							<p class="text-muted-foreground text-sm">No shortcuts found</p>
						</div>
					{/if}
				</div>
			</Sheet.Content>
		</Sheet.Root>

		<Tooltip text="Share" shortcut={SHORTCUTS['app:share']}>
			<Button
				size="icon"
				variant="ghost"
				class="h-6 w-6 fill-muted-foreground hover:fill-foreground transition-all"
				scale="md"
				on:click={() => {
					document.dispatchEvent(
						new KeyboardEvent('keydown', { key: 'l', metaKey: true, shiftKey: true })
					);
				}}
			>
				<Icon name="share" class="w-4 h-4" />
			</Button>
		</Tooltip>
	</div>
</footer>
