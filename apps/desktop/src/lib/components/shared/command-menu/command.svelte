<script lang="ts">
	import * as Command from '@haptic/ui/components/command';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/shared/icon.svelte';
	import { activeFile } from '@/store';
	import { moveNote, openNote } from '@/api/notes';
	import { getAllItems } from './helpers';
	import { mainCommands as commands, createNoteCommands } from './commands';
	import { setMode, mode } from 'mode-watcher';
	import { shortcutToString } from '@/utils';

	let open = false;
	let search = '';
	let value: string | undefined = undefined;
	let page: string | undefined = undefined;
	let openedWithShortcut = '';

	const shortcutKeyMap: Record<string, string | undefined> = {
		'cmd+k': 'default',
		'cmd+j': 'open_note',
		'cmd+shift+m': 'move_note'
	};

	// If a page is provided, it opens that page, otherwise it closes the menu
	function handlePageState(newPage: string | undefined) {
		if (!newPage) {
			open = false;
			openedWithShortcut = '';
		} else {
			// Add bounce animation for page change
			const dialog = document.querySelector('[data-dialog-content]');

			if (dialog) {
				dialog.animate(
					[
						{ transform: 'scale(1)' },
						{ transform: 'scale(0.98, 0.98)' },
						{ transform: 'scale(1, 1)' }
					],
					{
						duration: 225,
						easing: 'ease'
					}
				);
			}
		}

		page = newPage;
		search = '';
	}

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			const keyPressed = `${e.metaKey || e.ctrlKey ? 'cmd+' : ''}${e.shiftKey ? 'shift+' : ''}${
				e.key
			}`;
			if (
				(e.metaKey || e.ctrlKey || e.shiftKey) &&
				shortcutKeyMap[keyPressed] &&
				(openedWithShortcut === keyPressed || openedWithShortcut === '')
			) {
				e.preventDefault();
				openedWithShortcut = keyPressed;
				page = shortcutKeyMap[keyPressed];
				open = !open;
				if (!open) {
					handlePageState(undefined);
				}
			}
		}
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	activeFile.subscribe((notePath) => {
		// Remove last note specific commands
		if (commands[0].name !== 'Notes') {
			commands.shift();
		}

		if (notePath) {
			// Add notePath specific commands to the top of the list
			commands.unshift(createNoteCommands(notePath));

			// Set value to first command
			value = commands[0].commands[0].title;
		}
	});
</script>

<Command.Dialog
	bind:open
	bind:value
	loop
	onKeydown={(e) => {
		if (e.key === 'Escape') {
			handlePageState(undefined);
			openedWithShortcut = '';
		} else if (
			e.key === 'Backspace' &&
			!search &&
			page !== 'default' &&
			openedWithShortcut === 'cmd+k'
		) {
			handlePageState('default');
		}
	}}
>
	<Command.Input bind:value={search} placeholder="Search or jump to..." />
	<Command.List>
		<Command.Empty class="text-foreground/60 font-light">No commands found</Command.Empty>
		{#if page === 'default'}
			{#each commands as group}
				<Command.Group heading={group.name}>
					{#each group.commands as command}
						<Command.Item
							class="[&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground [&>*]:stroke-foreground/50 [&>*]:aria-selected:stroke-foreground"
							value={command.title}
							onSelect={() => {
								const page = command.onSelect?.();
								if (typeof page === 'undefined') {
									handlePageState(undefined);
								} else {
									handlePageState(page);
								}
							}}
						>
							<div class="flex w-full items-center justify-between">
								<div class="flex items-center gap-1.5">
									{#if command.icon}
										<Icon name={command.icon} />
									{/if}
									<span class="text-foreground/80 group:hover:text-foreground/100"></span>
									{command.title}
								</div>
								{#if command.shortcut}
									<span class="ml-auto text-xs tracking-widest text-muted-foreground h-full"
										>{shortcutToString(command.shortcut)}
									</span>
								{/if}
							</div>
						</Command.Item>
					{/each}
				</Command.Group>
			{/each}
		{:else if page === 'move_note'}
			<Command.Group heading="Move note to...">
				{#await getAllItems(true)}
					<!-- TODO: Make this a loading spinner -->
					<Command.Loading class="text-foreground/90">Loading folders...</Command.Loading>
				{:then folders}
					{#each folders as folder}
						{#if folder.path + `/${$activeFile?.split('/').pop()}` !== $activeFile}
							<Command.Item
								class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground [&>*]:stroke-foreground/50 [&>*]:aria-selected:stroke-foreground"
								value={folder.path}
								onSelect={() => {
									moveNote($activeFile || '', folder.path);
									handlePageState(undefined);
								}}
							>
								<Icon name="folder" />
								{folder.name.slice(1).replaceAll('/', ' > ')}
							</Command.Item>
						{/if}
					{/each}
				{:catch error}
					<Command.Item class="text-foreground/90"
						>Error loading folders: {error.message}</Command.Item
					>
				{/await}
			</Command.Group>
		{:else if page === 'open_note'}
			<Command.Group heading="Open note...">
				{#await getAllItems()}
					<Command.Loading class="text-foreground/90">Loading notes...</Command.Loading>
				{:then notes}
					{#each notes as note}
						<Command.Item
							class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground [&>*]:stroke-foreground/50 [&>*]:aria-selected:stroke-foreground"
							value={note.path}
							onSelect={() => {
								openNote(note.path);
								handlePageState(undefined);
							}}
						>
							<Icon name="note" />
							{note.name.slice(1).replaceAll('/', ' > ')}
						</Command.Item>
					{/each}
				{:catch error}
					<Command.Item class="text-foreground/90"
						>Error loading notes: {error.message}</Command.Item
					>
				{/await}
			</Command.Group>
		{:else if page === 'change_theme'}
			<Command.Group heading="Change theme...">
				{#if $mode !== 'light'}
					<Command.Item
						class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground [&>*]:stroke-foreground/50 [&>*]:aria-selected:stroke-foreground"
						value="light"
						onSelect={() => {
							setMode('light');
							handlePageState(undefined);
						}}
					>
						<Icon name="sun" />
						Light
					</Command.Item>
				{/if}
				{#if $mode !== 'dark'}
					<Command.Item
						class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground [&>*]:stroke-foreground/50 [&>*]:aria-selected:stroke-foreground"
						value="dark"
						onSelect={() => {
							setMode('dark');
							handlePageState(undefined);
						}}
					>
						<Icon name="moon" />
						Dark
					</Command.Item>
				{/if}
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>

<style>
	:global([data-cmdk-list]) {
		height: min(300px, var(--cmdk-list-height));
		max-height: 400px;
		margin-bottom: 8px;
		margin-top: 8px;
		overscroll-behavior: contain;
		transition: 100ms ease;
		transition-property: height;
	}
</style>
